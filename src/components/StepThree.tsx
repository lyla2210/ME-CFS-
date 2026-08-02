import React, { useState, useEffect } from 'react';
import { playClick, playWaringBeep } from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import { Dumbbell, ShieldAlert, Zap, Flame, ChevronUp, ArrowRight, RotateCcw, Clipboard } from 'lucide-react';

interface StepThreeProps {
  onComplete: () => void;
}

type PhaseType = 'baseline' | 'exercise' | 'crash' | 'logged';

export default function StepThree({ onComplete }: StepThreeProps) {
  const [phase, setPhase] = useState<PhaseType>('baseline');
  const [baselineCount, setBaselineCount] = useState(0);
  const [crashCount, setCrashCount] = useState(0);
  
  const [fatigue, setFatigue] = useState(0); // 0 to 100
  const [atp, setAtp] = useState(100);       // 100 down to 1.2
  const [dumbbellY, setDumbbellY] = useState(0);
  const [isCrashed, setIsCrashed] = useState(false);
  
  // Real-world exercise checklist
  const [donePushups, setDonePushups] = useState(false);
  const [doneJacks, setDoneJacks] = useState(false);
  
  // Feedback Log
  const [feedback, setFeedback] = useState("");
  const [submittedLog, setSubmittedLog] = useState<string | null>(null);

  // Phase transition triggers
  const handleBaselineLift = () => {
    playClick(750, 0.05);
    setBaselineCount(prev => {
      const next = prev + 1;
      if (next >= 3) {
        // Unlock exercise phase after 3 lifts
        setTimeout(() => {
          setPhase('exercise');
          setFatigue(10);
          setAtp(90);
        }, 1000);
      }
      return next;
    });

    setDumbbellY(-45);
    setTimeout(() => setDumbbellY(0), 200);
  };

  const handleCrashLift = () => {
    if (isCrashed) {
      playClick(150, 0.25);
      return;
    }

    const nextCount = crashCount + 1;
    setCrashCount(nextCount);

    // Exponentially fatigue shoots to 100, ATP falls to 1.2
    const currentFatigue = Math.min(100, nextCount * 22);
    setFatigue(currentFatigue);
    setAtp(Math.max(1.2, 100 - (nextCount * 23.5)));

    const pitch = Math.max(200, 700 - nextCount * 110);
    playClick(pitch, 0.06);

    // It lifts heavy and sluggish
    const heightMultiplier = Math.max(0.08, 1.0 - (currentFatigue / 100));
    setDumbbellY(-30 * heightMultiplier);
    
    setTimeout(() => {
      setDumbbellY(0);
    }, 250);

    if (currentFatigue >= 100) {
      setIsCrashed(true);
      playWaringBeep(1400, 200, 4);
    }
  };

  const handleExerciseComplete = () => {
    playClick(1000, 0.1);
    setPhase('crash');
    setFatigue(15);
    setAtp(85);
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
    setPhase('baseline');
    setBaselineCount(0);
    setCrashCount(0);
    setFatigue(0);
    setAtp(100);
    setDumbbellY(0);
    setIsCrashed(false);
    setDonePushups(false);
    setDoneJacks(false);
    setFeedback("");
    setSubmittedLog(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-lg border border-cyan-500/30 overflow-hidden bg-slate-950/80 p-6 md:p-8 font-sans">
      
      {/* Title section */}
      <div className="mb-6 border-b border-cyan-500/20 pb-4">
        <h2 id="step-three-title" className="text-xl md:text-2xl font-semibold tracking-tight text-cyan-400 font-mono flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-cyan-400 animate-pulse" />
          STAGE 03: The Weight of Gravity [Post-Exertional Malaise]
        </h2>
        <p className="text-slate-400 text-xs mt-1 leading-relaxed border-l border-cyan-500/20 pl-2">
          To observers, exercise is a cure-all. But for ME/CFS, any normal physical exertion breaks mitochondrial cellular respiration, crashing ATP synthesis. This induces Post-Exertional Malaise (PEM)—leaving the entire body paralyzed as if weighted by molten lead for days or weeks. This stage tests how minor efforts spark complete cellular collapse.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Physiological Status & Instructions */}
        <div className="lg:col-span-5 flex flex-col justify-between p-5 border border-slate-800 bg-slate-900/60 rounded">
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-cyan-400 tracking-wider font-mono">MITOCHONDRIAL ENERGY CORE</h3>
            
            <div className="space-y-2 border-y border-slate-800 py-3 font-mono text-xs text-slate-400">
              <div className="flex justify-between items-center">
                <span>Muscle Fatigue Coefficient:</span>
                <span className={`font-bold ${fatigue > 70 ? 'text-rose-500 text-sm animate-pulse' : 'text-cyan-400'}`}>
                  {fatigue.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${fatigue > 70 ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]'}`}
                  style={{ width: `${fatigue}%` }}
                />
              </div>

              <div className="flex justify-between items-center mt-3">
                <span>Mitochondrial Efficiency [ATP]:</span>
                <span className={`font-bold ${atp < 20 ? 'text-red-400' : 'text-amber-400'}`}>{atp.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded overflow-hidden">
                <div 
                  className={`h-full transition-all duration-350 ${atp < 20 ? 'bg-red-500 shadow-[0_0_8px_rgb(239,68,68)]' : 'bg-amber-500'}`}
                  style={{ width: `${atp}%` }}
                />
              </div>

              <div className="flex justify-between items-center mt-3 text-[10px]">
                <span>Current Active Dumbbell:</span>
                <span className="text-cyan-300 font-bold font-mono">
                  {phase === 'baseline' ? "Dumbbell A (2kg)" : phase === 'crash' ? "Dumbbell B (Labeled 2kg)" : "None"}
                </span>
              </div>
            </div>

            {/* Stage Guidance Text Boxes */}
            <AnimatePresence mode="wait">
              {phase === 'baseline' && (
                <motion.div
                  key="bas-guidance"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-md border-l-2 border-cyan-400 font-mono"
                >
                  <span className="text-cyan-400 font-bold block mb-1">Baseline Setup:</span>
                  1. Locate any lightweight object or lift your hand in real life.<br />
                  2. Lift it 3 times while clicking the <span className="text-cyan-300 font-semibold">Lift Dumbbell A</span> button.<br />
                  3. Observe how responsive, fast, and effortless it feels. This represents healthy homeostasis.
                </motion.div>
              )}

              {phase === 'exercise' && (
                <motion.div
                  key="exe-guidance"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-md border-l-2 border-amber-400 font-mono"
                >
                  <span className="text-amber-400 font-bold block mb-1">Metabolic Strain Prep:</span>
                  A 2kg dumbbell is gym's lightest load. But metabolic stress triggers immediate cellular fatigue for patients. Before lifting Dumbbell B, pre-fatigue your system:<br />
                  <span className="text-amber-300 font-semibold block mt-1">Please perform in real background:</span>
                  - <b className="text-slate-100">5 Push-ups (俯卧撑)</b><br />
                  - <b className="text-slate-100">5 Jumping Jacks (开合跳)</b>
                </motion.div>
              )}

              {phase === 'crash' && (
                <motion.div
                  key="crash-guidance"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-md border-l-2 border-rose-500 font-mono"
                >
                  <span className="text-rose-400 font-bold block mb-1">Crash Challenge:</span>
                  Now, try lifting **Dumbbell B**, which is also labelled as **2kg** in the UI.<br />
                  Click <span className="text-rose-400 font-semibold">Lift Dumbbell B</span> to simulate your response. See how ATP drops rapidly and physical movement locks.
                </motion.div>
              )}

              {phase === 'logged' && (
                <motion.div
                  key="logged-guidance"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-md border-l-2 border-green-500 font-mono"
                >
                  <span className="text-green-400 font-bold block mb-1">Log Success:</span>
                  Your biochemical and perceived sensory feedback has been saved into the clinic report system! Proceed to get your laboratory analysis.
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
              Reset Energy Buffer
            </button>
          </div>
        </div>

        {/* Right Side: Immersive Dumbbell Stage Platform */}
        <div className="lg:col-span-7 border border-slate-800 bg-slate-900/30 rounded p-5 relative overflow-hidden flex flex-col justify-between min-h-[380px]">
          {isCrashed && (
            <div className="absolute inset-0 bg-red-950/15 animate-pulse z-0 pointer-events-none border border-red-500/20" />
          )}

          {/* DYNAMIC SCREEN AREA */}
          <div className="z-10 bg-slate-950/80 py-4 px-6 rounded border border-slate-800 flex-1 flex flex-col items-center justify-center relative">
            
            {/* Main vector lifting guide */}
            <div className="relative w-full h-44 flex items-center justify-center border-b border-dashed border-slate-800">
              <div className="absolute left-1/2 top-4 bottom-0 w-[1px] bg-slate-800 border-dashed" />
              <div className="absolute bottom-0 inset-x-8 h-1 bg-slate-800" />
              
              <div className="absolute top-4 right-4 font-mono text-[9px] text-slate-500 text-right uppercase">
                <div>PEM G-LOAD MULTIPLIER:</div>
                <div className={`font-bold ${isCrashed ? 'text-red-500 text-xs' : 'text-cyan-400'}`}>
                  {isCrashed ? '24.50 G [CRITICAL BLOCK]' : phase === 'baseline' ? '1.00 G [NOMINAL]' : `${(2.0 + (fatigue * 0.12)).toFixed(2)} G`}
                </div>
              </div>

              {/* LIFTING DUMBBELL ACCENT */}
              <motion.div
                id="physio-dumbbell-item"
                animate={{ y: dumbbellY }}
                transition={{ type: 'spring', damping: 12, stiffness: 100 }}
                className={`absolute flex flex-col items-center justify-center transition-colors duration-200 ${
                  isCrashed 
                    ? 'text-red-500' 
                    : fatigue > 50 
                    ? 'text-amber-500' 
                    : 'text-cyan-400'
                }`}
                style={{ bottom: 4 }}
              >
                {/* Warnings */}
                {fatigue > 60 && (
                  <div className="text-[7.5px] bg-red-950 border border-red-500/30 px-1 rounded animate-bounce text-red-400 mb-1 font-mono uppercase tracking-widest font-extrabold">
                     PEM Threshold Breached
                  </div>
                )}

                {/* SVG Visual Dumbbell */}
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

            {/* ACTION TRIGGERS DEPENDING ON ACTIVE PHASE */}
            <div className="mt-4 w-full flex justify-center z-20">
              <AnimatePresence mode="wait">
                
                {/* 1. Baseline lift button */}
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
                      className="px-6 py-3 w-4/5 rounded bg-cyan-500 text-slate-950 hover:bg-cyan-400 active:scale-95 transition-all font-mono text-xs font-bold font-mono shadow-[0_0_12px_rgba(34,211,238,0.3)] cursor-pointer flex flex-col items-center"
                    >
                      <ChevronUp className="h-4 w-4 animate-bounce shrink-0 mb-0.5" />
                      <span>Lift Dumbbell A (2kg)</span>
                      <span className="text-[9px] opacity-65 font-normal mt-0.5">Lifts logged: {baselineCount} / 3</span>
                    </button>
                  </motion.div>
                )}

                {/* 2. Real Exercise Checklist */}
                {phase === 'exercise' && (
                  <motion.div
                    key="exe-checklist"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full p-3 bg-slate-900/60 border border-slate-800 rounded text-left space-y-3"
                  >
                    <div className="text-[10.5px] font-mono text-amber-400 font-bold flex items-center gap-1.5 uppercase">
                      <Flame className="h-4 w-4 text-amber-400 animate-pulse" />
                      Metabolic Pre-Exhaustion Checklist
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                      <label className="flex items-center gap-2 p-2 rounded bg-slate-950 border border-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={donePushups}
                          onChange={(e) => { playClick(); setDonePushups(e.target.checked); }}
                          className="rounded text-cyan-400 bg-slate-900 border-slate-700 h-4 w-4"
                        />
                        <span>I finished **5 Push-ups**</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 rounded bg-slate-950 border border-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={doneJacks}
                          onChange={(e) => { playClick(); setDoneJacks(e.target.checked); }}
                          className="rounded text-cyan-400 bg-slate-900 border-slate-700 h-4 w-4"
                        />
                        <span>I finished **5 Jumping Jacks**</span>
                      </label>
                    </div>

                    <button
                      id="proceed-to-b"
                      disabled={!donePushups || !doneJacks}
                      onClick={handleExerciseComplete}
                      className={`w-full py-2.5 font-mono text-xs font-bold rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        donePushups && doneJacks
                          ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      <span>Unlock Dumbbell B Trial</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}

                {/* 3. Crash Lift Button */}
                {phase === 'crash' && !isCrashed && (
                  <motion.div
                    key="crash-btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full flex justify-center"
                  >
                    <button
                      id="dumbbell-lift-trigger-crash"
                      onClick={handleCrashLift}
                      className="px-6 py-3 w-4/5 rounded bg-rose-950/20 text-rose-300 border border-red-500/40 hover:bg-rose-900/30 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.2)] font-mono text-xs font-bold cursor-pointer flex flex-col items-center"
                    >
                      <ChevronUp className="h-4 w-4 animate-bounce shrink-0 mb-0.5" />
                      <span>Lift Dumbbell B (Labeled 2kg, feels 6kg!)</span>
                      <span className="text-[9px] opacity-65 font-normal mt-0.5">Attempted strokes: {crashCount}</span>
                    </button>
                  </motion.div>
                )}

                {/* 4. Crashed State - Display Textarea */}
                {phase === 'crash' && isCrashed && (
                  <motion.div
                    key="crash-log-form"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full text-left bg-slate-950 border border-red-500/30 p-3.5 rounded"
                  >
                    <div className="text-[10px] font-mono text-red-500 font-bold mb-1 uppercase tracking-wider flex items-center gap-1">
                      <ShieldAlert className="h-4 w-4 text-red-500" />
                      ⚠ Cell Energy Depleted: Log Perceived Sensation
                    </div>
                    <form onSubmit={submitFeedback} className="space-y-2">
                      <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                        In ME/CFS, Dumbbell B (actual weight 6kg) feels intensely heavy after doing basic workouts, triggering systemic fatigue. Please type and log how this sudden crash felt:
                      </p>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="w-full h-20 bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 font-mono focus:border-red-500 focus:outline-none resize-none leading-relaxed placeholder:text-slate-600"
                        placeholder="e.g., The second 2kg felt incredibly heavy and exhausting to lift, my arms felt like lead..."
                        required
                      />
                      <button
                        type="submit"
                        className="w-full py-1.5 bg-red-650 border border-red-500 hover:bg-rose-900 text-red-200 text-xs font-mono font-bold rounded cursor-pointer"
                      >
                        Submit Sensation Log & Lock Data
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* 5. Logged View */}
                {phase === 'logged' && (
                  <motion.div
                    key="logged-confirmation"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full p-4 bg-slate-900/60 border border-emerald-500/25 rounded text-left space-y-2 font-mono text-xs"
                  >
                    <div className="text-emerald-400 font-bold flex items-center gap-1">
                      <Clipboard className="h-4 w-4" />
                      <span>PERCEIVED FEEDBACK RECORDED SUCCESSFULLY</span>
                    </div>
                    <div className="italic p-2 bg-slate-950/80 rounded border border-slate-800 text-slate-300">
                      &quot;{submittedLog}&quot;
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      This sensory mismatch between expectations (labeled 2kg) and physical capacity is at the core of PEM gaslighting. Proceeding to clinic report compilation...
                    </p>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

          </div>

          <AnimatePresence>
            {isCrashed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 border border-rose-500/30 bg-red-950/20 p-4 rounded text-xs font-mono leading-relaxed"
                id="pem-crash-details"
              >
                <div className="text-rose-450 font-bold mb-1 flex items-center gap-1 text-rose-400">
                  <Zap className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
                  Experiential Reality:
                </div>
                Healthy individuals recover from a brisk push-up, experiencing transient tiredness. For an ME/CFS patient, **pushing through pushes you off a cliff.** Dumbbell B represents the grueling friction of carrying a 6kg deadweight when you are labeled to hold 2kg, as cellular ATP collapses to virtual zero.
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* FOOTER RAILS */}
      <div className="mt-6 border-t border-slate-800 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
          <ShieldAlert className="h-4 w-4 text-slate-500" />
          <span>ME/CFS exhibits severe erythrocyte cell deformability compromises and acute vascular blood oxygen depletion.</span>
        </div>
        
        {phase === 'logged' && (
          <button
            id="proceed-step-four-btn"
            onClick={() => { playClick(1200); onComplete(); }}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold rounded flex items-center gap-1.5 transition-all shadow-[0_0_8px_rgba(34,211,238,0.3)] cursor-pointer"
          >
            Review Clinical Labs & Reports
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

    </div>
  );
}
