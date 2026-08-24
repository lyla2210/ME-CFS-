import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CyberGrid from './components/CyberGrid';
import StepOne from './components/StepOne';
import StepTwo from './components/StepTwo';
import StepThree from './components/StepThree';
import StepFour from './components/StepFour';
import { playClick, playChime } from './utils/audio';
import { unlockRoomOrder } from './utils/progress';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, BookOpen, ChevronRight, HelpCircle, ExternalLink, Users, RefreshCw } from 'lucide-react';
import { StepStatus } from './types';

const INITIAL_STEPS: StepStatus[] = [
  { id: 1, name: "The Impossible Rest", enName: "RESTLESSNESS", status: 'active', description: "Simulating how non-restorative sleep fails to regenerate cellular Adenosine Triphosphate (ATP)." },
  { id: 2, name: "Dissolving Speech", enName: "COGNITIVE FOG", status: 'locked', description: "Navigating dysphasia, mouse coordinates sluggish lag, and semantic word scramble." },
  { id: 3, name: "The Weight of Gravity", enName: "EXERTION PEM", status: 'locked', description: "Mild exertion, a false calm, then delayed PEM 12–48h later—plus a densh against false equivalence." },
  { id: 4, name: "The Gaslighting Verdict", enName: "LAB GASLIGHTING", status: 'locked', description: "Confronting pristine, flawlessly 'normal' laboratory charts while profoundly disabled." }
];

function buildStepsForEntry(startStep: number): StepStatus[] {
  const step = startStep >= 1 && startStep <= 4 ? startStep : 1;
  return INITIAL_STEPS.map((s) => {
    if (s.id < step) return { ...s, status: 'completed' as const };
    if (s.id === step) return { ...s, status: 'active' as const };
    if (s.id === step + 1) return { ...s, status: 'unlocked' as const };
    return { ...s, status: 'locked' as const };
  });
}

export default function SimulationApp() {
  const [searchParams] = useSearchParams();
  const entryStep = useMemo(() => {
    const raw = parseInt(searchParams.get('step') ?? '1', 10);
    return raw >= 1 && raw <= 4 ? raw : 1;
  }, [searchParams]);

  const [activeStepId, setActiveStepId] = useState<number>(entryStep);
  const [steps, setSteps] = useState<StepStatus[]>(() => buildStepsForEntry(entryStep));
  const [activeTab, setActiveTab] = useState<'simulation' | 'background' | 'about'>('simulation');

  const unlockNextStep = (currentId: number) => {
    setSteps(prevSteps => {
      return prevSteps.map(step => {
        if (step.id === currentId) {
          return { ...step, status: 'completed' as const };
        }
        if (step.id === currentId + 1) {
          return { ...step, status: 'unlocked' as const };
        }
        return step;
      });
    });

    if (currentId < 4) {
      setActiveStepId(currentId + 1);
    } else {
      setActiveStepId(5);
    }
    unlockRoomOrder(currentId + 1);
    playChime();
  };

  const handleRestartAll = () => {
    playClick(400);
    setSteps(INITIAL_STEPS.map((s) =>
      s.id === 1 ? { ...s, status: 'active' as const } : { ...s, status: 'locked' as const }
    ));
    setActiveStepId(1);
    setActiveTab('simulation');
  };

  return (
    <div className="relative min-h-screen w-full bg-black text-[#e2e8f0] font-sans flex flex-col justify-between overflow-x-hidden selection:bg-white/20 selection:text-white">
      
      <CyberGrid />

      {/* Minimal top nav — matches reference */}
      <header className="z-10 px-4 py-4 md:px-8 flex justify-end">
        <nav className="flex items-stretch border border-white/12 rounded overflow-hidden font-mono text-[11px] tracking-[0.12em]">
          <button 
            id="tab-simulation"
            onClick={() => { playClick(); setActiveTab('simulation'); }}
            className={`px-4 py-2 transition-all cursor-pointer uppercase ${
              activeTab === 'simulation'
                ? 'accent-tab-active'
                : 'bg-transparent text-white/50 hover:text-white/75'
            }`}
          >
            Simulation
          </button>
          <button 
            id="tab-background"
            onClick={() => { playClick(); setActiveTab('background'); }}
            className={`px-4 py-2 border-l border-white/12 transition-all cursor-pointer uppercase ${
              activeTab === 'background'
                ? 'accent-tab-active'
                : 'bg-transparent text-white/50 hover:text-white/75'
            }`}
          >
            Background
          </button>
          <button 
            id="tab-about"
            onClick={() => { playClick(); setActiveTab('about'); }}
            className={`px-4 py-2 border-l border-white/12 transition-all cursor-pointer uppercase ${
              activeTab === 'about'
                ? 'accent-tab-active'
                : 'bg-transparent text-white/50 hover:text-white/75'
            }`}
          >
            About
          </button>
        </nav>
      </header>

      {/* MAIN CONTENT PORTAL */}
      <main className="z-10 flex-1 w-full max-w-6xl mx-auto px-4 py-8 md:py-12 flex flex-col justify-center items-center">
        
        {activeTab === 'simulation' ? (
          <AnimatePresence mode="wait">

            {activeStepId === 1 && (
              <motion.div key="step-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                <StepOne onComplete={() => unlockNextStep(1)} />
              </motion.div>
            )}

            {/* Step 2: Cognitive Fog Dialog */}
            {activeStepId === 2 && (
              <motion.div key="step-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                <StepTwo onComplete={() => unlockNextStep(2)} />
              </motion.div>
            )}

            {/* Step 3: Dumbbell PEM Exertion */}
            {activeStepId === 3 && (
              <motion.div key="step-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                <StepThree onComplete={() => unlockNextStep(3)} />
              </motion.div>
            )}

            {/* Step 4: Normal metrics Medical Diagnostic System */}
            {activeStepId === 4 && (
              <motion.div key="step-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                <StepFour onComplete={() => unlockNextStep(4)} />
              </motion.div>
            )}

            {/* Step 5: Epilogue / Reflection view */}
            {activeStepId === 5 && (
              <motion.div
                key="epilogue-panel"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full max-w-3xl rounded-lg border border-white/10 overflow-hidden bg-[#111114]/95 p-6 md:p-10 text-center space-y-6 bg-[radial-gradient(circle_at_center,_rgba(30,41,59,0.3)_0%,_transparent_75%)]"
              >
                <div className="h-12 w-12 rounded-full border border-white/12 bg-white/5 flex items-center justify-center mx-auto shadow-md">
                  <ShieldAlert className="h-6 w-6 text-violet-300" />
                </div>

                <h2 className="text-2xl font-bold font-mono text-white/85 uppercase tracking-wider">
                  Simulation Protocol Complete
                </h2>
                <div className="text-[10px] text-slate-500 tracking-wider font-mono">
                  EXPERIENTIAL PROTOCOLS COMPLETED - CLINICAL SUMMARY REFLECTION
                </div>

                <div className="text-xs text-[#e2e8f0]/90 leading-relaxed text-left space-y-3 font-sans max-w-2xl mx-auto py-2">
                  <p>
                    <strong>This simulation lasted 10 minutes for you. For individuals diagnosed with Myalgic Encephalomyelitis (ME/CFS), it represents decades of systematic confinement without release.</strong>
                  </p>
                  <p>
                    They are banned from simple cardio workouts (as even 5 pushups trigger multi-day PEM metabolic collapse), denied refreshing sleeps (due to a chronically overactive sympathetic autonomic system), and struggle with basic communications while enduring severe cognitive crashes. To make matters worse, their routine clinical test sheets return completely &quot;clear,&quot; leaving them exposed to psychological skepticism.
                  </p>
                  <p>
                    This experiential design aims to bridge this severe communication divide, fostering meaningful empathy. Next time you encounter someone expressing chronic fatigue or widespread neuropathic pain, please avoid saying: *&quot;Have you simply tried getting outside or working out more?&quot;*
                  </p>
                  <p>
                    <b>Active listening without judgment is the most meaningful beacon we can provide.</b>
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-900 flex justify-center gap-4 flex-col sm:flex-row">
                  <button
                    id="epilogue-restart-btn"
                    onClick={handleRestartAll}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 text-xs font-mono font-bold rounded transition-all cursor-pointer"
                  >
                    Repeat Simulation Run
                  </button>
                  <a
                    id="link-cdc-info"
                    href="https://www.cdc.gov/me-cfs/index.html"
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 accent-btn text-xs font-mono rounded transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Read CDC Guidelines</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-950" />
                  </a>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        ) : activeTab === 'background' ? (
          /* Theory / Medical Library segment (ActiveTab === 'background') */
          <motion.div
            key="theory-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl rounded-lg border border-white/8 bg-black/85 p-6 md:p-8 space-y-6 text-sm relative"
          >
            <div className="flex items-center gap-2 border-b border-white/8 pb-3">
              <BookOpen className="h-5 w-5 text-white/80" />
              <h2 className="text-lg font-bold font-mono text-white/80 uppercase tracking-wide">
                Pathological Foundations: ME/CFS Medical Theory
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
              
              {/* Card 1 */}
              <div className="space-y-4 p-4 bg-slate-900/40 border border-white/8 rounded">
                <div className="font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <span className="h-1.5 w-1.5 accent-dot rounded-full" />
                  What is Post-Exertional Malaise (PEM)?
                </div>
                <p className="text-slate-400 leading-relaxed font-sans text-[11px]">
                  Unlike normal exhaustion which resolves with solid bedrest, any minor physical or mental activity in ME/CFS triggers rapid systemic mitochondrial degradation 12-48 hours later. Exercise breaks functional oxidative phosphorylation, triggering anaerobic cellular lactate crashes. Pushing through the pain systematically destroys the patient&apos;s baseline.
                </p>
              </div>

              {/* Card 2 */}
              <div className="space-y-4 p-4 bg-slate-900/40 border border-white/8 rounded">
                <div className="font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <span className="h-1.5 w-1.5 accent-dot rounded-full" />
                  Biomarker Invisible Pathology
                </div>
                <p className="text-slate-400 leading-relaxed font-sans text-[11px]">
                  Traditional testing protocols (Complete Blood Counts, Basic Liver, and MRI profiles) are engineered to detect gross inflammation or localized tumors. They completely fail to capture micro-level blood alterations, specifically **Erythrocyte Cell Deformability**. Under microfluidic stress scans, ME/CFS red blood cells show high rigidity—causing widespread blood gas exchange depletion in capillary networks while blood sheets return as pristine &quot;normal.&quot;
                </p>
              </div>

              {/* Card 3 */}
              <div className="space-y-4 p-4 bg-slate-900/40 border border-white/8 rounded">
                <div className="font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <span className="h-1.5 w-1.5 accent-dot rounded-full" />
                  The Danger of GET / CBT Dogma
                </div>
                <p className="text-slate-400 leading-relaxed font-sans text-[11px]">
                  For decades, consensus panels mistakenly suggested Graded Exercise Therapy (GET) and Cognitive Behavioral Therapy (CBT), claiming fatigue stemmed from deconditioning. Global double-blind studies have invalidated this, showing that GET actively escalates physical damage. Modern guidelines from NICE (UK) and the CDC strictly prohibit GET, advising instead on **Pacing** to stay within a protective metabolic boundary.
                </p>
              </div>

            </div>

            <div className="p-4 bg-slate-900/50 border border-slate-900 rounded text-xs space-y-2">
              <h4 className="font-bold text-white/75 font-mono uppercase tracking-wide">
                💡 CLINICALLY SUPPORTED PROTOCOLS FOR COMPASSIONATE CARE:
              </h4>
              <ul className="list-disc list-inside space-y-1.5 pl-1 text-[11.5px] text-slate-300 leading-relaxed font-sans">
                <li>
                  <strong>Discard the &quot;Rest and Sleep&quot; Cliche:</strong> The deep sleep cycle (N3 state) in ME/CFS is clinically desynchronized in autonomic dysregulation. Patients wake up just as exhausted as before going to sleep.
                </li>
                <li>
                  <strong>Abolish Moral and Physical Pressure:</strong> Restrict advice recommending cardio exercises or push-ups to regain stamina; these actions frequently lock patients to their beds for consecutive weeks.
                </li>
                <li>
                  <strong>Pardon Semantic Dysphasia:</strong> Grant patients time during communication to locate basic terminology without feeling rushed.
                </li>
              </ul>
            </div>
          </motion.div>
        ) : (
          /* "About" tab section detailing what is ME/CFS and some official links */
          <motion.div
            key="about-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl rounded-lg border border-white/8 bg-black/85 p-6 md:p-8 space-y-6 text-sm relative"
          >
            <div className="flex items-center gap-2 border-b border-white/8 pb-3">
              <HelpCircle className="h-5 w-5 text-violet-300" />
              <h2 className="text-lg font-bold font-mono text-white/80 uppercase tracking-wide">
                About the Invisible Prison & ME/CFS Support
              </h2>
            </div>

            <div className="space-y-4 text-slate-300 leading-relaxed text-xs sm:text-sm font-sans">
              <div className="border-l-2 border-white/20 pl-4 py-1 space-y-2">
                <p className="font-bold text-white text-sm">What is the intent of this simulator?</p>
                <p className="text-xs text-slate-400">
                  This sensory simulation is constructed as a curated experiential display. Over 75% of ME/CFS sufferers report severe psychological burnout from diagnostic skepticism, where family, peers, and standard medical practitioners suggest their illness is simply behavioral. By taking healthy testers through a multi-stage process—including non-restorative sleep, mouse coordinate lags, a hidden 6kg weight trials, and a clinical test sheet reporting pristine results—we highlight the stark contrast between visceral suffering and diagnostic indifference.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <p className="font-bold text-white text-sm flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-white/60" />
                  Clinical Resources & Official Health Reports
                </p>
                <p className="text-xs text-slate-400">
                  Access official peer records, diagnostic parameters, and supportive evidence regarding Myalgic Encephalomyelitis (ME/CFS) compiled by global health authorities:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  
                  {/* Link 1 */}
                  <a 
                    href="https://www.cdc.gov/me-cfs/index.html" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center justify-between p-3 rounded bg-slate-900/60 border border-slate-800 hover:border-white/10 text-xs text-slate-300 hover:text-white font-mono transition-all pr-4 group"
                  >
                    <span className="flex items-center gap-2">
                      <ExternalLink className="h-3.5 w-3.5 text-violet-300/80" />
                      CDC ME/CFS Guidelines
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-violet-300" />
                  </a>

                  {/* Link 2 */}
                  <a 
                    href="https://www.nhs.uk/conditions/myalgic-encephalomyelitis-or-chronic-fatigue-syndrome-me-cfs/" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center justify-between p-3 rounded bg-slate-900/60 border border-slate-800 hover:border-white/10 text-xs text-slate-300 hover:text-white font-mono transition-all pr-4 group"
                  >
                    <span className="flex items-center gap-2">
                      <ExternalLink className="h-3.5 w-3.5 text-violet-300/80" />
                      NHS ME/CFS Overview
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-violet-300" />
                  </a>

                  {/* Link 3 */}
                  <a 
                    href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8544443/" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center justify-between p-3 rounded bg-slate-900/60 border border-slate-800 hover:border-white/10 text-xs text-slate-300 hover:text-white font-mono transition-all pr-4 group"
                  >
                    <span className="flex items-center gap-2">
                      <ExternalLink className="h-3.5 w-3.5 text-violet-300/80" />
                      Mitochondrial Dysfunction PMC
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-violet-300" />
                  </a>

                  {/* Link 4 */}
                  <a 
                    href="https://www.reddit.com/r/mecfs/" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center justify-between p-3 rounded bg-slate-900/60 border border-slate-800 hover:border-white/10 text-xs text-slate-300 hover:text-white font-mono transition-all pr-4 group"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-violet-300/80" />
                      Reddit Community r/mecfs
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-violet-300" />
                  </a>

                </div>
              </div>

              <div className="p-4 bg-slate-900/50 border border-red-500/10 rounded text-xs leading-normal text-slate-400">
                ⚠️ IMPORTANT INTERACTIVE NOTICE: Stage 01 asks for still postures. Stage 03 offers an optional physical path (push-ups / jumping jacks) and a full interface-only path—use whichever you can safely complete. Stop any real-world movement if you feel unwell. These interactions are metaphors for delayed PEM, not a claim that you now know living with ME/CFS.
              </div>
            </div>
          </motion.div>
        )}

      </main>

      {/* FOOTER RAILS */}
      <footer className="z-10 border-t border-slate-950 bg-slate-950 py-4 px-6 text-center text-[10px] text-slate-600 font-mono flex flex-col sm:flex-row justify-between items-center gap-2">
        <div>
          DESIGNED FOR AWARENESS EMULATION · © 2026 INVISIBLE PRISON
        </div>
        <div className="flex gap-4">
          <span className="text-slate-500">PHYSIOLOGY SCANNER: ACTIVE_SIM_ON</span>
          <span className="text-slate-500">FEEDBACK INBOX: liangdaoniangxi@gmail.com</span>
        </div>
      </footer>

    </div>
  );
}
