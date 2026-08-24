import { motion } from 'motion/react';
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

  return (
    <motion.button
      type="button"
      aria-label={locked ? `${room.title} locked` : `Enter ${room.title}`}
      aria-disabled={locked}
      className={`room-hotspot absolute rounded-sm border transition-all duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30 ${
        locked
          ? 'cursor-not-allowed border-transparent opacity-40'
          : active
            ? 'cursor-pointer border-white/30 bg-white/[0.07] shadow-[0_0_28px_rgba(255,255,255,0.1)]'
            : 'cursor-pointer border-transparent hover:border-white/12 hover:bg-white/[0.04]'
      }`}
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: `${width}%`,
        height: `${height}%`,
      }}
      onMouseEnter={onHover}
      onClick={(e) => {
        e.stopPropagation();
        onEnter(room);
      }}
    >
      {active && !locked && (
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        >
          <span className="text-[9px] md:text-[10px] font-mono tracking-[0.25em] text-white/60 uppercase">
            {room.label}
          </span>
          <span className="text-[10px] md:text-xs font-sans tracking-[0.35em] text-white/90 uppercase mt-1">
            Enter
          </span>
        </motion.span>
      )}
      {active && locked && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <span className="text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase">
            Locked
          </span>
        </motion.span>
      )}
    </motion.button>
  );
}
