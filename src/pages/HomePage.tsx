import { useState } from 'react';
import CyberGrid from '../components/CyberGrid';
import CosmicDrift from '../components/space/CosmicDrift';
import CornerVignette from '../components/home/CornerVignette';
import HeroSection from '../components/home/HeroSection';
import BlackoutTransition from '../components/home/BlackoutTransition';
import SpaceMap from '../components/space/SpaceMap';

type HomePhase = 'hero' | 'blackout' | 'space';

export default function HomePage() {
  const [phase, setPhase] = useState<HomePhase>('hero');

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Ambient: data streams + mouse glow + cosmic drift + corner vignette */}
      <CyberGrid />
      <CosmicDrift />
      <CornerVignette intensity={0.64} />

      <div className="relative z-10 min-h-screen">
        {(phase === 'hero' || phase === 'blackout') && (
          <HeroSection onTryNow={() => setPhase('blackout')} />
        )}
        {phase === 'space' && <SpaceMap />}
      </div>

      {phase === 'blackout' && (
        <BlackoutTransition onComplete={() => setPhase('space')} />
      )}
    </div>
  );
}
