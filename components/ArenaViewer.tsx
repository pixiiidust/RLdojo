import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RefreshCw, Swords, Brain, ChevronDown, Activity, BarChart, MonitorPlay, X } from 'lucide-react';
import { EpisodeTrajectory, Action, OpponentType } from '../types';

interface ArenaViewerProps {
  trajectory: EpisodeTrajectory | null;
  loading: boolean;
  onRestart?: () => void;
  onChangeOpponent?: (type: OpponentType) => void;
  onShowAnalysis?: () => void;
  currentOpponentType?: OpponentType;
  onClose?: () => void;
}

const ARENA_TILES = 11;

// --- Helper Components ---
const CommentaryLine: React.FC<{ text: string, type: 'info' | 'critical' }> = ({ text, type }) => (
    <div className={`text-xs md:text-xl font-mono ${type === 'critical' ? 'text-amber-300 font-black' : 'text-amber-500'} animate-in fade-in slide-in-from-bottom-2 leading-tight text-center md:text-left`}>
        {text}
    </div>
);

const MenuDropdown: React.FC<{ 
    label: string, 
    icon: React.ReactNode, 
    options: { id: string, label: string, desc: string }[], 
    onSelect: (id: string) => void 
}> = ({ label, icon, options, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative w-full">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-black border md:border-4 border-amber-500 hover:bg-amber-500 hover:text-black py-2 md:py-4 px-2 md:px-4 font-bold uppercase flex items-center justify-between gap-1 md:gap-4 transition-all text-[10px] md:text-lg whitespace-nowrap"
            >
                <div className="flex items-center gap-2 md:gap-3 overflow-hidden">{icon} <span className="truncate">{label}</span></div>
                <ChevronDown size={14} className={`transition-transform flex-shrink-0 md:w-5 md:h-5 ${isOpen ? 'rotate-180' : ''}`}/>
            </button>
            
            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-black border md:border-4 border-amber-500 z-50 shadow-[0_0_20px_rgba(255,176,0,0.2)] max-h-40 md:max-h-60 overflow-y-auto">
                    {options.map(opt => (
                        <button 
                            key={opt.id}
                            onClick={() => { onSelect(opt.id); setIsOpen(false); }}
                            className="w-full text-left p-2 md:p-4 hover:bg-amber-900/30 border-b border-amber-900 last:border-0 group"
                        >
                            <div className="font-bold text-amber-500 uppercase text-[10px] md:text-base group-hover:text-amber-400">{opt.label}</div>
                            <div className="text-[8px] md:text-xs text-amber-500/60 group-hover:text-amber-500/80 truncate">{opt.desc}</div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export const ArenaViewer: React.FC<ArenaViewerProps> = ({ trajectory, loading, onRestart, onChangeOpponent, onShowAnalysis, onClose, currentOpponentType = OpponentType.RANDOM }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(150);
  const [showEndModal, setShowEndModal] = useState(false);
  const timerRef = useRef<number | null>(null);
  const [commentary, setCommentary] = useState<{text: string, type: 'info'|'critical'}|null>(null);

  useEffect(() => {
    if (isPlaying && trajectory && trajectory.steps.length > 0) {
      timerRef.current = window.setInterval(() => {
        setStepIndex(prev => {
          if (prev >= trajectory.steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, trajectory, playbackSpeed]);

  useEffect(() => {
    setStepIndex(0);
    setCommentary(null);
    setIsPlaying(true);
    setShowEndModal(false);
  }, [trajectory]);

  // Generate commentary based on step events
  useEffect(() => {
    if (!trajectory || !trajectory.steps[stepIndex]) return;
    const step = trajectory.steps[stepIndex];
    const prev = stepIndex > 0 ? trajectory.steps[stepIndex - 1] : null;

    let newComment = null;

    if (stepIndex === 0) {
        newComment = { text: "FIGHT START! Fighters engage.", type: 'info' };
    } else if (prev) {
        const selfDmg = prev.self_hp - step.self_hp;
        const oppDmg = prev.opp_hp - step.opp_hp;
        const dist = Math.abs(step.self_pos - step.opp_pos);

        if (oppDmg > 10) newComment = { text: "CRITICAL HIT! Agent lands a devastating blow.", type: 'critical' };
        else if (selfDmg > 10) newComment = { text: "WARNING! Agent takes heavy damage.", type: 'critical' };
        else if (oppDmg > 0) newComment = { text: `Agent connects a strike! Opponent HP now ${Math.round(step.opp_hp)}.`, type: 'info' };
        else if (selfDmg > 0) newComment = { text: `Opponent strikes back! Agent HP down to ${Math.round(step.self_hp)}.`, type: 'info' };
        else if (step.self_action === Action.BLOCK && prev.opp_action === Action.PUNCH) newComment = { text: "Clutch block by the Agent!", type: 'info' };
        else if (step.self_action === Action.BLOCK) newComment = { text: "Agent maintains defensive stance.", type: 'info' };
        else if (dist === 1 && stepIndex % 5 === 0) newComment = { text: "Fighters are nose-to-nose in close combat.", type: 'info' };
    }

    if (newComment) setCommentary(newComment as any);

  }, [stepIndex, trajectory]);

  const isFinished = trajectory && stepIndex === trajectory.steps.length - 1;
  
  useEffect(() => {
      if (isFinished) setShowEndModal(true);
  }, [isFinished]);

  // Loading State
  if (loading) return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-4 md:gap-6 text-amber-500 animate-pulse bg-black p-4">
       <div className="text-xl md:text-5xl font-black tracking-widest text-center">CONNECTING TO ARENA...</div>
       <div className="w-full max-w-xs md:max-w-md h-3 md:h-4 border-2 border-amber-500 p-1">
           <div className="h-full bg-amber-500 animate-[width_1s_ease-in-out_infinite] w-full origin-left"></div>
       </div>
    </div>
  );
  
  // Empty State
  if (!trajectory) return (
    <div className="h-full w-full flex flex-col items-center justify-center text-amber-500/30 gap-4 bg-black p-4 text-center">
      <div className="w-20 h-20 md:w-32 md:h-32 border-4 border-dashed border-amber-500/30 rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite]">
         <div className="w-12 h-12 md:w-24 md:h-24 border-2 border-amber-500/30 rounded-full"></div>
      </div>
      <span className="uppercase tracking-widest font-bold text-sm md:text-2xl">Ready for Simulation</span>
    </div>
  );

  // Guard against undefined steps (Bug fix)
  const currentStep = trajectory.steps[stepIndex];
  if (!currentStep) return null;

  return (
    <div className="h-full flex flex-col relative bg-black text-amber-500 select-none overflow-hidden">
      
      {/* Top Border Info Strip */}
      <div className="h-6 md:h-10 border-b md:border-b-2 border-amber-500 bg-amber-950/20 flex justify-between items-center px-2 md:px-4 font-bold text-[8px] md:text-sm uppercase tracking-wider shrink-0">
         <div className="flex gap-2 md:gap-6">
             <div className="flex gap-1 md:gap-2"><span className="opacity-50">EP:</span><span>{trajectory.episode_id.substring(0,6)}</span></div>
             <div className="flex gap-1 md:gap-2"><span className="opacity-50">STEP:</span><span>{currentStep.t}</span></div>
         </div>
         <div className="flex gap-2 md:gap-4 items-center">
             <div className="opacity-50 hidden md:block">BRAIN: LATEST</div>
             <div className="flex gap-1 md:gap-2">
                 <span>SCORE:</span>
                 <span className={currentStep.reward > 0 ? "text-amber-300" : "text-amber-700"}>
                     {currentStep.reward}
                 </span>
             </div>
             {onClose && (
                <button 
                  onClick={onClose} 
                  className="ml-2 border-l border-amber-900 pl-2 text-amber-500 hover:text-white transition-colors"
                  title="Close Viewer"
                >
                    <X size={14} className="md:w-5 md:h-5"/>
                </button>
             )}
         </div>
      </div>

      {/* COMPACT ARENA AREA */}
      <div className="flex-none h-[160px] md:h-[320px] relative bg-[#080500] border-b-2 md:border-b-4 border-amber-900 overflow-hidden">
        
        {/* Grid Floor */}
        <div className="absolute bottom-0 w-full h-1/4 flex border-t border-amber-900/50">
           {Array.from({ length: ARENA_TILES }).map((_, i) => (
             <div key={i} className="flex-1 border-r border-amber-900/30 flex items-end justify-center pb-1">
                 <span className="text-[8px] md:text-xs font-bold opacity-20">{i}</span>
             </div>
           ))}
        </div>

        {/* Characters Container */}
        <div className="absolute inset-0 flex items-end pb-4 md:pb-8">
            
            {/* Agent (YOU) - Bright Amber/Greenish */}
            <div 
              className="absolute transition-all duration-150 ease-linear z-10 w-0 flex flex-col items-center gap-0.5 md:gap-2"
              style={{ left: `${(currentStep.self_pos / ARENA_TILES) * 100}%` }}
            >
                 {/* HP Label (Above Bar) */}
                 <span className="text-[6px] md:text-xs font-black tracking-wider text-amber-400 whitespace-nowrap mb-0 drop-shadow-md bg-black/50 px-0.5 md:px-1">
                    AGENT {Math.round(currentStep.self_hp)}
                 </span>
                 {/* Thicker HP Bar (2x) */}
                 <div className="w-10 md:w-24 h-1 md:h-4 bg-black border md:border-2 border-amber-600 mb-0.5 md:mb-1">
                     <div className="bg-amber-500 h-full transition-all" style={{ width: `${currentStep.self_hp}%` }}></div>
                 </div>
                 
                 {/* Body */}
                 <div className={`w-6 h-14 md:w-14 md:h-44 border-2 md:border-[5px] border-amber-200 bg-amber-500 relative flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.6)] ${currentStep.self_action === Action.BLOCK ? 'border-b-[4px] md:border-b-[10px] scale-y-90' : ''}`}>
                     {/* Face */}
                     <div className="w-full flex justify-center gap-0.5 md:gap-1 mt-1 md:mt-3 absolute top-0">
                        <div className="w-0.5 h-0.5 md:w-1.5 md:h-1.5 bg-black"></div><div className="w-0.5 h-0.5 md:w-1.5 md:h-1.5 bg-black"></div>
                     </div>
                     {/* Action Indicator */}
                     {(currentStep.self_action === Action.PUNCH || currentStep.self_action === Action.KICK) && (
                         <div className="absolute left-full ml-1 md:ml-2 bg-white text-black text-[8px] md:text-xl font-black px-1 md:px-2 py-0 md:py-1 uppercase animate-ping z-50 rounded-sm">POW</div>
                     )}
                 </div>
            </div>

            {/* Opponent (ENEMY) - Red/Magenta */}
            <div 
              className="absolute transition-all duration-150 ease-linear z-10 w-0 flex flex-col items-center gap-0.5 md:gap-2"
              style={{ left: `${(currentStep.opp_pos / ARENA_TILES) * 100}%` }}
            >
                 {/* HP Label (Above Bar) */}
                 <span className="text-[6px] md:text-xs font-black tracking-wider text-red-500 whitespace-nowrap mb-0 drop-shadow-md bg-black/50 px-0.5 md:px-1">
                    ENEMY {Math.round(currentStep.opp_hp)}
                 </span>
                 {/* Thicker HP Bar (2x) */}
                 <div className="w-10 md:w-24 h-1 md:h-4 bg-black border md:border-2 border-red-800 mb-0.5 md:mb-1">
                     <div className="bg-red-600 h-full transition-all" style={{ width: `${currentStep.opp_hp}%` }}></div>
                 </div>

                 {/* Body */}
                 <div className={`w-6 h-14 md:w-14 md:h-44 border-2 md:border-[5px] border-red-200 bg-red-600 relative flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.6)] ${currentStep.opp_action === Action.BLOCK ? 'border-b-[4px] md:border-b-[10px] scale-y-90' : ''}`}>
                     {/* Face */}
                     <div className="w-full flex justify-center gap-0.5 md:gap-1 mt-1 md:mt-3 absolute top-0">
                        <div className="w-0.5 h-0.5 md:w-1.5 md:h-1.5 bg-black"></div><div className="w-0.5 h-0.5 md:w-1.5 md:h-1.5 bg-black"></div>
                     </div>
                     {/* Action Indicator */}
                     {(currentStep.opp_action === Action.PUNCH || currentStep.opp_action === Action.KICK) && (
                         <div className="absolute right-full mr-1 md:mr-2 bg-white text-black text-[8px] md:text-xl font-black px-1 md:px-2 py-0 md:py-1 uppercase animate-ping z-50 rounded-sm">BAM</div>
                     )}
                 </div>
            </div>
        </div>
      </div>

      {/* LIVE COMMENTARY MODULE */}
      <div className="flex-none h-14 md:h-32 bg-black border-b border-amber-900 p-2 md:p-6 flex flex-col justify-center shrink-0">
          <div className="text-[8px] md:text-sm font-black uppercase tracking-widest text-amber-700 mb-1 md:mb-2 flex items-center gap-2">
            <Activity size={10} className="md:w-4 md:h-4 animate-pulse" /> LIVE COMMENTARY
          </div>
          <div className="h-full flex items-center overflow-hidden">
            {commentary ? (
                <CommentaryLine text={commentary.text} type={commentary.type} />
            ) : (
                <span className="opacity-30 italic text-xs md:text-2xl">...waiting for signal...</span>
            )}
          </div>
      </div>

      {/* Timeline & Controls */}
      <div className="flex-1 flex flex-col p-2 md:p-6 bg-amber-950/5 relative min-h-0">
          
          {/* Scrubber */}
          <div className="flex items-center gap-2 md:gap-6 mb-2 md:mb-4">
             <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-white hover:bg-amber-500/20 p-1 md:p-2 rounded-full transition-all">
                 {isPlaying ? <Pause size={16} className="md:w-8 md:h-8" /> : <Play size={16} className="md:w-8 md:h-8" />}
             </button>
             <input 
                type="range" 
                min={0} 
                max={trajectory.steps.length - 1} 
                value={stepIndex}
                onChange={(e) => { setIsPlaying(false); setStepIndex(parseInt(e.target.value)); }}
                className="flex-1 accent-amber-500 h-2 md:h-4 bg-amber-900 rounded-none appearance-none cursor-pointer"
            />
          </div>

          {/* NEW END OF EPISODE PANEL - RESPONSIVE MODAL FIX */}
          {isFinished && showEndModal && (
              <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto backdrop-blur-sm animate-in fade-in flex items-center justify-center p-2 md:p-4">
                  <div className="w-full max-w-3xl my-auto border-2 md:border-[6px] border-amber-500 bg-black p-1 shadow-[0_0_50px_rgba(255,176,0,0.15)] flex flex-col shrink-0">
                      
                      {/* ASCII Header with Close Button */}
                      <div className="bg-amber-500 text-black p-2 md:p-6 mb-2 md:mb-8 border-b md:border-b-4 border-black shrink-0 flex justify-between items-center">
                           <h2 className="text-sm md:text-4xl font-black uppercase tracking-tighter">
                               EPISODE COMPLETE: {trajectory.won ? "AGENT WIN" : "AGENT DEFEAT"}
                           </h2>
                           <button onClick={() => setShowEndModal(false)} className="hover:bg-black hover:text-amber-500 p-1 rounded transition-colors">
                               <X size={20} className="md:w-8 md:h-8"/>
                           </button>
                      </div>
                      
                      <div className="px-2 md:px-8 pb-4 md:pb-8 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-8">
                           
                           {/* Watch Again */}
                           <div className="md:col-span-2">
                               <button 
                                 onClick={() => { setStepIndex(0); setIsPlaying(true); }} 
                                 className="w-full border md:border-4 border-amber-500 hover:bg-amber-500 hover:text-black py-2 md:py-4 px-2 md:px-6 font-bold uppercase flex items-center justify-center gap-2 md:gap-4 transition-all group text-[10px] md:text-xl"
                               >
                                  <RefreshCw size={14} className="md:w-7 md:h-7 group-hover:rotate-180 transition-transform"/> Watch Replay
                               </button>
                               <div className="text-center mt-1 md:mt-2 text-[8px] md:text-sm text-amber-500/60">Replays this fight from the start.</div>
                           </div>

                           {/* Choose Opponent Dropdown */}
                           {onChangeOpponent && (
                               <div>
                                   <MenuDropdown 
                                        label="Choose Opponent"
                                        icon={<Swords size={14} className="md:w-6 md:h-6"/>}
                                        onSelect={(id) => onChangeOpponent(id as OpponentType)}
                                        options={[
                                            { id: OpponentType.AGGRESSIVE, label: "Aggressive Bot", desc: "Rushes in and attacks often." },
                                            { id: OpponentType.DEFENSIVE, label: "Defensive Bot", desc: "Blocks more and waits." },
                                            { id: OpponentType.RANDOM, label: "Random Bot", desc: "Picks moves at random." },
                                            { id: OpponentType.MIRROR, label: "Mirror Match", desc: "Uses the same model as you." }
                                        ]}
                                   />
                                   <div className="text-center mt-1 md:mt-2 text-[8px] md:text-sm text-amber-500/60 font-bold border-t border-amber-900/50 pt-1">
                                       Opponent: {currentOpponentType.toUpperCase()}
                                   </div>
                               </div>
                           )}

                           {/* Choose Brain Dropdown */}
                           <div>
                               <MenuDropdown 
                                    label="Choose Brain"
                                    icon={<Brain size={14} className="md:w-6 md:h-6"/>}
                                    onSelect={(id) => console.log("Switch brain to", id)}
                                    options={[
                                        { id: 'latest', label: "Latest Model", desc: "This run's current state." },
                                        { id: 'best', label: "Best Model", desc: "Highest win rate (82%)." },
                                        { id: 'saved1', label: "SF-Run-041 Best", desc: "Saved from previous run." }
                                    ]}
                               />
                               <div className="text-center mt-1 md:mt-2 text-[8px] md:text-sm text-amber-500/60 border-t border-amber-900/50 pt-1">
                                    Agent Brain: LATEST
                               </div>
                           </div>

                           {/* AI Analysis */}
                           {onShowAnalysis && (
                               <div className="md:col-span-2 pt-2 md:pt-6 border-t md:border-t-2 border-amber-900 mt-1 md:mt-2">
                                   <div className="flex justify-between items-center bg-amber-900/20 p-1 md:p-2 border border-amber-900/50 mb-1 md:mb-2">
                                       <span className="font-bold text-amber-500 text-[8px] md:text-base">ANALYSIS:</span>
                                   </div>
                                   <button 
                                     onClick={onShowAnalysis}
                                     className="w-full border md:border-4 border-dashed border-amber-500/50 hover:border-amber-500 hover:bg-amber-900/20 py-2 md:py-4 px-2 md:px-4 font-bold uppercase flex items-center justify-center gap-2 md:gap-3 text-amber-500 transition-all text-[10px] md:text-lg"
                                   >
                                      <BarChart size={14} className="md:w-6 md:h-6"/> AI Analysis Report
                                   </button>
                                   <div className="text-center mt-1 md:mt-2 text-[8px] md:text-sm text-amber-500/60">Get a short explanation of how your agent trained and what it learned.</div>
                               </div>
                           )}

                      </div>
                  </div>
              </div>
          )}
      </div>

    </div>
  );
};