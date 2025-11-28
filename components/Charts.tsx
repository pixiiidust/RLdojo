

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MetricPoint } from '../types';

interface MetricsChartProps {
  data: MetricPoint[];
}

export const MetricsChart: React.FC<MetricsChartProps> = ({ data }) => {
  return (
    <div className="flex flex-col h-full gap-8">
      
      {/* Skill Level Chart (Win Rate) - MOST IMPORTANT FOR BEGINNERS */}
      <div className="flex-1 min-h-0 flex flex-col">
        <h3 className="text-amber-500 font-bold text-lg uppercase mb-2 tracking-widest border-b border-amber-500/30 flex justify-between">
            <span className="flex items-center gap-2">SKILL LEVEL (Win Rate)</span>
            <span className="opacity-50 text-sm">HIGHER IS BETTER</span>
        </h3>
        <div className="flex-1 min-h-0 bg-amber-950/10 border border-amber-900/30 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#451a03" />
              <XAxis 
                dataKey="episode" 
                stroke="#b45309" 
                fontSize={14} 
                tickLine={false}
                label={{ value: 'TRAINING TIME', position: 'bottom', offset: 0, fill: '#b45309', fontSize: 12 }} 
              />
              <YAxis 
                stroke="#ffb000" 
                domain={[0, 1]} 
                fontSize={14} 
                tickFormatter={(value) => `${Math.round(value * 100)}%`}
              />
              <Tooltip 
                 contentStyle={{ backgroundColor: '#000', border: '2px solid #ffb000', color: '#ffb000', fontFamily: 'VT323', fontSize: '18px' }}
                 formatter={(value: number) => [`${Math.round(value * 100)}%`, 'Win Probability']}
                 labelFormatter={(label) => `Time: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="win_rate" 
                stroke="#ffb000" 
                name="SKILL"
                strokeWidth={4} 
                dot={false}
                activeDot={{ r: 8, fill: '#ffb000' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-amber-700 mt-2 italic">
            This chart shows how often your fighter wins against the practice opponent.
        </p>
      </div>

      {/* Learning Progress (Reward) */}
      <div className="flex-1 min-h-0 flex flex-col">
        <h3 className="text-amber-500 font-bold text-lg uppercase mb-2 tracking-widest border-b border-amber-500/30 flex justify-between">
            <span className="flex items-center gap-2">LEARNING PROGRESS (Reward)</span>
            <span className="opacity-50 text-sm">CONSISTENCY</span>
        </h3>
        <div className="flex-1 min-h-0 bg-amber-950/10 border border-amber-900/30 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#451a03" />
              <XAxis dataKey="episode" stroke="#b45309" fontSize={14} tickLine={false} />
              <YAxis stroke="#b45309" fontSize={14} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#000', border: '2px solid #ffb000', color: '#ffb000', fontFamily: 'VT323', fontSize: '18px' }}
                itemStyle={{ color: '#ffb000' }}
                cursor={{ stroke: '#ffb000', strokeWidth: 1 }}
                formatter={(value: number) => [value, 'Score']}
              />
              <Line 
                type="step" 
                dataKey="reward" 
                stroke="#d97706" 
                strokeWidth={2} 
                dot={false}
                animationDuration={300}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-amber-700 mt-2 italic">
            Points earned for good moves (hitting) vs bad moves (getting hit).
        </p>
      </div>

    </div>
  );
};