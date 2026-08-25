import { motion } from 'motion/react';
import { Lock } from 'lucide-react';
import type { RoomConfig } from '../../config/rooms';

interface RoomHotspotProps {
  room: RoomConfig;
  locked: boolean;
  active: boolean;
  onHover: () => void;
  onEnter: (room: RoomConfig) => void;
}

export default function RoomHotspot({
  room,
  locked,
  active,
  onHover,
  onEnter,
}: RoomHotspotProps) {
  const { left, top, width, height } = room.hotspot;
  const showEnter = !locked && active;

  return (
    <motion.button
      type="button"
      aria-label={locked ? `${room.title} locked` : `Enter ${room.title}`}
      aria-disabled={locked}
      className={`room-hotspot absolute focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-200/40 ${
        locked ? 'cursor-not-allowed' : 'cursor-pointer'
      }`}
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: `${width}%`,
        height: `${height}%`,
        clipPath: 'polygon(8% 4%, 96% 0%, 100% 92%, 4% 100%)',
      }}
      onMouseEnter={onHover}
      onClick={(e) => {
        e.stopPropagation();
        onEnter(room);
      }}
    >
      <motion.span
        className="absolute inset-0 pointer-events-none"
        initial={false}
        animate={{
          opacity: showEnter ? 0.55 : 0,
          background: showEnter
            ? 'linear-gradient(160deg, rgba(250, 240, 180, 0.42) 0%, rgba(232, 210, 120, 0.22) 45%, rgba(255, 255, 255, 0.06) 100%)'
            : 'transparent',
          boxShadow: showEnter
            ? 'inset 0 0 40px rgba(255, 236, 160, 0.18), 0 0 36px rgba(255, 220, 120, 0.12)'
            : 'none',
        }}
        transition={{ duration: 0.28 }}
      />

      {showEnter && (
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-2"
        >
          <span className="text-[9px] md:text-[10px] font-sans tracking-[0.08em] text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
            {room.label}: {room.title}
          </span>
          <span className="mt-1 text-base md:text-lg font-sans font-bold tracking-[0.12em] text-amber-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            Enter
          </span>
        </motion.span>
      )}

      {active && locked && (
        <motion.span
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.22 }}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none"
        >
          <motion.span
            className="flex items-center justify-center rounded-full border border-white/15 bg-black/50 p-2.5 shadow-[0_0_24px_rgba(0,0,0,0.65)]"
            animate={{
              rotate: [0, -10, 10, -6, 4, 0],
              y: [0, -2, 0],
            }}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
          >
            <Lock className="h-5 w-5 md:h-6 md:w-6 text-white/55" strokeWidth={1.75} />
          </motion.span>
          <span className="text-[10px] md:text-[11px] font-mono tracking-[0.22em] text-white/45 uppercase">
            Locked
          </span>
        </motion.span>
      )}
    </motion.button>
  );
}
