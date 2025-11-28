import React, { useState, useEffect } from 'react';
import { generateMockRuns, generateMetrics, generateModels, simulateEpisode } from './services/rlService';
import { analyzeRunPerformance } from './services/geminiService';
import { Run, RunStatus, MetricPoint, ModelArtifact, EpisodeTrajectory, OpponentType, Difficulty, TrainingDuration, BeginnerConfig, Algorithm, TrainingPreset } from './types';
import { ArenaViewer } from './components/ArenaViewer';
import { MetricsChart } from './components/Charts';
import { RetroDashboard } from './components/RetroDashboard';
import { 
  Terminal, Play, Square, Plus, RotateCw, X, Cpu, Monitor, Activity, 
  FileText, Zap, Brain, Layers, Settings, Filter, Clock, RefreshCw, 
  User, Shield, Swords, BarChart2, CheckCircle, AlertTriangle, ArrowRight, Trash2, BookOpen, Command, HelpCircle, ChevronDown
} from 'lucide-react';

// --- Helper Functions ---
const formatDuration = (start?: string, end?: string) => {
    if (!start) return "00:00:00";
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : Date.now();
    const diff = Math.max(0, endTime - startTime);
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// --- Styled Components ---
const RetroContainer: React.FC<{ className?: string; children: React.ReactNode; }> = ({ className = "", children }) => (
    <div className={`retro-border bg-black/80 relative flex flex-col overflow-hidden ${className}`}>
        {children}
        <div className="absolute top-0 left-0 w-4 h-4 bg-amber-500"></div>
        <div className="absolute top-0 right-0 w-4 h-4 bg-amber-500"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 bg-amber-500"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 bg-amber-500"></div>
    </div>
);

const RetroButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'danger' | 'ghost' | 'success' }> = ({ children, variant = 'primary', className, ...props }) => {
    const baseClass = "uppercase font-black tracking-wider px-8 py-4 text-xl transition-all active:translate-y-1 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
        primary: "bg-amber-500 text-black hover:bg-amber-400 border-4 border-amber-500",
        success: "bg-amber-500 text-black hover:bg-white hover:border-white border-4 border-amber-500 animate-pulse-fast",
        danger: "bg-red-900/20 border-4 border-red-500 text-red-500 hover:bg-red-500 hover:text-black",
        ghost: "border-4 border-amber-500/50 text-amber-500 hover:border-amber-500 hover:bg-amber-500/10"
    };
    return <button className={`${baseClass} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};

// --- Wizard Component ---
interface WizardProps {
    onComplete: (config: BeginnerConfig & { name: string }) => void;
    onCancel: () => void;
}

const Wizard: React.FC<WizardProps> = ({ onComplete, onCancel }) => {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
    
    // Removed duration step from wizard as requested

    const steps = [
        { id: 1, title: "Identity", desc: "Name your AI Fighter" },
        { id: 2, title: "Challenge", desc: "Choose your opponent" },
        { id: 3, title: "Confirm", desc: "Review Protocol" }
    ];

    return (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <RetroContainer className="w-full max-w-4xl p-0 shadow-[0_0_100px_rgba(255,176,0,0.15)] h-[600px]">
                {/* Header */}
                <div className="bg-amber-500 text-black p-6 flex justify-between items-center">
                    <h2 className="text-3xl font-black uppercase flex items-center gap-3"><Zap size={32}/> NEW TRAINING SESSION</h2>
                    <button onClick={onCancel}><X size={32}/></button>
                </div>

                <div className="flex flex-1">
                    {/* Steps Sidebar */}
                    <div className="w-64 border-r-4 border-amber-500/30 bg-amber-950/20 p-6 space-y-6">
                        {steps.map(s => (
                            <div key={s.id} className={`flex items-center gap-4 ${step === s.id ? 'text-amber-500 opacity-100' : 'text-amber-900 opacity-50'}`}>
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${step === s.id ? 'border-amber-500 bg-amber-500 text-black' : 'border-amber-900'}`}>
                                    {s.id}
                                </div>
                                <div className="uppercase font-bold">{s.title}</div>
                            </div>
                        ))}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 p-12 flex flex-col">
                        <div className="flex-1">
                            {step === 1 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-8">
                                    <h3 className="text-4xl font-black uppercase">First, give your fighter a name.</h3>
                                    <p className="text-xl opacity-70">This helps you identify it later in the logs.</p>
                                    <input 
                                        autoFocus
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full bg-black border-b-4 border-amber-500 py-4 text-4xl text-amber-500 focus:outline-none placeholder-amber-900 uppercase font-mono"
                                        placeholder="E.G. ROOKIE BOT 01"
                                    />
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-8">
                                    <h3 className="text-4xl font-black uppercase">Who should it practice against?</h3>
                                    <div className="grid grid-cols-3 gap-6">
                                        {[
                                            { d: Difficulty.EASY, label: "Rookie", desc: "Moves randomly. Good for learning basics." },
                                            { d: Difficulty.NORMAL, label: "Pro", desc: "Attacks you. Good for learning defense." },
                                            { d: Difficulty.HARD, label: "Elite", desc: "Punishes mistakes. Only for advanced AI." }
                                        ].map(opt => (
                                            <button 
                                                key={opt.d}
                                                onClick={() => setDifficulty(opt.d)}
                                                className={`p-6 border-4 text-left hover:scale-105 transition-all ${difficulty === opt.d ? 'border-amber-500 bg-amber-500/20' : 'border-amber-900 opacity-60'}`}
                                            >
                                                <div className="text-2xl font-black uppercase mb-2">{opt.label}</div>
                                                <div className="text-sm opacity-80">{opt.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-8">
                                    <h3 className="text-4xl font-black uppercase">Ready to Initialize?</h3>
                                    <div className="border-4 border-amber-900/50 p-6 bg-amber-950/10 space-y-4 text-xl">
                                        <div className="flex justify-between border-b border-amber-900 pb-2">
                                            <span className="opacity-50">FIGHTER ID</span>
                                            <span className="font-bold">{name || "UNNAMED"}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-amber-900 pb-2">
                                            <span className="opacity-50">DIFFICULTY</span>
                                            <span className="font-bold text-amber-300">{difficulty.toUpperCase()}</span>
                                        </div>
                                        <div className="text-sm text-amber-700 italic mt-4">
                                            * You can adjust training duration and algorithm on the main screen before starting.
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Nav */}
                        <div className="flex justify-between pt-8 border-t border-amber-900/30">
                            {step > 1 ? (
                                <button onClick={() => setStep(s => s - 1)} className="text-xl uppercase font-bold text-amber-700 hover:text-amber-500">Back</button>
                            ) : <div></div>}
                            
                            {step < 3 ? (
                                <RetroButton onClick={() => setStep(s => s + 1)} disabled={!name && step === 1}>Next Step <ArrowRight/></RetroButton>
                            ) : (
                                <RetroButton onClick={() => onComplete({ 
                                    name: name || "UNNAMED", 
                                    friendly_difficulty: difficulty === Difficulty.EASY ? "Rookie" : "Pro", 
                                    training_duration: 'SHORT', 
                                    goal_description: "Custom user training" 
                                })} variant="success">CREATE FIGHTER</RetroButton>
                            )}
                        </div>
                    </div>
                </div>
            </RetroContainer>
        </div>
    );
};

// --- Welcome Screen ---
const WelcomeScreen: React.FC<{ onStartBeginner: () => void, onStartAdvanced: () => void }> = ({ onStartBeginner, onStartAdvanced }) => (
    <div className="fixed inset-0 bg-black z-40 flex flex-col items-center justify-center text-center p-8 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-black to-black">
        <div className="max-w-5xl space-y-12 animate-in zoom-in duration-500 border-4 border-amber-500 p-12 bg-black/80 shadow-[0_0_150px_rgba(255,176,0,0.1)]">
            <h1 className="text-[6rem] leading-none font-black text-amber-500 text-shadow-amber uppercase tracking-tighter mb-4">
                RL DOJO
            </h1>
            
            <p className="text-3xl text-amber-100 font-medium leading-relaxed max-w-4xl mx-auto opacity-90">
                Reinforcement learning sounds complex, but it is easier to grasp when you see it happen. <br/><br/>
                <span className="text-amber-500">RL Dojo</span> lets you train a small agent in a simple world and watch it improve through trial and error. 
                You see how rewards guide behavior and how a policy takes shape, step by step.
            </p>

            <div className="grid grid-cols-2 gap-12 mt-16">
                {/* Beginner Path */}
                <button 
                    onClick={onStartBeginner}
                    className="group border-4 border-amber-500 p-8 hover:bg-amber-500 transition-all text-left flex flex-col gap-4 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 group-hover:bg-black"></div>
                    <div className="flex items-center gap-3 text-4xl font-black uppercase text-amber-500 group-hover:text-black">
                        <BookOpen size={40}/> Start Journey
                    </div>
                    <p className="text-xl text-amber-500/70 group-hover:text-black/80 font-bold">
                        I am new to RL. Guide me through training my first agent.
                    </p>
                </button>

                {/* Advanced Path */}
                <button 
                    onClick={onStartAdvanced}
                    className="group border-4 border-amber-900 p-8 hover:border-amber-500 hover:bg-amber-900/20 transition-all text-left flex flex-col gap-4"
                >
                    <div className="flex items-center gap-3 text-4xl font-black uppercase text-amber-700 group-hover:text-amber-500">
                        <Command size={40}/> Access Console
                    </div>
                    <p className="text-xl text-amber-900 group-hover:text-amber-500/70 font-bold">
                        I know what I'm doing. Give me raw control over hyperparameters.
                    </p>
                </button>
            </div>
        </div>
    </div>
);

// --- Compare Modal ---
const CompareModal: React.FC<{ runs: Run[], onClose: () => void }> = ({ runs, onClose }) => {
    // Only completed runs
    const completedRuns = runs.filter(r => r.status === RunStatus.COMPLETED);
    
    return (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-8 backdrop-blur-sm">
            <RetroContainer className="w-full max-w-5xl p-8 h-[80vh]">
                 <div className="flex justify-between items-center mb-8 border-b-4 border-amber-500 pb-4">
                    <h2 className="text-4xl font-black uppercase flex items-center gap-3">
                        <BarChart2 size={40} /> FIGHTER COMPARISON
                    </h2>
                    <button onClick={onClose} className="hover:text-white"><X size={40}/></button>
                </div>
                
                {completedRuns.length < 2 ? (
                     <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
                        <AlertTriangle size={64}/>
                        <div className="text-2xl">Need at least 2 completed fighters to compare.</div>
                     </div>
                ) : (
                    <div className="grid grid-cols-2 gap-8 h-full overflow-y-auto pb-20">
                         {completedRuns.map(run => (
                             <div key={run.run_id} className="border-4 border-amber-900/50 p-6 bg-amber-950/10 flex flex-col gap-4">
                                 <div className="text-3xl font-black uppercase text-amber-500">{run.name}</div>
                                 <div className="grid grid-cols-2 gap-4 text-xl">
                                     <div>
                                         <span className="block text-sm opacity-50">DIFFICULTY</span>
                                         <span className="font-bold">{run.ui_config?.friendly_difficulty || "CUSTOM"}</span>
                                     </div>
                                     <div>
                                         <span className="block text-sm opacity-50">ALGORITHM</span>
                                         <span className="font-bold">{run.config.algo}</span>
                                     </div>
                                 </div>
                                 <div className="mt-4 pt-4 border-t border-amber-900">
                                     <div className="flex justify-between items-end mb-2">
                                         <span className="font-bold">WIN RATE</span>
                                         <span className="text-4xl font-black">{Math.round((run.best_mean_reward + 10) / 20 * 100)}%</span>
                                     </div>
                                     <div className="w-full bg-amber-900 h-6">
                                         <div className="bg-amber-500 h-full" style={{ width: `${Math.round((run.best_mean_reward + 10) / 20 * 100)}%` }}></div>
                                     </div>
                                 </div>
                             </div>
                         ))}
                    </div>
                )}
            </RetroContainer>
        </div>
    );
}

// --- Main App ---
export default function App() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<MetricPoint[]>([]);
  const [activeTrajectory, setActiveTrajectory] = useState<EpisodeTrajectory | null>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [simOpponent, setSimOpponent] = useState<OpponentType>(OpponentType.RANDOM);

  // New Training Settings State for currently selected run (if queued)
  const [trainingPreset, setTrainingPreset] = useState<TrainingPreset>(TrainingPreset.STANDARD);
  const [customEpisodes, setCustomEpisodes] = useState<number>(500);
  const [selectedAlgo, setSelectedAlgo] = useState<Algorithm>(Algorithm.DQN);
  const [showAlgoInfo, setShowAlgoInfo] = useState(false);
  
  // UX State
  const [showWizard, setShowWizard] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showCompare, setShowCompare] = useState(false);
  const [showAnalysisDashboard, setShowAnalysisDashboard] = useState(false);
  const [activeView, setActiveView] = useState<'TELEMETRY' | 'VISUALS'>('TELEMETRY');
  const [elapsedTime, setElapsedTime] = useState("00:00:00");

  const selectedRun = runs.find(r => r.run_id === selectedRunId) || null;

  // Sync controls with selected run
  useEffect(() => {
    if (selectedRun && selectedRun.status === RunStatus.QUEUED) {
        setTrainingPreset(selectedRun.config.training_preset || TrainingPreset.STANDARD);
        setCustomEpisodes(selectedRun.total_episodes);
        setSelectedAlgo(selectedRun.config.algo as Algorithm || Algorithm.DQN);
    }
  }, [selectedRunId]);

  // Sim Loop & Timer Sync
  useEffect(() => {
    const interval = setInterval(() => {
        setRuns(prev => prev.map(r => {
            if (r.status === RunStatus.RUNNING) {
                const increment = Math.floor(Math.random() * 5) + 2;
                const newEp = Math.min(r.total_episodes, r.current_episode + increment);
                return { 
                    ...r, 
                    current_episode: newEp,
                    status: newEp >= r.total_episodes ? RunStatus.COMPLETED : RunStatus.RUNNING,
                    finished_at: newEp >= r.total_episodes ? new Date().toISOString() : undefined,
                    best_mean_reward: Math.min(15, (newEp / r.total_episodes) * 15) // Simulate improvement
                };
            }
            return r;
        }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Timer
  useEffect(() => {
      const timerInterval = setInterval(() => {
          if (selectedRun) {
              setElapsedTime(formatDuration(selectedRun.started_at, selectedRun.finished_at));
          } else {
              setElapsedTime("00:00:00");
          }
      }, 500);
      return () => clearInterval(timerInterval);
  }, [selectedRun?.started_at, selectedRun?.finished_at, selectedRun?.status]);

  // Metrics Update
  useEffect(() => {
      if (selectedRun) {
          if (selectedRun.status !== RunStatus.QUEUED) {
             setMetrics(generateMetrics(selectedRun.run_id, selectedRun.current_episode));
          } else {
              setMetrics([]);
          }
      }
  }, [selectedRun?.current_episode, selectedRunId, selectedRun?.status]);

  const handleSelectRun = (id: string) => {
    setSelectedRunId(id);
    setActiveTrajectory(null);
    setActiveView('TELEMETRY');
    setAnalysisResult(null);
  };

  const handleCreateRun = (config: BeginnerConfig & { name: string }) => {
      const newRun: Run = {
          run_id: `RUN_${Math.floor(Math.random()*10000)}`,
          name: config.name,
          description: config.goal_description,
          category: "User",
          created_at: new Date().toISOString(),
          status: RunStatus.QUEUED,
          best_mean_reward: 0,
          current_episode: 0,
          total_episodes: 200, // Default, updated via UI
          tags: [],
          mode: 'SIMPLE',
          ui_config: config,
          config: { 
            env_name: 'StickFight-v0', 
            max_steps: 200,
            difficulty: config.friendly_difficulty === "Rookie" ? Difficulty.EASY : config.friendly_difficulty === "Pro" ? Difficulty.NORMAL : Difficulty.HARD, 
            algo: Algorithm.DQN,
            training_preset: TrainingPreset.STANDARD,
            hyperparams: { learning_rate: 0.001, batch_size: 64, epsilon_start: 1 } 
          },
      };
      setRuns(prev => [newRun, ...prev]);
      handleSelectRun(newRun.run_id);
      setShowWizard(false);
  };

  const updateRunSettings = (preset: TrainingPreset, episodes: number, algo: Algorithm) => {
      if (!selectedRun) return;
      setRuns(prev => prev.map(r => {
          if (r.run_id === selectedRun.run_id) {
              return {
                  ...r,
                  total_episodes: episodes,
                  config: {
                      ...r.config,
                      algo: algo,
                      training_preset: preset
                  }
              }
          }
          return r;
      }));
  }

  const handleRunAction = () => {
      if (!selectedRun) return;
      let updatedRun = { ...selectedRun };
      
      if (selectedRun.status === RunStatus.QUEUED) {
          updatedRun.status = RunStatus.RUNNING;
          updatedRun.started_at = new Date().toISOString();
          // Apply current UI settings
          updatedRun.total_episodes = trainingPreset === TrainingPreset.CUSTOM ? customEpisodes : (trainingPreset === TrainingPreset.QUICK ? 50 : trainingPreset === TrainingPreset.STANDARD ? 200 : 1000);
          updatedRun.config.algo = selectedAlgo;
      } else if (selectedRun.status === RunStatus.RUNNING) {
          updatedRun.status = RunStatus.COMPLETED;
          updatedRun.finished_at = new Date().toISOString();
      } else if (selectedRun.status === RunStatus.COMPLETED || selectedRun.status === RunStatus.FAILED) {
          updatedRun.status = RunStatus.QUEUED;
          updatedRun.started_at = undefined;
          updatedRun.finished_at = undefined;
          updatedRun.current_episode = 0;
      }
      setRuns(prev => prev.map(r => r.run_id === selectedRun.run_id ? updatedRun : r));
  };

  // Onboarding Paths
  const startBeginnerJourney = () => {
      setRuns([]);
      setShowWelcome(false);
      setShowWizard(true);
  };

  const startAdvancedConsole = () => {
      const mockRuns = generateMockRuns(2);
      setRuns(mockRuns);
      setSelectedRunId(mockRuns[0].run_id);
      setShowWelcome(false);
  };

  const handleSimulate = (opponent: OpponentType = OpponentType.RANDOM) => {
    setSimOpponent(opponent);
    setSimLoading(true);
    setActiveView('VISUALS');
    setTimeout(() => {
      setActiveTrajectory(simulateEpisode(opponent));
      setSimLoading(false);
    }, 800);
  };

  const handleAnalyze = async () => {
      if (!selectedRun) return;
      setAnalysisLoading(true);
      setShowAnalysisDashboard(true);
      if (!analysisResult) {
        const result = await analyzeRunPerformance(metrics, selectedRun.config);
        setAnalysisResult(result);
      }
      setAnalysisLoading(false);
  };

  const handleDeleteAll = () => {
      if (confirm("Reset everything? This will delete all your fighters.")) {
          setRuns([]);
          setSelectedRunId(null);
      }
  };

  if (showWelcome) return (
    <WelcomeScreen 
        onStartBeginner={startBeginnerJourney} 
        onStartAdvanced={startAdvancedConsole} 
    />
  );

  return (
    <div className="h-screen flex flex-col bg-black text-amber-500 overflow-hidden font-mono selection:bg-amber-500 selection:text-black">
      {showWizard && <Wizard onComplete={handleCreateRun} onCancel={() => setShowWizard(false)} />}
      {showCompare && <CompareModal runs={runs} onClose={() => setShowCompare(false)} />}
      
      {/* AI Analysis Modal */}
      {showAnalysisDashboard && selectedRun && (
          <div className="fixed inset-0 z-50 p-8 bg-black/90 backdrop-blur flex items-center justify-center">
              <div className="w-full max-w-6xl h-[90vh]">
                  {analysisLoading ? (
                      <div className="text-center animate-pulse text-amber-500 text-2xl font-bold uppercase">
                          Contacting AI Oracle...
                      </div>
                  ) : (
                    <RetroDashboard 
                        run={selectedRun} 
                        analysis={analysisResult || "No analysis available."} 
                        metrics={metrics} 
                        evaluations={generateModels(selectedRun.run_id)[0].evaluations}
                        onClose={() => setShowAnalysisDashboard(false)}
                    />
                  )}
              </div>
          </div>
      )}

      {/* --- TOP BAR --- */}
      <header className="h-20 shrink-0 border-b-4 border-amber-500 bg-amber-950/20 px-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-6">
            <Terminal size={32} className="text-amber-500" />
            <div className="flex flex-col">
                <h1 className="text-4xl font-black uppercase tracking-[0.2em] leading-none text-shadow-amber">RL DOJO</h1>
            </div>
        </div>
        <div className="flex items-center gap-6">
             <button onClick={handleDeleteAll} className="flex items-center gap-2 text-red-500 hover:text-red-400 uppercase font-bold text-sm">
                <Trash2 size={20}/> Reset System
             </button>
        </div>
      </header>

      {/* --- MAIN WORKSPACE --- */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT RAIL: FIGHTER LOGS */}
        <div className="w-80 shrink-0 border-r-4 border-amber-500/50 flex flex-col bg-black/50 backdrop-blur-sm">
            <div className="p-4 border-b-4 border-amber-500/30">
                <h2 className="text-2xl font-black uppercase tracking-widest flex items-center gap-2 mb-4">
                   <User size={24}/> Fighter Logs
                </h2>
                <RetroButton variant="ghost" className="w-full py-2 text-lg" onClick={() => setShowWizard(true)}>
                    <Plus size={20} /> New Fighter
                </RetroButton>
                {runs.length > 1 && (
                    <button onClick={() => setShowCompare(true)} className="w-full mt-2 text-sm uppercase font-bold text-amber-700 hover:text-amber-500 flex items-center justify-center gap-2 py-2 border border-amber-900 hover:border-amber-500">
                        <BarChart2 size={16}/> Compare
                    </button>
                )}
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                {runs.length === 0 && (
                    <div className="text-center p-4 opacity-50 italic text-lg">
                        No fighters yet.<br/>Start training!
                    </div>
                )}
                {runs.map(run => {
                    const isActive = selectedRunId === run.run_id;
                    const isRunning = run.status === RunStatus.RUNNING;
                    return (
                        <button 
                            key={run.run_id}
                            onClick={() => handleSelectRun(run.run_id)}
                            className={`w-full text-left p-4 border-2 transition-all uppercase group relative overflow-hidden flex flex-col gap-1 ${
                                isActive ? 'bg-amber-500 text-black border-amber-500' : 'border-amber-900/50 hover:border-amber-500/50'
                            }`}
                        >
                            <div className="font-black text-xl truncate pr-2 tracking-wide">{run.name}</div>
                            <div className="flex justify-between items-center text-sm opacity-80 w-full font-bold">
                                <span>{run.status === RunStatus.RUNNING ? 'TRAINING...' : run.status}</span>
                                {run.status === RunStatus.COMPLETED && <CheckCircle size={20}/>}
                            </div>
                            {isRunning && !isActive && <div className="absolute bottom-0 left-0 h-1 bg-amber-500 animate-[width_2s_ease-in-out_infinite] w-full"></div>}
                        </button>
                    )
                })}
            </div>
        </div>

        {/* CENTER STAGE */}
        <div className="flex-1 flex flex-col relative bg-amber-950/5 min-w-0">
            {selectedRun ? (
                <>
                    {/* Header: Run Info + Training Config */}
                    <div className="h-auto shrink-0 border-b-4 border-amber-500/30 bg-black/40 flex flex-col">
                        {/* Top Line: Name and Status */}
                        <div className="h-16 px-6 flex items-center justify-between border-b border-amber-900/30">
                            <div className="flex flex-col">
                                <span className="text-sm uppercase opacity-50 font-bold">Current Fighter</span>
                                <h2 className="text-3xl font-black uppercase text-white tracking-wide">{selectedRun.name}</h2>
                            </div>
                            <div className="flex gap-4 items-center">
                                <div className={`px-4 py-1 border-2 text-xl font-bold uppercase ${selectedRun.status === RunStatus.RUNNING ? 'border-amber-500 text-amber-500 animate-pulse' : selectedRun.status === RunStatus.COMPLETED ? 'border-green-500 text-green-500' : 'border-amber-900 text-amber-700'}`}>
                                    {selectedRun.status === RunStatus.QUEUED ? "READY" : selectedRun.status === RunStatus.RUNNING ? "TRAINING" : "COMPLETE"}
                                </div>
                            </div>
                        </div>

                        {/* Training Controls Bar (Only editable when Queued) - INCREASED HEIGHT */}
                        <div className="px-6 py-16 bg-amber-950/30 flex flex-wrap items-center gap-12 text-lg">
                            
                            {/* Algorithm Selector */}
                            <div className="flex flex-col gap-2 relative group">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-amber-600 uppercase">Algorithm:</span>
                                  <div className="flex items-center bg-black border border-amber-900">
                                      <select 
                                          disabled={selectedRun.status !== RunStatus.QUEUED}
                                          value={selectedAlgo}
                                          onChange={(e) => setSelectedAlgo(e.target.value as Algorithm)}
                                          className="bg-transparent text-amber-500 font-bold p-2 uppercase focus:outline-none disabled:opacity-50 text-xl"
                                      >
                                          <option value={Algorithm.DQN}>DQN (Fast)</option>
                                          <option value={Algorithm.PPO}>PPO (Stable)</option>
                                      </select>
                                  </div>
                                  <div className="text-amber-600 cursor-help">
                                      <HelpCircle size={24}/>
                                  </div>
                                </div>
                                {/* Expanded Tooltip */}
                                <div className="absolute top-full left-0 mt-4 w-[400px] bg-black border-4 border-amber-500 p-6 z-50 hidden group-hover:block shadow-[0_0_30px_rgba(245,158,11,0.3)] animate-in fade-in slide-in-from-top-2">
                                    <div className="mb-6">
                                        <div className="font-bold text-2xl mb-2 text-amber-400 border-b border-amber-800 pb-1">DQN (Deep Q-Network)</div>
                                        <div className="text-base opacity-90 leading-relaxed text-amber-100">Learns by estimating value of actions. Good for simple tasks.</div>
                                    </div>
                                    <div>
                                        <div className="font-bold text-2xl mb-2 text-amber-400 border-b border-amber-800 pb-1">PPO (Proximal Policy Opt)</div>
                                        <div className="text-base opacity-90 leading-relaxed text-amber-100">Updates policy gradually. More stable for complex tasks.</div>
                                    </div>
                                </div>
                            </div>

                            {/* Duration Presets */}
                            <div className="flex items-center gap-2" title="Select pre-configured training length">
                                <span className="font-bold text-amber-600 uppercase">Training Time:</span>
                                <div className="flex items-center bg-black border border-amber-900">
                                    <select 
                                        disabled={selectedRun.status !== RunStatus.QUEUED}
                                        value={trainingPreset}
                                        onChange={(e) => {
                                            const val = e.target.value as TrainingPreset;
                                            setTrainingPreset(val);
                                            if (val === TrainingPreset.QUICK) setCustomEpisodes(50);
                                            if (val === TrainingPreset.STANDARD) setCustomEpisodes(200);
                                            if (val === TrainingPreset.DEEP) setCustomEpisodes(1000);
                                        }}
                                        className="bg-transparent text-amber-500 font-bold p-2 uppercase focus:outline-none disabled:opacity-50 text-xl"
                                    >
                                        <option value={TrainingPreset.QUICK}>Quick Demo (50 eps)</option>
                                        <option value={TrainingPreset.STANDARD}>Standard (200 eps)</option>
                                        <option value={TrainingPreset.DEEP}>Deep Training (1000 eps)</option>
                                        <option value={TrainingPreset.CUSTOM}>Custom</option>
                                    </select>
                                </div>
                            </div>

                            {/* Episodes Count */}
                            <div className="flex items-center gap-2" title="Total number of episodes to train">
                                <span className="font-bold text-amber-600 uppercase">Episodes:</span>
                                <input 
                                    type="number"
                                    disabled={selectedRun.status !== RunStatus.QUEUED || trainingPreset !== TrainingPreset.CUSTOM}
                                    value={trainingPreset !== TrainingPreset.CUSTOM ? (trainingPreset === TrainingPreset.QUICK ? 50 : trainingPreset === TrainingPreset.STANDARD ? 200 : 1000) : customEpisodes}
                                    onChange={(e) => setCustomEpisodes(parseInt(e.target.value))}
                                    className="bg-black border border-amber-900 w-28 text-center font-bold text-amber-500 p-2 focus:outline-none focus:border-amber-500 disabled:opacity-50 text-xl"
                                />
                            </div>

                            {/* Seed with Tooltip */}
                            <div className="flex items-center gap-2 relative group">
                                <span className="font-bold text-amber-600 uppercase">Seed:</span>
                                <span className="font-mono text-amber-500 text-xl border-b border-dotted border-amber-900 cursor-help">{selectedRun.config.seed || 123}</span>
                                
                                {/* Seed Tooltip */}
                                <div className="absolute top-full left-0 mt-4 w-[300px] bg-black border-4 border-amber-500 p-4 z-50 hidden group-hover:block shadow-[0_0_30px_rgba(245,158,11,0.3)] animate-in fade-in slide-in-from-top-2">
                                    <div className="font-bold text-xl mb-2 text-amber-400">Random Seed</div>
                                    <div className="text-base opacity-90 leading-relaxed text-amber-100">
                                        A number that initializes the random number generator. Using the same seed ensures the same sequence of random events (like enemy moves), making experiments reproducible.
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 p-6 overflow-hidden relative flex gap-6">
                        
                        {/* LEFT: STATUS STORY & CONTROLS */}
                        <div className="w-1/3 flex flex-col gap-4">
                             {/* Narrative Box */}
                             <RetroContainer className="flex-1 p-6 bg-amber-950/10 border-amber-500">
                                 <h3 className="text-xl font-black uppercase mb-4 border-b-2 border-amber-500 pb-2 flex items-center gap-2"><Activity/> Status Log</h3>
                                 <div className="text-lg space-y-4 font-mono leading-relaxed overflow-y-auto pr-2 custom-scrollbar">
                                     {selectedRun.status === RunStatus.QUEUED && (
                                         <p className="text-amber-200">
                                             This fighter is initialized and waiting for data. It doesn't know how to fight yet. <br/>
                                             Review the settings above, then click <span className="font-bold text-amber-500">INITIALIZE TRAINING</span> below to start.
                                         </p>
                                     )}
                                     {selectedRun.status === RunStatus.RUNNING && (
                                         <div>
                                             <p className="text-amber-200 mb-4 animate-pulse">
                                                 Training in progress... The {selectedRun.config.algo} agent is playing {selectedRun.total_episodes} practice matches against the {selectedRun.ui_config?.friendly_difficulty || "Standard"} bot.
                                             </p>
                                             <div className="w-full bg-amber-900/50 h-8 border-2 border-amber-500 mb-2">
                                                 <div 
                                                    className="h-full bg-amber-500 transition-all duration-1000" 
                                                    style={{ width: `${(selectedRun.current_episode / selectedRun.total_episodes) * 100}%`}}
                                                 ></div>
                                             </div>
                                             <div className="text-right font-bold text-amber-500">
                                                 {(selectedRun.current_episode / selectedRun.total_episodes * 100).toFixed(0)}% COMPLETE
                                             </div>
                                         </div>
                                     )}
                                     {selectedRun.status === RunStatus.COMPLETED && (
                                         <div className="space-y-4">
                                             <p className="text-green-400 text-3xl font-bold mb-2">Training Finished!</p>
                                             <p className="text-amber-200 text-xl">
                                                 Your fighter has completed its training. Check the chart on the right to see if it improved.
                                             </p>

                                             {/* Summary Metrics */}
                                             <div className="bg-amber-900/20 border-2 border-amber-900 p-3 grid grid-cols-2 gap-4 text-lg">
                                                 <div>
                                                     <span className="block text-sm opacity-50 uppercase">Time Elapsed</span>
                                                     <span className="font-bold">{elapsedTime}</span>
                                                 </div>
                                                 <div>
                                                     <span className="block text-sm opacity-50 uppercase">Episodes</span>
                                                     <span className="font-bold">{selectedRun.total_episodes}</span>
                                                 </div>
                                                 <div>
                                                     <span className="block text-sm opacity-50 uppercase">Best Reward</span>
                                                     <span className="font-bold text-amber-400">{selectedRun.best_mean_reward.toFixed(1)}</span>
                                                 </div>
                                                 <div>
                                                     <span className="block text-sm opacity-50 uppercase">Win Rate</span>
                                                     <span className="font-bold text-amber-400">{Math.round((selectedRun.best_mean_reward + 10) / 20 * 100)}%</span>
                                                 </div>
                                             </div>
                                             
                                             <div className="pt-2">
                                                 <p className="text-sm text-amber-300 italic mb-2 text-center">
                                                     Want a deeper insight? Click below for an AI-generated breakdown.
                                                 </p>
                                                 <button 
                                                    onClick={handleAnalyze}
                                                    className="w-full border-4 border-amber-500 bg-amber-950/30 text-amber-500 hover:bg-amber-500 hover:text-black py-4 font-bold uppercase flex items-center justify-center gap-3 transition-all text-xl"
                                                 >
                                                    <BarChart2 size={24}/> VIEW AI ANALYSIS REPORT
                                                 </button>
                                             </div>

                                             <p className="text-amber-200 pt-2 text-center">
                                                 Ready to see it in action? <br/>Click <span className="font-bold text-amber-500">WATCH DEMO FIGHT</span> below.
                                             </p>
                                         </div>
                                     )}
                                 </div>
                             </RetroContainer>

                             {/* Action Box */}
                             <div className="h-24 shrink-0">
                                {selectedRun.status === RunStatus.QUEUED && (
                                     <RetroButton onClick={handleRunAction} variant="success" className="w-full h-full text-2xl">
                                        START TRAINING <Zap size={24}/>
                                     </RetroButton>
                                )}
                                {selectedRun.status === RunStatus.RUNNING && (
                                     <RetroButton onClick={handleRunAction} variant="danger" className="w-full h-full text-2xl">
                                        STOP TRAINING <Square size={24}/>
                                     </RetroButton>
                                )}
                                {selectedRun.status === RunStatus.COMPLETED && (
                                     <RetroButton onClick={() => handleSimulate(OpponentType.RANDOM)} variant="primary" className="w-full h-full text-2xl animate-pulse-fast">
                                        WATCH DEMO FIGHT <Play size={24}/>
                                     </RetroButton>
                                )}
                             </div>
                        </div>

                        {/* RIGHT: METRICS OR VIEWER */}
                        <div className="flex-1 flex flex-col min-w-0">
                            {activeView === 'VISUALS' ? (
                                <RetroContainer className="h-full border-4 border-amber-500 bg-black min-h-0 flex-1">
                                    <div className="absolute top-0 right-0 z-50">
                                        <button onClick={() => setActiveView('TELEMETRY')} className="bg-black border-l-2 border-b-2 border-amber-500 p-2 hover:bg-amber-500 hover:text-black">
                                            <X/>
                                        </button>
                                    </div>
                                    <ArenaViewer 
                                        trajectory={activeTrajectory} 
                                        loading={simLoading} 
                                        currentOpponentType={simOpponent}
                                        onRestart={() => handleSimulate(simOpponent)}
                                        onChangeOpponent={(type) => handleSimulate(type)}
                                        onShowAnalysis={handleAnalyze}
                                    />
                                </RetroContainer>
                            ) : (
                                <RetroContainer className="h-full p-6 bg-black min-h-0 flex-1 flex flex-col">
                                    {selectedRun.status === RunStatus.QUEUED ? (
                                        <div className="h-full flex flex-col items-center justify-center opacity-30 text-center gap-4">
                                            <BarChart2 size={80}/>
                                            <div className="text-2xl uppercase font-bold">No Data Yet</div>
                                            <p className="text-xl">Charts will appear here once training starts.</p>
                                        </div>
                                    ) : (
                                        <div className="flex-1 min-h-0 flex flex-col relative">
                                            <MetricsChart data={metrics} />
                                        </div>
                                    )}
                                </RetroContainer>
                            )}
                        </div>

                    </div>
                </>
            ) : (
                 <div className="h-full flex flex-col items-center justify-center opacity-20">
                    <Terminal size={120} />
                    <div className="text-5xl mt-8 font-black uppercase">Create a Fighter</div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}