"use client";

import { useProduction } from "@/hooks/useProduction";
import { useEmployees } from "@/hooks/useEmployees";
import { cn } from "@/lib/utils";

export function RealtimeRanking() {
  const { data: productions, loading: pLoad } = useProduction();
  const { employees, loading: eLoad } = useEmployees();

  const workerStats = employees.map(emp => {
    const count = productions.filter(p => p.employee_id === emp.id).length;
    return { ...emp, count };
  }).sort((a, b) => b.count - a.count).slice(0, 5);

  const colors = [
    "bg-accent-blue", 
    "bg-accent-green", 
    "bg-accent-gold", 
    "bg-accent-purple", 
    "bg-accent-red"
  ];

  const initials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="card-premium p-10 space-y-10">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Ranking em Tempo Real</h3>
      </div>

      <div className="space-y-8">
        {workerStats.map((item, index) => {
          const percentage = Math.round((item.count / 24) * 100); // Scale 24 based on image
          return (
            <div key={item.id} className="flex items-center gap-6 group">
              <span className="text-2xl font-black text-slate-700 w-6 italic">{index + 1}</span>
              
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center font-black text-xs text-black shadow-lg",
                colors[index % colors.length]
              )}>
                {initials(item.nome)}
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-center mb-1">
                   <p className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{item.nome}</p>
                   <span className="text-xl font-black text-accent-gold tracking-tighter italic">{item.count}</span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-1000", colors[index % colors.length])}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
