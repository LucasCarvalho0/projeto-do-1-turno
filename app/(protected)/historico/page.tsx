"use client";

import { useState, useMemo } from "react";
import { useProduction } from "@/hooks/useProduction";
import { 
  History as HistoryIcon, 
  Search as SearchIcon, 
  FileDown as FileDownIcon, 
  Calendar as CalendarIcon, 
  Filter as FilterIcon, 
  Download as DownloadIcon, 
  FileSpreadsheet as FileSpreadsheetIcon, 
  FileText as FileTextIcon, 
  Clock as ClockIcon, 
  Car as CarIcon, 
  User as UserIcon, 
  CheckCircle2 as CheckCircle2Icon, 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

export default function HistoricoPage() {
  const { data: productions, loading } = useProduction({ allHistory: true });
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(format(startOfDay(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfDay(new Date()), 'yyyy-MM-dd'));

  const filteredData = useMemo(() => {
    return productions.filter(item => {
      const itemDate = parseISO(item.timestamp);
      const isDateInRange = isWithinInterval(itemDate, {
        start: startOfDay(new Date(startDate)),
        end: endOfDay(new Date(endDate))
      });
      const matchesSearch = item.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.versao.toLowerCase().includes(searchTerm.toLowerCase());
      return isDateInRange && matchesSearch;
    });
  }, [productions, startDate, endDate, searchTerm]);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData.map(item => ({
      Data: format(parseISO(item.timestamp), 'dd/MM/yyyy HH:mm:ss'),
      VIN: item.vin,
      Versao: item.versao,
      Operador: (item as any).employees?.nome || 'N/A',
      Status: 'Sincronizado'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Produção");
    XLSX.writeFile(wb, `historico_producao_${startDate}_${endDate}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Histórico de Produção Automotiva`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Período: ${startDate} até ${endDate}`, 14, 22);
    
    autoTable(doc, {
      startY: 25,
      head: [['Data/Hora', 'VIN', 'Versão', 'Operador', 'Status']],
      body: filteredData.map(item => [
        format(parseISO(item.timestamp), 'dd/MM/yyyy HH:mm'),
        item.vin,
        item.versao,
        (item as any).employees?.nome || 'N/A',
        'Sincronizado'
      ]),
      theme: 'striped',
      headStyles: { fillColor: [250, 204, 21], textColor: [0, 0, 0] }
    });
    
    doc.save(`historico_producao_${startDate}_${endDate}.pdf`);
  };

  return (
    <div className="space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Histórico</h2>
          <p className="text-slate-500 font-medium font-mono text-[10px] uppercase tracking-widest">Registros de produção e Auditoria</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={exportToExcel}
            className="bg-accent-gold/10 hover:bg-accent-gold hover:text-black border border-accent-gold text-accent-gold font-black uppercase tracking-widest px-6 py-4 rounded-2xl flex items-center gap-2 transition-all shadow-xl shadow-yellow-500/5 group"
          >
            <FileSpreadsheetIcon className="w-5 h-5" />
            Excel
          </button>
          <button 
            onClick={exportToPDF}
            className="bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.1] text-white font-black uppercase tracking-widest px-6 py-4 rounded-2xl flex items-center gap-2 transition-all group"
          >
            <FileTextIcon className="w-5 h-5" />
            PDF
          </button>
        </div>
      </div>

      <div className="card-premium p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-1">Buscar VIN / Versão</label>
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="text"
              placeholder="Digite para filtrar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-accent-gold/20 transition-all font-medium text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-1">Data Início</label>
          <div className="relative">
            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-accent-gold/20 transition-all font-medium text-sm appearance-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-1">Data Fim</label>
          <div className="relative">
            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-accent-gold/20 transition-all font-medium text-sm appearance-none"
            />
          </div>
        </div>
      </div>

      <div className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                <th className="p-6 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 italic">Data / Hora</th>
                <th className="p-6 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 italic">VIN Code</th>
                <th className="p-6 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 italic">Versão</th>
                <th className="p-6 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 italic">Operador</th>
                <th className="p-6 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 italic">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="p-8 h-12 bg-white/[0.01]" />
                  </tr>
                ))
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-6">
                       <div className="flex items-center gap-3">
                          <ClockIcon className="w-4 h-4 text-slate-600" />
                          <span className="text-sm font-bold text-slate-300">
                             {format(parseISO(item.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                          </span>
                       </div>
                    </td>
                    <td className="p-6">
                       <div className="flex items-center gap-3">
                          <CarIcon className="w-4 h-4 text-slate-600" />
                          <span className="text-sm font-black font-mono tracking-widest text-accent-gold italic">
                             {item.vin}
                          </span>
                       </div>
                    </td>
                    <td className="p-6">
                       <span className="px-3 py-1 bg-white/[0.05] rounded-lg text-[10px] font-black uppercase text-slate-400 group-hover:text-white transition-colors">
                          {item.versao}
                       </span>
                    </td>
                    <td className="p-6">
                       <div className="flex items-center gap-3">
                          <UserIcon className="w-4 h-4 text-slate-600" />
                          <span className="text-sm font-bold text-slate-300">
                             {(item as any).employees?.nome || "Sistema"}
                          </span>
                       </div>
                    </td>
                    <td className="p-6">
                       <div className="flex items-center gap-2 px-3 py-1 w-fit rounded-full bg-green-500/10 border border-green-500/20">
                          <CheckCircle2Icon className="w-3 h-3 text-green-500" />
                          <span className="text-[10px] font-black uppercase text-green-500 tracking-tighter">Sincronizado</span>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-700 font-black uppercase tracking-widest text-sm">
                    Nenhum registro encontrado para este período
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 bg-white/[0.02] border-t border-white/[0.05] flex items-center justify-between">
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
             Mostrando {filteredData.length} registros
           </p>
           <div className="flex items-center gap-2">
              <button disabled className="p-2 text-slate-700 cursor-not-allowed"><ChevronLeftIcon /></button>
              <button disabled className="p-2 text-slate-700 cursor-not-allowed"><ChevronRightIcon /></button>
           </div>
        </div>
      </div>
    </div>
  );
}
