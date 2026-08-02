import React, { useState, useEffect, useRef } from 'react';
import { playClick, playWaringBeep } from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Play, RotateCcw, Fingerprint, Clock, Zap, AlertTriangle, RefreshCw } from 'lucide-react';

interface StepOneProps {
  onComplete: () => void;
}

const POSTURES = [
  {
    title: "Posture A: Head Tilt & Static Pelvic Tension",
    detail: "Tilt your head 45 degrees to the left, interlock your fingers tightly behind your back, and contract your leg muscles. Remain completely still until the simulator triggers the next cycle.",
    energyCost: "Mitochondrial Load: Rising",
  },
  {
    title: "Posture B: Frontal Finger Pressure & Fixed Gaze",
    detail: "Press your palms together and place both index fingers firmly against the center of your forehead. Keep your eyes wide open, staring intently at the flickering cyan dot. Do not blink.",
    energyCost: "Autonomic Stress: Hyper-Arousal",
  },
  {
    title: "Posture C: Contra-Cross & Unilateral Balance",
    detail: "Cross your right thigh tightly over your left. Lean your torso forward as heavily as possible against your knees. Lightly pinch your left earlobe with your right hand. Maintain shallow chest breathing.",
    energyCost: "PEM Threat Factor: Critical"
  },
  {
    title: "Posture D: Isometric Shrug & Dyspneic Respiration",
    detail: "Shrug both shoulders as high as possible, pinning them to your ears. Maintain rapid, extremely shallow chest breathing (short inhales, short exhales). Prevent any abdominal movement.",
    energyCost: "CO2 Saturation State: Congested"
  }
];

export default function StepOne({ onComplete }: StepOneProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentPostureIdx, setCurrentPostureIdx] = useState(-1);
  const [secondsLeft, setSecondsLeft] = useState(180);
  const [sensorPressed, setSensorPressed] = useState(false);
  const [postureInterrupted, setPostureInterrupted] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [totalInterruptionCount, setTotalInterruptionCount] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const totalPhaseTime = 180;

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            playWaringBeep(1000, 300, 3);
            setIsRunning(false);
            return 0;
          }
          const next = prev - 1;
          // Every 20 seconds, standard rest is interrupted (elapsed = 20, 40, etc.)
          if (next % 20 === 0) {
            playWaringBeep(1000, 300, 3);
            setTotalInterruptionCount(p => p + 1);
            setPostureInterrupted(true);
            setIsRunning(false);
            setAlertMessage("Due to mitochondrial clearance breakdown, standard sleep and immobility fail to restore charge. Autonomic stagnation detected. You must re-align physical posture to seek biochemical homeostasis!");
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleStart = () => {
    playClick(1000);
    setIsRunning(true);
    setPostureInterrupted(false);
    if (currentPostureIdx === -1) {
      setCurrentPostureIdx(0);
    }
  };

  const handlePause = () => {
    playClick(600);
    setIsRunning(false);
  };

  const handleReset = () => {
    playClick(400);
    setIsRunning(false);
    setPostureInterrupted(false);
    setCurrentPostureIdx(-1);
    setSecondsLeft(totalPhaseTime);
    setTotalInterruptionCount(0);
  };

  const handleSensorDown = () => {
    playClick(900, 0.1);
    setSensorPressed(true);

    if (postureInterrupted) {
      setTimeout(() => {
        setSensorPressed(false);
        setPostureInterrupted(false);
        setIsRunning(true);
        // Switch to the next posture title & instruction details
        setCurrentPostureIdx((prev) => (prev + 1) % POSTURES.length);
      }, 1500);
    }
  };

  const handleSensorUp = () => {
    setSensorPressed(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-lg border border-cyan-500/30 overflow-hidden bg-slate-950/80 p-6 md:p-8 font-sans">
      
      {/* Header and Introduction */}
      <div className="mb-6 border-b border-cyan-500/20 pb-4">
        <div className="flex justify-between items-start flex-col sm:flex-row gap-4">
          <div>
            <h2 id="step-one-title" className="text-xl md:text-2xl font-semibold tracking-tight text-cyan-400 font-mono flex items-center gap-2">
              <Zap className="h-5 w-5 animate-pulse text-cyan-400" />
              STAGE 01: The Impossible Rest [Non-Restorative Sleep]
            </h2>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              Healthy people recharge via sleep. For ME/CFS patients, sleep acts like charging a battery with a critical leak—it fails to restore cellular energy (ATP). This stage simulates this unreachable sense of tranquility.
            </p>
          </div>
          
          {/* Mode Indicator */}
          <div className="flex items-center gap-2 bg-slate-905 border border-cyan-500/20 px-3 py-1.5 rounded text-xs font-mono text-cyan-400 bg-cyan-950/20">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>3-MIN PEM IMMERSION</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[380px]">
        
        {/* Left Control Column */}
        <div className="lg:col-span-5 flex flex-col justify-between p-5 border border-slate-800 bg-slate-900/60 rounded">
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-cyan-400 tracking-wider font-mono">PHYSIOLOGICAL SIMULATOR</h3>
            
            {/* Round display status */}
            <div className="py-2 border-y border-slate-800">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Interruption Cycles:</span>
                <span className="text-rose-400 font-bold text-sm">{totalInterruptionCount}</span>
              </div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mt-2">
                <span>Cellular Reserve [ATP]:</span>
                <span className="text-cyan-400 font-bold">12% (Depleted State)</span>
              </div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mt-2">
                <span>Sleep Efficiency:</span>
                <span className="text-red-400 font-bold">0.05%</span>
              </div>
            </div>

            {/* Instruction Callout */}
            <div className="text-slate-300 text-xs bg-slate-950/65 p-3 rounded-md leading-relaxed border-l-2 border-cyan-400 font-mono">
              <span className="text-cyan-400 font-semibold block mb-1">Physical Instructions:</span>
              1. Rest back, close your eyes, and click <span className="text-cyan-300 font-semibold">Start Charging</span>.<br />
              2. When the battery timer ends, autonomic charge will be physically interrupted.<br />
              3. You must enact the corresponding posture shown on the right in real life, and <span className="text-amber-400 font-bold">Hold the Sensor Button</span> to re-align your threshold, or the leak timer will halt indefinitely.
            </div>
          </div>

          {/* Start/Stop Controls */}
          <div className="mt-6 flex flex-col gap-2">
            {!isRunning && !postureInterrupted ? (
              <button
                id="reset-battery-btn"
                onClick={handleStart}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-slate-950 font-bold rounded flex items-center justify-center gap-2 transition-all font-mono shadow-[0_0_12px_rgba(34,211,238,0.3)] cursor-pointer"
              >
                <Play className="h-4 w-4 fill-slate-950" />
                Start Rest Simulation
              </button>
            ) : isRunning ? (
              <button
                id="charge-pause-btn"
                onClick={handlePause}
                className="w-full py-3 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-550/10 active:bg-cyan-500/20 font-mono rounded flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <div className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                Attempting to sleep...
              </button>
            ) : null}

            {postureInterrupted && (
              <div className="text-amber-400 text-[10px] font-mono bg-amber-950/20 border border-amber-500/30 p-2 rounded text-center animate-pulse">
                ⚠ Cellular Desynchronization / Neuro-apnea Crash!
              </div>
            )}

            <button
              id="reset-battery-sim"
              onClick={handleReset}
              className="w-full py-2 border border-slate-800 hover:border-slate-750 text-slate-400 hover:text-slate-200 text-xs font-mono rounded flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Simulated Rest
            </button>
          </div>
        </div>

        {/* Right Dashboard Column */}
        <div className="lg:col-span-7 flex flex-col justify-between border border-slate-800 bg-slate-900/30 rounded p-5 relative overflow-hidden">
          
          {postureInterrupted && (
            <div className="absolute inset-0 bg-red-950/10 animate-pulse pointer-events-none z-0 border border-red-500/20" />
          )}

          {/* MAIN COUNTER SCREEN */}
          <div className="z-10 flex flex-col items-center justify-center py-6">
            <h4 className="text-[10px] text-slate-500 tracking-widest font-mono mb-2 uppercase">CELLULAR RECHARGE TIMER</h4>
            
            <div className="relative flex items-center justify-center w-40 h-40">
              <div className="absolute inset-0 rounded-full border-2 border-slate-800" />
              
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="74"
                  className="stroke-cyan-500/10 fill-none"
                  strokeWidth="4"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="74"
                  className={`fill-none transition-all duration-1000 ${postureInterrupted ? 'stroke-rose-500' : 'stroke-cyan-400'}`}
                  strokeWidth="5"
                  strokeDasharray="465"
                  strokeDashoffset={465 - (465 * (secondsLeft / totalPhaseTime))}
                />
              </svg>

              <div className="text-center font-mono">
                <div className={`text-4xl font-bold tracking-tight ${postureInterrupted ? 'text-red-500 animate-pulse cyber-glow-red' : 'text-cyan-400 cyber-glow'}`}>
                  {formatTime(secondsLeft)}
                </div>
                <div className="text-[9px] text-slate-500 mt-1 uppercase">
                  {postureInterrupted ? 'Charge Disrupted' : isRunning ? 'Syncing Cells...' : 'Cellular Idle'}
                </div>
              </div>
            </div>
          </div>

          {/* POSTURE PANEL OR PROMPT */}
          <div className="z-10 mt-4 bg-slate-950/80 p-4 border border-slate-800 rounded-md">
            <AnimatePresence mode="wait">
              {currentPostureIdx === -1 ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-xs text-slate-500 py-4 font-mono"
                >
                  [ System Idle. Click &quot;Start Rest Simulation&quot; to begin. ]
                </motion.div>
              ) : !postureInterrupted ? (
                <motion.div
                  key="normal-posture"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2 text-xs font-mono"
                >
                  <div className="flex justify-between font-semibold text-cyan-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-cyan-450 animate-spin" />
                      Calm state active
                    </span>
                    <span className="text-slate-400">{POSTURES[currentPostureIdx].energyCost}</span>
                  </div>
                  <p className="text-xs text-slate-300 bg-cyan-950/10 p-2.5 border border-cyan-500/10 rounded leading-relaxed">
                    Keep your eyes closed, and breathe. Try to escape your hyperactive sympathetic nervous system...
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="glitch-posture"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between font-mono font-bold text-amber-500 text-xs">
                    <span className="flex items-center gap-1.5 animate-pulse">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      [ALERT] Physical Posture Realignment Request ({currentPostureIdx + 1}/4)
                    </span>
                    <span className="text-rose-400">{POSTURES[currentPostureIdx].energyCost}</span>
                  </div>

                  <div className="p-3 bg-slate-950 border border-amber-500/20 rounded font-mono">
                    <div className="text-xs text-amber-300 font-semibold mb-1">
                      {POSTURES[currentPostureIdx].title}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {POSTURES[currentPostureIdx].detail}
                    </p>
                  </div>

                  {/* Fingerprint interaction trigger to bypass */}
                  <div className="border border-slate-800 p-3 bg-slate-900/40 rounded flex items-center justify-between gap-3 flex-col sm:flex-row">
                    <span className="text-[10px] text-slate-400 leading-normal font-mono">
                      Adopt the physical posture above, then <span className="text-amber-300 font-semibold">Hold down the Biometric Core</span> below to resolve the blockage:
                    </span>
                    <button
                      id="sensor-reset-btn"
                      onMouseDown={handleSensorDown}
                      onMouseUp={handleSensorUp}
                      onMouseLeave={handleSensorUp}
                      onTouchStart={handleSensorDown}
                      onTouchEnd={handleSensorUp}
                      className={`h-12 w-32 font-mono text-xs rounded transition-all flex flex-col items-center justify-center cursor-pointer select-none ring-1 ${
                        sensorPressed 
                        ? 'bg-amber-400 text-slate-950 font-bold scale-95 ring-amber-400/50 shadow-[0_0_10px_#f59e0b]'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 ring-transparent hover:bg-amber-500/20'
                      }`}
                    >
                      <Fingerprint className={`h-5 w-5 mb-0.5 ${sensorPressed ? 'animate-ping' : ''}`} />
                      <span>{sensorPressed ? 'Aligning...' : 'Hold Sensor'}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* FOOTER CONTEXT */}
      <div className="mt-6 border-t border-slate-800 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
          <ShieldAlert className="h-4 w-4 text-slate-500" />
          <span>ME/CFS physiological systems completely fail to perform proper glymphatic clearance during deep sleep (N3 phase).</span>
        </div>
        
        {secondsLeft <= 0 ? (
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] text-emerald-400 font-mono tracking-wider font-bold">✓ 3-MINUTE PEM SIMULATION FULLY SURVIVED</span>
            <button
              id="proceed-step-two-btn"
              onClick={() => { playClick(1200); onComplete(); }}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-mono text-xs font-bold rounded flex items-center gap-1.5 transition-all shadow-[0_0_8px_rgba(16,185,129,0.3)] cursor-pointer"
            >
              Survive to Stage 02
              <RefreshCw className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '4s' }} />
            </button>
          </div>
        ) : totalInterruptionCount >= 1 ? (
          <div className="flex flex-col items-end gap-1.5">
            <button
              id="proceed-step-two-btn"
              onClick={() => { playClick(1200); onComplete(); }}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-450 text-slate-950 font-mono text-xs font-bold rounded flex items-center gap-1.5 transition-all shadow-[0_0_8px_rgba(34,211,238,0.3)] cursor-pointer"
            >
              Unlock Stage 02
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
