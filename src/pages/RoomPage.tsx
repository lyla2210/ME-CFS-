import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import PageTransition from '../components/layout/PageTransition';
import CyberGrid from '../components/CyberGrid';
import { isRoomId, ROOM_BY_ID } from '../config/rooms';
import { isRoomUnlocked } from '../utils/progress';
import { playClick } from '../utils/audio';

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();

  if (!isRoomId(roomId)) {
    return <Navigate to="/" replace />;
  }

  const room = ROOM_BY_ID[roomId];

  if (!isRoomUnlocked(room.order)) {
    return <Navigate to="/" replace />;
  }

  return (
    <PageTransition className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      <CyberGrid />

      <header className="relative z-10 px-6 md:px-10 pt-8 md:pt-10 flex items-center justify-between">
        <Link
          to="/"
          onClick={() => playClick(600)}
          className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.25em] text-slate-500 hover:text-slate-300 uppercase transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to space
        </Link>
        <span className="text-[10px] font-mono tracking-[0.3em] text-slate-600 uppercase">
          {room.label}
        </span>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-16">
        <div className="w-full max-w-3xl text-center space-y-8">
          <div className="mx-auto max-w-xl rounded-sm overflow-hidden border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.85)]">
            <img
              src={room.image}
              alt={room.title}
              className="w-full h-auto max-h-[40vh] object-contain bg-black"
            />
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-mono tracking-[0.35em] text-slate-500 uppercase">
              {room.label} · Entered
            </p>
            <h1 className="text-2xl md:text-4xl font-sans font-light tracking-[0.12em] uppercase">
              {room.title}
            </h1>
            <p className="text-xs md:text-sm text-slate-400 font-sans tracking-wide max-w-lg mx-auto">
              {room.subtitle}
            </p>
          </div>

          <div className="pt-4">
            <Link
              to={`/simulation?step=${room.simulationStep ?? 1}`}
              onClick={() => playClick(900, 0.1)}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-slate-600 hover:border-white/40 text-[11px] font-mono tracking-[0.25em] uppercase text-white/90 hover:text-white transition-all"
            >
              Begin experience
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    </PageTransition>
  );
}
