import React, { useState, useEffect, useRef } from 'react';
import { playClick, playWaringBeep } from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import { Play, ChevronRight, Clock } from 'lucide-react';

interface StepOneProps {
  onComplete: () => void;
}

const ACTIONS = [
  {
    label: 'Action 1',
    detail:
      'Sit naturally with both feet flat on the floor. Keep your back slightly away from the backrest and allow your arms to rest naturally on the armrests. Maintain this position until the next prompt.',
  },
  {
    label: 'Action 2',
    detail:
      'Extend your right hand toward your left shoulder. At the same time, bring your left arm behind you and around to your right waist. Maintain this position for 20 seconds, then close your eyes and relax.',
  },
  {
    label: 'Action 3',
    detail:
      'Maintain the previous posture. However, tilt your head to the right side and fully extend your feet downward, pointing your toes. Keep your eyes closed and sustain this position for 20 seconds.',
  },
] as const;

const ACTION_SECONDS = 20;

type Phase = 'idle' | 'holding' | 'awaitingNext' | 'done';

export default function StepOne({ onComplete }: StepOneProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [actionIndex, setActionIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(ACTION_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase !== 'holding') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          playWaringBeep(880, 440, 2);
          setPhase('awaitingNext');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, actionIndex]);

  const startAction = (index: number) => {
    setActionIndex(index);
    setSecondsLeft(ACTION_SECONDS);
    setPhase('holding');
  };

  const handleStart = () => {
    playClick(1000);
    startAction(0);
  };

  const handleNext = () => {
    playClick(900);
    if (actionIndex >= ACTIONS.length - 1) {
      setPhase('done');
      return;
    }
    startAction(actionIndex + 1);
  };

  const current = ACTIONS[actionIndex];

  return (
    <div className="w-full max-w-2xl mx-auto rounded-lg border border-white/10 bg-black/80 p-5 md:p-8 font-sans">
      <header className="mb-8 border-b border-white/10 pb-5">
        <h2
          id="step-one-title"
          className="text-xl md:text-2xl font-semibold tracking-tight text-white/85 font-mono"
        >
          STAGE <span className="text-violet-300">01</span>: The Impossible Rest
        </h2>
        <p className="text-slate-400 text-sm mt-2 leading-relaxed max-w-xl">
          Healthy sleep restores energy. In ME/CFS, rest often fails to recharge the body at all.
        </p>
      </header>

      <AnimatePresence mode="wait">
        {phase === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center text-center gap-6 py-6"
          >
            <p className="text-sm text-slate-300 leading-relaxed max-w-md">
              Online Experience 1.0 is an{' '}
              <span className="text-white/85">accelerated simulation</span>: three postures,
              one minute total — 20 seconds each.
            </p>
            <button
              id="start-rest-sim-btn"
              onClick={handleStart}
              className="px-6 py-3 accent-btn rounded flex items-center gap-2 font-mono text-sm cursor-pointer"
            >
              <Play className="h-4 w-4 fill-slate-950" />
              Begin
            </button>
          </motion.div>
        )}

        {(phase === 'holding' || phase === 'awaitingNext') && current && (
          <motion.div
            key={`action-${actionIndex}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col items-center gap-6"
          >
            <p className="text-center text-[11px] md:text-xs font-mono text-slate-500 tracking-wide uppercase leading-relaxed max-w-md">
              Online Experience 1.0 · Accelerated simulation
              <br />
              3 actions · 1 minute total · 20 seconds each
            </p>

            <div className="text-center">
              <div
                className={`font-mono text-5xl md:text-6xl font-bold tracking-tight tabular-nums ${
                  phase === 'awaitingNext' ? 'text-amber-400/90' : 'text-violet-300 accent-glow'
                }`}
              >
                {String(secondsLeft).padStart(2, '0')}
              </div>
              <div className="mt-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1.5">
                <Clock className="h-3 w-3" />
                {phase === 'holding' ? 'Hold posture' : 'Time up'}
              </div>
            </div>

            <div className="w-full border-t border-white/8 pt-5 space-y-2">
              <div className="text-xs font-mono text-white/60">
                {current.label}
                <span className="text-slate-600"> · {actionIndex + 1}/{ACTIONS.length}</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{current.detail}</p>
            </div>

            {phase === 'awaitingNext' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full flex flex-col items-center gap-3 pt-1"
              >
                <p className="text-xs font-mono text-amber-400/90 text-center">
                  {actionIndex >= ACTIONS.length - 1
                    ? 'Action complete. Click Next to continue.'
                    : 'Action complete. Click Next for the next posture.'}
                </p>
                <button
                  id="next-action-btn"
                  onClick={handleNext}
                  className="px-6 py-3 accent-btn rounded flex items-center gap-2 font-mono text-sm cursor-pointer"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-6 py-2"
          >
            <p className="text-sm text-slate-300 leading-relaxed">
              For a quick online experience, this session was shortened. In real rest, however,
              people with ME/CFS are like the regular population who must shift posture every so
              often — except that those interruptions mean they cannot obtain effective rest.
            </p>
            <button
              id="proceed-step-two-btn"
              onClick={() => {
                playClick(1200);
                onComplete();
              }}
              className="self-start px-5 py-2.5 accent-btn font-mono text-xs rounded flex items-center gap-1.5 cursor-pointer"
            >
              Continue to Stage 02
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
