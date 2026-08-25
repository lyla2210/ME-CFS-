import React, { useState, useEffect, useRef } from 'react';
import GlitchFace from './GlitchFace';
import { playClick, playGlitchHum, playWaringBeep, playChime } from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  ArrowRight, 
  RefreshCcw, 
  AlertTriangle, 
  Folder, 
  Mail, 
  ChevronUp, 
  ChevronDown, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

interface StepTwoProps {
  onComplete: () => void;
}

// Scramble text function to visually represent synaptic fog
const GLITCH_GLYPHS = "010x%$&?#@+§øΔαβγ¥Ω※★░▒▓█";

function useScrambledText(originalText: string, distortion: number) {
  const [displayedText, setDisplayedText] = useState(originalText);

  useEffect(() => {
    if (distortion === 0) {
      setDisplayedText(originalText);
      return;
    }

    let intervalId: NodeJS.Timeout;
    const factor = distortion / 100;

    const scramble = () => {
      const chars = originalText.split("");
      const scrambledWords = chars.map((char) => {
        if (
          char === " " || 
          char === "\n" || 
          char === "," || 
          char === "." || 
          char === ":" || 
          char === "?" || 
          char === "!" ||
          char === "[" ||
          char === "]" ||
          char === "-" ||
          char === "_"
        ) {
          return char;
        }
        if (Math.random() < factor * 0.45) {
          return GLITCH_GLYPHS[Math.floor(Math.random() * GLITCH_GLYPHS.length)];
        }
        return char;
      });
      setDisplayedText(scrambledWords.join(""));
    };

    intervalId = setInterval(scramble, 150);
    return () => clearInterval(intervalId);
  }, [originalText, distortion]);

  return displayedText;
}

export default function StepTwo({ onComplete }: StepTwoProps) {
  // Navigation Tasks: 1 to 5
  const [taskIndex, setTaskIndex] = useState(1);
  const [isBlackout, setIsBlackout] = useState(false);

  // Mouse lag animation coordinates (starts at Task 2)
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [laggyPos, setLaggyPos] = useState({ x: -100, y: -100 });
  const [isHoveringWorkspace, setIsHoveringWorkspace] = useState(false);
  const requestRef = useRef<number | null>(null);
  const lastMousePos = useRef({ x: -100, y: -100 });

  // Get mouse lag factor based on current Task index
  const getLagFactor = () => {
    if (taskIndex === 1) return 1.0; // no lag
    if (taskIndex === 2) return 0.20; // light lag
    if (taskIndex === 3) return 0.11; // floaty lag
    if (taskIndex === 4) return 0.06; // heavy frustrating lag
    return 0.02; // Task 5: agonizingly slow
  };

  const getHealthPercent = () => {
    return Math.max(5, 100 - (taskIndex - 1) * 23);
  };

  const getCellularDelay = () => {
    if (taskIndex === 1) return 0;
    return (taskIndex - 1) * 450;
  };

  // ----------------------------------------------------
  // TASK 1: Remember Three Numbers
  // ----------------------------------------------------
  const [t1Phase, setT1Phase] = useState<'memorize' | 'question' | 'result'>('memorize');
  const [t1Countdown, setT1Countdown] = useState(5);
  const [t1Selected, setT1Selected] = useState<number | null>(null);
  const [t1Feedback, setT1Feedback] = useState<string>('');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (taskIndex === 1 && t1Phase === 'memorize') {
      timer = setInterval(() => {
        setT1Countdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            playClick(400, 0.15);
            setT1Phase('question');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [taskIndex, t1Phase]);

  const handleT1Choice = (choice: number) => {
    setT1Selected(choice);
    if (choice === 32) {
      playChime();
      setT1Feedback("Correct answer! Memory registers the sequence before prompt deletion.");
    } else {
      playWaringBeep(800, 300, 2);
      setT1Feedback("Incorrect. Synaptic memory decayed before the response could align.");
    }
    setT1Phase('result');
  };

  // ----------------------------------------------------
  // TASK 2: Drag GlobalTech Client Information
  // ----------------------------------------------------
  const foldersT2 = [
    { id: 'cloudnet', name: 'EmilyChen_CloudNet' },
    { id: 'brightstar', name: 'SarahKim_BrightStar' },
    { id: 'globaltech', name: 'JackThompson_GlobalTech' },
    { id: 'ecovibe', name: 'OliviaPark_EcoVibe' }
  ];
  const [t2SelectedId, setT2SelectedId] = useState<string | null>(null);
  const [t2Feedback, setT2Feedback] = useState<string>('');
  const [t2Status, setT2Status] = useState<'pending' | 'success'>('pending');

  const handleT2DragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('folderId', id);
    playClick(700, 0.05);
  };

  const handleT2Drop = (e: React.DragEvent) => {
    e.preventDefault();
    const folderId = e.dataTransfer.getData('folderId');
    processT2Selection(folderId);
  };

  const processT2Selection = (folderId: string) => {
    if (folderId === 'globaltech') {
      playChime();
      setT2Feedback("Correct! GlobalTech client information parsed into the email buffer.");
      setT2Status('success');
    } else {
      playWaringBeep(900, 400, 1);
      setT2Feedback("Wrong client directory! Manager rejects this dataset.");
    }
  };

  // ----------------------------------------------------
  // TASK 3: Sort Emails
  // ----------------------------------------------------
  const initialEmails = [
    { id: 'B', text: 'Weekly report - due Friday', priority: 3 },
    { id: 'C', text: 'Meeting invitation - next Tuesday', priority: 1 },
    { id: 'A', text: '[URGENT] Client complaint - GlobalTech', priority: 4 },
    { id: 'D', text: 'Newsletter draft - for review', priority: 2 }
  ];
  const [emails, setEmails] = useState(initialEmails);
  const [t3Timer, setT3Timer] = useState(15);
  const [t3Status, setT3Status] = useState<'playing' | 'success' | 'failed'>('playing');
  const [t3Feedback, setT3Feedback] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (taskIndex === 3 && t3Status === 'playing') {
      interval = setInterval(() => {
        setT3Timer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setT3Status('failed');
            playWaringBeep(500, 200, 3);
            setT3Feedback("You didn't finish this task.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [taskIndex, t3Status]);

  const moveEmail = (index: number, direction: 'up' | 'down') => {
    if (t3Status !== 'playing') return;
    playClick(850, 0.05);
    const newEmails = [...emails];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= emails.length) return;

    // Swap elements
    const temp = newEmails[index];
    newEmails[index] = newEmails[targetIdx];
    newEmails[targetIdx] = temp;
    setEmails(newEmails);

    // Check if matching order: A (priority 4) -> B (priority 3) -> D (priority 2) -> C (priority 1)
    const sortedIds = newEmails.map(e => e.id).join('');
    if (sortedIds === 'ABDC') {
      setT3Status('success');
      playChime();
      setT3Feedback("Emails sorted. Good job! Mail priority hierarchy completed.");
    }
  };

  // ----------------------------------------------------
  // TASK 4: Find and Open Q3 Financial Report
  // ----------------------------------------------------
  const scatteredFiles = [
    { id: 'f1', originalName: 'Financial_Report_Q3', currentName: 'Financial_Report_Q3' },
    { id: 'f2', originalName: 'Q2_Report', currentName: 'Q2_Report' },
    { id: 'f3', originalName: 'Q4_Budget', currentName: 'Q4_Budget' },
    { id: 'f4', originalName: 'Client_List', currentName: 'Client_List' },
    { id: 'f5', originalName: 'Meeting_Minutes', currentName: 'Meeting_Minutes' },
    { id: 'f6', originalName: 'Project_Timeline', currentName: 'Project_Timeline' }
  ];

  const [t4Files, setT4Files] = useState(scatteredFiles);
  const [t4Timer, setT4Timer] = useState(10);
  const [t4Status, setT4Status] = useState<'playing' | 'failed'>('playing');
  const [t4GlitchingId, setT4GlitchingId] = useState<string | null>(null);

  // Position offsets for scattering items
  const filePositions = [
    { left: '10%', top: '25%' },
    { left: '42%', top: '15%' },
    { left: '72%', top: '30%' },
    { left: '15%', top: '65%' },
    { left: '45%', top: '70%' },
    { left: '75%', top: '65%' }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (taskIndex === 4 && t4Status === 'playing') {
      interval = setInterval(() => {
        setT4Timer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setT4Status('failed');
            playWaringBeep(450, 150, 3);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [taskIndex, t4Status]);

  // When hovering or trying to click the correct Q3 Report
  const handleT4HoverCorrect = (id: string, isHovering: boolean) => {
    if (t4Status !== 'playing') return;
    if (id === 'f1') {
      if (isHovering) {
        // Automatically turns into another randomized folder on hover
        const alternativeNames = ['Q2_Report', 'Q4_Budget', 'Client_List', 'Meeting_Minutes'];
        const randomName = alternativeNames[Math.floor(Math.random() * alternativeNames.length)];
        
        setT4Files(prev => prev.map(f => f.id === 'f1' ? { ...f, currentName: randomName } : f));
        setT4GlitchingId('f1');
        playGlitchHum(0.2);
      } else {
        // Return to original
        setT4Files(prev => prev.map(f => f.id === 'f1' ? { ...f, currentName: 'Financial_Report_Q3' } : f));
        setT4GlitchingId(null);
      }
    }
  };

  const handleT4Click = (id: string) => {
    if (t4Status !== 'playing') return;
    playWaringBeep(1000, 400, 1);
    // Any click on f1 is wrong because it instantly scrambles to a distractor.
    // Display interactive prompt shaking effect
    setT4GlitchingId(id);
    setTimeout(() => {
      setT4GlitchingId(null);
    }, 600);
  };

  // ----------------------------------------------------
  // TASK 5: 2 PM Client Meeting Calculation
  // ----------------------------------------------------
  const [t5MeetingTime, setT5MeetingTime] = useState('2:00 PM');
  const [t5Attempt, setT5Attempt] = useState(0);
  const [t5Feedback, setT5Feedback] = useState('');
  const [t5IsOver, setT5IsOver] = useState(false);

  const handleT5Choice = (choice: string) => {
    if (t5IsOver) return;
    const nextAttempt = t5Attempt + 1;
    setT5Attempt(nextAttempt);

    if (nextAttempt === 1) {
      playWaringBeep(900, 350, 2);
      setT5Feedback("Error! Time perception is glitching. The system updates...");
      setT5MeetingTime("12:00 AM");
    } else if (nextAttempt === 2) {
      playWaringBeep(850, 300, 2);
      setT5Feedback("Incorrect. The schedule shifts again before comprehension...");
      setT5MeetingTime("9:00 AM");
    } else {
      playWaringBeep(400, 150, 4);
      setT5Feedback("CRITICAL DISMISSAL");
      setT5IsOver(true);
      // Wait and trigger blackout typewriter sequence
      setTimeout(() => {
        setIsBlackout(true);
      }, 1800);
    }
  };

  // ----------------------------------------------------
  // Dynamic slow mouse lag hook logic
  // ----------------------------------------------------
  useEffect(() => {
    const updateLagPosition = () => {
      const factor = getLagFactor();
      
      setLaggyPos((prev) => {
        const dx = lastMousePos.current.x - prev.x;
        const dy = lastMousePos.current.y - prev.y;
        
        if (factor === 1.0 || (Math.abs(dx) < 1 && Math.abs(dy) < 1)) {
          return { x: lastMousePos.current.x, y: lastMousePos.current.y };
        }
        
        return {
          x: prev.x + dx * factor,
          y: prev.y + dy * factor,
        };
      });
      
      requestRef.current = requestAnimationFrame(updateLagPosition);
    };

    requestRef.current = requestAnimationFrame(updateLagPosition);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [taskIndex]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePos({ x, y });
    lastMousePos.current = { x, y };
  };

  // Typewriter effect state inside Blackout
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const [typewriterText, setTypewriterText] = useState("");
  const typewriterTimerRef = useRef<NodeJS.Timeout | null>(null);

  const blackoutContent = "You used to be capable. But processing information gradually became nearly impossible. For many people living with ME/CFS, this is what everyday life feels like.";

  useEffect(() => {
    if (isBlackout) {
      setTypewriterIndex(0);
      setTypewriterText("");
      
      const updateText = () => {
        setTypewriterIndex((prevIndex) => {
          if (prevIndex < blackoutContent.length) {
            setTypewriterText(blackoutContent.substring(0, prevIndex + 1));
            if (blackoutContent[prevIndex] !== " ") {
              playClick(150 + Math.random() * 50, 0.02);
            }
            return prevIndex + 1;
          } else {
            if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);
            return prevIndex;
          }
        });
      };

      typewriterTimerRef.current = setInterval(updateText, 45);
    }

    return () => {
      if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);
    };
  }, [isBlackout]);

  const handleRestart = () => {
    playClick(500);
    setTaskIndex(1);
    setIsBlackout(false);
    setT1Phase('memorize');
    setT1Countdown(5);
    setT1Selected(null);
    setT1Feedback('');
    setT2SelectedId(null);
    setT2Feedback('');
    setT2Status('pending');
    setEmails(initialEmails);
    setT3Timer(15);
    setT3Status('playing');
    setT3Feedback('');
    setT4Files(scatteredFiles);
    setT4Timer(10);
    setT4Status('playing');
    setT5MeetingTime('2:00 PM');
    setT5Attempt(0);
    setT5Feedback('');
    setT5IsOver(false);
    setTypewriterText("");
  };

  return (
    <div className="w-full max-w-6xl mx-auto rounded-lg border border-white/10 overflow-hidden bg-black/80 p-4 md:p-5 font-sans">
      
      {/* Header Info */}
      <div className="mb-4 border-b border-white/10 pb-3">
        <h2 id="step-two-title" className="text-xl md:text-2xl font-semibold tracking-tight text-white/80 font-mono flex items-center gap-2">
          <Brain className="h-5 w-5 text-violet-300 animate-pulse" />
          STAGE <span className="text-violet-300">02</span>: Dissolving Speech [Cognitive Fog & Dysphasia]
        </h2>
        <p className="text-slate-400 text-xs mt-1 leading-relaxed border-l border-white/10 pl-2">
          ME/CFS brain fog targets information processing and verbal coordination (dysphasia). As sensory overload peaks, language crumbles into digital artifacts, and neuropathway signals experience physical delay—causing you to stare at buttons yet struggle to move your limbs.
        </p>
      </div>

      {/* Main Sandbox Workspace area */}
      <div
        id="cognitive-sandbox"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHoveringWorkspace(true)}
        onMouseLeave={() => {
          setIsHoveringWorkspace(false);
          setMousePos({ x: -100, y: -100 });
          lastMousePos.current = { x: -100, y: -100 };
        }}
        className={`relative min-h-[340px] rounded border border-slate-800 bg-black/60 p-3 md:p-4 overflow-hidden select-none transition-all duration-1000 ${
          taskIndex > 1 && !isBlackout ? 'cursor-none' : 'cursor-default'
        } ${isBlackout ? 'bg-black border-black shadow-[inset_0_0_50px_rgba(0,0,0,1)]' : ''}`}
      >
        <AnimatePresence mode="wait">
          {!isBlackout ? (
            <motion.div
              key="dialog-view"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch"
            >
              {/* Dynamic laggy cursor inside sandbox block */}
              {taskIndex > 1 && isHoveringWorkspace && (
                <div
                  id="laggy-mouse-cursor"
                  className="absolute rounded-full border border-red-500 bg-red-500/10 shadow-[0_0_12px_rgba(244,63,94,0.8)] pointer-events-none z-50 flex items-center justify-center transition-transform"
                  style={{
                    left: `${laggyPos.x}px`,
                    top: `${laggyPos.y}px`,
                    width: `${18 + (taskIndex * 3)}px`,
                    height: `${18 + (taskIndex * 3)}px`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  <div className="absolute top-1/2 left-0 right-0 h-[0.5px] bg-rose-500/40" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-[0.5px] bg-rose-500/40" />
                </div>
              )}

              {/* Left Side: Avatar & Diagnostic HUD */}
              <div className="md:col-span-4 flex flex-col items-center justify-center gap-3 border-r border-slate-900 pr-0 md:pr-4">
                <GlitchFace distortion={(taskIndex - 1) * 23} />
                <div className="text-center font-mono w-full">
                  <div className={`text-xs font-bold leading-none uppercase ${taskIndex > 3 ? 'text-rose-400' : 'text-violet-300'}`}>
                    MANAGER [DEPT LEAD]
                  </div>
                  <div className="text-[9px] text-slate-500 mt-1 uppercase tracking-wider">
                    Synaptic Health: {getHealthPercent()}%
                  </div>
                  <div className="text-[9px] text-rose-500/80 font-bold mt-1 uppercase tracking-wider">
                    Cellular Delay: {getCellularDelay()} ms
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-900 flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((idx) => (
                      <div 
                        key={idx} 
                        className={`h-2 w-full max-w-[20px] rounded-[1px] transition-all ${
                          idx <= taskIndex 
                            ? 'accent-dot' 
                            : 'bg-slate-800'
                        }`}
                        title={`Task ${idx}`}
                      />
                    ))}
                  </div>
                  <div className="text-[8px] text-slate-600 mt-1 uppercase tracking-wider font-mono">
                    Task progress: {taskIndex} of 5
                  </div>
                </div>
              </div>

              {/* Right Side: Active Task Sandbox */}
              <div className="md:col-span-8 flex flex-col justify-between space-y-4">
                
                {/* ------------------------------------------- */}
                {/* TASK 1 VIEW */}
                {/* ------------------------------------------- */}
                {taskIndex === 1 && (
                  <div className="flex-1 flex flex-col justify-between space-y-4">
                    <div className="bg-slate-900/60 p-4 rounded-md border border-slate-800">
                      <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 mb-2">
                        <span className="tracking-widest">TRANSMISSION HEADER</span>
                        <span className="text-white/65 text-violet-300 font-bold">● ACTIVE</span>
                      </div>
                      
                      {t1Phase === 'memorize' ? (
                        <div className="text-center py-6 space-y-4">
                          <p className="font-mono text-xs text-slate-300">
                            Before we start, remember these three numbers.
                          </p>
                          <div className="text-3xl font-mono font-bold text-white tracking-[0.25em] animate-pulse">
                            24  32  13
                          </div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-950/20 border border-red-500/20 rounded text-[10px] text-red-400 font-mono">
                            <Clock className="h-3.5 w-3.5 text-red-400 animate-spin" style={{ animationDuration: '3s' }} />
                            DELETION IN {t1Countdown} SECONDS
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 space-y-3">
                          <p className="font-mono text-xs text-slate-300">
                            Please select the second number.
                          </p>
                          <div className="text-lg font-mono font-semibold text-violet-300/80">
                            [ SEARCHING RETRO-SEQUENCE... ]
                          </div>
                        </div>
                      )}
                    </div>

                    {t1Phase === 'question' && (
                      <div className="grid grid-cols-3 gap-2">
                        {[24, 32, 13].map((num) => (
                          <button
                            key={num}
                            onClick={() => handleT1Choice(num)}
                            className="py-3 px-2 rounded font-mono text-xs bg-white/5 hover:bg-white/15 border border-white/8 hover:border-white/10 text-white/85 transition-all cursor-pointer"
                          >
                            Choice {num === 24 ? 'A' : num === 32 ? 'B' : 'C'}: {num}
                          </button>
                        ))}
                      </div>
                    )}

                    {t1Phase === 'result' && (
                      <div className="space-y-4">
                        <div className={`p-4 rounded border font-mono text-xs ${
                          t1Selected === 32 
                            ? 'bg-violet-400/10 border-violet-400/30 text-violet-300'
                            : 'bg-rose-950/20 border-rose-500/25 text-rose-300'
                        }`}>
                          <div className="flex items-center gap-2 font-bold mb-1">
                            {t1Selected === 32 ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                            {t1Selected === 32 ? "SUCCESS" : "COGNITIVE STALL"}
                          </div>
                          <p className="leading-relaxed">{t1Feedback}</p>
                        </div>
                        <button
                          onClick={() => { playClick(); setTaskIndex(2); }}
                          className="w-full py-3 accent-btn font-bold font-mono text-xs rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>PROCEED TO TASK 2</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ------------------------------------------- */}
                {/* TASK 2 VIEW */}
                {/* ------------------------------------------- */}
                {taskIndex === 2 && (
                  <div className="flex-1 flex flex-col justify-between space-y-4">
                    <div className="bg-slate-900/60 p-4 rounded-md border border-slate-800">
                      <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 mb-2">
                        <span className="tracking-widest">TRANSMISSION HEADER</span>
                        <span className="text-orange-400 animate-pulse font-bold">⚠ DELAY STAGE 1 ACTIVE</span>
                      </div>
                      <p className="font-mono text-xs text-slate-200 leading-relaxed">
                        Please send me the client information for <strong className="text-violet-300 font-bold">GlobalTech</strong>.
                      </p>
                    </div>

                    {/* Draggable folders container */}
                    <div className="grid grid-cols-2 gap-2">
                      {foldersT2.map((f) => (
                        <div
                          key={f.id}
                          draggable={t2Status !== 'success'}
                          onDragStart={(e) => handleT2DragStart(e, f.id)}
                          onClick={() => {
                            if (t2Status !== 'success') {
                              playClick(750, 0.05);
                              setT2SelectedId(f.id);
                            }
                          }}
                          className={`p-3 rounded border font-mono text-xs flex items-center gap-2 cursor-grab select-none transition-all ${
                            t2SelectedId === f.id
                              ? 'bg-white/10 border-white/20 text-white/85'
                              : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-400'
                          }`}
                        >
                          <Folder className="h-4 w-4 shrink-0 text-white/60" />
                          <span className="truncate">{f.name}</span>
                        </div>
                      ))}
                    </div>

                    {/* Mailbox Drop Zone */}
                    <div 
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleT2Drop}
                      onClick={() => {
                        if (t2SelectedId && t2Status !== 'success') {
                          processT2Selection(t2SelectedId);
                        }
                      }}
                      className={`py-8 px-4 rounded border-2 border-dashed font-mono text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                        t2Status === 'success'
                          ? 'bg-emerald-950/10 border-emerald-500/40 text-emerald-400'
                          : t2SelectedId 
                          ? 'bg-white/90/5 border-white/20/40 text-white/85 animate-pulse'
                          : 'bg-slate-900/20 border-slate-800 hover:border-white/10 text-slate-500'
                      }`}
                    >
                      <Mail className="h-6 w-6 text-violet-300" />
                      <div className="text-xs font-bold uppercase tracking-wider">
                        {t2Status === 'success' ? 'FOLDER SECURELY TRANSMITTED' : 'Manager\'s Inbox [manager@company.com]'}
                      </div>
                      <p className="text-[10px] text-slate-400 max-w-sm leading-normal uppercase">
                        Drag the folder into the mail box, or select a folder then click here to drop.
                      </p>
                    </div>

                    {t2Feedback && (
                      <div className={`p-3 rounded border font-mono text-xs ${
                        t2Status === 'success'
                            ? 'bg-violet-400/10 border-violet-400/30 text-violet-300'
                            : 'bg-rose-950/20 border-rose-500/25 text-rose-300'
                      }`}>
                        {t2Feedback}
                      </div>
                    )}

                    {t2Status === 'success' && (
                      <button
                        onClick={() => { playClick(); setTaskIndex(3); }}
                        className="w-full py-3 accent-btn font-bold font-mono text-xs rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>PROCEED TO TASK 3</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}

                {/* ------------------------------------------- */}
                {/* TASK 3 VIEW */}
                {/* ------------------------------------------- */}
                {taskIndex === 3 && (
                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    <div className="bg-slate-900/60 p-3 rounded border border-slate-800 flex justify-between items-center gap-4">
                      <div>
                        <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">TRANSMISSION DIALOG</div>
                        <p className="font-mono text-xs text-slate-200">
                          Sort these emails by priority: <strong className="text-rose-400 font-bold">Urgent first</strong>.
                        </p>
                      </div>
                      <div className={`shrink-0 px-3 py-1.5 font-mono text-xs font-bold rounded border ${
                        t3Timer <= 5 
                          ? 'bg-rose-950/30 border-rose-500/45 text-rose-400 animate-pulse' 
                          : 'bg-slate-900 border-slate-800 text-violet-300'
                      }`}>
                        SEC LEFT: {t3Timer}s
                      </div>
                    </div>

                    {/* Email sorting block list */}
                    <div className="space-y-1.5">
                      {emails.map((email, idx) => (
                        <div 
                          key={email.id}
                          className={`p-2.5 rounded border font-mono text-[11px] flex items-center justify-between gap-3 ${
                            t3Status === 'success'
                              ? 'bg-emerald-950/15 border-emerald-500/30 text-emerald-450'
                              : 'bg-slate-900/40 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-5 text-center text-slate-500 text-[9px] border-r border-slate-800 pr-1">0{idx + 1}</span>
                            <span className="truncate">{email.text}</span>
                          </div>
                          
                          {/* Chevron controller */}
                          {t3Status === 'playing' && (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                disabled={idx === 0}
                                onClick={() => moveEmail(idx, 'up')}
                                className="p-1 rounded bg-slate-950 hover:bg-white/10 border border-slate-800 hover:border-white/10 text-slate-500 disabled:opacity-20 cursor-pointer"
                                title="Move Up"
                              >
                                <ChevronUp className="h-3 w-3" />
                              </button>
                              <button
                                disabled={idx === emails.length - 1}
                                onClick={() => moveEmail(idx, 'down')}
                                className="p-1 rounded bg-slate-950 hover:bg-white/10 border border-slate-800 hover:border-white/10 text-slate-500 disabled:opacity-20 cursor-pointer"
                                title="Move Down"
                              >
                                <ChevronDown className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {t3Feedback && (
                      <div className={`p-2.5 rounded border font-mono text-[11px] ${
                        t3Status === 'success'
                            ? 'bg-violet-400/10 border-violet-400/30 text-violet-300'
                            : 'bg-rose-950/20 border-rose-500/25 text-rose-300'
                      }`}>
                        {t3Feedback}
                      </div>
                    )}

                    {t3Status !== 'playing' && (
                      <button
                        onClick={() => { playClick(); setTaskIndex(4); }}
                        className="w-full py-2.5 accent-btn font-bold font-mono text-xs rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>PROCEED TO TASK 4</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}

                {/* ------------------------------------------- */}
                {/* TASK 4 VIEW */}
                {/* ------------------------------------------- */}
                {taskIndex === 4 && (
                  <div className="flex-1 flex flex-col justify-between space-y-4">
                    <div className="bg-slate-900/60 p-3 rounded border border-slate-800 flex justify-between items-center gap-4">
                      <div>
                        <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">CRITICAL DEADLINE</div>
                        <p className="font-mono text-xs text-slate-200">
                          Find and open the <strong className="text-violet-300">Q3 financial report</strong> before the clock runs out!
                        </p>
                      </div>
                      <div className="shrink-0 px-3 py-1.5 font-mono text-xs font-bold rounded border bg-rose-950/20 border-rose-500/40 text-rose-400 animate-pulse">
                        TIME REMAINING: {t4Timer}s
                      </div>
                    </div>

                    {/* scattered workspace folder cards */}
                    <div className="relative flex-1 min-h-[180px] bg-black/80 border border-slate-900 rounded p-4">
                      {t4Status === 'playing' ? (
                        t4Files.map((f, idx) => {
                          const isGlitching = t4GlitchingId === f.id;
                          const pos = filePositions[idx];
                          
                          return (
                            <button
                              key={f.id}
                              style={{
                                position: 'absolute',
                                left: pos.left,
                                top: pos.top
                              }}
                              onMouseEnter={() => handleT4HoverCorrect(f.id, true)}
                              onMouseLeave={() => handleT4HoverCorrect(f.id, false)}
                              onClick={() => handleT4Click(f.id)}
                              className={`p-2.5 rounded border flex flex-col items-center justify-center gap-1 text-[10px] font-mono tracking-tight max-w-[130px] transition-all duration-150 cursor-pointer ${
                                isGlitching
                                  ? 'bg-rose-950/60 border-red-500 text-red-200 animate-bounce'
                                  : 'bg-slate-900/40 border-slate-800 hover:border-white/10 hover:bg-white/90/5 text-slate-300'
                              }`}
                            >
                              <Folder className={`h-5 w-5 ${isGlitching ? 'text-red-500 animate-pulse' : 'text-white/60'}`} />
                              <span className="truncate block max-w-[110px]">{f.currentName}</span>
                            </button>
                          );
                        })
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-rose-950/10">
                          <AlertCircle className="h-8 w-8 text-rose-500 mb-2 animate-pulse" />
                          <h4 className="text-xs font-bold font-mono text-rose-400 uppercase tracking-wider">
                            Time's up! You didn't finish this task.
                          </h4>
                          <p className="text-[10px] text-slate-400 max-w-sm mt-1 uppercase leading-relaxed">
                            Mitochondrial crash prevented the motor response from aligning before the timer ran dry.
                          </p>
                        </div>
                      )}
                    </div>

                    {t4Status !== 'playing' && (
                      <button
                        onClick={() => { playClick(); setTaskIndex(5); }}
                        className="w-full py-2.5 accent-btn font-bold font-mono text-xs rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>PROCEED TO TASK 5</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}

                {/* ------------------------------------------- */}
                {/* TASK 5 VIEW */}
                {/* ------------------------------------------- */}
                {taskIndex === 5 && (
                  <div className="flex-1 flex flex-col justify-between space-y-4">
                    <div className="bg-slate-900/60 p-4 rounded-md border border-slate-800 space-y-2 relative">
                      <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
                        <span className="tracking-widest">INCOMING MESSAGE INBOX</span>
                        <span className="text-slate-500 font-bold">SENT 20 MINUTES AGO</span>
                      </div>
                      
                      <div className="border-l-2 border-rose-500 pl-3 py-1 space-y-1.5">
                        <div className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                          FROM: Supervisor [Dept Lead]
                        </div>
                        <p className="font-mono text-xs text-slate-200 leading-relaxed">
                          A client meeting starts at <strong className="text-violet-300 text-sm">{t5MeetingTime}</strong>. You need 30 minutes preparation.
                        </p>
                      </div>
                    </div>

                    {!t5IsOver ? (
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">
                          Question: When should you begin?
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          <button
                            id="choice-t5-a"
                            onClick={() => handleT5Choice("A")}
                            className="w-full py-3 px-4 rounded text-left font-mono text-xs bg-white/5 hover:bg-white/10 border border-white/8 text-white/85 cursor-pointer"
                          >
                            Choice A: 1:30 PM
                          </button>
                          <button
                            id="choice-t5-b"
                            onClick={() => handleT5Choice("B")}
                            className="w-full py-3 px-4 rounded text-left font-mono text-xs bg-white/5 hover:bg-white/10 border border-white/8 text-white/85 cursor-pointer"
                          >
                            Choice B: 11:30 AM
                          </button>
                          <button
                            id="choice-t5-c"
                            onClick={() => handleT5Choice("C")}
                            className="w-full py-3 px-4 rounded text-left font-mono text-xs bg-white/5 hover:bg-white/10 border border-white/8 text-white/85 cursor-pointer"
                          >
                            Choice C: 8:30 AM
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 space-y-3">
                        <XCircle className="h-8 w-8 text-rose-500 mx-auto animate-pulse" />
                        <h4 className="text-sm font-bold font-mono text-rose-400 uppercase tracking-wide">
                          Manager: I need someone more reliable.
                        </h4>
                        <p className="text-xs text-slate-500 font-mono uppercase">
                          COMPREHENSION CRASHED · INITIATING SYNAPTIC BLACKOUT...
                        </p>
                      </div>
                    )}

                    {t5Feedback && (
                      <div className="p-3 bg-rose-950/20 border border-rose-500/25 rounded font-mono text-xs text-rose-300">
                        {t5Feedback}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </motion.div>
          ) : (
            /* BLACKOUT POWERFUL VIEW - TYPEWRITER EFFECT */
            <motion.div
              key="blackout-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 bg-black flex flex-col justify-center p-6 md:p-12 text-left"
              id="blackout-box"
            >
              <div className="max-w-2xl mx-auto w-full space-y-6">
                <p className="whitespace-pre-wrap font-mono text-base md:text-lg leading-relaxed text-slate-100 tracking-wide select-none">
                  {typewriterText}
                  {typewriterIndex < blackoutContent.length && (
                    <span className="animate-pulse font-mono text-violet-300 ml-1">_</span>
                  )}
                </p>

                {/* Display button only when complete */}
                {typewriterIndex >= blackoutContent.length && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.0 }}
                    className="pt-10 flex gap-4"
                  >
                    <button
                      id="restart-step-two"
                      onClick={handleRestart}
                      className="px-4 py-2 border border-slate-800 hover:border-slate-700 text-slate-400 text-xs rounded transition-all cursor-pointer font-mono"
                    >
                      Repeat Brain Fog
                    </button>
                    <button
                      id="finish-step-two"
                      onClick={() => { playClick(1100); onComplete(); }}
                      className="px-5 py-2.5 accent-btn text-xs font-bold font-mono rounded cursor-pointer"
                    >
                      Proceed to Stage 03: Physical Exertion
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Details */}
      <div className="mt-4 text-center">
        <span className="text-[10px] text-slate-600 font-mono uppercase tracking-wider">
          ※ Simulation Note: Drag coordinates, timer deadlines, and calculation shifting demonstrate real cognitive load fatigue.
        </span>
      </div>
    </div>
  );
}
