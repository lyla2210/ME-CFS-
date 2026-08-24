import DotMatrixText from '../DotMatrixText';
import { playClick } from '../../utils/audio';

interface HeroSectionProps {
  onTryNow: () => void;
}

export default function HeroSection({ onTryNow }: HeroSectionProps) {
  const handleClick = () => {
    playClick(800, 0.12);
    onTryNow();
  };

  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center px-6 overflow-hidden select-none">
      <div className="relative z-10 flex flex-col items-center text-center space-y-10 md:space-y-14 max-w-5xl mx-auto py-20">
        <div className="space-y-5 md:space-y-7 flex flex-col items-center">
          <DotMatrixText text="A SPACE FOR" color="white" glow={false} />
          <DotMatrixText text="INVISIBLE ILLNESS" color="white" glow={false} />
        </div>

        <div className="space-y-4 pt-2">
          <h1 className="text-lg md:text-2xl lg:text-3xl font-sans font-normal tracking-[0.2em] text-white/95 uppercase">
            How do people with ME/CFS feel?
          </h1>
          <p className="text-[10px] md:text-xs text-slate-500 font-sans tracking-[0.14em] leading-relaxed max-w-3xl uppercase">
            Experiential simulator for myalgic encephalomyelitis (ME) &amp; chronic fatigue
            syndrome (CFS)
          </p>
        </div>

        <div className="pt-6 md:pt-10">
          <button
            id="launch-experience-btn"
            type="button"
            onClick={handleClick}
            className="px-14 md:px-16 py-3.5 md:py-4 rounded-full border border-slate-600/80 bg-transparent text-white/90 hover:text-white hover:border-slate-400 font-sans font-medium tracking-[0.28em] text-[11px] md:text-xs transition-all duration-500 cursor-pointer uppercase focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
          >
            Try Now
          </button>
        </div>
      </div>
    </section>
  );
}
