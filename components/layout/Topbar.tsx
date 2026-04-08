"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function Topbar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-24 fixed top-0 right-0 left-72 z-40 flex items-center justify-between px-12 bg-[#0d0d0d]/90 backdrop-blur-md">
      <div>
        <h2 className="text-3xl font-black tracking-tighter text-white">Dashboard</h2>
      </div>

      <div className="flex items-center gap-10">
        <div className="flex items-center gap-3 px-4 py-1.5 border border-green-500/30 rounded-full bg-green-500/[0.03]">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          <span className="text-[10px] uppercase font-black text-green-500 tracking-widest">Turno Ativo</span>
        </div>

        <div className="text-accent-gold font-black text-3xl tracking-tighter font-mono italic">
          {format(time, "HH:mm:ss")}
        </div>
      </div>
    </header>
  );
}
