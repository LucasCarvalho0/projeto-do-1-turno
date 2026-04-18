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
  RefreshCw,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { playSuccessSound, playErrorSound } from "@/utils/sound";

interface VinScannerProps {
  onScan: (vin: string) => void;
  disabled: boolean;
}

export function VinScanner({ onScan, disabled }: VinScannerProps) {
  const [mode, setMode] = useState<'input' | 'camera'>('input');
  const [vinInput, setVinInput] = useState("");
  const [vinConfirm, setVinConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [activeCamera, setActiveCamera] = useState<'environment' | 'user'>('environment');
  const [isSuccessCaptured, setIsSuccessCaptured] = useState(false);
  
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isTransitioning = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerId = "reader";

  // Garantir foco constante no input para leitores Bluetooth/USB
  useEffect(() => {
    if (mode === 'input' && !disabled) {
      const focusInterval = setInterval(() => {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'BUTTON') {
          inputRef.current?.focus();
        }
      }, 500);
      return () => clearInterval(focusInterval);
    }
  }, [mode, disabled]);

  // Validação em tempo real
  useEffect(() => {
    const cleanVin = vinInput.trim().toUpperCase();
    if (cleanVin.length > 0) {
      const validation = validateVIN(cleanVin);
      if (cleanVin.length === 17 && !validation.isValid) {
        setError(validation.error || "VIN Inválido (Deve ter 17 caracteres)");
      } else if (cleanVin.length > 17) {
        setError("O VIN deve ter exatamente 17 caracteres");
      } else {
        setError(null);
      }
    } else {
      setError(null);
    }
  }, [vinInput]);

  // Validação de correspondência
  const isMatch = vinInput === vinConfirm && vinInput.length === 17;

  const stopScanner = async () => {
    if (isTransitioning.current) return;
    
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      isTransitioning.current = true;
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error("Failed to stop scanner", err);
      } finally {
        isTransitioning.current = false;
      }
    }
  };

  const startScanner = async () => {
    if (isTransitioning.current) return;
    
    try {
      isTransitioning.current = true;
      if (!html5QrCodeRef.current) {
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
          fps: 30,
          qrbox: { width: 350, height: 120 }, 
          aspectRatio: 1.0,
          videoConstraints: {
            facingMode: activeCamera,
            focusMode: 'continuous',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } as any
        },
        (decodedText) => {
          const clean = decodedText.toUpperCase().slice(0, 17);
          const validation = validateVIN(clean);
          
          if (clean.length === 17 && validation.isValid) {
            playSuccessSound();
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            
            setIsSuccessCaptured(true);
            setVinInput(clean);
            setVinConfirm(clean);
            
            setTimeout(() => {
              setMode('input');
              setIsSuccessCaptured(false);
              setError(null);
            }, 800);
          }
        },
        (errorMessage) => {
          // Silent failure for continuous scanning
        }
      );
    } catch (err: any) {
      console.error("Scanner start error", err);
      setError(err.message || "Erro ao acessar a câmera. Verifique as permissões.");
      setTimeout(() => setMode('input'), 3000);
    } finally {
      isTransitioning.current = false;
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'original' | 'confirm') => {
    const value = e.target.value.toUpperCase().replace(/[IOQ]/g, "").slice(0, 17);
    if (field === 'original') {
      setVinInput(value);
      setVinConfirm(value); 
    } else {
      setVinConfirm(value);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isMatch) {
      onScan(vinInput);
      setVinInput("");
      setVinConfirm("");
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isMatch) {
        handleSubmit();
      }
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center gap-6 mt-12 md:mt-20">
      <div className="flex bg-white/[0.02] p-1 rounded-2xl border border-white/[0.05] w-fit">
        <button
          onClick={() => setMode('input')}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all",
            mode === 'input' ? "bg-accent-gold text-black shadow-lg shadow-yellow-500/10" : "text-slate-500 hover:text-white"
          )}
        >
          <Keyboard className="w-4 h-4" />
          Teclado / Bipagem
        </button>
        <button
          onClick={() => setMode('camera')}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all",
            mode === 'camera' ? "bg-accent-gold text-black shadow-lg shadow-yellow-500/10" : "text-slate-500 hover:text-white"
          )}
        >
          <Camera className="w-4 h-4" />
          Câmera Coletora
        </button>
      </div>

      <div className="flex-1 w-full flex flex-col items-center justify-center gap-6">
        {mode === 'camera' && (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="relative w-full h-full">
              {/* O vídeo do scanner preenche a tela */}
              <div id={containerId} className="w-full h-full object-cover" />
              
              {/* Máscara de Scanner Profissional */}
              <div className="scanner-mask pointer-events-none">
                <div className="scanner-cutout">
                  {/* Linha Laser Neon - Garantidamente no topo do recorte */}
                  <div className="animate-scan-line-laser" />
                  
                  {/* Mira nos cantos do recorte */}
                  <div className="scanner-corner top-0 left-0 border-r-0 border-b-0 rounded-tl-xl" />
                  <div className="scanner-corner top-0 right-0 border-l-0 border-b-0 rounded-tr-xl" />
                  <div className="scanner-corner bottom-0 left-0 border-r-0 border-t-0 rounded-bl-xl" />
                  <div className="scanner-corner bottom-0 right-0 border-l-0 border-t-0 rounded-br-xl" />
                </div>
              </div>

              {/* Informações de Status */}
              <div className="absolute top-12 left-0 right-0 z-[60] flex flex-col items-center gap-4 pointer-events-none">
                <div className="px-6 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Mira Laser Vermelha Ativa</p>
                </div>
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest text-center px-10">
                  Posicione o código de barras no centro do retângulo
                </p>
              </div>

              {/* Botões de Controle Premium (Glassmorphism) */}
              <div className="absolute bottom-12 left-0 right-0 z-[60] flex items-center justify-center gap-8 px-10">
                <button 
                  onClick={toggleTorch}
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-xl border-2 transition-all active:scale-90",
                    isTorchOn 
                      ? "bg-accent-gold border-accent-gold text-black shadow-lg shadow-yellow-500/40" 
                      : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                  )}
                >
                  {isTorchOn ? <Zap className="w-6 h-6 fill-current" /> : <ZapOff className="w-6 h-6" />}
                </button>

                <button 
                  onClick={() => setMode('input')}
                  className="w-20 h-20 rounded-full bg-red-600/90 backdrop-blur-md flex items-center justify-center text-white border-4 border-white/10 active:scale-90 transition-all shadow-2xl"
                >
                  <X className="w-10 h-10" />
                </button>

                <button 
                  onClick={() => setActiveCamera(prev => prev === 'environment' ? 'user' : 'environment')}
                  className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center text-white border-2 border-white/20 active:scale-90 transition-all hover:bg-white/20"
                >
                  <RefreshCw className="w-6 h-6" />
                </button>
              </div>

              {/* Modo Sucesso Overlay */}
              {isSuccessCaptured && (
                <div className="absolute inset-0 z-[100] bg-green-500/40 backdrop-blur-md flex flex-col items-center justify-center animate-in zoom-in duration-300">
                   <div className="w-32 h-32 rounded-full bg-green-500 flex items-center justify-center shadow-2xl">
                      <CheckCircle2 className="w-20 h-20 text-white" />
                   </div>
                   <p className="mt-8 text-3xl font-black text-white uppercase tracking-[0.4em] italic">VIN CAPTURADO</p>
                </div>
              )}
            </div>
          </div>
        )}

        <form 
          onSubmit={handleSubmit}
          className="w-full flex flex-col items-center gap-6"
        >
          {mode === 'input' && (
            <div className="w-full max-w-md space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Número do VIN</label>
                <div className="relative group">
                  <input
                    ref={inputRef}
                    type="text"
                    autoFocus
                    maxLength={17}
                    onKeyDown={handleKeyDown}
                    placeholder="DIGITE OU BIPE O VIN"
                    className={cn(
                      "w-full bg-white/[0.02] border rounded-2xl p-5 pl-14 text-lg md:text-xl font-black font-mono tracking-[0.1em] outline-none transition-all placeholder:text-slate-800",
                      error ? "border-red-500 text-red-500 animate-shake" : "border-white/[0.05] text-accent-gold focus:border-accent-gold/40",
                      disabled && "opacity-50 cursor-not-allowed"
                    )}
                    value={vinInput}
                    onChange={(e) => handleInputChange(e, 'original')}
                    disabled={disabled}
                  />
                  <Scan className={cn("absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6", error ? "text-red-500" : (disabled ? "text-slate-700" : "text-slate-500 group-focus-within:text-accent-gold transition-colors"))} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Confirmar VIN</label>
                <div className="relative group">
                  <input
                    type="text"
                    maxLength={17}
                    placeholder="CONFIRMAÇÃO (AUTO-FILL ATIVO)"
                    onKeyDown={handleKeyDown}
                    className={cn(
                      "w-full bg-white/[0.02] border rounded-2xl p-5 pl-14 text-lg md:text-xl font-black font-mono tracking-[0.1em] outline-none transition-all placeholder:text-slate-800",
                      isMatch ? "border-green-500/50 text-green-500" : "border-white/[0.05] text-white focus:border-white/20",
                      disabled && "opacity-50 cursor-not-allowed"
                    )}
                    value={vinConfirm}
                    onChange={(e) => handleInputChange(e, 'confirm')}
                    disabled={disabled || !vinInput}
                  />
                  <CheckCircle2 className={cn("absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6", isMatch ? "text-green-500" : "text-slate-700")} />
                </div>
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
            type="submit"
            disabled={!isMatch || disabled}
            className={cn(
              "flex items-center gap-3 px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-2xl mt-4",
              isMatch && !disabled 
                ? "bg-accent-gold text-black shadow-yellow-500/20" 
                : "bg-white/[0.03] text-slate-700 cursor-not-allowed"
            )}
          >
            <CheckCircle2 className="w-5 h-5" />
            Confirmar Montagem
          </button>
        </form>
      </div>

      <p className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-700 text-center px-6">
        {mode === 'camera' ? "Aponte para o código de barras do veículo" : "Os 17 caracteres do VIN devem ser idênticos nos dois campos"}
      </p>
    </div>
  );
}
