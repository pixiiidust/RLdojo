import React from 'react';
import { Run, MetricPoint, OpponentType } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Bot, Activity, Zap, X, Terminal, Cpu, Database, Radio, Clock, Target, Award } from 'lucide-react';

interface RetroDashboardProps {
  run: Run;
  analysis: string;
  metrics: MetricPoint[];
  evaluations: Record<OpponentType, number> | undefined;
  onClose: () => void;
}

export const RetroDashboard: React.FC<RetroDashboardProps> = ({ run, analysis, metrics, evaluations, onClose }) => {
  // Derive data for the dashboard
  const latestMetric = metrics[metrics.length - 1] || { epsilon: 1.0, win_rate: 0, steps: 0, reward: 0 };
  const noiseReduction = ((1 - latestMetric.epsilon) * 100).toFixed(1);
  const masteryLevel = Math.round(latestMetric.win_rate * 100);
  const totalSteps = metrics.reduce((acc, curr) => acc + curr.steps, 0);
  
  // Format Radar Data
  const radarData = evaluations ? [
    { subject: 'RANDOM', A: Math.round(evaluations[OpponentType.RANDOM] * 100), fullMark: 100 },
    { subject: 'AGGRESSIVE', A: Math.round(evaluations[OpponentType.AGGRESSIVE] * 100), fullMark: 100 },
    { subject: 'DEFENSIVE', A: Math.round(evaluations[OpponentType.DEFENSIVE] * 100), fullMark: 100 },
    { subject: 'EFFICIENCY', A: Math.min(100, Math.round((200 - latestMetric.steps) / 2)), fullMark: 100 },
    { subject: 'REWARD', A: Math.min(100, Math.max(0, (latestMetric.reward + 10) * 5)), fullMark: 100 },
  ] : [];

  // Generate "Anomaly" Grid (Mocking buffer state)
  const gridCells = Array.from({ length: 112 }).map((_, i) => {
    // Create a pattern based on run ID hash or metrics
    const val = Math.sin(i + metrics.length);
    return val > 0.5 ? 1 : val > 0 ? 0.5 : 0;
  });

  return (
    <div className="bg-black border-2 border-amber-500 rounded-sm p-3 md:p-4 font-mono text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)] animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden h-full flex flex-col">
      
      {/* CRT Scanline Effect Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20"></div>
      
      {/* Close Button - Top Right */}
      <button 
          onClick={onClose}
          className="absolute top-2 right-2 z-50 text-amber-500 hover:text-white border-2 border-amber-500 bg-black hover:bg-amber-500 p-1 shadow-lg transition-colors"
          title="Close Report"
      >
          <X size={24} className="md:w-7 md:h-7" />
      </button>

      {/* Main Container */}
      <div className="relative z-20 flex flex-col gap-3 md:gap-6 h-full min-h-0">
        
        {/* Header Block */}
        <div className="border-b-2 md:border-b-4 border-amber-500 pb-2 md:pb-4 flex justify-between items-end shrink-0 pr-8 md:pr-16">
          <div>
             <h1 className="text-xl md:text-4xl font-black tracking-tighter uppercase mb-1 md:mb-2 drop-shadow-[2px_2px_0px_rgba(245,158,11,0.3)]">
                RL DOJO: NEURAL NEXUS
             </h1>
             <div className="flex flex-col md:flex-row gap-1 md:gap-6 text-xs md:text-xl font-bold opacity-80">
                <span>// SYS.ROOT.ADMIN</span>
                <span>// TERMINAL_ID: {run.run_id.substring(4).toUpperCase()}</span>
             </div>
          </div>
          <div className="text-right hidden sm:block">
             <div className="text-xs md:text-lg uppercase opacity-70">Mastery Level</div>
             <div className="text-3xl md:text-6xl font-black leading-none text-amber-500 text-shadow-amber">+{masteryLevel}%</div>
             <div className="text-[10px] md:text-sm uppercase tracking-widest mt-1">TRAINER: {run.config.algo} AI</div>
          </div>
        </div>

        {/* Top Modules Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 shrink-0 text-xs md:text-base">
            {/* System Info */}
            <div className="border border-amber-500/50 p-2 md:p-3 flex flex-col justify-between bg-amber-950/10">
                <div className="text-sm md:text-lg font-bold uppercase flex items-center gap-2">
                    <Terminal size={16} className="md:w-5 md:h-5" /> ORION.OS // NEURAL OPTIMIZER
                </div>
                <div className="space-y-1 opacity-90 mt-2">
                    <div className="flex justify-between">
                        <span>REPORT ID:</span>
                        <span>DOJO-OMEGA-{run.run_id.substring(4, 8).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>STATUS:</span>
                        <span className={run.status === 'RUNNING' ? 'animate-pulse' : ''}>{run.status}</span>
                    </div>
                </div>
            </div>
            
            {/* Stats Info */}
            <div className="border border-amber-500/50 p-2 md:p-3 flex flex-col justify-between bg-amber-950/10">
                <div className="text-sm md:text-lg font-bold uppercase flex items-center gap-2">
                    <Cpu size={16} className="md:w-5 md:h-5" /> PROGRAM: KAIZEN // LEARNING ARRAY
                </div>
                <div className="space-y-1 opacity-90 mt-2">
                    <div className="flex justify-between">
                        <span>DATASETS CRUNCHED:</span>
                        <span>{totalSteps.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>NOISE REDUCTION:</span>
                        <span>{noiseReduction}%</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Main Content Grid - Flex 1 to take remaining space, min-h-0 to allow scrolling inside */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6 overflow-y-auto lg:overflow-visible custom-scrollbar">
            
            {/* Insight Column (Wide) */}
            <div className="lg:col-span-2 border-2 md:border-4 border-amber-500 p-3 md:p-6 flex flex-col gap-2 md:gap-4 relative bg-black/50 min-h-[300px] lg:min-h-0">
                <div className="absolute top-0 left-0 text-xs md:text-sm font-bold bg-amber-500 text-black px-2 md:px-3 py-1">INSIGHT SUMMARY</div>
                
                {/* Scrollable Text Area */}
                <div className="mt-6 font-mono text-base md:text-lg leading-relaxed whitespace-pre-wrap opacity-90 flex-1 overflow-y-auto custom-scrollbar pr-4">
                    {analysis}
                </div>

                <div className="shrink-0 border-t border-amber-500/30 pt-2 flex items-center gap-2 text-[10px] md:text-sm text-amber-500/70 animate-pulse mt-auto">
                    <span className="text-base md:text-xl">»»»</span> SENSEI VALIDATION REQUIRED FOR SYSTEM PURGE
                </div>
            </div>

            {/* Radar Column */}
            <div className="border-2 border-amber-500 p-3 md:p-4 flex flex-col relative bg-amber-950/5 min-h-[300px] lg:min-h-0">
                <div className="text-xs md:text-sm font-bold flex items-center gap-1 border-b border-amber-500/30 pb-1 mb-2">
                    <Radio size={14} className="md:w-4 md:h-4 animate-spin-slow" /> RADAR: NEURAL ACTIVITY
                </div>
                
                <div className="flex-1 min-h-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                            <PolarGrid stroke="#f59e0b" strokeOpacity={0.3} />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#f59e0b', fontSize: 10, fontWeight: 'bold' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="Agent"
                                dataKey="A"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                fill="#f59e0b"
                                fillOpacity={0.4}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#000', border: '1px solid #f59e0b', color: '#f59e0b', fontFamily: 'monospace', fontSize: '12px' }}
                                itemStyle={{ color: '#f59e0b' }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
                
                {/* Summary Metrics in Radar Panel */}
                <div className="mt-2 md:mt-4 border-t border-amber-500/30 pt-2 grid grid-cols-2 gap-2 md:gap-4 text-xs md:text-base opacity-80 shrink-0">
                     <div className="flex flex-col">
                         <span className="text-[10px] uppercase opacity-50 flex items-center gap-1"><Clock size={10}/> Elapsed</span>
                         <span className="font-bold">--:--:--</span>
                     </div>
                     <div className="flex flex-col">
                         <span className="text-[10px] uppercase opacity-50 flex items-center gap-1"><Target size={10}/> Total Reward</span>
                         <span className="font-bold text-amber-300">{latestMetric.reward}</span>
                     </div>
                     <div className="col-span-2 flex flex-col bg-amber-900/10 p-2 border border-amber-900/30">
                         <span className="text-[10px] uppercase opacity-50 flex items-center gap-1"><Award size={10}/> Performance</span>
                         <span className="font-bold text-sm md:text-lg">
                             {masteryLevel > 80 ? "ELITE" : masteryLevel > 50 ? "COMPETENT" : "NOVICE"}
                         </span>
                     </div>
                </div>
            </div>
        </div>

        {/* Bottom Modules - Fixed height on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 shrink-0 lg:h-48">
            
            {/* Anomaly Report (Grid) */}
            <div className="border border-amber-500/50 p-2 flex flex-col gap-2 bg-amber-950/5 h-32 md:h-auto">
                <div className="text-[10px] md:text-xs font-bold uppercase flex justify-between">
                    <span><Activity size={12} className="inline mr-1"/> ANOMALY REPORT</span>
                    <span className="text-amber-500/50">NEGATIVE</span>
                </div>
                {/* Grid with explicit columns since 16 is custom */}
                <div className="flex-1 grid gap-[1px] content-start overflow-hidden" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
                    {gridCells.map((val, i) => (
                        <div 
                            key={i} 
                            className={`aspect-square ${val === 1 ? 'bg-amber-500' : val === 0.5 ? 'bg-amber-500/30' : 'bg-amber-900/10'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Event Log */}
            <div className="md:col-span-2 border border-amber-500/50 p-2 flex flex-col gap-2 bg-amber-950/5 h-48 md:h-auto">
                <div className="text-[10px] md:text-xs font-bold uppercase border-b border-amber-500/30 pb-1 flex justify-between">
                    <span><Database size={12} className="inline mr-1"/> EVENT LOG TIMELINE</span>
                    <div className="flex gap-1">
                         <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-amber-500 rounded-full animate-ping"></div>
                    </div>
                </div>
                <div className="flex gap-2 md:gap-4 items-center h-full min-h-0">
                    {/* Face Icon Mock */}
                    <div className="shrink-0 w-12 h-12 md:w-20 md:h-20 border border-amber-500/50 flex items-center justify-center bg-amber-500/10">
                        <Bot size={24} className="md:w-8 md:h-8" />
                    </div>
                    {/* Log Lines */}
                    <div className="flex-1 space-y-1 md:space-y-2 font-mono text-[10px] md:text-sm opacity-80 overflow-y-auto custom-scrollbar h-full">
                        <div className="flex gap-2 md:gap-4">
                            <span className="opacity-50">0:50 AM</span>
                            <span>INITIALIZING NEURAL PATHWAYS...</span>
                        </div>
                        <div className="flex gap-2 md:gap-4">
                            <span className="opacity-50">1:58 PM</span>
                            <span>EPSILON DECAY TRIGGERED: 0.95</span>
                        </div>
                        <div className="flex gap-2 md:gap-4">
                            <span className="opacity-50">1:38 AM</span>
                            <span>OPTIMIZATION CYCLE COMPLETE.</span>
                        </div>
                        <div className="flex gap-2 md:gap-4">
                            <span className="opacity-50">0:35 AM</span>
                            <span>ANOMALY DETECTED IN SECTOR 7G.</span>
                        </div>
                        <div className="flex gap-2 md:gap-4">
                            <span className="opacity-50">0:36 AM</span>
                            <span>MEMORY BUFFER SYNCHRONIZED.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};