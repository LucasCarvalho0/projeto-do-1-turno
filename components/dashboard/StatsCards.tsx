"use client";

import { useProduction } from "@/hooks/useProduction";
import { 
  CheckCircle2, 
  Target, 
  Clock,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useSettings } from "@/hooks/useSettings";
import { parse, differenceInMinutes, startOfToday, isAfter, addDays } from "date-fns";

// Função utilitária para calcular as estatísticas fora do componente para maior clareza e evitar NaN
function calculateStats(countToday: number, meta: number, turnoInicio: string, turnoFim: string) {
  const now = new Date();
  const today = startOfToday();
  
  const formatTimeStr = (t: string) => {
    if (!t || typeof t !== 'string') return "06:00";
    const parts = t.split(':');
    if (parts.length < 2) return "06:00";
    const h = parts[0].padStart(2, '0');
    const m = parts[1].padStart(2, '0');
    return `${h}:${m}`;
  };

  const startStr = formatTimeStr(turnoInicio);
  const endStr = formatTimeStr(turnoFim || "16:48");
  
  const startTime = parse(startStr, 'HH:mm', today);
  let endTime = parse(endStr, 'HH:mm', today);
  
  const isValidStart = !isNaN(startTime.getTime());
  const isValidEnd = !isNaN(endTime.getTime());

  if (isValidStart && isValidEnd) {
    if (isAfter(startTime, endTime)) {
      endTime = addDays(endTime, 1);
    }

    const totalMinutes = differenceInMinutes(endTime, startTime);
    const elapsedMinutes = Math.max(0, differenceInMinutes(now, startTime));
    const elapsedHours = elapsedMinutes / 60;
    
    const hoursElapsed = Math.floor(elapsedMinutes / 60);
    const minsElapsed = elapsedMinutes % 60;
    
    const averagePerHour = elapsedHours > 0 ? (countToday / elapsedHours).toFixed(1) : "0.0";
    const targetPerHour = totalMinutes > 0 ? (meta / (totalMinutes / 60)) : 10;
    const isAboveAverage = parseFloat(averagePerHour) >= targetPerHour;
    const timeDisplay = `${hoursElapsed.toString().padStart(2, '0')}:${minsElapsed.toString().padStart(2, '0')}`;
    
    return { timeDisplay, averagePerHour, isAboveAverage, startStr };
  }

  return { timeDisplay: "00:00", averagePerHour: "0.0", isAboveAverage: false, startStr: "06:00" };
}

export function StatsCards() {
  const { data: productions, loading: pLoad } = useProduction();
  const { meta, turnoInicio, turnoFim, loading: sLoad } = useSettings();
  
  const loading = pLoad || sLoad;
  const countToday = productions.length;

  const { timeDisplay, averagePerHour, isAboveAverage, startStr } = calculateStats(
    countToday, 
    meta, 
    turnoInicio, 
    turnoFim
  );

  const stats = [
    {
      title: "CARROS BIPADOS HOJE",
      value: loading ? "..." : countToday.toString(),
      label: "Produção Total do Turno",
      icon: CheckCircle2,
      color: "text-accent-gold",
      border: "border-t-accent-gold",
    },
    {
      title: "META DO TURNO",
      value: meta.toString(),
      label: `${Math.max(0, meta - countToday)} restantes para o objetivo`,
      icon: Target,
      color: "text-accent-purple",
      border: "border-t-accent-purple",
    },
    {
      title: "TEMPO DE TURNO",
      value: timeDisplay,
      label: `Início: ${startStr}`,
      icon: Clock,
      color: "text-accent-blue",
      border: "border-t-accent-blue",
    },
    {
      title: "MÉDIA POR HORA",
      value: averagePerHour,
      label: isAboveAverage ? "Acima da média esperada" : "Abaixo da média esperada",
      icon: BarChart3,
      color: isAboveAverage ? "text-accent-green" : "text-accent-red",
      border: isAboveAverage ? "border-t-accent-green" : "border-t-accent-red",
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
