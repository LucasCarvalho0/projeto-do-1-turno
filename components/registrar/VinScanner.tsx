"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { validateVIN } from "@/utils/vin";
import { 
  Scan, 
  Keyboard, 
  Camera, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  ZapOff,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VinScannerProps {
  onScan: (vin: string) => void;
  disabled: boolean;
}

export function VinScanner({ onScan, disabled }: VinScannerProps) {
  const [mode, setMode] = useState<'input' | 'camera'>('input');
  const [vinInput, setVinInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [activeCamera, setActiveCamera] = useState<'environment' | 'user'>('environment');
  
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const containerId = "reader";

  // Auto-submit removido por solicitação do usuário para garantir conferência manual
  useEffect(() => {
    const cleanVin = vinInput.trim().toUpperCase();
    if (cleanVin.length >= 11) {
      const validation = validateVIN(cleanVin);
      if (!validation.isValid) {
        setError(validation.error || "VIN Inválido");
      } else {
        setError(null);
      }
    } else {
      setError(null);
    }
  }, [vinInput]);

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error("Failed to stop scanner", err);
      }
    }
  };

  const startScanner = async () => {
    try {
      if (!html5QrCodeRef.current) {
        // Formatos suportados devem ser configurados no construtor
        html5QrCodeRef.current = new Html5Qrcode(containerId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.DATA_MATRIX
          ],
          verbose: false
        });
      }

      await html5QrCodeRef.current.start(
        { facingMode: activeCamera },
        {
          fps: 15,
          qrbox: { width: 280, height: 280 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          setVinInput(decodedText.toUpperCase());
        },
        (errorMessage) => {
          // Silent failure for continuous scanning
        }
      );
    } catch (err) {
      console.error("Scanner start error", err);
    }
  };

  useEffect(() => {
    if (mode === 'camera' && !disabled) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [mode, disabled, activeCamera]);

  const toggleTorch = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        // getRunningTrack pode não estar nos types mas existe em runtime em versões recentes
        // Fallback para uma abordagem segura
        const scanner = html5QrCodeRef.current as any;
        const track = typeof scanner.getRunningTrack === 'function' 
          ? scanner.getRunningTrack() 
          : null;

        if (track && 'applyConstraints' in track) {
          await track.applyConstraints({
            advanced: [{ torch: !isTorchOn }]
          });
          setIsTorchOn(!isTorchOn);
        }
      } catch (err) {
        console.warn("Flashlight not supported on this device", err);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[IOQ]/g, "");
    setVinInput(value);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanVin = vinInput.trim();
    if (cleanVin) {
      const validation = validateVIN(cleanVin);
      if (validation.isValid) {
        onScan(cleanVin);
        setVinInput("");
        setMode('input');
      } else {
        setError(validation.error || "VIN Inválido");
      }
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center gap-6">
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
        {mode === 'camera' && (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
            {/* Scanner Area */}
            <div className="relative w-full h-full flex items-center justify-center">
              <div id={containerId} className="w-full h-full object-cover" />
              
              {/* Industrial Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full flex flex-col">
                  <div className="flex-1 bg-black/60" />
                  <div className="h-[280px] flex">
                    <div className="flex-1 bg-black/60" />
                    <div className="w-[280px] relative">
                      {/* Detection Target Corner Frames */}
                      <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-accent-gold rounded-tl-3xl" />
                      <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-accent-gold rounded-tr-3xl" />
                      <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-accent-gold rounded-bl-3xl" />
                      <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-accent-gold rounded-br-3xl" />
                      
                      {/* Scanning Line Animation */}
                      <div className="absolute top-0 left-4 right-4 h-1 bg-accent-gold/50 shadow-[0_0_15px_rgba(250,204,21,0.5)] animate-scan-line-v2" />
                    </div>
                    <div className="flex-1 bg-black/60" />
                  </div>
                  <div className="flex-1 bg-black/60 flex flex-col items-center justify-center p-8 gap-4">
                     <p className="text-white font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">
                        Centralize o Código de Barras
                     </p>
                     {error && (
                        <div className="bg-red-500 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase flex items-center gap-2">
                           <AlertCircle className="w-3 h-3" />
                           {error}
                        </div>
                     )}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-6 px-10">
                <button 
                  onClick={toggleTorch}
                  className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-all border border-white/20"
                >
                  {isTorchOn ? <Zap className="w-6 h-6 text-accent-gold" /> : <ZapOff className="w-6 h-6" />}
                </button>

                <button 
                  onClick={() => setMode('input')}
                  className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white active:scale-95 transition-all shadow-xl shadow-red-500/20"
                >
                  <X className="w-8 h-8" />
                </button>

                <button 
                  onClick={() => setActiveCamera(prev => prev === 'environment' ? 'user' : 'environment')}
                  className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-all border border-white/20"
                >
                  <RefreshCw className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        )}

        {mode === 'input' && (
          <div className="w-full max-w-sm space-y-6">
            <div className="relative group">
              <input
                type="text"
                autoFocus
                maxLength={30}
                placeholder="BIPE OU DIGITE O VIN"
                className={cn(
                  "w-full bg-white/[0.02] border rounded-2xl p-6 pl-16 text-2xl font-black font-mono tracking-[0.2em] outline-none transition-all",
                  error ? "border-red-500 text-red-500 animate-shake" : "border-white/[0.05] text-accent-gold focus:border-accent-gold/40",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                value={vinInput}
                onChange={handleInputChange}
                disabled={disabled}
              />
              <Scan className={cn("absolute left-6 top-1/2 -translate-y-1/2 w-7 h-7", error ? "text-red-500" : (disabled ? "text-slate-700" : "text-slate-500 group-focus-within:text-accent-gold transition-colors"))} />
            </div>
            
            {error && (
              <div className="flex items-center gap-2 justify-center text-red-500 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
              </div>
            )}
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
        {mode === 'camera' ? "Aponte para o código de barras do veículo" : "Bipe o carro e clique em 'Confirmar Montagem'"}
      </p>
    </div>
  );
}
