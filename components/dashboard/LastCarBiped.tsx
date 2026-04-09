"use client";

import { useProduction } from "@/hooks/useProduction";
import { format } from "date-fns";

export function LastCarBiped() {
  const { data: productions, loading } = useProduction();
  const lastCar = productions[0];

  return (
    <div className="card-premium p-10 h-full flex flex-col justify-between">
      <div className="space-y-1">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Último Vin Bipado</h3>
        <div className="flex items-center gap-2 text-green-500 mt-2">
           <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest">Ao Vivo</span>
        </div>
      </div>

      <div className="space-y-4 mt-8 overflow-hidden">
        <p className="text-2xl min-[400px]:text-3xl xl:text-4xl font-black text-accent-gold tracking-[0.05em] font-mono italic break-all leading-tight">
          {loading ? "SEARCHING..." : lastCar?.vin || "AGUARDANDO..."}
        </p>
        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.1em] truncate">
          {loading ? "..." : lastCar ? `${lastCar.employees?.nome || 'OPERADOR'} · ${lastCar.versao} · ${format(new Date(lastCar.timestamp), 'HH:mm')}` : "SISTEMA PRONTO"}
        </p>
      </div>
    </div>
  );
}
