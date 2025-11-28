import React from 'react';
import { Run, MetricPoint, OpponentType } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Cpu, Terminal, Radio, X, Target, Award, Clock } from 'lucide-react';

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

  return (
    <div className="bg-black border md:border-2 border-amber-500 rounded-sm p-2 md:p-4 font-mono text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)] animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden h-full flex flex-col w-full">
      
      {/* CRT Scanline Effect Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20"></div>
      
      {/* Close Button - Top Right */}
      <button 
          onClick={onClose}
          className="absolute top-1 right-1 md:top-2 md:right-2 z-50 text-amber-500 hover:text-white border border-amber-500 bg-black hover:bg-amber-500 p-1 shadow-lg transition-colors"
          title="Close Report"
      >
          <X size={16} className="md:w-7 md:h-7" />
      </button>

      {/* Main Content Wrapper - Scrollable on mobile/tablet */}
      <div className="relative z-20 flex flex-col gap-2 md:gap-6 h-full flex-1 overflow-y-auto lg:overflow-hidden pr-1">
        
        {/* Header Block */}
        <div className="border-b md:border-b-4 border-amber-500 pb-2 md:pb-4 flex flex-col lg:flex-row justify-between items-start lg:items-end shrink-0 pr-8 md:pr-16">
          <div>
             <h1 className="text-lg md:text-4xl font-black tracking-tighter uppercase mb-0.5 md:mb-2 drop-shadow-[2px_2px_0px_rgba(245,158,11,0.3)]">
                RL DOJO: NEURAL NEXUS
             </h1>
             <div className="flex flex-col lg:flex-row gap-0 lg:gap-6 text-[10px] md:text-xl font-bold opacity-80">
                <span>// SYS.ROOT.ADMIN</span>
                <span>// TERMINAL_ID: {run.run_id.substring(4).toUpperCase()}</span>
             </div>
          </div>
          <div className="text-right hidden sm:block mt-2 lg:mt-0">
             <div className="text-[10px] md:text-lg uppercase opacity-70">Mastery Level</div>
             <div className="text-2xl md:text-6xl font-black leading-none text-amber-500 text-shadow-amber">+{masteryLevel}%</div>
             <div className="text-[8px] md:text-sm uppercase tracking-widest mt-1">TRAINER: {run.config.algo} AI</div>
          </div>
        </div>

        {/* Top Modules Row */}
        <div className="grid grid-cols-2 gap-2 md:gap-6 shrink-0 text-xs md:text-base">
            {/* System Info */}
            <div className="border border-amber-500/50 p-1.5 md:p-3 flex flex-col justify-between bg-amber-950/10">
                <div className="text-[10px] md:text-lg font-bold uppercase flex items-center gap-1 md:gap-2">
                    <Terminal size={12} className="md:w-5 md:h-5" /> ORION.OS
                </div>
                <div className="space-y-0.5 md:space-y-1 opacity-90 mt-1 md:mt-2 text-[8px] md:text-base">
                    <div className="flex justify-between">
                        <span>REPORT ID:</span>
                        <span>{run.run_id.substring(4, 8).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>STATUS:</span>
                        <span className={run.status === 'RUNNING' ? 'animate-pulse' : ''}>{run.status}</span>
                    </div>
                </div>
            </div>
            
            {/* Stats Info */}
            <div className="border border-amber-500/50 p-1.5 md:p-3 flex flex-col justify-between bg-amber-950/10">
                <div className="text-[10px] md:text-lg font-bold uppercase flex items-center gap-1 md:gap-2">
                    <Cpu size={12} className="md:w-5 md:h-5" /> PROGRAM: KAIZEN
                </div>
                <div className="space-y-0.5 md:space-y-1 opacity-90 mt-1 md:mt-2 text-[8px] md:text-base">
                    <div className="flex justify-between">
                        <span>DATASETS:</span>
                        <span>{totalSteps.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>NOISE:</span>
                        <span>{noiseReduction}%</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Main Content Grid - Stacked on Mobile, Grid on LG Desktop */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-6 pb-2">
            
            {/* Insight Column (Wide) */}
            <div className="lg:col-span-2 border md:border-4 border-amber-500 p-2 md:p-6 flex flex-col gap-2 md:gap-4 relative bg-black/50 min-h-[300px] lg:min-h-0">
                <div className="absolute top-0 left-0 text-[8px] md:text-sm font-bold bg-amber-500 text-black px-1.5 md:px-3 py-0.5 md:py-1">INSIGHT SUMMARY</div>
                
                {/* Scrollable Text Area */}
                <div className="mt-4 md:mt-6 font-mono text-sm md:text-xl leading-relaxed whitespace-pre-wrap opacity-90 flex-1 overflow-y-auto custom-scrollbar pr-1 md:pr-4">
                    {analysis}
                </div>

                <div className="shrink-0 border-t border-amber-500/30 pt-1 md:pt-2 flex items-center gap-2 text-[8px] md:text-sm text-amber-500/70 animate-pulse mt-auto">
                    <span className="text-sm md:text-xl">»»»</span> SENSEI VALIDATION REQUIRED FOR SYSTEM PURGE
                </div>
            </div>

            {/* Radar Column */}
            <div className="border border-amber-500 p-2 md:p-4 flex flex-col relative bg-amber-950/5 min-h-[300px] lg:min-h-0">
                <div className="text-[10px] md:text-sm font-bold flex items-center gap-1 border-b border-amber-500/30 pb-1 mb-2">
                    <Radio size={12} className="md:w-4 md:h-4 animate-spin-slow" /> RADAR: NEURAL ACTIVITY
                </div>
                
                <div className="flex-1 min-h-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                            <PolarGrid stroke="#f59e0b" strokeOpacity={0.3} />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#f59e0b', fontSize: 9, fontWeight: 'bold' }} />
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
                                contentStyle={{ backgroundColor: '#000', border: '1px solid #f59e0b', color: '#f59e0b', fontFamily: 'monospace', fontSize: '10px' }}
                                itemStyle={{ color: '#f59e0b' }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
                
                {/* Summary Metrics in Radar Panel */}
                <div className="mt-1 md:mt-4 border-t border-amber-500/30 pt-1 md:pt-2 grid grid-cols-2 gap-2 md:gap-4 text-[10px] md:text-base opacity-80 shrink-0">
                     <div className="flex flex-col">
                         <span className="text-[8px] md:text-[10px] uppercase opacity-50 flex items-center gap-1"><Clock size={10}/> Elapsed</span>
                         <span className="font-bold">--:--:--</span>
                     </div>
                     <div className="flex flex-col">
                         <span className="text-[8px] md:text-[10px] uppercase opacity-50 flex items-center gap-1"><Target size={10}/> Total Reward</span>
                         <span className="font-bold text-amber-300">{latestMetric.reward}</span>
                     </div>
                     <div className="col-span-2 flex flex-col bg-amber-900/10 p-1 md:p-2 border border-amber-900/30">
                         <span className="text-[8px] md:text-[10px] uppercase opacity-50 flex items-center gap-1"><Award size={10}/> Performance</span>
                         <span className="font-bold text-xs md:text-lg">
                             {masteryLevel > 80 ? "ELITE" : masteryLevel > 50 ? "COMPETENT" : "NOVICE"}
                         </span>
                     </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};