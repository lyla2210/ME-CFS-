import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { playClick, playWaringBeep } from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import {
  Dumbbell,
  ShieldAlert,
  Zap,
  Flame,
  ArrowRight,
  RotateCcw,
  Clipboard,
  Clock,
  Activity,
  AlertTriangle,
} from 'lucide-react';

interface StepThreeProps {
  onComplete: () => void;
}

type PhaseType =
  | 'baseline'
  | 'path'
  | 'exercise'
  | 'falseCalm'
  | 'delay'
  | 'crash'
  | 'densh'
  | 'logged';

type ExertionPath = 'physical' | 'dumbbell' | null;

const DELAY_HOURS = [0, 6, 12, 24, 36, 48] as const;
const SETS_TARGET = 5;
const EXERTION_CLICKS = 10;
const CRASH_CLICK_IMPULSE = 6.2;
const CRASH_GRAVITY = 48;
const CRASH_MOTION_SCALE = 50;
const CRASH_WARN_CLICKS = 3;
const CRASH_MAX_CLICKS = 20;

function DumbbellSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 40" className={`w-24 h-11 drop-shadow-[0_0_8px_currentColor] ${className ?? ''}`}>
      <rect x="0" y="5" width="20" height="30" rx="3" fill="currentColor" />
      <rect x="20" y="8" width="5" height="24" rx="1" fill="currentColor" opacity="0.8" />
      <rect x="25" y="17" width="50" height="6" rx="1" fill="currentColor" />
      <rect x="75" y="8" width="5" height="24" rx="1" fill="currentColor" opacity="0.8" />
      <rect x="80" y="5" width="20" height="30" rx="3" fill="currentColor" />
    </svg>
  );
}

function TaskProgress({
  total,
  done,
  variant = 'violet',
  clickCount,
  hint,
}: {
  total: number;
  done: number;
  variant?: 'violet' | 'red';
  clickCount?: number;
  hint?: string | null;
}) {
  const lit = variant === 'red' ? 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.5)]' : 'bg-violet-400 accent-dot';
  const dotSize = total > 6 ? 'h-2 w-2' : 'h-2.5 w-2.5';
  return (
    <div className="w-full flex flex-col items-center gap-2 pointer-events-none">
      <div className="flex flex-nowrap justify-center items-center gap-1.5 w-full px-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`${dotSize} rounded-full shrink-0 transition-all duration-200 ${
              i < done ? lit : 'bg-slate-700 border border-slate-600'
            }`}
          />
        ))}
      </div>
      <div className="flex items-center gap-3 text-[11px] font-mono tabular-nums">
        <span className={`font-bold ${variant === 'red' ? 'text-red-400' : 'text-violet-300'}`}>
          {done}/{total}
        </span>
        {clickCount !== undefined && (
          <span className="text-slate-500">Clicks: {clickCount}</span>
        )}
      </div>
      {hint && (
        <p className="text-[10px] font-mono text-violet-300/90 max-w-md text-center leading-relaxed px-2">
          {hint}
        </p>
      )}
    </div>
  );
}

export default function StepThree({ onComplete }: StepThreeProps) {
  const [phase, setPhase] = useState<PhaseType>('baseline');
  const [exertionPath, setExertionPath] = useState<ExertionPath>(null);

  const [setsDone, setSetsDone] = useState(0);
  const [baselineClickCount, setBaselineClickCount] = useState(0);
  const [liftProgress, setLiftProgress] = useState(0);
  const [exertionClicks, setExertionClicks] = useState(0);
  const [crashTotalClicks, setCrashTotalClicks] = useState(0);
  const [crashRedMode, setCrashRedMode] = useState(false);
  const [isCrashed, setIsCrashed] = useState(false);

  const [fatigue, setFatigue] = useState(0);
  const [atp, setAtp] = useState(100);

  const [donePushups, setDonePushups] = useState(false);
  const [doneJacks, setDoneJacks] = useState(false);

  const [delayIndex, setDelayIndex] = useState(0);
  const [delayAuto, setDelayAuto] = useState(false);
  const delayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const liftChamberRef = useRef<HTMLDivElement>(null);
  const crashPhysicsRef = useRef({ progress: 0, velocity: 0 });
  const repLockRef = useRef(false);
  const [maxLiftPx, setMaxLiftPx] = useState(120);

  const [feedback, setFeedback] = useState('');
  const [submittedLog, setSubmittedLog] = useState<string | null>(null);

  const hoursElapsed = DELAY_HOURS[delayIndex];
  const showDumbbell =
    phase === 'baseline' ||
    (phase === 'exercise' && exertionPath === 'dumbbell') ||
    (phase === 'crash' && !isCrashed);

  const dumbbellColor =
    isCrashed || crashRedMode
      ? 'text-red-500'
      : phase === 'crash'
        ? 'text-violet-300'
        : 'text-violet-300';

  const resetLiftVisual = useCallback(() => {
    setLiftProgress(0);
  }, []);

  useLayoutEffect(() => {
    const el = liftChamberRef.current;
    if (!el) return;
    const update = () => setMaxLiftPx(Math.max(90, el.clientHeight - 48));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [showDumbbell, phase]);

  const resetCrashPhysics = useCallback(() => {
    crashPhysicsRef.current = { progress: 0, velocity: 0 };
    repLockRef.current = false;
    setLiftProgress(0);
  }, []);

  const forceCrashComplete = useCallback(() => {
    setIsCrashed(true);
    setFatigue(100);
    setAtp(1.2);
    resetCrashPhysics();
    playWaringBeep(1400, 200, 3);
  }, [resetCrashPhysics]);

  const completeCrashRep = useCallback(() => {
    if (repLockRef.current) return;
    repLockRef.current = true;
    crashPhysicsRef.current.velocity = 0;
    crashPhysicsRef.current.progress = 100;
    setLiftProgress(100);
    playClick(880, 0.06);

    window.setTimeout(() => {
      resetCrashPhysics();
      setSetsDone((prev) => {
        const next = prev + 1;
        if (next >= SETS_TARGET) {
          forceCrashComplete();
        }
        return next;
      });
    }, 220);
  }, [forceCrashComplete, resetCrashPhysics]);

  useEffect(() => {
    if (!delayAuto || phase !== 'delay') {
      if (delayTimerRef.current) clearInterval(delayTimerRef.current);
      return;
    }

    delayTimerRef.current = setInterval(() => {
      setDelayIndex((prev) => Math.min(prev + 1, DELAY_HOURS.length - 1));
    }, 900);

    return () => {
      if (delayTimerRef.current) clearInterval(delayTimerRef.current);
    };
  }, [delayAuto, phase]);

  useEffect(() => {
    if (phase !== 'delay') return;

    if (delayIndex > 0) {
      playClick(400 + delayIndex * 80, 0.04);
    }
    if (delayIndex >= 3) {
      setFatigue(Math.min(45, 10 + delayIndex * 6));
      setAtp(Math.max(55, 90 - delayIndex * 5));
    }
    if (delayIndex >= DELAY_HOURS.length - 1) {
      setDelayAuto(false);
      playWaringBeep(900, 250, 2);
      const t = setTimeout(() => {
        setPhase('crash');
        setFatigue(55);
        setAtp(48);
        setIsCrashed(false);
        setCrashRedMode(false);
        setSetsDone(0);
        resetCrashPhysics();
        setCrashTotalClicks(0);
      }, 650);
      return () => clearTimeout(t);
    }
  }, [delayIndex, phase]);

  // Crash phase: velocity + gravity — single click rises then falls to rest; rapid clicks stack
  useEffect(() => {
    if (phase !== 'crash' || isCrashed) return;

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.04);
      last = now;

      if (!repLockRef.current) {
        const body = crashPhysicsRef.current;
        body.velocity -= CRASH_GRAVITY * dt;
        body.progress += body.velocity * dt * CRASH_MOTION_SCALE;

        if (body.progress <= 0) {
          body.progress = 0;
          if (body.velocity < 0) body.velocity = 0;
        }

        if (body.progress >= 100) {
          body.progress = 100;
          body.velocity = 0;
          setLiftProgress(100);
          completeCrashRep();
        } else {
          setLiftProgress(body.progress);
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, isCrashed, completeCrashRep]);

  const completeRep = (onDone: (nextSets: number) => void) => {
    setLiftProgress(100);
    setTimeout(() => {
      setSetsDone((prev) => {
        const next = prev + 1;
        onDone(next);
        return next;
      });
      resetLiftVisual();
    }, 280);
  };

  const handleDumbbellClick = () => {
    if (isCrashed) {
      playClick(150, 0.25);
      return;
    }

    if (phase === 'baseline') {
      if (setsDone >= SETS_TARGET) return;
      playClick(750, 0.05);
      setBaselineClickCount((c) => c + 1);
      completeRep((next) => {
        if (next >= SETS_TARGET) {
          setTimeout(() => {
            setPhase('path');
            setSetsDone(0);
            setFatigue(5);
            setAtp(95);
          }, 500);
        }
      });
      return;
    }

    if (phase === 'exercise' && exertionPath === 'dumbbell') {
      if (exertionClicks >= EXERTION_CLICKS) return;
      playClick(600 + exertionClicks * 12, 0.04);
      const next = exertionClicks + 1;
      setExertionClicks(next);
      setFatigue(Math.min(18, 8 + next * 0.4));
      setAtp(Math.max(82, 92 - next * 0.35));
      setLiftProgress(88);
      setTimeout(resetLiftVisual, 220);
      if (next >= EXERTION_CLICKS) {
        setTimeout(() => finishExertion(), 450);
      }
      return;
    }

    if (phase === 'crash' && !isCrashed) {
      if (crashTotalClicks >= CRASH_MAX_CLICKS || repLockRef.current) return;

      const nextClick = crashTotalClicks + 1;
      crashPhysicsRef.current.velocity += CRASH_CLICK_IMPULSE;
      setCrashTotalClicks(nextClick);

      if (nextClick === CRASH_WARN_CLICKS) {
        setCrashRedMode(true);
        playWaringBeep(700, 180, 2);
      }

      setFatigue(Math.min(100, 55 + nextClick * 2));
      setAtp(Math.max(1.2, 48 - nextClick * 1.1));
      playClick(Math.max(180, 520 - nextClick * 14), 0.05);

      if (nextClick >= CRASH_MAX_CLICKS) {
        window.setTimeout(() => forceCrashComplete(), 300);
      }
    }
  };

  const choosePath = (path: 'physical' | 'dumbbell') => {
    playClick(1000, 0.1);
    setExertionPath(path);
    setPhase('exercise');
    setFatigue(8);
    setAtp(92);
    if (path === 'dumbbell') {
      setExertionClicks(0);
      resetLiftVisual();
    }
  };

  const finishExertion = () => {
    playClick(1000, 0.1);
    setPhase('falseCalm');
    setFatigue(12);
    setAtp(88);
    resetLiftVisual();
  };

  const startDelay = () => {
    playClick(800, 0.08);
    setPhase('delay');
    setDelayIndex(0);
    setDelayAuto(true);
    setFatigue(10);
    setAtp(90);
  };

  const skipToPem = () => {
    playClick(500);
    setDelayAuto(false);
    if (delayTimerRef.current) clearInterval(delayTimerRef.current);
    setDelayIndex(DELAY_HOURS.length - 1);
  };

  const goToDensh = () => {
    playClick(900, 0.08);
    setPhase('densh');
  };

  const submitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    playClick(900, 0.08);
    setSubmittedLog(feedback);
    setPhase('logged');
  };

  const handleReset = () => {
    playClick(400);
    setDelayAuto(false);
    if (delayTimerRef.current) clearInterval(delayTimerRef.current);
    setPhase('baseline');
    setExertionPath(null);
    setSetsDone(0);
    setBaselineClickCount(0);
    resetLiftVisual();
    resetCrashPhysics();
    setExertionClicks(0);
    setCrashTotalClicks(0);
    setCrashRedMode(false);
    resetCrashPhysics();
    setFatigue(0);
    setAtp(100);
    setIsCrashed(false);
    setDonePushups(false);
    setDoneJacks(false);
    setDelayIndex(0);
    setFeedback('');
    setSubmittedLog(null);
  };

  const physicalReady = donePushups && doneJacks;

  const phaseLabel = () => {
    switch (phase) {
      case 'baseline':
        return 'BASELINE';
      case 'path':
        return 'CHOOSE PATH';
      case 'exercise':
        return 'EXERTION';
      case 'falseCalm':
        return 'FALSE CALM';
      case 'delay':
        return `T+${hoursElapsed}H`;
      case 'crash':
        return 'DELAYED PEM';
      case 'densh':
        return 'REALITY CHECK';
      case 'logged':
        return 'LOGGED';
      default:
        return '';
    }
  };

  const liftProgressTarget = (): {
    total: number;
    done: number;
    variant: 'violet' | 'red';
  } | null => {
    if (phase === 'baseline') return { total: SETS_TARGET, done: setsDone, variant: 'violet' };
    if (phase === 'exercise' && exertionPath === 'dumbbell') {
      return { total: EXERTION_CLICKS, done: exertionClicks, variant: 'violet' };
    }
    if (phase === 'crash' && !isCrashed) {
      return { total: SETS_TARGET, done: setsDone, variant: crashRedMode ? 'red' : 'violet' };
    }
    return null;
  };

  const renderDumbbellZone = () => {
    const progress = liftProgressTarget();
    const crashHint =
      phase === 'crash' && !isCrashed && crashTotalClicks >= CRASH_WARN_CLICKS
        ? 'Having trouble reaching the target line with a single click like before? Try clicking the dumbbell quickly and multiple times.'
        : null;

    const clickCount =
      phase === 'baseline'
        ? baselineClickCount
        : phase === 'exercise' && exertionPath === 'dumbbell'
          ? exertionClicks
          : phase === 'crash'
            ? crashTotalClicks
            : undefined;

    const liftY = (liftProgress / 100) * maxLiftPx;
    const isCrashLift = phase === 'crash';

    return (
      <div className="flex-1 flex flex-col w-full min-h-0">
        <div
          ref={liftChamberRef}
          className="relative flex-1 min-h-[200px] flex items-end justify-center"
        >
          <div className="absolute left-1/2 top-6 bottom-6 w-px bg-slate-800/40 -translate-x-1/2" />

          <div className="absolute left-6 right-6 top-6 flex items-center gap-2 pointer-events-none">
            <div className="flex-1 border-t border-dashed border-violet-400/45" />
            <span className="text-[8px] font-mono text-violet-300/60 uppercase tracking-widest shrink-0">
              Target line
            </span>
          </div>

          {isCrashLift ? (
            <button
              type="button"
              id="physio-dumbbell-item"
              onClick={handleDumbbellClick}
              disabled={isCrashed || crashTotalClicks >= CRASH_MAX_CLICKS}
              style={{ transform: `translateY(-${liftY}px)` }}
              className={`absolute bottom-6 flex flex-col items-center justify-center cursor-pointer select-none transition-colors duration-200 disabled:cursor-default disabled:opacity-50 ${dumbbellColor} hover:brightness-110 active:scale-[0.97]`}
              aria-label="Click to lift dumbbell"
            >
              <DumbbellSvg />
            </button>
          ) : (
            <motion.button
              type="button"
              id="physio-dumbbell-item"
              onClick={handleDumbbellClick}
              disabled={
                isCrashed ||
                (phase === 'baseline' && setsDone >= SETS_TARGET) ||
                (phase === 'exercise' && exertionClicks >= EXERTION_CLICKS)
              }
              animate={{ y: -liftY }}
              transition={{ type: 'spring', damping: 14, stiffness: 200 }}
              className={`absolute bottom-6 flex flex-col items-center justify-center cursor-pointer select-none transition-colors duration-300 disabled:cursor-default disabled:opacity-60 ${dumbbellColor} hover:brightness-110 active:scale-[0.97]`}
              aria-label="Click to lift dumbbell"
            >
              <DumbbellSvg />
            </motion.button>
          )}
        </div>

        {progress && (
          <div className="shrink-0 py-3 px-2">
            <TaskProgress
              total={progress.total}
              done={progress.done}
              variant={progress.variant}
              clickCount={clickCount}
              hint={crashHint}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto rounded-lg border border-white/10 overflow-hidden bg-black/80 p-4 md:p-5 font-sans">
      <div className="mb-4 border-b border-white/10 pb-3">
        <h2
          id="step-three-title"
          className="text-xl md:text-2xl font-semibold tracking-tight text-white/80 font-mono flex items-center gap-2"
        >
          <Dumbbell className="h-5 w-5 text-violet-300 animate-pulse" />
          STAGE <span className="text-violet-300">03</span>: The Weight of Gravity [Post-Exertional Malaise]
        </h2>
        <p className="text-slate-400 text-xs mt-1 leading-relaxed border-l border-white/10 pl-2">
          PEM is not &quot;getting tired after exercise.&quot; It is a delayed metabolic crash—often peaking{' '}
          <span className="text-white/85">12–48 hours</span> after the activity that seemed manageable.
          This stage lets you feel that lag, then denshes acute fatigue from ME/CFS.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-5 flex flex-col justify-between p-4 border border-slate-800 bg-slate-900/60 rounded">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white/70 tracking-wider font-mono">
                MITOCHONDRIAL ENERGY CORE
              </h3>
              <span className="text-[9px] font-mono text-slate-500 border border-slate-800 px-1.5 py-0.5 rounded">
                {phaseLabel()}
              </span>
            </div>

            <div className="space-y-2 border-y border-slate-800 py-3 font-mono text-xs text-slate-400">
              <div className="flex justify-between items-center">
                <span>Muscle Fatigue Coefficient:</span>
                <span
                  className={`font-bold ${
                    fatigue > 70 ? 'text-rose-500 text-sm animate-pulse' : 'accent-mark'
                  }`}
                >
                  {fatigue.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    fatigue > 70 ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'accent-progress'
                  }`}
                  style={{ width: `${fatigue}%` }}
                />
              </div>

              <div className="flex justify-between items-center mt-3">
                <span>Mitochondrial Efficiency [ATP]:</span>
                <span className={`font-bold ${atp < 20 ? 'text-red-400' : 'accent-mark'}`}>
                  {atp.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded overflow-hidden">
                <div
                  className={`h-full transition-all duration-350 ${
                    atp < 20 ? 'bg-red-500 shadow-[0_0_8px_rgb(239,68,68)]' : 'accent-progress'
                  }`}
                  style={{ width: `${atp}%` }}
                />
              </div>

              <div className="flex justify-between items-center mt-3 text-[10px]">
                <span>Hours since exertion:</span>
                <span
                  className={`font-bold font-mono ${
                    hoursElapsed >= 24 && phase !== 'baseline' && phase !== 'path' && phase !== 'exercise'
                      ? 'text-rose-400'
                      : 'text-white/85'
                  }`}
                >
                  {phase === 'delay' || phase === 'crash' || phase === 'densh' || phase === 'logged'
                    ? `T+${phase === 'delay' ? hoursElapsed : 48}h`
                    : '—'}
                </span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {phase === 'baseline' && (
                <motion.div
                  key="bas-guidance"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-xs text-slate-300 leading-relaxed bg-black/60 p-3 rounded-md border-l-2 border-white/20 font-mono"
                >
                  <span className="text-violet-300 font-bold block mb-1">1 · Baseline</span>
                  Click the dumbbell to lift it to the target line. Complete{' '}
                  <span className="text-white/85">{SETS_TARGET} sets</span>—each set takes a single
                  click. Notice how responsive it feels.
                </motion.div>
              )}

              {phase === 'path' && (
                <motion.div
                  key="path-guidance"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-xs text-slate-300 leading-relaxed bg-black/60 p-3 rounded-md accent-border-l font-mono"
                >
                  <span className="text-violet-300 font-bold block mb-1">2 · Choose exertion</span>
                  Optional real-world movement, or keep clicking the same 2kg dumbbell. Both paths
                  lead to the same delayed crash.
                </motion.div>
              )}

              {phase === 'exercise' && (
                <motion.div
                  key="exe-guidance"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-xs text-slate-300 leading-relaxed bg-black/60 p-3 rounded-md accent-border-l font-mono"
                >
                  <span className="text-violet-300 font-bold block mb-1">3 · Mild exertion</span>
                  {exertionPath === 'physical' ? (
                    <>
                      Complete a short real-world set. Stop if anything hurts—this is not a fitness test.
                      <span className="text-white/75 font-semibold block mt-1">
                        5 push-ups · 5 jumping jacks
                      </span>
                    </>
                  ) : (
                    <>Click the dumbbell 10 times.</>
                  )}
                </motion.div>
              )}

              {phase === 'falseCalm' && (
                <motion.div
                  key="calm-guidance"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-xs text-slate-300 leading-relaxed bg-black/60 p-3 rounded-md accent-border-l font-mono"
                >
                  <span className="text-violet-300 font-bold block mb-1">4 · False calm</span>
                  Energy looks recoverable. Many patients hear: &quot;See? You managed it.&quot; PEM has not
                  arrived yet—debt is still accruing under the surface.
                </motion.div>
              )}

              {phase === 'delay' && (
                <motion.div
                  key="delay-guidance"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-xs text-slate-300 leading-relaxed bg-black/60 p-3 rounded-md border-l-2 border-violet-400 font-mono"
                >
                  <span className="text-violet-300 font-bold block mb-1">5 · The lag that defines PEM</span>
                  Time advances toward the 12–48h window. This delay is why &quot;I felt fine after the
                  walk&quot; does not disprove ME/CFS—and why pushing through is so dangerous.
                </motion.div>
              )}

              {phase === 'crash' && (
                <motion.div
                  key="crash-guidance"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-xs text-slate-300 leading-relaxed bg-black/60 p-3 rounded-md border-l-2 border-rose-500 font-mono"
                >
                  <span className="text-rose-400 font-bold block mb-1">6 · Delayed crash (T+48h)</span>
                  Click the 2 kg dumbbell; reaching the target line counts as one rep.
                </motion.div>
              )}

              {phase === 'densh' && (
                <motion.div
                  key="densh-guidance"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-xs text-slate-300 leading-relaxed bg-black/60 p-3 rounded-md border-l-2 border-white/20 font-mono"
                >
                  <span className="text-violet-300 font-bold block mb-1">7 · Reality densh</span>
                  What you just felt is not ME/CFS. Read the contrast carefully before logging a
                  sensation note.
                </motion.div>
              )}

              {phase === 'logged' && (
                <motion.div
                  key="logged-guidance"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-slate-300 leading-relaxed bg-black/60 p-3 rounded-md border-l-2 border-green-500 font-mono"
                >
                  <span className="text-green-400 font-bold block mb-1">Log captured</span>
                  Proceed to the clinical gaslighting stage—where severe PEM still returns
                  &quot;normal&quot; labs.
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-6">
            <button
              id="reset-pem-simulation"
              onClick={handleReset}
              className="w-full py-2 bg-slate-900 border border-slate-800 hover:border-slate-750 text-slate-400 hover:text-slate-200 text-xs font-mono rounded transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="h-3 w-3" />
              Reset Stage 03
            </button>
          </div>
        </div>

        <div className="lg:col-span-7 bg-black/50 rounded relative overflow-hidden flex flex-col min-h-[360px]">
          {(isCrashed || crashRedMode) && (
            <div className="absolute inset-0 bg-red-950/10 animate-pulse z-0 pointer-events-none" />
          )}

          <div className="z-10 flex-1 flex flex-col min-h-0 p-2">
            {showDumbbell ? (
              renderDumbbellZone()
            ) : (
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 w-full">
              <AnimatePresence mode="wait">
                {phase === 'path' && (
                  <motion.div
                    key="path-choice"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="w-full space-y-3"
                  >
                    <p className="text-[10px] text-slate-500 font-mono text-center uppercase tracking-wider">
                      How do you want to incur metabolic debt?
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        id="path-physical"
                        onClick={() => choosePath('physical')}
                        className="p-4 rounded border border-white/10 bg-white/5 hover:border-white/20 text-left transition-all cursor-pointer group"
                      >
                        <Activity className="h-5 w-5 text-white/60 mb-2 group-hover:text-violet-300" />
                        <div className="text-xs font-mono font-bold text-white/85 mb-1">
                          Physical path
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                          Optional: 5 push-ups + 5 jumping jacks. Skip if you cannot or prefer not to.
                        </p>
                      </button>
                      <button
                        id="path-dumbbell"
                        onClick={() => choosePath('dumbbell')}
                        className="p-4 rounded border border-white/10 bg-white/5 hover:border-white/20 text-left transition-all cursor-pointer group"
                      >
                        <Dumbbell className="h-5 w-5 text-violet-300 mb-2" />
                        <div className="text-xs font-mono font-bold text-white/85 mb-1">
                          Dumbbell path
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                          Click the same 2kg load {EXERTION_CLICKS} times. No real-world exercise needed.
                        </p>
                      </button>
                    </div>
                  </motion.div>
                )}

                {phase === 'exercise' && exertionPath === 'physical' && (
                  <motion.div
                    key="exe-physical"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full p-3 bg-slate-900/60 border border-slate-800 rounded text-left space-y-3"
                  >
                    <div className="text-[10.5px] font-mono text-white/75 font-bold flex items-center gap-1.5 uppercase">
                      <Flame className="h-4 w-4 text-violet-300 animate-pulse" />
                      Optional physical checklist
                    </div>
                    <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                      Stop immediately if dizzy, in pain, or unwell.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                      <label className="flex items-center gap-2 p-2 rounded bg-slate-950 border border-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={donePushups}
                          onChange={(e) => {
                            playClick();
                            setDonePushups(e.target.checked);
                          }}
                          className="accent-checkbox"
                        />
                        <span>I finished 5 push-ups</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 rounded bg-slate-950 border border-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={doneJacks}
                          onChange={(e) => {
                            playClick();
                            setDoneJacks(e.target.checked);
                          }}
                          className="accent-checkbox"
                        />
                        <span>I finished 5 jumping jacks</span>
                      </label>
                    </div>
                    <button
                      id="proceed-after-physical"
                      disabled={!physicalReady}
                      onClick={finishExertion}
                      className={`w-full py-2.5 font-mono text-xs font-bold rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        physicalReady
                          ? 'accent-btn'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      <span>I&apos;m done — continue</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}

                {phase === 'falseCalm' && (
                  <motion.div
                    key="false-calm"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full p-4 bg-slate-900/50 border border-white/10 rounded text-left space-y-3"
                  >
                    <div className="text-white/75 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-violet-300" />
                      Status: Recoverable · No crash detected
                    </div>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      Your meters look fine. A doctor, coach, or relative might say you &quot;tolerated
                      exercise well.&quot; In ME/CFS, this is often the most dangerous moment—because PEM
                      arrives later, when everyone assumes you are okay.
                    </p>
                    <button
                      id="advance-time-btn"
                      onClick={startDelay}
                      className="w-full py-2.5 accent-btn rounded cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Clock className="h-4 w-4" />
                      Advance time into the PEM window
                    </button>
                  </motion.div>
                )}

                {phase === 'delay' && (
                  <motion.div
                    key="delay-clock"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full space-y-4"
                  >
                    <div className="text-center py-4">
                      <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] mb-2">
                        Hours since exertion
                      </div>
                      <motion.div
                        key={hoursElapsed}
                        initial={{ opacity: 0.4, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`text-5xl md:text-6xl font-mono font-bold tabular-nums accent-glow ${
                          hoursElapsed >= 24 ? 'text-rose-400' : 'text-violet-300'
                        }`}
                      >
                        T+{hoursElapsed}h
                      </motion.div>
                      <p className="text-[11px] text-slate-400 mt-3 font-sans max-w-sm mx-auto leading-relaxed">
                        {hoursElapsed < 12 &&
                          'Still within the false-calm window. Many patients look &quot;fine&quot; here.'}
                        {hoursElapsed >= 12 &&
                          hoursElapsed < 36 &&
                          'Entering the classic PEM onset range (12–48h). Capacity starts eroding.'}
                        {hoursElapsed >= 36 &&
                          'Peak delayed malaise window. Ordinary tasks now cost a disproportionate price.'}
                      </p>
                    </div>

                    <div className="flex justify-between px-1">
                      {DELAY_HOURS.map((h, i) => (
                        <div key={h} className="flex flex-col items-center gap-1">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              i <= delayIndex
                                ? i === delayIndex
                                  ? 'accent-dot ring-2 ring-violet-400/30 ring-offset-1 ring-offset-black'
                                  : hoursElapsed >= 24 && h >= 24
                                    ? 'bg-rose-400/80'
                                    : 'bg-violet-400/70'
                                : 'bg-slate-700'
                            }`}
                          />
                          <span className="text-[8px] font-mono text-slate-600">{h}h</span>
                        </div>
                      ))}
                    </div>

                    <button
                      id="skip-to-pem"
                      onClick={skipToPem}
                      className="w-full py-2 accent-btn-ghost rounded cursor-pointer"
                    >
                      Skip ahead to T+48h crash
                    </button>
                  </motion.div>
                )}

                {phase === 'crash' && isCrashed && (
                  <motion.div
                    key="crash-continue"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full p-4 bg-red-950/30 border border-red-500/30 rounded space-y-3"
                  >
                    <div className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <ShieldAlert className="h-4 w-4" />
                      Cellular capacity locked · ATP ≈ 1.2%
                    </div>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      You cannot push through this without deepening the crash. Next: a densh so this
                      minute of discomfort is not mistaken for living with ME/CFS.
                    </p>
                    <button
                      id="goto-densh"
                      onClick={goToDensh}
                      className="w-full py-2.5 bg-rose-500 hover:bg-rose-400 text-slate-950 font-mono text-xs font-bold rounded cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      Open reality densh
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}

                {phase === 'densh' && (
                  <motion.div
                    key="densh-panel"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="w-full space-y-3 text-left"
                  >
                    <div className="flex items-center gap-2 text-white/75 font-mono text-xs font-bold uppercase tracking-wider">
                      <AlertTriangle className="h-4 w-4 text-violet-300" />
                      Do not confuse these two experiences
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded border border-slate-700 bg-slate-900/50">
                        <div className="text-[10px] font-mono text-slate-400 uppercase mb-2">
                          What you felt (simulation)
                        </div>
                        <ul className="text-[11px] text-slate-300 font-sans space-y-1.5 leading-relaxed list-disc list-inside">
                          <li>Minutes of awkward effort</li>
                          <li>A compressed &quot;wait&quot; for 48 hours</li>
                          <li>A heavy lift you can walk away from</li>
                          <li>You can restart this stage anytime</li>
                        </ul>
                      </div>
                      <div className="p-3 rounded border border-rose-500/30 bg-rose-950/20">
                        <div className="text-[10px] font-mono text-rose-400 uppercase mb-2">
                          What patients live (ME/CFS PEM)
                        </div>
                        <ul className="text-[11px] text-slate-300 font-sans space-y-1.5 leading-relaxed list-disc list-inside">
                          <li>Crash lasting days to weeks after mild activity</li>
                          <li>Bedbound, light/sound intolerant, word-finding loss</li>
                          <li>Even basic self-care can deepen the crash</li>
                          <li>No reset button — only pacing inside a fragile envelope</li>
                        </ul>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed border-l-2 border-white/12 pl-3">
                      Feeling tired after push-ups is acute fatigue. PEM is a delayed, multi-system
                      collapse. Understanding the difference is the point of this stage—not claiming
                      you &quot;now know what ME feels like.&quot;
                    </p>

                    <form onSubmit={submitFeedback} className="space-y-2 pt-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                        Optional: one sentence on what surprised you about the delay
                      </label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="w-full h-20 bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 font-mono focus:border-white/60 focus:outline-none resize-none leading-relaxed placeholder:text-slate-600"
                        placeholder="e.g., I expected to crash right after the exercise, not two days later..."
                        required
                      />
                      <button
                        type="submit"
                        className="w-full py-2 accent-btn text-xs font-mono font-bold rounded cursor-pointer"
                      >
                        Save reflection & continue
                      </button>
                    </form>
                  </motion.div>
                )}

                {phase === 'logged' && (
                  <motion.div
                    key="logged-confirmation"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full p-4 bg-slate-900/60 border border-emerald-500/25 rounded text-left space-y-2 font-mono text-xs"
                  >
                    <div className="text-emerald-400 font-bold flex items-center gap-1">
                      <Clipboard className="h-4 w-4" />
                      <span>REFLECTION RECORDED</span>
                    </div>
                    <div className="italic p-2 bg-black/80 rounded border border-slate-800 text-slate-300 font-sans">
                      &quot;{submittedLog}&quot;
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal font-sans">
                      Next, the clinic will return pristine labs—another reason PEM is so often
                      dismissed.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-800 pt-3 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
          <ShieldAlert className="h-4 w-4 text-slate-500 shrink-0" />
          <span>
            PEM ≠ acute tiredness. NICE / CDC advise pacing within an energy envelope—not graded
            exercise that ignores delayed crashes.
          </span>
        </div>

        {phase === 'logged' && (
          <button
            id="proceed-step-four-btn"
            onClick={() => {
              playClick(1200);
              onComplete();
            }}
            className="px-4 py-2 accent-btn font-mono text-xs font-bold rounded flex items-center gap-1.5 transition-all shadow-[0_0_8px_rgba(255,255,255,0.06)] cursor-pointer shrink-0"
          >
            Review Clinical Labs & Reports
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
