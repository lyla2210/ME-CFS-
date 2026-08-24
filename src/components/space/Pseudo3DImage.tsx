import React, { useCallback, useEffect, useRef, useState } from 'react';

interface Pseudo3DImageProps {
  children: React.ReactNode;
  /** Base scale of the 3D plane (0.6 preview → 1 explore) */
  scale?: number;
  enabled?: boolean;
  className?: string;
}

function useIsCoarsePointer() {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    const update = () => setCoarse(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return coarse;
}

/**
 * Wraps content in perspective + mouse-tracked tilt/parallax.
 * Keeps rotation subtle so the PNG proportions stay believable.
 */
export default function Pseudo3DImage({
  children,
  scale = 1,
  enabled = true,
  className = '',
}: Pseudo3DImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef({ rx: 0, ry: 0, tx: 0, ty: 0 });
  const [transform, setTransform] = useState({ rx: 0, ry: 0, tx: 0, ty: 0 });
  const isCoarse = useIsCoarsePointer();

  const maxRotate = isCoarse ? 2.5 : 5;
  const maxTranslate = isCoarse ? 8 : 16;

  const applyTransform = useCallback(() => {
    setTransform({ ...targetRef.current });
    rafRef.current = null;
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!enabled || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;

      targetRef.current = {
        ry: nx * maxRotate * 2,
        rx: -ny * maxRotate * 2,
        tx: nx * maxTranslate,
        ty: ny * maxTranslate,
      };

      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(applyTransform);
      }
    },
    [enabled, maxRotate, maxTranslate, applyTransform]
  );

  const handleMouseLeave = useCallback(() => {
    targetRef.current = { rx: 0, ry: 0, tx: 0, ty: 0 };
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(applyTransform);
    }
  }, [applyTransform]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const { rx, ry, tx, ty } = transform;

  return (
    <div
      ref={containerRef}
      className={`pseudo-3d-scene ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: '1200px', perspectiveOrigin: '50% 50%' }}
    >
      <div
        className="pseudo-3d-plane will-change-transform"
        style={{
          transform: `
            scale(${scale})
            rotateX(${rx}deg)
            rotateY(${ry}deg)
            translate3d(${tx}px, ${ty}px, 0)
          `,
          transition: 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
