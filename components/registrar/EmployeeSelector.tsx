"use client";

import { useEmployees } from "@/hooks/useEmployees";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface EmployeeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function EmployeeSelector({ value, onChange }: EmployeeSelectorProps) {
  const { employees, loading } = useEmployees();
  
  // Only show active employees for registration
  const activeEmployees = employees.filter(emp => emp.ativo);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="py-8 text-center text-slate-700 animate-pulse font-black uppercase tracking-widest text-[10px]">
            Sincronizando Operadores...
          </div>
        ) : activeEmployees.length > 0 ? (
          activeEmployees.map((emp) => (
            <button
              key={emp.id}
              onClick={() => onChange(emp.id)}
              className={cn(
                "flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 interactive-action group",
                value === emp.id 
                  ? "bg-accent-gold/10 border-accent-gold shadow-[0_0_15px_rgba(250,204,21,0.05)]" 
                  : "bg-white/[0.02] border-white/[0.05] hover:border-white/10"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                value === emp.id ? "bg-accent-gold text-black shadow-lg" : "bg-white/[0.03] text-slate-600 group-hover:text-slate-400"
              )}>
                <User className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className={cn(
                  "text-sm font-bold transition-colors",
                  value === emp.id ? "text-white" : "text-slate-400"
                )}>
                  {emp.nome}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
                   <p className="text-[9px] text-slate-600 uppercase font-black tracking-tighter">Bancada Ativa</p>
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="py-12 text-center text-slate-700 font-black uppercase tracking-widest text-[10px] opacity-40">
            Nenhum operador ativo
          </div>
        )}
      </div>
    </div>
  );
}
