"use client";

import { useState, useEffect } from "react";
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Target, 
  Clock, 
  ShieldAlert,
  CheckCircle2,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function ConfiguracoesPage() {
  const [meta, setMeta] = useState(90);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');
  const supabase = createClient();

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('settings').select('*').single();
      if (data) {
        setMeta(data.meta);
      }
    }
    loadSettings();
  }, [supabase]);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('settings')
      .update({ meta })
      .eq('id', 1); // Assuming ID 1 for global settings

    if (!error) {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 rounded-[2rem] bg-accent-gold/10 flex items-center justify-center border border-accent-gold/20 shadow-2xl shadow-yellow-500/10">
          <Settings className="text-accent-gold w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Configurações</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Parâmetros Operacionais do Sistema</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Production Settings */}
        <div className="card-premium p-10 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-accent-gold/5 rounded-full blur-3xl -translate-x-16 -translate-y-16" />
          
          <div className="relative z-10 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
              <Target className="w-4 h-4 text-accent-gold" />
              Metas de Produção
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-500 ml-1">Meta Diária (Veículos)</label>
                <input 
                  type="number" 
                  value={meta}
                  onChange={(e) => setMeta(parseInt(e.target.value))}
                  className="w-full bg-white/[0.03] border border-white/[0.1] rounded-2xl p-6 text-4xl font-black italic tracking-tighter text-white outline-none focus:border-accent-gold/40 transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-600 font-bold uppercase leading-relaxed">
                Este valor impactará o cálculo de eficiência em tempo real no Dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Global Reset Settings */}
        <div className="card-premium p-10 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/5 rounded-full blur-3xl translate-x-16 -translate-y-16" />
          
          <div className="relative z-10 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-accent-purple" />
              Ciclo de Reinicialização
            </h3>
            
            <div className="flex items-center gap-6 p-6 bg-white/[0.02] border border-white/[0.05] rounded-[2rem]">
               <div className="w-14 h-14 rounded-2xl bg-accent-purple/10 flex items-center justify-center text-accent-purple">
                  <Clock className="w-7 h-7" />
               </div>
               <div>
                  <p className="text-2xl font-black text-white italic tracking-tighter">01:00 AM</p>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Horário de Reset do Turno</p>
               </div>
            </div>

            <div className="p-4 bg-accent-purple/5 border border-accent-purple/10 rounded-2xl flex items-start gap-3">
               <ShieldAlert className="w-4 h-4 text-accent-purple shrink-0 mt-0.5" />
               <p className="text-[10px] text-slate-500 font-bold uppercase leading-tight">
                 A reinicialização limpa os indicadores visuais do Dashboard, mas preserva todos os registros no histórico para auditorias.
               </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card-premium p-10 flex flex-col md:flex-row items-center justify-between gap-8 border-accent-gold/10">
        <div className="space-y-2 text-center md:text-left">
           <h4 className="text-sm font-black uppercase text-white tracking-widest italic">Salvar Alterações Globais</h4>
           <p className="text-xs text-slate-500 font-medium">As mudanças serão aplicadas para todos os terminais ativos.</p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={loading}
          className={cn(
            "flex items-center gap-3 px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-2xl",
            saveStatus === 'success' ? "bg-green-500 text-white" : "bg-accent-gold text-black shadow-yellow-500/20"
          )}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : saveStatus === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saveStatus === 'success' ? "Configurações Salvas" : "Gravar Mudanças"}
        </button>
      </div>

      <div className="flex justify-center pt-8">
        <button className="flex items-center gap-2 text-red-500/40 hover:text-red-500 text-[10px] font-black uppercase tracking-[0.3em] transition-all">
          <Trash2 className="w-3 h-3" />
          Limpar Cache do Sistema
        </button>
      </div>
    </div>
  );
}
