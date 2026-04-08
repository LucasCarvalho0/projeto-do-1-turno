"use client";

import { useState } from "react";
import { useEmployees, Employee } from "@/hooks/useEmployees";
import { 
  Plus, 
  Search, 
  UserPlus, 
  Trash2, 
  Edit2, 
  ToggleLeft, 
  ToggleRight,
  AlertCircle,
  X,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function FuncionariosPage() {
  const { employees, loading, addEmployee, updateEmployee, deleteEmployee } = useEmployees();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  const [formData, setFormData] = useState({
    nome: "",
    matricula: "",
    ativo: true
  });

  const filteredEmployees = employees.filter(emp => 
    emp.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.matricula?.includes(searchTerm)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee) {
      await updateEmployee(editingEmployee.id, formData);
    } else {
      await addEmployee(formData);
    }
    closeModal();
  };

  const openModal = (emp?: Employee) => {
    if (emp) {
      setEditingEmployee(emp);
      setFormData({
        nome: emp.nome,
        matricula: emp.matricula || "",
        ativo: emp.ativo
      });
    } else {
      setEditingEmployee(null);
      setFormData({ nome: "", matricula: "", ativo: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  return (
    <div className="space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Operadores</h2>
          <p className="text-slate-500 font-medium font-mono text-[10px] uppercase tracking-widest">Gestão de Equipe do Turno</p>
        </div>
        
        <button 
          onClick={() => openModal()}
          className="bg-accent-gold hover:bg-yellow-500 text-black font-black uppercase tracking-widest px-6 py-4 rounded-2xl flex items-center gap-2 transition-all shadow-xl shadow-yellow-500/10"
        >
          <UserPlus className="w-5 h-5" />
          Novo Operador
        </button>
      </div>

      <div className="card-premium p-6 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text"
            placeholder="Buscar por nome ou matrícula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-accent-gold/20 transition-all font-medium text-sm"
          />
        </div>
        <div className="hidden md:block w-px h-10 bg-white/[0.05]" />
        <div className="text-[10px] uppercase font-black text-slate-600 tracking-tighter">
          Total: {employees.length} Operadores
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card-premium h-40 animate-pulse bg-white/[0.02]" />
          ))
        ) : filteredEmployees.length > 0 ? (
          filteredEmployees.map((emp) => (
            <div key={emp.id} className="card-premium p-8 group relative overflow-hidden transition-all duration-300 hover:border-white/10">
              <div className="absolute top-0 right-0 p-4 flex gap-2 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => openModal(emp)}
                  className="p-2 bg-white/[0.05] hover:bg-accent-gold hover:text-black rounded-lg transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => deleteEmployee(emp.id)}
                  className="p-2 bg-white/[0.05] hover:bg-red-500 hover:text-white rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-start gap-5">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg bg-white/[0.03] transition-all",
                  emp.ativo ? "text-accent-gold" : "text-slate-600 grayscale"
                )}>
                  {emp.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                
                <div className="space-y-1">
                  <h3 className={cn(
                    "font-bold text-lg leading-tight transition-colors",
                    emp.ativo ? "text-white" : "text-slate-500"
                  )}>{emp.nome}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {emp.matricula || "MTR: NÃO INFORMADO"}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-white/[0.05] pt-6">
                 <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", emp.ativo ? "bg-green-500" : "bg-slate-700")} />
                    <span className="text-[10px] font-black uppercase tracking-tighter text-slate-600">
                      {emp.ativo ? "Operador Ativo" : "Operador Inativo"}
                    </span>
                 </div>
                 <button 
                  onClick={() => updateEmployee(emp.id, { ativo: !emp.ativo })}
                  className={cn("transition-colors", emp.ativo ? "text-green-500" : "text-slate-700")}
                 >
                    {emp.ativo ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                 </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-30 text-center">
            <Users className="w-16 h-16 mb-4" />
            <p className="font-black uppercase tracking-widest text-sm">Nenhum operador encontrado</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="card-premium w-full max-w-md p-10 space-y-8 animate-in zoom-in-95 duration-300 relative">
              <button 
                onClick={closeModal}
                className="absolute top-6 right-6 text-slate-500 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="space-y-2">
                <h3 className="text-2xl font-black italic tracking-tighter text-white">
                  {editingEmployee ? "Editar" : "Novo"} Operador
                </h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Dados cadastrais do funcionário</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-1">Nome Completo</label>
                    <input 
                      required
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/[0.05] rounded-2xl py-4 px-6 text-white outline-none focus:border-accent-gold/30"
                      placeholder="Nome do Operador"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-1">Matrícula (Opcional)</label>
                    <input 
                      type="text"
                      value={formData.matricula}
                      onChange={(e) => setFormData({...formData, matricula: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/[0.05] rounded-2xl py-4 px-6 text-white outline-none focus:border-accent-gold/30 font-mono"
                      placeholder="Ex: 000000"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-accent-gold/5 border border-accent-gold/10 rounded-2xl">
                   <AlertCircle className="w-5 h-5 text-accent-gold" />
                   <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase">
                     Este operador ficará disponível para seleção imediata no painel de bipagem de produção.
                   </p>
                </div>

                <button className="w-full bg-accent-gold hover:bg-yellow-500 text-black font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-xl shadow-yellow-500/20 active:scale-95">
                  {editingEmployee ? "Salvar Alterações" : "Cadastrar Operador"}
                </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
