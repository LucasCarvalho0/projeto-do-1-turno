"use client";

import { useProduction } from '@/hooks/useProduction';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { parseISO, getHours } from 'date-fns';

export function HourlyProductionChart() {
  const { data: productions, loading } = useProduction();

  const hours = Array.from({ length: 11 }, (_, i) => i + 6); 
  const chartData = hours.map(h => {
    const count = productions.filter(p => {
      const date = parseISO(p.timestamp);
      return getHours(date) === h;
    }).length;
    
    return {
      hour: `${h.toString().padStart(2, '0')}h`,
      count,
      target: 8
    };
  });

  if (loading) return null;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={chartData} 
        margin={{ top: 20, right: 30, left: -20, bottom: 0 }}
        barGap={0}
      >
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" strokeDasharray="0" />
        <XAxis 
          dataKey="hour" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} 
          dy={10}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} 
        />
        <Tooltip 
          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          contentStyle={{ 
            backgroundColor: '#0d0d0d', 
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '10px',
            color: '#fff'
          }}
        />
        <Bar 
          dataKey="count" 
          radius={[4, 4, 0, 0]}
          fill="#facc15"
          barSize={24}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.count >= entry.target ? "#facc15" : "rgba(180, 150, 20, 0.4)"} 
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
