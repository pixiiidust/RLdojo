
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MetricPoint } from '../types';

interface MetricsChartProps {
  data: MetricPoint[];
}

export const MetricsChart: React.FC<MetricsChartProps> = ({ data }) => {
  return (
    <div className="flex flex-col h-full gap-2 md:gap-8 overflow-hidden">
      
      {/* Skill Level Chart (Win Rate) - MOST IMPORTANT FOR BEGINNERS */}
      <div className="flex-1 min-h-0 flex flex-col">
        <h3 className="text-amber-500 font-bold text-xs md:text-lg uppercase mb-1 md:mb-2 tracking-widest border-b border-amber-500/30 flex justify-between shrink-0">
            <span className="flex items-center gap-2">SKILL LEVEL (Win Rate)</span>
            <span className="opacity-50 text-[10px] md:text-sm">HIGHER IS BETTER</span>
        </h3>
        <div className="flex-1 min-h-0 bg-amber-950/10 border border-amber-900/30 p-1 md:p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#451a03" vertical={false} />
              <XAxis 
                dataKey="episode" 
                stroke="#b45309" 
                fontSize={10} 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis 
                stroke="#ffb000" 
                domain={[0, 1]} 
                fontSize={10} 
                tickFormatter={(value) => `${Math.round(value * 100)}%`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                 contentStyle={{ backgroundColor: '#000', border: '1px solid #ffb000', color: '#ffb000', fontFamily: 'VT323', fontSize: '12px' }}
                 formatter={(value: number) => [`${Math.round(value * 100)}%`, 'Win Rate']}
                 labelFormatter={(label) => `Ep: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="win_rate" 
                stroke="#ffb000" 
                name="SKILL"
                strokeWidth={2} 
                dot={false}
                activeDot={{ r: 4, fill: '#ffb000' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Learning Progress (Reward) */}
      <div className="flex-1 min-h-0 flex flex-col">
        <h3 className="text-amber-500 font-bold text-xs md:text-lg uppercase mb-1 md:mb-2 tracking-widest border-b border-amber-500/30 flex justify-between shrink-0">
            <span className="flex items-center gap-2">LEARNING PROGRESS (Reward)</span>
            <span className="opacity-50 text-[10px] md:text-sm">CONSISTENCY</span>
        </h3>
        <div className="flex-1 min-h-0 bg-amber-950/10 border border-amber-900/30 p-1 md:p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#451a03" vertical={false} />
              <XAxis dataKey="episode" stroke="#b45309" fontSize={10} tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis stroke="#b45309" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#000', border: '1px solid #ffb000', color: '#ffb000', fontFamily: 'VT323', fontSize: '12px' }}
                itemStyle={{ color: '#ffb000' }}
                cursor={{ stroke: '#ffb000', strokeWidth: 1 }}
                formatter={(value: number) => [value, 'Score']}
                labelFormatter={(label) => `Ep: ${label}`}
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
      </div>

    </div>
  );
};
