"use client";

import { useState } from "react";
import { 
  ScanLine, 
  Users, 
  Car, 
  CheckCircle2, 
  AlertCircle,
} from "lucide-react";
import { EmployeeSelector } from "@/components/registrar/EmployeeSelector";
import { VersionSelector } from "@/components/registrar/VersionSelector";
import { VinScanner } from "@/components/registrar/VinScanner";
import { SuccessAnimation } from "@/components/registrar/SuccessAnimation";
import { cn } from "@/lib/utils";
import { useProduction } from "@/hooks/useProduction";
import { playSuccessSound, playErrorSound } from "@/utils/sound";

export default function RegistrarMontagemPage() {
  const [employee, setEmployee] = useState<string>("");
  const [version, setVersion] = useState<string>("");
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');
  const [message, setMessage] = useState("");
  const { addProduction } = useProduction();

  const handleVinConfirmed = async (vin: string) => {
    if (!employee || !version) {
      setStatus('error');
      setMessage("Selecione o funcionário e a versão antes de confirmar.");
      return;
    }

    setStatus('loading');
    
    const { error } = await addProduction({
      vin,
      employee_id: employee,
      versao: version
    });

    if (error) {
      playErrorSound();
      setStatus('error');
      setMessage(error.code === '23505' ? "VIN JÁ CADASTRADO!" : "ERRO AO REGISTRAR NO BANCO.");
    } else {
      playSuccessSound();
      setStatus('success');
      setMessage(`VIN CAPTURADO COM SUCESSO!`);
      
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-6 animate-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 rounded-[2rem] bg-accent-gold/10 flex items-center justify-center shadow-2xl shadow-yellow-500/10 border border-accent-gold/20">
          <ScanLine className="text-accent-gold w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Central de Bipagem</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Painel Operacional de Montagem Industrial</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Selectors */}
        <div className="lg:col-span-4 space-y-8">
          <div className="card-premium p-8 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-32 h-32 bg-accent-gold/5 rounded-full blur-3xl -translate-x-12 -translate-y-12" />
             
             <div className="relative z-10 space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-3">
                      <Users className="text-accent-gold w-4 h-4" />
                      1. Operador Responsável
                    </h3>
                    {employee && <CheckCircle2 className="text-green-500 w-5 h-5 transition-all animate-in zoom-in" />}
                  </div>
                  <EmployeeSelector value={employee} onChange={setEmployee} />
                </div>

                <div className="h-px bg-white/[0.05]" />

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-3">
                      <Car className="text-accent-gold w-4 h-4" />
                      2. Versão do Veículo
                    </h3>
                    {version && <CheckCircle2 className="text-green-500 w-5 h-5 transition-all animate-in zoom-in" />}
                  </div>
                  <VersionSelector value={version} onChange={setVersion} />
                </div>
             </div>
          </div>

          <div className="p-6 bg-accent-gold/5 border border-accent-gold/10 rounded-2xl space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-accent-gold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Verificação Obrigatória
            </h4>
            <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase">
              Certifique-se que o VIN está correto. O registro é imutável após a confirmação manual.
            </p>
          </div>
        </div>

        {/* Right Column: Scanner */}
        <div className="lg:col-span-8 h-full">
          <div className={cn(
            "card-premium p-10 h-full flex flex-col items-center justify-center min-h-[600px] relative transition-all duration-500",
            status === 'success' ? "border-green-500" : status === 'error' ? "border-red-500" : ""
          )}>
            <div className="absolute top-8 left-8 flex items-center gap-2">
               <ScanLine className="text-slate-700 w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700 italic">Bipagem Estação 01</span>
            </div>

            <VinScanner onScan={handleVinConfirmed} disabled={!employee || !version || status === 'loading'} />

            <div className="w-full max-w-md mt-12 space-y-4">
              {status === 'loading' && (
                <div className="text-center py-4">
                  <div className="w-8 h-8 border-4 border-accent-gold border-t-transparent rounded-full animate-spin mx-auto mb-2 shadow-[0_0_15px_rgba(250,204,21,0.2)]" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-accent-gold animate-pulse">Sincronizando com Banco...</p>
                </div>
              )}

              {status === 'success' && (
                <div className="p-8 bg-green-500/10 border border-green-500/20 rounded-3xl flex items-center gap-5 text-green-400 animate-in zoom-in-95 duration-500">
                  <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-8 h-8 shadow-[0_0_15px_rgba(34,197,94,0.3)]" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Operação Concluída</p>
                    <p className="text-lg font-black italic tracking-tighter uppercase">{message}</p>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-5 text-red-500 animate-in shake duration-500">
                  <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-8 h-8 shadow-[0_0_15px_rgba(239,68,68,0.3)]" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Falha no Registro</p>
                    <p className="text-lg font-black italic tracking-tighter uppercase">{message}</p>
                  </div>
                </div>
              )}

              {!employee && !version && status === 'idle' && (
                <div className="text-center space-y-3 opacity-20 group">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Aguardando Parâmetros Operacionais</p>
                   <div className="flex justify-center gap-1">
                      <div className="w-1 h-1 rounded-full bg-slate-500" />
                      <div className="w-1 h-1 rounded-full bg-slate-500" />
                      <div className="w-1 h-1 rounded-full bg-slate-500" />
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {status === 'success' && <SuccessAnimation />}
    </div>
  );
}
