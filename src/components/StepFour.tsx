import React, { useState, useEffect } from 'react';
import { playClick, playWaringBeep, playChime } from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Activity, Heart, ClipboardCheck, ArrowRight, UserCircle, RefreshCcw, Info } from 'lucide-react';
import { SymptomRecord } from '../types';

interface StepFourProps {
  onComplete: () => void;
}

const DEFAULT_RECORD: SymptomRecord = {
  fatigueLevel: 9,
  brainFog: 8,
  musclePain: 8,
  sleepQuality: 9,
  postExertionalMalaise: true,
  orthostaticIntolerance: true,
  additionalNotes: "Spent three days fully bedridden, yet my body aches intensely. I lack the mechanical finger strength to turn over or raise a water glass. My head is crammed in a thick fog; I can barely parse sentences or understand messaging."
};

export default function StepFour({ onComplete }: StepFourProps) {
  const [record, setRecord] = useState<SymptomRecord>(DEFAULT_RECORD);
  const [pulse, setPulse] = useState(72);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatusLabel, setScanStatusLabel] = useState("");
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setIsScanning(false);
              setShowResult(true);
              playChime();
            }, 600);
            return 100;
          }
          const step = Math.floor(Math.random() * 8) + 4;
          return Math.min(100, prev + step);
        });
      }, 150);

      return () => clearInterval(interval);
    }
  }, [isScanning]);

  useEffect(() => {
    if (scanProgress < 20) {
      setScanStatusLabel("Analyzing peripheral blood flow microcirculation and gas-exchange array...");
    } else if (scanProgress < 50) {
      setScanStatusLabel("Running serum mass spectrometry markers [Erythrocyte Cell Deformability Index]...");
    } else if (scanProgress < 75) {
      setScanStatusLabel("Mapping orthostatic sympathetic response and echocardiogram tracking [ECG/Tilt-table]...");
    } else {
      setScanStatusLabel("Measuring prefrontal neuromotor transmitter levels and glial activation density...");
    }
  }, [scanProgress]);

  const triggerScan = () => {
    playClick(1000, 0.1);
    playWaringBeep(800, 500, 2);
    setScanProgress(0);
    setIsScanning(true);
    setShowResult(false);
  };

  const resetRecord = () => {
    playClick(400);
    setRecord(DEFAULT_RECORD);
    setShowResult(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-lg border border-cyan-500/30 overflow-hidden bg-slate-950/80 p-6 md:p-8 font-sans">
      
      {/* Title Header */}
      <div className="mb-6 border-b border-cyan-500/20 pb-4">
        <h2 id="step-four-title" className="text-xl md:text-2xl font-semibold tracking-tight text-cyan-400 font-mono flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-cyan-400 animate-pulse" />
          STAGE 04: The Gaslighting Verdict [The Perfect Lab Results]
        </h2>
        <p className="text-slate-400 text-xs mt-1 leading-relaxed border-l border-cyan-500/20 pl-2">
          The deepest abyss of ME/CFS lies in conventional diagnostic limitations. Despite extreme underlying distress and systemic collapse, routine clinical indicators (Complete Blood Count, Thyroid profile, ECG, Standard MRI) return looking entirely clear. This leaves patients vulnerable to clinical skepticism, labelled with psychosomatic terms while enduring severe neurological crises.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!isScanning && !showResult ? (
          <motion.div
            key="input-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Symptom questionnaire input */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-xs font-semibold text-cyan-400 tracking-wider font-mono">
                [SECTION A] Subjective Patient Symptoms [Patient Log]
              </h3>

              <div className="space-y-3 bg-slate-900/40 border border-slate-900 p-4 rounded">
                {/* Fatigue Slider */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-300">Systemic Exhaustion Score [Fatigue Level]</span>
                    <span className="text-rose-450 font-bold text-rose-400">{record.fatigueLevel} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={record.fatigueLevel}
                    onChange={(e) => setRecord({ ...record, fatigueLevel: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                {/* Brain Fog Slider */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-300">Synaptic Fog Intensity [Cognitive Fog]</span>
                    <span className="text-rose-455 font-bold text-rose-400">{record.brainFog} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={record.brainFog}
                    onChange={(e) => setRecord({ ...record, brainFog: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                {/* Pain Slider */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-300">Multifocal Joint & Muscle Pain [Widespread Pain]</span>
                    <span className="text-rose-455 font-bold text-rose-400">{record.musclePain} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={record.musclePain}
                    onChange={(e) => setRecord({ ...record, musclePain: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                {/* Sleep Quality Slider */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-300">Unrefreshing Quality Score [Non-Restorative Sleep]</span>
                    <span className="text-rose-455 font-bold text-rose-400">{record.sleepQuality} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={record.sleepQuality}
                    onChange={(e) => setRecord({ ...record, sleepQuality: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                {/* Boolean Checks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={record.postExertionalMalaise}
                      onChange={(e) => setRecord({ ...record, postExertionalMalaise: e.target.checked })}
                      className="rounded border-slate-800 bg-slate-950 text-cyan-400 focus:ring-0 h-4 w-4"
                    />
                    <span>Post-Exertional Malaise ⚠(PEM)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={record.orthostaticIntolerance}
                      onChange={(e) => setRecord({ ...record, orthostaticIntolerance: e.target.checked })}
                      className="rounded border-slate-800 bg-slate-950 text-cyan-400 focus:ring-0 h-4 w-4"
                    />
                    <span>Orthostatic Intolerance (Postural PoTS)</span>
                  </label>
                </div>

                {/* Additional Clinical Notes */}
                <div className="pt-2">
                  <label className="block text-xs font-mono text-slate-400 mb-1">Subjective Narrative Symptoms Addendum:</label>
                  <textarea
                    id="clinical-statement"
                    value={record.additionalNotes}
                    onChange={(e) => setRecord({ ...record, additionalNotes: e.target.value })}
                    className="w-full h-24 bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none leading-relaxed font-mono resize-none"
                    placeholder="Describe your active visceral sensations, physical limitations and autonomic concerns..."
                  />
                </div>
              </div>
            </div>

            {/* Simulated Medical Sensor Scan options and scanner preview */}
            <div className="lg:col-span-5 flex flex-col justify-between p-5 border border-slate-800 bg-slate-900/60 rounded">
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-cyan-400 tracking-wider font-mono">
                  [SECTION B] Clinical Biometric Sensors [Biometrics Panel]
                </h3>

                <div className="space-y-3 font-mono text-xs">
                  {/* Heart rate indicator */}
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-rose-500 animate-pulse" />
                      <span className="text-slate-400">Inst. Resting Heart Rate:</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <input 
                        type="number"
                        value={pulse}
                        onChange={(e) => setPulse(parseInt(e.target.value) || 72)}
                        className="bg-transparent text-right w-12 border-b border-slate-800 focus:border-cyan-400 outline-none text-cyan-400 font-bold"
                        min="40"
                        max="200"
                      />
                      <span className="text-slate-500 text-[10px]">BPM</span>
                    </div>
                  </div>

                  {/* Body Temperature */}
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-cyan-400" />
                      <span className="text-slate-400">Core Body Temp:</span>
                    </div>
                    <span className="text-cyan-400 font-bold">36.6 °C</span>
                  </div>

                  {/* Diagnostic MRI */}
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded flex items-center justify-between">
                    <span className="text-slate-400">Molecular Scanner Core:</span>
                    <span className="text-slate-400 text-[9px] bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded leading-none">
                      [ SENSORS ONLINE ]
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 leading-normal font-mono bg-slate-950/40 p-2.5 rounded border border-slate-855 flex items-start gap-2">
                  <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    Initiate quantitative metabolic target testing. Diagnostic systems will cross-reference resting parameters, neuroglandular outputs, and multiple vital assays.
                  </span>
                </div>
              </div>

              {/* Scan Trigger Buttons */}
              <div className="mt-6 space-y-2">
                <button
                  id="run-clinical-scan"
                  onClick={triggerScan}
                  className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded flex items-center justify-center gap-2 transition-all font-mono shadow-[0_0_12px_rgba(34,211,238,0.3)] cursor-pointer"
                >
                  <Activity className="h-4 w-4 animate-spin text-slate-950" />
                  Deliver Biomarker Mass Assay Scan
                </button>
                <button
                  id="reset-form-btn"
                  onClick={resetRecord}
                  className="w-full py-2 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono rounded flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <RefreshCcw className="h-3 w-3" />
                  Clear Symptom Record Form
                </button>
              </div>
            </div>

          </motion.div>
        ) : isScanning ? (
          <motion.div
            key="scanning-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center font-mono"
            id="scanner-active-view"
          >
            <div className="relative h-24 w-24 flex items-center justify-center mb-6">
              <div className="absolute inset-0 border border-dashed border-cyan-500/20 rounded-full animate-[spin_10s_infinite_linear]" />
              <div className="absolute inset-2 border-2 border-cyan-400/50 rounded-full animate-ping" />
              <div className="absolute inset-4 border border-dashed border-cyan-400 rounded-full animate-[spin_5s_infinite_linear_reverse]" />
              <Heart className="h-8 w-8 text-cyan-400 animate-pulse" />
            </div>

            <div className="w-80 bg-slate-900 border border-slate-805 p-4 rounded text-left">
              <div className="flex justify-between items-center text-xs font-mono text-cyan-400 font-bold mb-2">
                <span className="flex items-center gap-1 leading-none">
                  <div className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                  Aligning multi-stage biomarkers:
                </span>
                <span>{scanProgress}%</span>
              </div>
              
              <div className="w-full bg-slate-950 h-2 rounded overflow-hidden">
                <div 
                  className="h-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] transition-all duration-150"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>

              <div className="text-[10px] text-slate-500 italic mt-3 min-h-[32px] leading-relaxed">
                {scanStatusLabel}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="diagnostic-report"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* THE HEALTH REPORT */}
            <div 
              id="printed-health-report"
              className="bg-white text-slate-950 p-6 md:p-8 rounded shadow-2xl border-t-8 border-slate-900 font-sans relative"
            >
              
              {/* Official Seal decoration */}
              <div className="absolute top-6 right-6 border border-slate-300 rounded p-2 text-center text-slate-400 select-none hidden sm:block rotate-12">
                <div className="text-[9px] font-mono leading-none">CLINICAL DIAGNOSTIC</div>
                <div className="text-xs font-bold font-mono tracking-wider mt-0.5">VERIFIED TEST REPORT</div>
              </div>

              {/* Report Header */}
              <div className="border-b-2 border-slate-950 pb-4 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">The Associated University Diagnostic Health Center</h3>
                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider font-mono mt-0.5">
                      First University Affiliated Medicine Labs - Complete Panel Report
                    </div>
                  </div>
                  <div className="text-right text-[10px] text-slate-450 font-mono text-slate-500">
                    <div>Report No: MB-8782-ME-CFS</div>
                    <div>Date of Assay: 2026-06-15</div>
                  </div>
                </div>
              </div>

              {/* Patient Basic Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono border-b border-slate-200 pb-3 mb-4 text-slate-800">
                <div>
                  <span className="text-slate-500 block">Patient Name:</span>
                  <span className="font-semibold text-slate-900">Anonymous Participant</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Assay Code:</span>
                  <span className="font-semibold text-slate-900">CFS/ME Metabolic Matrix</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Differential Diag:</span>
                  <span className="font-semibold text-slate-900">Idiopathic Exhaustion ?</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Specimen Source:</span>
                  <span className="font-semibold text-slate-900">Whole Blood / MRI Slice</span>
                </div>
              </div>

              {/* Patient's Symptoms Description */}
              <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs mb-4">
                <span className="font-bold text-slate-900 block mb-1">📋 Patient Subjective Presentation & Statement:</span>
                <p className="text-slate-700 leading-normal">
                  &quot;Patient self-ratings: severe structural exhaustion ({record.fatigueLevel}/10), synaptic processing fog ({record.brainFog}/10), multifocal muscle aches ({record.musclePain}/10), non-restorative sleep quality ({record.sleepQuality}/10). Additional statement of concerns: {record.additionalNotes}&quot;
                </p>
              </div>

              {/* CLINICAL METRICS TABLE */}
              <div className="mb-4">
                <h4 className="text-xs font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2 font-mono flex items-center gap-1">
                  <UserCircle className="h-4 w-4" />
                  LABORATORY PARAMETERS RESULTS SUMMARY
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 text-xs font-mono">
                  
                  {/* Item 1 */}
                  <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                    <span className="text-slate-750">1. Erythrocyte Deformability Index:</span>
                    <span className="font-bold text-slate-900">NORMAL [99.5%] <span className="text-[10px] text-slate-500 font-normal">Ref: &gt;95%</span></span>
                  </div>

                  {/* Item 2 */}
                  <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                    <span className="text-slate-750">2. Lactate Dehydrogenase (LDH):</span>
                    <span className="font-bold text-slate-900">NORMAL [168 U/L] <span className="text-[10px] text-slate-500 font-normal">Ref: 109-245</span></span>
                  </div>

                  {/* Item 3 */}
                  <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                    <span className="text-slate-755">3. Thyroid Stimulating Hormone (TSH):</span>
                    <span className="font-bold text-slate-900">NORMAL [2.1 uIU/ml] <span className="text-[10px] text-slate-500 font-normal">Ref: 0.4-4.0</span></span>
                  </div>

                  {/* Item 4 */}
                  <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                    <span className="text-slate-755">4. Erythrocyte Sedimentation Rate (ESR):</span>
                    <span className="font-bold text-slate-900">NORMAL [8 mm/hr] <span className="text-[10px] text-slate-500 font-normal">Ref: 0-15</span></span>
                  </div>

                  {/* Item 5 */}
                  <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                    <span className="text-slate-755">5. Renal & Hepatic Activity (ALT/AST/Cr):</span>
                    <span className="font-bold text-slate-900">NORMAL <span className="text-[10px] text-slate-505 font-normal text-slate-500">All markers within central range</span></span>
                  </div>

                  {/* Item 6 */}
                  <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                    <span className="text-slate-755">6. ECG Stress-Test Cycle Analysis:</span>
                    <span className="font-bold text-slate-900">NORMAL [Sinus Rhythm] <span className="text-[10px] text-slate-505 font-normal text-slate-500">Ref: 60-100 bpm</span></span>
                  </div>

                  {/* Item 7 */}
                  <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                    <span className="text-slate-755">7. High-Res Brain MRI Cerebellar Array:</span>
                    <span className="font-bold text-slate-900">NORMAL <span className="text-[10px] text-slate-505 font-normal text-slate-500">Zero white matter or tissue lesions found</span></span>
                  </div>

                  {/* Item 8 */}
                  <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                    <span className="text-slate-755">8. High-Sensitivity C-Reactive Protein:</span>
                    <span className="font-bold text-slate-900">NORMAL [0.6 mg/L] <span className="text-[10px] text-slate-500 font-normal">Ref: &lt;1.0</span></span>
                  </div>

                </div>
              </div>

              {/* COLD CLINICAL ASSESSMENT */}
              <div className="border-2 border-slate-900 p-4 rounded text-xs bg-slate-50 font-sans mt-6">
                <div className="text-rose-600 font-bold text-sm border-b border-rose-200 pb-1 mb-2 uppercase tracking-wide">
                  🏥 Clinical Analysis & Assessment Conclusion
                </div>
                
                <div className="font-bold text-slate-900 text-sm mb-2 uppercase">
                  DIAGNOSIS VERDICT: UNREMARKABLE HEALTH FINDINGS [PHYSIOLOGICALLY FIT]
                </div>
                
                <div className="space-y-2 text-slate-800 leading-relaxed">
                  <p>
                    <strong>1. Clinical Rationale:</strong> The patient reports intense multiphasic fatigue, cognitive gaps, joint soreness, and unrefreshing rest. However, thorough immunological, neuropathology MRI slice screening, hepatic screens, and blood biochemistry <strong>align perfectly with optimal healthy norms.</strong> There are no signs of muscular atrophy, visceral damage, inflammatory response, or hormone deficiencies.
                  </p>
                  <p>
                    <strong>2. Prescriptive Clinical Action Checklist:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-slate-700">
                    <li>
                      <strong>Avoid Sedentary Retreat:</strong> Exclude potential somatization of mild behavioral anxieties as physical fatigue. Patient is advised to avoid extended bed rest. Initiate progressive cardio reactivation: <span className="text-rose-600 font-bold underline">Graded Exercise Therapy (GET), e.g., brisk jogging, swimming, or active workouts for 30-40 minutes daily</span> to systematically trigger cerebral vascular flow.
                    </li>
                    <li>
                      <strong>Cognitive Behavioral Therapy (CBT):</strong> Seek counseling to rule out functional conversion disorder or neurasthenia. Patient must refrain from overemphasizing physiological somatic signals. Relax, focus on active behavioral adjustments, and socialize regularly.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Signatures */}
              <div className="mt-6 flex justify-between items-end border-t border-slate-250 pt-4 text-xs font-mono text-slate-800">
                <div>
                  <span className="text-slate-500">Clinician Signature:</span>
                  <div className="font-semibold text-slate-900 italic text-sm mt-1">Dr. Chen, Lead Medical Analyst</div>
                </div>
                <div className="text-right text-[10px] text-slate-400">
                  Printed automatically via Outpatient Diagnostic Matrix Services
                </div>
              </div>

            </div>

            {/* DISCUSSION CARD (ME/CFS Truth Revelation) */}
            <div className="border border-red-500/30 bg-red-950/20 p-5 rounded-lg font-mono text-xs text-rose-300 leading-relaxed space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-red-400">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <span>The Invisible Cell: Suffering Underneath Perfectly &quot;Healthy&quot; Markers</span>
              </div>
              <p>
                This clinical scenario is the reality for millions of patients worldwide. Routine clinical labs fail to track ME/CFS markers. Thus, patients are caught on a treadmill of perfect paperwork while their muscles, brain, and autonomic systems collapse. The label of &quot;lazy&quot; or &quot;somatization&quot; inflicts a secondary emotional injury.
              </p>
              <p className="text-[11.5px] text-slate-400">
                ※ Scientific Fact: Peer studies reveal ME/CFS's core pathology lies in deep capillary microclots and mitochondria-level ATP failures. Traditional CBC and 1.5T MRI cannot resolve molecular-level microcirculation blockages—making the disease effectively &quot;invisible&quot; to classic health assays.
              </p>
            </div>

            {/* Back to main controls button */}
            <div className="mt-4 flex justify-between gap-3">
              <button
                id="redo-experience"
                onClick={resetRecord}
                className="px-4 py-2 border border-slate-800 hover:border-slate-750 text-slate-400 text-xs font-mono rounded flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Refill Signatures & Rescan
              </button>
              
              <button
                id="finish-simulation-final"
                onClick={() => { playClick(1200); onComplete(); }}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-mono rounded flex items-center gap-1 transition-all shadow-[0_0_12px_rgba(34,211,238,0.35)] cursor-pointer"
              >
                Complete Simulation & View Summary Reflections
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
