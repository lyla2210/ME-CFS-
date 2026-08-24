import React, { useState, useEffect, useRef } from 'react';
import { playClick, playWaringBeep } from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import {
  Dumbbell,
  ShieldAlert,
  Zap,
  Flame,
  ChevronUp,
  ArrowRight,
  RotateCcw,
  Clipboard,
  Clock,
  Monitor,
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

type ExertionPath = 'physical' | 'ui' | null;

const DELAY_HOURS = [0, 6, 12, 24, 36, 48] as const;

export default function StepThree({ onComplete }: StepThreeProps) {
  const [phase, setPhase] = useState<PhaseType>('baseline');
  const [exertionPath, setExertionPath] = useState<ExertionPath>(null);
  const [baselineCount, setBaselineCount] = useState(0);
  const [crashCount, setCrashCount] = useState(0);

  const [fatigue, setFatigue] = useState(0);
  const [atp, setAtp] = useState(100);
  const [dumbbellY, setDumbbellY] = useState(0);
  const [isCrashed, setIsCrashed] = useState(false);

  // Physical checklist
  const [donePushups, setDonePushups] = useState(false);
  const [doneJacks, setDoneJacks] = useState(false);

  // UI-only exertion: rapid taps
  const [uiTapCount, setUiTapCount] = useState(0);
  const UI_TAP_TARGET = 25;

  // Delayed PEM clock
  const [delayIndex, setDelayIndex] = useState(0);
  const [delayAuto, setDelayAuto] = useState(false);
  const delayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Feedback
  const [feedback, setFeedback] = useState('');
  const [submittedLog, setSubmittedLog] = useState<string | null>(null);

  const hoursElapsed = DELAY_HOURS[delayIndex];

  // Advance the delayed-PEM clock while in the delay phase
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

  // Side effects as the clock ticks; enter crash at T+48h
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
      // Enter crash on next frame so we are not cancelled by delayAuto cleanup
      const t = setTimeout(() => {
        setPhase('crash');
        setFatigue(55);
        setAtp(48);
        setIsCrashed(false);
        setCrashCount(0);
      }, 650);
      return () => clearTimeout(t);
    }
  }, [delayIndex, phase]);

  const handleBaselineLift = () => {
    playClick(750, 0.05);
    setBaselineCount((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        setTimeout(() => {
          setPhase('path');
          setFatigue(5);
          setAtp(95);
        }, 700);
      }
      return next;
    });
    setDumbbellY(-45);
    setTimeout(() => setDumbbellY(0), 200);
  };

  const choosePath = (path: 'physical' | 'ui') => {
    playClick(1000, 0.1);
    setExertionPath(path);
    setPhase('exercise');
    setFatigue(8);
    setAtp(92);
  };

  const handleUiTap = () => {
    if (uiTapCount >= UI_TAP_TARGET) return;
    playClick(600 + uiTapCount * 12, 0.04);
    const next = uiTapCount + 1;
    setUiTapCount(next);
    // Feels "fine" — only mild cost during exertion
    setFatigue(Math.min(18, 8 + next * 0.4));
    setAtp(Math.max(82, 92 - next * 0.35));
    setDumbbellY(-20);
    setTimeout(() => setDumbbellY(0), 120);
  };

  const finishExertion = () => {
    playClick(1000, 0.1);
    // False calm: looks recovered / "I can push through"
    setPhase('falseCalm');
    setFatigue(12);
    setAtp(88);
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
    // Jumping to final tick lets the delayIndex effect open the crash phase
    setDelayIndex(DELAY_HOURS.length - 1);
  };

  const handleCrashLift = () => {
    if (isCrashed) {
      playClick(150, 0.25);
      return;
    }

    const nextCount = crashCount + 1;
    setCrashCount(nextCount);

    const currentFatigue = Math.min(100, 55 + nextCount * 15);
    setFatigue(currentFatigue);
    setAtp(Math.max(1.2, 48 - nextCount * 15.5));

    const pitch = Math.max(180, 550 - nextCount * 90);
    playClick(pitch, 0.06);

    const heightMultiplier = Math.max(0.06, 1.0 - (currentFatigue / 100) * 1.1);
    setDumbbellY(-28 * heightMultiplier);
    setTimeout(() => setDumbbellY(0), 320);

    if (currentFatigue >= 100) {
      setIsCrashed(true);
      playWaringBeep(1400, 200, 4);
    }
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
    setBaselineCount(0);
    setCrashCount(0);
    setFatigue(0);
    setAtp(100);
    setDumbbellY(0);
    setIsCrashed(false);
    setDonePushups(false);
    setDoneJacks(false);
    setUiTapCount(0);
    setDelayIndex(0);
    setFeedback('');
    setSubmittedLog(null);
  };

  const physicalReady = donePushups && doneJacks;
  const uiReady = uiTapCount >= UI_TAP_TARGET;

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

  return (
    <div className="w-full max-w-4xl mx-auto rounded-lg border border-white/10 overflow-hidden bg-black/80 p-6 md:p-8 font-sans">
      {/* Title */}
      <div className="mb-6 border-b border-white/10 pb-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: meters + guidance */}
        <div className="lg:col-span-5 flex flex-col justify-between p-5 border border-slate-800 bg-slate-900/60 rounded">
          <div className="space-y-4">
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
                    fatigue > 70
                      ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                      : 'accent-progress'
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
                  Lift the light 2kg load three times. Notice how easy and responsive it feels—healthy
                  homeostasis before any metabolic debt is incurred.
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
                  Physical participation is optional. Both paths create the same teaching beat: activity
                  that feels okay now, then delayed collapse.
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
                    <>
                      Rapidly tap the UI load {UI_TAP_TARGET} times. You should still feel mostly fine
                      afterward—that is intentional.
                    </>
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
                  Same labeled 2kg load. Same button. Different body. Try lifting—watch ATP collapse.
                  This is a tiny slice of what PEM feels like.
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

        {/* Right: interactive stage */}
        <div className="lg:col-span-7 border border-slate-800 bg-slate-900/30 rounded p-5 relative overflow-hidden flex flex-col justify-between min-h-[400px]">
          {isCrashed && (
            <div className="absolute inset-0 bg-red-950/15 animate-pulse z-0 pointer-events-none border border-red-500/20" />
          )}

          <div className="z-10 bg-black/80 py-4 px-6 rounded border border-slate-800 flex-1 flex flex-col items-center justify-center relative">
            {/* Dumbbell visual — shown in lift-related phases */}
            {(phase === 'baseline' ||
              phase === 'exercise' ||
              phase === 'crash' ||
              phase === 'falseCalm') && (
              <div className="relative w-full h-36 flex items-center justify-center border-b border-dashed border-slate-800 mb-2">
                <div className="absolute left-1/2 top-4 bottom-0 w-[1px] bg-slate-800" />
                <div className="absolute bottom-0 inset-x-8 h-1 bg-slate-800" />

                <div className="absolute top-4 right-4 font-mono text-[9px] text-slate-500 text-right uppercase">
                  <div>PEM G-LOAD MULTIPLIER:</div>
                  <div
                    className={`font-bold ${
                      isCrashed ? 'text-red-500 text-xs' : 'accent-mark'
                    }`}
                  >
                    {isCrashed
                      ? '24.50 G [CRITICAL]'
                      : phase === 'crash'
                        ? `${(4.2 + fatigue * 0.08).toFixed(2)} G`
                        : '1.00 G [NOMINAL]'}
                  </div>
                </div>

                <motion.div
                  id="physio-dumbbell-item"
                  animate={{ y: dumbbellY }}
                  transition={{ type: 'spring', damping: 14, stiffness: 90 }}
                  className={`absolute flex flex-col items-center justify-center transition-colors duration-200 ${
                    isCrashed
                      ? 'text-red-500'
                      : phase === 'crash'
                        ? 'text-white/70'
                        : 'text-violet-300'
                  }`}
                  style={{ bottom: 4 }}
                >
                  {fatigue > 70 && (
                    <div className="text-[7.5px] bg-red-950 border border-red-500/30 px-1 rounded animate-bounce text-red-400 mb-1 font-mono uppercase tracking-widest font-extrabold">
                      PEM Threshold Breached
                    </div>
                  )}
                  <svg viewBox="0 0 100 40" className="w-24 h-11 drop-shadow-[0_0_8px_currentColor]">
                    <rect x="0" y="5" width="20" height="30" rx="3" fill="currentColor" />
                    <rect x="20" y="8" width="5" height="24" rx="1" fill="currentColor" opacity="0.8" />
                    <rect x="25" y="17" width="50" height="6" rx="1" fill="currentColor" />
                    <rect x="75" y="8" width="5" height="24" rx="1" fill="currentColor" opacity="0.8" />
                    <rect x="80" y="5" width="20" height="30" rx="3" fill="currentColor" />
                  </svg>
                  <span className="text-[10px] font-mono mt-1 font-bold tracking-wider">
                    2kg [LABELLED]
                  </span>
                </motion.div>
              </div>
            )}

            <div className="mt-2 w-full flex justify-center z-20">
              <AnimatePresence mode="wait">
                {/* Baseline */}
                {phase === 'baseline' && (
                  <motion.div
                    key="bas-btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full flex justify-center"
                  >
                    <button
                      id="dumbbell-lift-trigger-bas"
                      onClick={handleBaselineLift}
                      className="px-6 py-3 w-4/5 rounded accent-btn active:scale-95 transition-all font-mono text-xs font-bold shadow-[0_0_12px_rgba(255,255,255,0.08)] cursor-pointer flex flex-col items-center"
                    >
                      <ChevronUp className="h-4 w-4 animate-bounce shrink-0 mb-0.5" />
                      <span>Lift Dumbbell A (2kg)</span>
                      <span className="text-[9px] opacity-65 font-normal mt-0.5">
                        Lifts logged: {baselineCount} / 3
                      </span>
                    </button>
                  </motion.div>
                )}

                {/* Path choice */}
                {phase === 'path' && (
                  <motion.div
                    key="path-choice"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="w-full space-y-3"
                  >
                    <p className="text-[10px] text-slate-500 font-mono text-center uppercase tracking-wider">
                      Select how you want to incur metabolic debt
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
                        id="path-ui"
                        onClick={() => choosePath('ui')}
                        className="p-4 rounded border border-white/10 bg-white/5 hover:border-white/20 text-left transition-all cursor-pointer group"
                      >
                        <Monitor className="h-5 w-5 text-violet-300 mb-2" />
                        <div className="text-xs font-mono font-bold text-white/85 mb-1">
                          Interface-only path
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                          Rapid tap the UI load. Same delayed-PEM lesson, no real-world exercise.
                        </p>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Exercise */}
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
                      Stop immediately if dizzy, in pain, or unwell. You can switch to the
                      interface-only path anytime.
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
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        id="switch-to-ui"
                        onClick={() => {
                          playClick();
                          setExertionPath('ui');
                          setUiTapCount(0);
                        }}
                        className="flex-1 py-2 text-[10px] font-mono text-slate-400 border border-slate-800 rounded hover:text-slate-200 cursor-pointer"
                      >
                        Switch to interface-only
                      </button>
                      <button
                        id="proceed-after-physical"
                        disabled={!physicalReady}
                        onClick={finishExertion}
                        className={`flex-1 py-2.5 font-mono text-xs font-bold rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          physicalReady
                            ? 'accent-btn'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        }`}
                      >
                        <span>I&apos;m done — continue</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {phase === 'exercise' && exertionPath === 'ui' && (
                  <motion.div
                    key="exe-ui"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full flex flex-col items-center gap-3"
                  >
                    <button
                      id="ui-exertion-tap"
                      onClick={handleUiTap}
                      disabled={uiReady}
                      className={`px-6 py-3 w-4/5 rounded font-mono text-xs font-bold cursor-pointer flex flex-col items-center transition-all ${
                        uiReady
                          ? 'bg-slate-800 text-slate-500 cursor-default'
                          : 'accent-btn active:scale-95 shadow-[0_0_12px_rgba(255,255,255,0.08)]'
                      }`}
                    >
                      <ChevronUp className="h-4 w-4 animate-bounce shrink-0 mb-0.5" />
                      <span>Rapid Lift (UI exertion)</span>
                      <span className="text-[9px] opacity-65 font-normal mt-0.5">
                        Taps: {uiTapCount} / {UI_TAP_TARGET}
                      </span>
                    </button>
                    {uiReady && (
                      <button
                        id="proceed-after-ui"
                        onClick={finishExertion}
                        className="px-6 py-2.5 w-4/5 rounded accent-btn font-mono text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        Exertion complete — continue
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </motion.div>
                )}

                {/* False calm */}
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

                {/* Delay clock */}
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

                    {/* Timeline ticks */}
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

                {/* Crash lifts */}
                {phase === 'crash' && !isCrashed && (
                  <motion.div
                    key="crash-btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full flex flex-col items-center gap-2"
                  >
                    <p className="text-[10px] text-rose-400/80 font-mono text-center mb-1">
                      Two days later. Same 2kg label. Try it.
                    </p>
                    <button
                      id="dumbbell-lift-trigger-crash"
                      onClick={handleCrashLift}
                      className="px-6 py-3 w-4/5 rounded bg-rose-950/20 text-rose-300 border border-red-500/40 hover:bg-rose-900/30 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.2)] font-mono text-xs font-bold cursor-pointer flex flex-col items-center"
                    >
                      <ChevronUp className="h-4 w-4 animate-bounce shrink-0 mb-0.5" />
                      <span>Lift Dumbbell B (Labeled 2kg)</span>
                      <span className="text-[9px] opacity-65 font-normal mt-0.5">
                        Attempts: {crashCount}
                      </span>
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

                {/* Densh */}
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
                          <li>A heavy UI lift you can walk away from</li>
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

                {/* Logged */}
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
          </div>

          <AnimatePresence>
            {(phase === 'crash' || phase === 'densh') && isCrashed && phase === 'crash' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 border border-rose-500/30 bg-red-950/20 p-4 rounded text-xs font-mono leading-relaxed"
                id="pem-crash-details"
              >
                <div className="font-bold mb-1 flex items-center gap-1 text-rose-400">
                  <Zap className="h-3.5 w-3.5 animate-pulse" />
                  Delayed PEM (T+48h):
                </div>
                <span className="text-slate-300 font-sans">
                  The effort that felt tolerable yesterday is collecting interest. This is why graded
                  exercise can push people off a cliff—progress looks fine until the delayed crash
                  erases the baseline.
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 border-t border-slate-800 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
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
