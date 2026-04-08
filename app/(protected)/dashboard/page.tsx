"use client";

import { useSettings } from "@/hooks/useSettings";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ProgressMeta } from "@/components/dashboard/ProgressMeta";
import { HourlyProductionChart } from "@/components/dashboard/HourlyProductionChart";
import { RealtimeRanking } from "@/components/dashboard/RealtimeRanking";
import { LastCarBiped } from "@/components/dashboard/LastCarBiped";

export default function DashboardPage() {
  const { meta } = useSettings();

  return (
    <div className="space-y-8 py-2 animate-in fade-in duration-700">
      <StatsCards meta={meta} />

      <ProgressMeta total={meta} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
        <div className="xl:col-span-8">
          <div className="card-premium p-10 h-full relative overflow-hidden group">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Produção por Hora</h3>
            </div>
            <div className="h-[300px] w-full">
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
