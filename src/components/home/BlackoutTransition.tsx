import { useEffect } from 'react';
import { motion } from 'motion/react';

interface BlackoutTransitionProps {
  onComplete: () => void;
}

const DURATION_MS = 900;

/**
 * Inward corner blackout — matches the static corner vignette, then swallows the center.
 */
export default function BlackoutTransition({ onComplete }: BlackoutTransitionProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, DURATION_MS);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const corners = [
    { style: { top: 0, left: 0, transformOrigin: 'top left' } },
    { style: { top: 0, right: 0, transformOrigin: 'top right' } },
    { style: { bottom: 0, left: 0, transformOrigin: 'bottom left' } },
    { style: { bottom: 0, right: 0, transformOrigin: 'bottom right' } },
  ];

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {corners.map((c, i) => (
        <motion.div
          key={i}
          className="absolute bg-black"
          style={{
            ...c.style,
            width: '52%',
            height: '52%',
          }}
          initial={{ scale: 0.35, opacity: 0.6 }}
          animate={{ scale: 2.6, opacity: 1 }}
          transition={{
            duration: 0.85,
            ease: [0.42, 0, 0.58, 1],
            delay: i * 0.04,
          }}
        />
      ))}

      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.55, ease: 'easeIn' }}
      />
    </div>
  );
}
