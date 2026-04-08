"use client";

import { useProduction } from "@/hooks/useProduction";
import { 
  Trophy, 
  Users, 
  TrendingUp, 
  Award,
  Medal,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

export default function RankingTurnoPage() {
  const { data: productions, loading } = useProduction();

  const ranking = useMemo(() => {
    const counts: Record<string, { name: string, count: number }> = {};
    
    productions.forEach(p => {
      const empId = p.employee_id;
      const empName = (p as any).employees?.nome || "Desconhecido";
      
      if (!counts[empId]) {
        counts[empId] = { name: empName, count: 0 };
      }
      counts[empId].count += 1;
    });

    return Object.entries(counts)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count);
  }, [productions]);

  const topThree = ranking.slice(0, 3);
  const others = ranking.slice(3);

  return (
    <div className="space-y-12 py-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <Trophy className="text-accent-gold w-6 h-6" />
             <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">Ranking do Turno</h2>
          </div>
          <p className="text-slate-500 font-medium font-mono text-[10px] uppercase tracking-widest">Produtividade Individual em Tempo Real</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.05] p-4 rounded-2xl">
           <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center">
              <TrendingUp className="text-accent-gold w-5 h-5" />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Total Hoje</p>
              <p className="text-xl font-black text-white italic">{productions.length} <span className="text-[10px] text-slate-600 not-italic uppercase tracking-widest ml-1">Carros</span></p>
           </div>
        </div>
      </div>

      {/* Podium Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-5xl mx-auto pt-10">
        {/* 2nd Place */}
        {topThree[1] && (
          <div className="order-2 md:order-1 card-premium p-8 h-80 flex flex-col items-center justify-center relative group animate-in slide-in-from-left duration-700">
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-400 shadow-[0_0_15px_rgba(148,163,184,0.3)]" />
            <div className="w-16 h-16 rounded-2xl bg-slate-400/10 flex items-center justify-center border border-slate-400/20 mb-6 shadow-2xl shadow-slate-400/5 group-hover:bg-slate-400/20 transition-all">
               <Trophy className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-black text-center text-white uppercase italic truncate w-full mb-1">{topThree[1].name}</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">2º Lugar - Prata</p>
            <div className="text-4xl font-black italic tracking-tighter text-slate-300">
               {topThree[1].count}
            </div>
          </div>
        )}

        {/* 1st Place */}
        {topThree[0] && (
          <div className="order-1 md:order-2 card-premium p-10 h-96 flex flex-col items-center justify-center relative group border-accent-gold/40 shadow-[0_0_50px_rgba(250,204,21,0.08)] animate-in zoom-in duration-1000">
             <div className="absolute top-0 left-0 w-full h-2 bg-accent-gold shadow-[0_0_20px_rgba(250,204,21,0.5)]" />
             <div className="absolute -top-12 flex flex-col items-center gap-2">
                <Trophy className="w-16 h-16 text-accent-gold drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-bounce" />
             </div>
             <h3 className="text-3xl font-black text-center text-white uppercase italic truncate w-full mb-1 mt-6">{topThree[0].name}</h3>
             <p className="text-[10px] font-black uppercase tracking-widest text-accent-gold mb-8">Líder de Produção - Ouro</p>
             <div className="text-7xl font-black italic tracking-tighter text-accent-gold drop-shadow-[0_0_30px_rgba(250,204,21,0.3)]">
                {topThree[0].count}
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mt-2">Unidades</p>
          </div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <div className="order-3 card-premium p-8 h-72 flex flex-col items-center justify-center relative group animate-in slide-in-from-right duration-700">
             <div className="absolute top-0 left-0 w-full h-1 bg-[#d97706] shadow-[0_0_15px_rgba(217,119,6,0.3)]" />
             <div className="w-16 h-16 rounded-2xl bg-[#d97706]/10 flex items-center justify-center border border-[#d97706]/20 mb-6 shadow-2xl shadow-orange-700/5 group-hover:bg-[#d97706]/20 transition-all">
                <Trophy className="w-8 h-8 text-[#d97706]" />
             </div>
             <h3 className="text-lg font-black text-center text-white uppercase italic truncate w-full mb-1">{topThree[2].name}</h3>
             <p className="text-[10px] font-black uppercase tracking-widest text-[#d97706] mb-6">3º Lugar - Bronze</p>
             <div className="text-3xl font-black italic tracking-tighter text-slate-300">
                {topThree[2].count}
             </div>
          </div>
        )}
      </div>

      {/* Others List */}
      <div className="max-w-5xl mx-auto space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-6 flex items-center gap-3">
           <Target className="w-4 h-4" />
           Ranking Geral de Eficiência
        </h3>
        {others.map((item, index) => (
          <div key={item.id} className="card-premium p-6 flex items-center justify-between group hover:border-white/10 transition-all">
             <div className="flex items-center gap-8">
                <span className="text-sm font-black text-slate-700 w-6 italic">#{index + 4}</span>
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-white/[0.02] flex items-center justify-center text-xs font-black text-slate-400 group-hover:text-white transition-colors">
                      {item.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                   </div>
                   <span className="font-bold text-slate-200 group-hover:text-white transition-colors">{item.name}</span>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <div className="w-24 h-2 bg-white/[0.03] rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-accent-gold/40" 
                    style={{ width: `${(item.count / (topThree[0]?.count || 1)) * 100}%` }}
                   />
                </div>
                <span className="text-xl font-black italic text-white w-12 text-right">{item.count}</span>
             </div>
          </div>
        ))}

        {ranking.length === 0 && !loading && (
          <div className="text-center py-20 card-premium border-dashed opacity-30">
             <Users className="w-12 h-12 mx-auto mb-4" />
             <p className="font-black uppercase tracking-widest text-xs">Aguardando início dos registros de produção</p>
          </div>
        )}
      </div>
    </div>
  );
}
