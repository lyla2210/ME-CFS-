import React, { useEffect, useState, useRef } from 'react';

interface GlitchFaceProps {
  distortion: number; // 0 to 100
}

export default function GlitchFace({ distortion }: GlitchFaceProps) {
  const [jitterOffsets, setJitterOffsets] = useState({ x: 0, y: 0 });
  const [scanlines, setScanlines] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (distortion > 0) {
        const factor = distortion / 100;
        const maxDist = factor * 22;
        setJitterOffsets({
          x: (Math.random() - 0.5) * maxDist,
          y: (Math.random() - 0.5) * maxDist,
        });

        if (Math.random() < factor) {
          const glitchLines = [];
          for (let i = 0; i < 3; i++) {
            glitchLines.push(Math.random() > 0.5 ? 'SYNC_LOSS' : 'ERR_SYS_0x' + Math.floor(Math.random() * 256).toString(16).toUpperCase());
          }
          setScanlines(glitchLines);
        } else {
          setScanlines([]);
        }
      } else {
        setJitterOffsets({ x: 0, y: 0 });
        setScanlines([]);
      }
    }, 120 - distortion);

    return () => clearInterval(interval);
  }, [distortion]);

  const scale = 1 + (distortion / 400);
  const distortionActive = distortion > 0;
  
  const getRandOffset = (max: number) => {
    if (distortion === 0) return 0;
    return (Math.random() - 0.5) * (distortion / 100) * max;
  };

  const faceCenter = { x: 100 + getRandOffset(15), y: 100 + getRandOffset(15) };
  const leftEye = { x: 70 + getRandOffset(25), y: 80 + getRandOffset(25) };
  const rightEye = { x: 130 + getRandOffset(25), y: 80 + getRandOffset(25) };
  const mouthY = 135 + getRandOffset(30);
  const mouthW = 40 + getRandOffset(20);

  return (
    <div 
      ref={containerRef}
      className="relative w-48 h-48 border border-white/10 bg-black/80 rounded flex items-center justify-center overflow-hidden font-mono text-[10px]"
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0%,transparent_80%)]" />
      <div className="absolute inset-y-0 left-12 w-[1px] bg-white/10" />
      <div className="absolute inset-y-0 left-36 w-[1px] bg-white/10" />
      <div className="absolute inset-x-0 top-12 h-[1px] bg-white/10" />
      <div className="absolute inset-x-0 top-36 h-[1px] bg-white/10" />

      {/* Futuristic Vector Face */}
      <svg 
        id="vec-face"
        viewBox="0 0 200 200" 
        className="w-40 h-40 transition-transform duration-100"
        style={{
          transform: `scale(${scale}) translate(${jitterOffsets.x}px, ${jitterOffsets.y}px)`,
          filter: distortion > 50 ? `hue-rotate(${distortion}deg) saturate(1.5)` : 'none'
        }}
      >
        {/* Head Shell */}
        <circle 
          cx={faceCenter.x} 
          cy={faceCenter.y} 
          r="75" 
          fill="none" 
          stroke={distortion > 60 ? '#f43f5e' : 'rgba(255,255,255,0.75)'} 
          strokeWidth="1.5" 
          strokeDasharray={distortion > 40 ? "5, 8, 2, 8" : "none"}
          className="transition-colors duration-300"
        />

        {/* Head Circuit Dots */}
        <circle cx={faceCenter.x - 75} cy={faceCenter.y} r="3" fill="rgba(255,255,255,0.75)" />
        <circle cx={faceCenter.x + 75} cy={faceCenter.y} r="3" fill="rgba(255,255,255,0.75)" />
        <circle cx={faceCenter.x} cy={faceCenter.y - 75} r="3" fill="rgba(255,255,255,0.75)" />

        {/* Brain Signal Mesh (Visible when distorted) */}
        {distortion > 20 && (
          <path
            d={`M ${leftEye.x} ${leftEye.y} L ${rightEye.x} ${rightEye.y} L ${faceCenter.x} ${mouthY} Z`}
            fill="none"
            stroke="rgba(244, 63, 94, 0.3)"
            strokeWidth="1"
          />
        )}

        {/* Left Eye */}
        {distortion > 75 ? (
          <text x={leftEye.x - 8} y={leftEye.y + 4} fill="#f43f5e" className="font-bold">Err</text>
        ) : (
          <g>
            <circle cx={leftEye.x} cy={leftEye.y} r="10" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" />
            <circle cx={leftEye.x} cy={leftEye.y} r="3" fill="rgba(255,255,255,0.75)" />
            {distortion > 40 && <line x1={leftEye.x - 12} y1={leftEye.y} x2={leftEye.x + 12} y2={leftEye.y} stroke="#f43f5e" strokeWidth="1.5" />}
          </g>
        )}

        {/* Right Eye */}
        {distortion > 75 ? (
          <text x={rightEye.x - 8} y={rightEye.y + 4} fill="#f43f5e" className="font-bold">ØX</text>
        ) : (
          <g>
            <circle cx={rightEye.x} cy={rightEye.y} r="10" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" />
            <circle cx={rightEye.x} cy={rightEye.y} r="3" fill="rgba(255,255,255,0.75)" />
            {distortion > 40 && <line x1={rightEye.x - 12} y1={rightEye.y} x2={rightEye.x + 12} y2={rightEye.y} stroke="#f43f5e" strokeWidth="1.5" />}
          </g>
        )}

        {/* Nose Line / Core */}
        <path d={`M 100 85 L ${faceCenter.x} 110`} stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" fill="none" />

        {/* Mouth */}
        {distortion > 80 ? (
          <text x={faceCenter.x - 20} y={mouthY} fill="#f43f5e" className="animate-pulse">???</text>
        ) : distortion > 40 ? (
          <path 
            d={`M ${faceCenter.x - mouthW/2} ${mouthY} Q ${faceCenter.x} ${mouthY + 12} ${faceCenter.x + mouthW/2} ${mouthY}`} 
            fill="none" 
            stroke="#f43f5e" 
            strokeWidth="2" 
          />
        ) : (
          <line 
            x1={faceCenter.x - mouthW/2} 
            y1={mouthY} 
            x2={faceCenter.x + mouthW/2} 
            y2={mouthY} 
            stroke="rgba(255,255,255,0.75)" 
            strokeWidth="2" 
          />
        )}
      </svg>

      {/* Glitch Overlay Text Lines */}
      {distortionActive && (
        <div className="absolute inset-0 p-2 flex flex-col justify-between pointer-events-none text-rose-500 font-semibold uppercase tracking-wider">
          <div className="flex justify-between">
            <span className="bg-rose-950/90 px-1 border border-rose-500/40 text-[8px] animate-pulse">
              FOG: {distortion}%
            </span>
            <span className="text-[8px] text-white/70">STATUS: FLUX</span>
          </div>
          {scanlines.length > 0 && (
            <div className="bg-red-950/80 px-1 border border-red-500 text-[8px] text-center mb-1">
              {scanlines[0]}
            </div>
          )}
        </div>
      )}

      {/* Cyber Grid scanning bar */}
      <div className="absolute inset-x-0 h-[1.5px] bg-[rgba(255,255,255,0.75)]/35 shadow-[0_0_8px_rgba(255,255,255,0.75)] animate-[bounce_3s_infinite_linear]" />
    </div>
  );
}
