import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  alpha: number;
}

interface Meteor {
  x: number;
  y: number;
  len: number;
  speed: number;
  angle: number;
  alpha: number;
}

interface Celestial {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  hue: number;
  alpha: number;
}

/**
 * Subtle drifting stars, meteors, and small celestial bodies — cosmic ambience behind the space map.
 */
export default function CosmicDrift() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let frameId = 0;

    const stars: Star[] = [];
    const meteors: Meteor[] = [];
    const celestials: Celestial[] = [];

    const init = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      stars.length = 0;
      meteors.length = 0;
      celestials.length = 0;

      for (let i = 0; i < 90; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.4 + Math.random() * 1.2,
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.06,
          alpha: 0.15 + Math.random() * 0.45,
        });
      }

      for (let i = 0; i < 5; i++) {
        spawnMeteor();
      }

      for (let i = 0; i < 6; i++) {
        celestials.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 3 + Math.random() * 8,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.1,
          hue: 220 + Math.random() * 40,
          alpha: 0.08 + Math.random() * 0.12,
        });
      }
    };

    function spawnMeteor() {
      meteors.push({
        x: Math.random() * w * 1.2,
        y: Math.random() * h * 0.4,
        len: 40 + Math.random() * 80,
        speed: 2 + Math.random() * 3,
        angle: Math.PI * 0.75 + (Math.random() - 0.5) * 0.2,
        alpha: 0.12 + Math.random() * 0.2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // faint nebula wash
      const neb = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, Math.max(w, h) * 0.55);
      neb.addColorStop(0, 'rgba(60, 60, 80, 0.06)');
      neb.addColorStop(0.5, 'rgba(20, 20, 30, 0.03)');
      neb.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = neb;
      ctx.fillRect(0, 0, w, h);

      stars.forEach((s) => {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) s.x = w;
        if (s.x > w) s.x = 0;
        if (s.y < 0) s.y = h;
        if (s.y > h) s.y = 0;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
        ctx.fill();
      });

      celestials.forEach((c) => {
        c.x += c.vx;
        c.y += c.vy;
        if (c.x < -20) c.x = w + 20;
        if (c.x > w + 20) c.x = -20;
        if (c.y < -20) c.y = h + 20;
        if (c.y > h + 20) c.y = -20;
        const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r * 2);
        grad.addColorStop(0, `hsla(${c.hue}, 15%, 55%, ${c.alpha})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
      });

      meteors.forEach((m, idx) => {
        const dx = Math.cos(m.angle) * m.speed;
        const dy = Math.sin(m.angle) * m.speed;
        m.x += dx;
        m.y += dy;

        const tailX = m.x - Math.cos(m.angle) * m.len;
        const tailY = m.y - Math.sin(m.angle) * m.len;
        const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(1, `rgba(255,255,255,${m.alpha})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();

        if (m.x < -100 || m.y > h + 100) {
          meteors[idx] = {
            x: w + Math.random() * 200,
            y: Math.random() * h * 0.35,
            len: 40 + Math.random() * 80,
            speed: 2 + Math.random() * 3,
            angle: Math.PI * 0.75 + (Math.random() - 0.5) * 0.2,
            alpha: 0.12 + Math.random() * 0.2,
          };
        }
      });

      frameId = requestAnimationFrame(draw);
    };

    init();
    draw();
    window.addEventListener('resize', init);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', init);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-70"
      aria-hidden
    />
  );
}
