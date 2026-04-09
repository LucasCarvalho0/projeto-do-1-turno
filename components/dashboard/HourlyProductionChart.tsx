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

  // Lista de horas do turno (06:00 até 01:00 do dia seguinte)
  const hours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1]; 
  
  const chartData = hours.map(h => {
    const count = productions.filter(p => {
      try {
        const date = parseISO(p.timestamp);
        // getHours retorna a hora local, o que é correto pois o painel é físico e local.
        return getHours(date) === h;
      } catch (err) {
        return false;
      }
    }).length;
    
    return {
      hour: `${h.toString().padStart(2, '0')}h`,
      count,
      target: 8
    };
  });

  console.log("Chart Data recalculado:", chartData.filter(d => d.count > 0));

  if (loading && productions.length === 0) return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

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
