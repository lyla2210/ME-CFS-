import React, { useEffect, useRef } from 'react';

export default function CyberGrid() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    let targetMouseX = width / 2;
    let targetMouseY = height / 2;
    let glowMouseX = width / 2;
    let glowMouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    };

    window.addEventListener('mousemove', handleMouseMove);

    interface DataStream {
      x: number;
      y: number;
      speed: number;
      length: number;
      opacity: number;
      charList: string[];
    }

    const streams: DataStream[] = [];
    const streamCount = 48;
    const streamChars = '01010101_SYS_OK_ERR_HALT_LOG'.split('');

    for (let i = 0; i < streamCount; i++) {
      streams.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 0.35 + Math.random() * 1.2,
        length: 6 + Math.floor(Math.random() * 10),
        opacity: 0.05 + Math.random() * 0.14,
        charList: Array(16)
          .fill(0)
          .map(() => streamChars[Math.floor(Math.random() * streamChars.length)]),
      });
    }

    let glowAngle = 0;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const draw = () => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // ambient drift
      glowAngle += 0.0008;
      const glowX1 = width * 0.3 + Math.cos(glowAngle) * 30;
      const glowY1 = height * 0.3 + Math.sin(glowAngle) * 30;
      const radGlow1 = ctx.createRadialGradient(
        glowX1,
        glowY1,
        10,
        glowX1,
        glowY1,
        Math.max(280, width * 0.35)
      );
      radGlow1.addColorStop(0, 'rgba(120, 120, 140, 0.04)');
      radGlow1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radGlow1;
      ctx.fillRect(0, 0, width, height);

      // mouse follow gradient spotlight — preserved
      glowMouseX += (targetMouseX - glowMouseX) * 0.06;
      glowMouseY += (targetMouseY - glowMouseY) * 0.06;

      const radMouseGlow = ctx.createRadialGradient(
        glowMouseX,
        glowMouseY,
        0,
        glowMouseX,
        glowMouseY,
        Math.max(240, width * 0.2)
      );
      radMouseGlow.addColorStop(0, 'rgba(196, 181, 253, 0.09)');
      radMouseGlow.addColorStop(0.35, 'rgba(167, 139, 250, 0.05)');
      radMouseGlow.addColorStop(0.7, 'rgba(139, 92, 246, 0.025)');
      radMouseGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radMouseGlow;
      ctx.fillRect(0, 0, width, height);

      // subtle grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.018)';
      ctx.lineWidth = 1;
      const gridSpace = 64;
      for (let x = 0; x < width; x += gridSpace) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSpace) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // data streams — minimal white/gray
      ctx.font = '9px monospace';
      streams.forEach((stream) => {
        for (let j = 0; j < stream.length; j++) {
          const char = stream.charList[j % stream.charList.length];
          const streamY = (stream.y + j * 12) % height;

          if (j === stream.length - 1) {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.55, stream.opacity * 2 + 0.12)})`;
          } else {
            ctx.fillStyle = `rgba(160, 160, 170, ${stream.opacity * (j / stream.length)})`;
          }
          ctx.fillText(char, stream.x, streamY);
        }

        stream.y += stream.speed;

        if (Math.random() > 0.985) {
          stream.charList[Math.floor(Math.random() * stream.charList.length)] =
            streamChars[Math.floor(Math.random() * streamChars.length)];
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      id="cyber-grid-canvas-bg"
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-90"
    />
  );
}
