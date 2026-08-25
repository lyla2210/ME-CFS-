import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ASSETS } from '../../config/assets';
import { ROOMS, type RoomConfig } from '../../config/rooms';
import { playClick, playRoomHover, playRoomLocked } from '../../utils/audio';
import {
  getUnlockedRoomOrder,
  isFreeExplore,
  isRoomUnlocked,
} from '../../utils/progress';
import Pseudo3DImage from './Pseudo3DImage';
import RoomHotspot from './RoomHotspot';

type SpacePhase = 'preview' | 'explore';

interface SpaceMapProps {
  /** Skip preview and open explore (e.g. return from epilogue). */
  startInExplore?: boolean;
}

export default function SpaceMap({ startInExplore = false }: SpaceMapProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const forceExplore =
    startInExplore || searchParams.get('space') === '1' || searchParams.get('view') === 'space';

  const [phase, setPhase] = useState<SpacePhase>(forceExplore ? 'explore' : 'preview');
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);
  const [isEnteringRoom, setIsEnteringRoom] = useState(false);
  const [unlockedOrder, setUnlockedOrder] = useState(getUnlockedRoomOrder);
  const [freeExplore, setFreeExplore] = useState(isFreeExplore);

  useEffect(() => {
    const sync = () => {
      setUnlockedOrder(getUnlockedRoomOrder());
      setFreeExplore(isFreeExplore());
    };
    window.addEventListener('mecfs-progress', sync);
    return () => window.removeEventListener('mecfs-progress', sync);
  }, []);

  const scale = phase === 'preview' ? 0.62 : 1;
  const prompt =
    phase === 'preview'
      ? 'CLICK THE SPACE'
      : freeExplore
        ? 'Hover a room to enter · free explore'
        : unlockedOrder <= 1
          ? 'Hover Room 1 to enter'
          : `Stage ${unlockedOrder} unlocked · hover to enter`;

  const handleSpaceClick = () => {
    if (phase !== 'preview' || isEnteringRoom) return;
    playClick(700, 0.08);
    setPhase('explore');
  };

  const handleRoomHover = (room: RoomConfig) => {
    if (hoveredRoomId === room.id) return;
    setHoveredRoomId(room.id);
    if (isRoomUnlocked(room.order)) {
      playRoomHover(room.order);
    } else {
      playRoomLocked();
    }
  };

  const handleEnterRoom = (room: RoomConfig) => {
    if (isEnteringRoom) return;
    if (!isRoomUnlocked(room.order)) {
      playRoomLocked();
      return;
    }
    playClick(1000, 0.1);
    setIsEnteringRoom(true);
    setTimeout(
      () => navigate(`/simulation?step=${room.simulationStep ?? room.order}`),
      450
    );
  };

  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center px-4 md:px-8 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: isEnteringRoom ? 0 : 1 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      >
        <motion.p
          className="absolute top-10 md:top-14 left-0 right-0 text-center text-[10px] md:text-xs font-mono tracking-[0.35em] text-slate-400/80 uppercase z-20 pointer-events-none"
          animate={{ opacity: phase === 'explore' ? 0.5 : 0.85 }}
        >
          {prompt}
        </motion.p>

        <div className="relative w-full max-w-5xl flex items-center justify-center py-16 md:py-20">
          <motion.div
            className="w-full flex justify-center"
            animate={{
              y: [0, -10, 4, -6, 0],
              rotateZ: [0, 0.3, -0.2, 0.15, 0],
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Pseudo3DImage scale={scale} enabled={!isEnteringRoom}>
              <motion.button
                type="button"
                className={`relative block w-full max-w-[min(920px,92vw)] mx-auto overflow-visible bg-transparent ${
                  phase === 'preview' ? 'cursor-pointer' : 'cursor-default'
                }`}
                onClick={handleSpaceClick}
                animate={{
                  filter: isEnteringRoom ? 'blur(6px)' : 'blur(0px)',
                }}
                transition={{ duration: 0.45 }}
                aria-label={phase === 'preview' ? 'Enter the experiential space' : 'Space map'}
              >
                <div className="relative w-full space-map-blend">
                  <picture>
                    <source srcSet={ASSETS.spaceMapWebp} type="image/webp" />
                    <img
                      src={ASSETS.spaceMap}
                      alt="ME/CFS experiential space floor plan"
                      width={920}
                      height={761}
                      fetchPriority="high"
                      decoding="async"
                      className="w-full h-auto object-contain pointer-events-none select-none block"
                      draggable={false}
                    />
                  </picture>
                </div>

                <AnimatePresence>
                  {phase === 'explore' && (
                    <motion.div
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.35, duration: 0.5 }}
                      onMouseLeave={() => setHoveredRoomId(null)}
                    >
                      {ROOMS.map((room) => (
                        <div key={room.id} className="contents">
                          <RoomHotspot
                            room={room}
                            locked={!isRoomUnlocked(room.order)}
                            active={hoveredRoomId === room.id}
                            onHover={() => handleRoomHover(room)}
                            onEnter={handleEnterRoom}
                          />
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </Pseudo3DImage>
          </motion.div>
        </div>

        {phase === 'preview' && (
          <motion.p
            className="absolute bottom-12 md:bottom-16 text-[10px] font-mono tracking-[0.3em] text-slate-500 uppercase z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.6 }}
          >
            CLICK TO EXPLORE
          </motion.p>
        )}
      </motion.div>

      <AnimatePresence>
        {isEnteringRoom && (
          <motion.div
            className="fixed inset-0 z-50 bg-black pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, ease: 'easeIn' }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
