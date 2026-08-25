import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CyberGrid from '../components/CyberGrid';
import CosmicDrift from '../components/space/CosmicDrift';
import CornerVignette from '../components/home/CornerVignette';
import HeroSection from '../components/home/HeroSection';
import BlackoutTransition from '../components/home/BlackoutTransition';
import SpaceMap from '../components/space/SpaceMap';
import { preloadSpaceMap } from '../utils/preloadSpaceMap';

type HomePhase = 'hero' | 'blackout' | 'space';

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const jumpToSpace =
    searchParams.get('space') === '1' || searchParams.get('view') === 'space';

  const [phase, setPhase] = useState<HomePhase>(jumpToSpace ? 'space' : 'hero');

  useEffect(() => {
    preloadSpaceMap();
  }, []);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <CyberGrid />
      <CosmicDrift />
      <CornerVignette intensity={0.64} />

      <div className="relative z-10 min-h-screen">
        {(phase === 'hero' || phase === 'blackout') && (
          <HeroSection onTryNow={() => setPhase('blackout')} />
        )}
        {phase === 'space' && <SpaceMap startInExplore={jumpToSpace} />}
      </div>

      {phase === 'blackout' && (
        <BlackoutTransition onComplete={() => setPhase('space')} />
      )}
    </div>
  );
}
