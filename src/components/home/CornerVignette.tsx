interface CornerVignetteProps {
  /** 0.4 = subtle corners, 0.7 = strong vignette toward center */
  intensity?: number;
  className?: string;
}

function buildVignette(intensity: number) {
  const spread = Math.max(18, 62 - intensity * 38);
  const alpha = Math.min(0.98, 0.5 + intensity * 0.48);
  return `
    radial-gradient(ellipse 110% 90% at 0% 0%, rgba(0,0,0,${alpha}) 0%, transparent ${spread}%),
    radial-gradient(ellipse 110% 90% at 100% 0%, rgba(0,0,0,${alpha}) 0%, transparent ${spread}%),
    radial-gradient(ellipse 110% 90% at 0% 100%, rgba(0,0,0,${alpha}) 0%, transparent ${spread}%),
    radial-gradient(ellipse 110% 90% at 100% 100%, rgba(0,0,0,${alpha}) 0%, transparent ${spread}%)
  `;
}

/** Four-corner black gradients — static ambience + base for inward blackout. */
export default function CornerVignette({
  intensity = 0.62,
  className = '',
}: CornerVignetteProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-[6] ${className}`}
      style={{ background: buildVignette(intensity) }}
      aria-hidden
    />
  );
}

export { buildVignette };
