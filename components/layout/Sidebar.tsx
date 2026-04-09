"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { usePWA } from "@/hooks/usePWA";
import { 
  LayoutDashboard, 
  ScanLine, 
  Trophy, 
  History, 
  Users, 
  Settings, 
  LogOut,
  Target,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Registrar Montagem", href: "/registrar-montagem", icon: ScanLine },
  { name: "Ranking do Turno", href: "/ranking-turno", icon: Trophy },
  { name: "Histórico", href: "/historico", icon: History },
  { name: "Funcionários", href: "/funcionarios", icon: Users },
  { name: "Configurações", href: "/configuracoes", icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const { isInstallable, installApp } = usePWA();

  useEffect(() => {
    const session = localStorage.getItem('session_user');
    if (session) {
      setUser(JSON.parse(session));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('session_user');
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden transition-all duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside className={cn(
        "w-72 h-screen bg-[#0d0e10] border-r border-white-[0.03] fixed left-0 top-0 flex flex-col transition-all duration-300 ease-in-out z-[70] lg:z-50",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
      <div className="p-10">
        <h1 className="text-2xl font-black tracking-tighter text-accent-gold italic leading-none mb-1">
          AUTOPROD
        </h1>
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
          Turno da Manhã
        </p>
      </div>

      <div className="h-px bg-white/[0.03] mx-6" />

      <nav className="flex-1 px-4 py-8 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 interactive-action",
                isActive 
                  ? "bg-white/[0.03] text-accent-gold shadow-[inset_0_0_15px_rgba(250,204,21,0.05)]" 
                  : "text-slate-400 hover:bg-white/[0.02] hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-accent-gold" : "text-slate-500 group-hover:text-slate-300")} />
              <span className="text-sm font-bold tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-8 space-y-4">
        {isInstallable && (
          <button 
            onClick={installApp}
            className="flex items-center justify-center gap-3 w-full py-4 bg-accent-gold/10 border border-accent-gold/20 rounded-2xl text-accent-gold hover:bg-accent-gold hover:text-black transition-all group shadow-xl shadow-yellow-500/5"
          >
            <span className="text-sm font-black uppercase tracking-widest">Instalar APP</span>
            <Download className="w-4 h-4 animate-bounce" />
          </button>
        )}

        <div className="flex items-center gap-4 px-2 py-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-blue to-accent-blue/40 flex items-center justify-center text-black font-black text-sm border-2 border-[#0d0e10] shadow-xl">
            {user?.nome?.slice(0, 2).toUpperCase() || "UN"}
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none mb-1">
              {user?.matricula === '116203' ? 'Anna Karolina' : (user?.nome || "Carregando...")}
            </p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                {user?.matricula === '116203' ? 'Administrativo' : (user?.tipo || 'Operador')}
            </p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-3 w-full py-4 border border-white/10 rounded-2xl text-slate-300 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all group interactive-action"
        >
          <span className="text-sm font-bold">Sair do sistema</span>
          <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </aside>
    </>
  );
}
