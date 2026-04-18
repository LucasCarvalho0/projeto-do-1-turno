"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Barcode,
  Fingerprint as FingerIcon, 
  Lock as LockIcon, 
  ArrowRight as ArrowIcon, 
  ShieldCheck as ShieldIcon, 
  AlertCircle as AlertIcon 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!supabase) {
        throw new Error("Erro de configuração: Conexão com o banco de dados não disponível. Verifique as variáveis de ambiente.");
      }

      const { data, error: dbError } = await supabase
        .from('admins')
        .select('*')
        .eq('matricula', matricula.trim())
        .eq('senha', senha.trim())
        .maybeSingle();

      if (dbError || !data) {
        throw new Error("Matrícula ou senha inválidos.");
      }

      // Cookies/Session could be set here for middleware protection
      // For now, we'll use a simple localStorage session for demo/visual speed
      localStorage.setItem('session_user', JSON.stringify(data));
      
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-gold/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-blue/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
      
      <div className="w-full max-w-md relative z-10 space-y-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="flex flex-col items-center space-y-4 mb-12">
          <div className="w-20 h-20 rounded-[2.5rem] bg-accent-gold/10 flex items-center justify-center border border-accent-gold/20 shadow-2xl shadow-yellow-500/20">
            <Barcode className="w-10 h-10 text-accent-gold" />
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase">
              AUTO<span className="text-accent-gold">PROD</span>
            </h1>
            <p className="text-[10px] uppercase font-black tracking-[0.4em] text-slate-500">Production Control System</p>
          </div>
        </div>

        <div className="card-premium rounded-[2.5rem] p-10 space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold text-white tracking-tight">Acesso Restrito</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Insira suas credenciais industriais</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2 group">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-1">Matrícula</label>
                <div className="relative">
                  <FingerIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-accent-gold transition-colors" />
                  <input 
                    required
                    type="text" 
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    placeholder="000000"
                    className="w-full bg-white/[0.03] border border-white/[0.05] rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-accent-gold/30 focus:bg-white/[0.05] transition-all font-mono tracking-widest"
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-1">Senha Industrial</label>
                <div className="relative">
                  <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-accent-gold transition-colors" />
                  <input 
                    required
                    type="password" 
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/[0.03] border border-white/[0.05] rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-accent-gold/30 focus:bg-white/[0.05] transition-all font-mono tracking-widest"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-xl flex items-center gap-3 text-red-400 text-xs font-bold animate-in shake">
                 <AlertIcon className="w-4 h-4" />
                 {error}
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full bg-accent-gold hover:bg-yellow-500 text-black font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-xl shadow-yellow-500/20 group relative overflow-hidden active:scale-95"
            >
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? "Autenticando..." : (
                  <>
                    Entrar no Sistema
                    <ArrowIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>
        </div>

        <div className="flex items-center justify-center gap-2 text-slate-700">
           <ShieldIcon className="w-4 h-4" />
           <span className="text-[10px] uppercase font-black tracking-tighter">Terminal Seguro de Produção</span>
        </div>
      </div>
    </div>
  );
}
