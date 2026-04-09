"use client";

import { useProduction } from "@/hooks/useProduction";

export function ProgressMeta({ total = 90 }: { total: number }) {
  const { data: productions, loading } = useProduction();
  const current = productions.length;
  // Dynamic percentage based on current total meta
  const percentage = total > 0 ? Math.min(Math.round((current / total) * 100), 100) : 0;

  return (
    <div className="card-premium p-10 space-y-10">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Progresso da Meta</h3>
      </div>

      <div className="space-y-6">
        <div className="relative h-4 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.05]">
          <div 
            className="h-full bg-accent-gold shadow-[0_0_20px_rgba(250,204,21,0.4)] transition-all duration-1000 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex justify-between items-center px-1">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">{current} carros</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-accent-gold italic tracking-tighter">{percentage}%</span>
          </div>

          <div className="space-y-1 text-right">
             <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Meta: {total} carros</span>
          </div>
        </div>

        <div className="text-center">
           <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-none">
             {current} / {total} carros
           </p>
        </div>
      </div>
    </div>
  );
}
