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

    // Mouse coordinates initialization
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

    // Data streams
    interface DataStream {
      x: number;
      y: number;
      speed: number;
      length: number;
      opacity: number;
      charList: string[];
    }

    const streams: DataStream[] = [];
    const streamCount = 55; // Elevated stream count for better data flow visibility
    const streamChars = "01010101XXXXXXXXX_SYS_OK_ERR_ATPHALT_LOG".split("");

    for (let i = 0; i < streamCount; i++) {
      streams.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 0.4 + Math.random() * 1.6,
        length: 6 + Math.floor(Math.random() * 12),
        opacity: 0.08 + Math.random() * 0.25, // Increased prominence opacity range
        charList: Array(18).fill(0).map(() => streamChars[Math.floor(Math.random() * streamChars.length)])
      });
    }

    // Glowing background base rotation
    let glowAngle = 0;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const draw = () => {
      // Background clear
      ctx.fillStyle = '#0a0a0c'; // absolute slate dark
      ctx.fillRect(0, 0, width, height);

      // 1. Base organic ambient glows
      glowAngle += 0.001;
      const glowX1 = width * 0.25 + Math.cos(glowAngle) * 40;
      const glowY1 = height * 0.25 + Math.sin(glowAngle) * 40;

      const radGlow1 = ctx.createRadialGradient(glowX1, glowY1, 10, glowX1, glowY1, Math.max(300, width * 0.4));
      radGlow1.addColorStop(0, 'rgba(124, 58, 237, 0.05)'); // violet base
      radGlow1.addColorStop(0.5, 'rgba(76, 29, 149, 0.01)');
      radGlow1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radGlow1;
      ctx.fillRect(0, 0, width, height);

      // 2. Smoothly interpolated mouse follow trail diffuse glow (Dynamic Spotlight)
      glowMouseX += (targetMouseX - glowMouseX) * 0.06;
      glowMouseY += (targetMouseY - glowMouseY) * 0.06;

      const radMouseGlow = ctx.createRadialGradient(
        glowMouseX, 
        glowMouseY, 
        0, 
        glowMouseX, 
        glowMouseY, 
        Math.max(260, width * 0.22)
      );
      radMouseGlow.addColorStop(0, 'rgba(6, 182, 212, 0.12)');  // cyan core focus
      radMouseGlow.addColorStop(0.4, 'rgba(124, 58, 237, 0.05)'); // indigo mid spectrum
      radMouseGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');          // smooth boundary
      ctx.fillStyle = radMouseGlow;
      ctx.fillRect(0, 0, width, height);

      // High-tech subtle grid pattern
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.015)'; // Indigo grid
      ctx.lineWidth = 1;
      const gridSpace = 60;
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

      // Draw flowing data packet streams
      ctx.font = 'bold 9px monospace';
      streams.forEach((stream) => {
        for (let j = 0; j < stream.length; j++) {
          const char = stream.charList[j % stream.charList.length];
          const streamY = (stream.y + j * 12) % height;

          // Introduce fading gradient downwards & white head highlights for visual realism
          if (j === stream.length - 1) {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1.0, stream.opacity * 2.2 + 0.25)})`;
          } else {
            ctx.fillStyle = `rgba(34, 211, 238, ${stream.opacity * (j / stream.length)})`;
          }
          ctx.fillText(char, stream.x, streamY);
        }

        // Move vertical stream down
        stream.y += stream.speed;

        // Jitter characters occasionally to simulation data shift
        if (Math.random() > 0.982) {
          stream.charList[Math.floor(Math.random() * stream.charList.length)] = streamChars[Math.floor(Math.random() * streamChars.length)];
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
      className="absolute inset-0 w-full h-full pointer-events-none opacity-95"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
