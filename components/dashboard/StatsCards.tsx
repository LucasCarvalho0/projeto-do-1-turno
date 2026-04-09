"use client";

import { useProduction } from "@/hooks/useProduction";
import { 
  CheckCircle2, 
  Target, 
  Clock,
  TrendingDown,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

export function StatsCards({ meta = 90 }: { meta: number }) {
  const { data: productions, loading } = useProduction();
  
  const countToday = productions.length;

  const stats = [
    {
      title: "CARROS BIPADOS HOJE",
      value: loading ? "..." : countToday.toString(),
      label: "+12 na última hora",
      icon: CheckCircle2,
      color: "text-accent-gold",
      border: "border-t-accent-gold",
    },
    {
      title: "META DO TURNO",
      value: meta.toString(),
      label: `${Math.max(0, meta - countToday)} restantes`,
      icon: Target,
      color: "text-accent-purple",
      border: "border-t-accent-purple",
    },
    {
      title: "TEMPO DE TURNO",
      value: "06:48",
      label: "Início: 06:00",
      icon: Clock,
      color: "text-accent-blue",
      border: "border-t-accent-blue",
    },
    {
      title: "MÉDIA POR HORA",
      value: "10.4",
      label: "Acima da média",
      icon: BarChart3,
      color: "text-accent-blue",
      border: "border-t-accent-blue",
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.title} className={cn(
          "card-premium p-8 border-t-4 flex flex-col justify-between h-[220px] transition-all duration-300 hover:translate-y-[-4px]",
          stat.border
        )}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-500 w-2/3 leading-tight">{stat.title}</h4>
              <stat.icon className={cn("w-8 h-8 opacity-20", stat.color)} />
            </div>
            <div className="text-5xl font-black tracking-tighter text-white">
              {stat.value}
            </div>
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
