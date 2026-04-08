"use client";

import { Check, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const versions = [
  { id: "L2 Advanced", name: "L2 Advanced", description: "Configuração Industrial Superior" },
  { id: "L3 Exclusive", name: "L3 Exclusive", description: "Pacote Premium Completo" },
];

interface VersionSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function VersionSelector({ value, onChange }: VersionSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {versions.map((ver) => (
        <button
          key={ver.id}
          onClick={() => onChange(ver.id)}
          className={cn(
            "flex items-center gap-4 p-5 rounded-3xl border transition-all duration-300 group interactive-action",
            value === ver.id 
              ? "bg-accent-gold/10 border-accent-gold shadow-[0_0_20px_rgba(250,204,21,0.1)]" 
              : "border-white/[0.05] bg-white/[0.02] hover:border-white/10"
          )}
        >
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
            value === ver.id ? "bg-accent-gold text-black shadow-lg" : "bg-white/[0.03] text-slate-700 group-hover:bg-white/[0.07]"
          )}>
            <Check className={cn("w-6 h-6 transition-all duration-500", value === ver.id ? "scale-100 opacity-100" : "scale-50 opacity-0")} />
          </div>
          <div className="flex-1 text-left">
            <h4 className={cn("font-black text-sm uppercase tracking-tight transition-colors italic", value === ver.id ? "text-white" : "text-slate-500 group-hover:text-slate-300")}>
              {ver.name}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
               <Shield className={cn("w-3 h-3", value === ver.id ? "text-accent-gold" : "text-slate-700")} />
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{ver.description}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
