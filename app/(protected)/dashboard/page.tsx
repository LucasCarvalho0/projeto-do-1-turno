"use client";

import { useEffect, useState } from "react";
import { useSettings } from "@/hooks/useSettings";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ProgressMeta } from "@/components/dashboard/ProgressMeta";
import { HourlyProductionChart } from "@/components/dashboard/HourlyProductionChart";
import { RealtimeRanking } from "@/components/dashboard/RealtimeRanking";
import { LastCarBiped } from "@/components/dashboard/LastCarBiped";

export default function DashboardPage() {
  const { meta } = useSettings();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const session = localStorage.getItem('session_user');
    if (session) {
      const user = JSON.parse(session);
      // Forçar o nome correto para a administradora se necessário
      if (user.matricula === '116203') {
        setUserName("Anna Karolina");
      } else {
        setUserName(user.nome);
      }
    }
  }, []);

  return (
    <div className="space-y-6 md:space-y-8 py-2 md:py-4 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-white">
          Bem-vinda, <span className="text-accent-gold">{userName || "Carregando..."}</span>
        </h1>
        <p className="text-[10px] md:text-sm uppercase font-black tracking-[0.3em] text-slate-500">
          Setor Administrativo | Turno da Manhã
        </p>
      </div>

      <StatsCards />

      <ProgressMeta total={meta} />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-6 md:gap-8 items-stretch">
        <div className="xl:col-span-8 h-full">
          <div className="card-premium p-6 md:p-10 h-full relative overflow-hidden group min-h-[400px]">
            <div className="flex items-center justify-between mb-8 md:mb-10">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Produção por Hora</h3>
            </div>
            <div className="h-[250px] md:h-[350px] w-full">
              <HourlyProductionChart />
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 h-full">
          <LastCarBiped />
        </div>
      </div>

      <RealtimeRanking />
    </div>
  );
}
