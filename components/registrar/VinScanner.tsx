"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Scan, Keyboard, Camera, X, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VinScannerProps {
  onScan: (vin: string) => void;
  disabled: boolean;
}

export function VinScanner({ onScan, disabled }: VinScannerProps) {
  const [mode, setMode] = useState<'input' | 'camera'>('input');
  const [vinInput, setVinInput] = useState("");
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (mode === 'camera' && !disabled) {
      scannerRef.current = new Html5QrcodeScanner(
        "reader", 
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scannerRef.current.render(
        (decodedText) => {
          setVinInput(decodedText);
          // Don't auto-read, wait for button
        },
        (error) => {
          // Silent error for continuous scanning
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [mode, disabled]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (vinInput.trim()) {
      onScan(vinInput.trim());
      setVinInput("");
      if (mode === 'camera') setMode('input');
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center gap-10">
      <div className="flex bg-white/[0.02] p-1 rounded-2xl border border-white/[0.05] w-fit">
        <button
          onClick={() => setMode('input')}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all",
            mode === 'input' ? "bg-accent-gold text-black shadow-lg shadow-yellow-500/10" : "text-slate-500 hover:text-white"
          )}
        >
          <Keyboard className="w-4 h-4" />
          Scanner Físico
        </button>
        <button
          onClick={() => setMode('camera')}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all",
            mode === 'camera' ? "bg-accent-gold text-black shadow-lg shadow-yellow-500/10" : "text-slate-500 hover:text-white"
          )}
        >
          <Camera className="w-4 h-4" />
          Câmera Celular
        </button>
      </div>

      <div className="flex-1 w-full flex flex-col items-center justify-center gap-8">
        {mode === 'camera' ? (
          <div className="w-full aspect-square max-w-[320px] border-2 border-accent-gold/20 rounded-[2.5rem] overflow-hidden relative shadow-2xl shadow-yellow-500/5">
             <div id="reader" className="w-full h-full" />
             <div className="absolute inset-0 pointer-events-none border-[12px] border-[#1a1c1e] rounded-[2.5rem]" />
             <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-accent-gold/40 border-dashed rounded-3xl animate-pulse" />
             </div>
             <button 
               onClick={() => setMode('input')}
               className="absolute top-4 right-4 p-2 bg-black/60 rounded-xl text-white hover:bg-black z-10 transition-all"
             >
               <X className="w-4 h-4" />
             </button>
          </div>
        ) : (
          <div className="w-full max-w-sm space-y-6">
            <div className="relative group">
              <input
                type="text"
                autoFocus
                placeholder="AGUARDANDO BIP/VIN"
                className={cn(
                  "w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 pl-16 text-2xl font-black font-mono tracking-[0.2em] text-accent-gold outline-none focus:border-accent-gold/40 transition-all",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                value={vinInput}
                onChange={(e) => setVinInput(e.target.value.toUpperCase())}
                disabled={disabled}
              />
              <Scan className={cn("absolute left-6 top-1/2 -translate-y-1/2 w-7 h-7", disabled ? "text-slate-700" : "text-slate-500 group-focus-within:text-accent-gold transition-colors")} />
            </div>
          </div>
        )}

        <button
          onClick={() => handleSubmit()}
          disabled={!vinInput || disabled}
          className={cn(
            "flex items-center gap-3 px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-2xl",
            vinInput && !disabled 
              ? "bg-accent-gold text-black shadow-yellow-500/20" 
              : "bg-white/[0.03] text-slate-700 cursor-not-allowed"
          )}
        >
          <CheckCircle2 className="w-5 h-5" />
          Confirmar Montagem
        </button>
      </div>

      <p className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-700 text-center">
        {mode === 'camera' ? "Posicione o QR/Código de Barras no centro" : "Utilize o leitor laser ou digite manualmente"}
      </p>
    </div>
  );
}
