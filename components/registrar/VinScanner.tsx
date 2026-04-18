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
          fps: 30, // Aumentado para maior fluidez
          qrbox: { width: 320, height: 120 }, // Perfil mais horizontal para códigos lineares
          aspectRatio: 1.0,
          videoConstraints: {
            facingMode: activeCamera,
            focusMode: 'continuous',
            // Mudança para 'ideal' sem 'min' para evitar erro em dispositivos que não suportam HD
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } as any
        },
        (decodedText) => {
          const clean = decodedText.toUpperCase().slice(0, 17);
          const validation = validateVIN(clean);
          
          if (clean.length === 17 && validation.isValid) {
            // FEEDBACK INDUSTRIAL
            playSuccessSound();
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            
            setIsSuccessCaptured(true);
            setVinInput(clean);
            setVinConfirm(clean); // Auto-fill para bypass de confirmação
            
            // Agora apenas fecha a câmera e deixa os dados preenchidos para confirmação manual
            setTimeout(() => {
              setMode('input');
              setIsSuccessCaptured(false);
              setError(null);
            }, 800);
          } else if (clean.length === 17 && !validation.isValid) {
             playErrorSound();
             setError(validation.error || "VIN Inválido");
          }
        },
        (errorMessage) => {
          // Silent failure for continuous scanning
        }
      );
    } catch (err: any) {
      console.error("Scanner start error", err);
      setError(err.message || "Erro ao acessar a câmera. Verifique as permissões.");
      // Se falhar em iniciar, volta para o modo input após 3 segundos
      setTimeout(() => setMode('input'), 3000);
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
      setVinConfirm(value); // Preenchimento automático solicitado pelo usuário
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
      // Mantém o modo input focado após submissão
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
            <div className="relative w-full h-full flex items-center justify-center">
              <div id={containerId} className="w-full h-full object-cover" />
              
              {/* MODO SUCESSO COLETOR */}
              {isSuccessCaptured && (
                <div className="absolute inset-0 z-50 bg-green-500/30 backdrop-blur-sm flex flex-col items-center justify-center animate-in zoom-in duration-300">
                   <div className="w-32 h-32 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.5)]">
                      <CheckCircle2 className="w-20 h-20 text-white" />
                   </div>
                   <p className="mt-8 text-2xl font-black text-white uppercase tracking-[0.3em]">VIN COLETADO</p>
                </div>
              )}

              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full flex flex-col">
                  <div className="flex-1 bg-black/60" />
                  <div className="h-[180px] flex">
                    <div className="flex-1 bg-black/60" />
                    <div className="w-[320px] relative border-2 border-accent-gold/20 flex items-center justify-center overflow-hidden">
                      {/* Detection Target Corner Frames */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-accent-gold rounded-tl-xl" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-accent-gold rounded-tr-xl" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-accent-gold rounded-bl-xl" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-accent-gold rounded-br-xl" />
                      
                      {/* Scanning Line Animation */}
                      <div className="absolute left-0 right-0 h-[2px] bg-accent-gold shadow-[0_0_20px_rgba(250,204,21,1)] animate-scan-line-v2 z-10" />
                    </div>
                    <div className="flex-1 bg-black/60" />
                  </div>
                  <div className="flex-1 bg-black/60 flex flex-col items-center justify-center p-8 gap-4">
                     <div className="flex items-center gap-3 px-6 py-2 bg-accent-gold/10 border border-accent-gold/20 rounded-full">
                        <Target className="w-4 h-4 text-accent-gold animate-pulse" />
                        <p className="text-accent-gold font-black uppercase tracking-[0.3em] text-[10px]">
                           Modo Coletor Nissan Ativo
                        </p>
                     </div>
                  </div>
                </div>
              </div>

              {/* Controles Maiores para Uso Industrial */}
              <div className="absolute bottom-12 left-0 right-0 flex items-center justify-center gap-10 px-10">
                <button 
                  onClick={toggleTorch}
                  className={cn(
                    "w-20 h-20 rounded-full flex flex-col items-center justify-center gap-1 active:scale-90 transition-all border-2",
                    isTorchOn 
                      ? "bg-accent-gold border-accent-gold text-black shadow-[0_0_30px_rgba(250,204,21,0.4)]" 
                      : "bg-white/10 backdrop-blur-md border-white/20 text-white"
                  )}
                >
                  {isTorchOn ? <Zap className="w-8 h-8 fill-current" /> : <ZapOff className="w-8 h-8" />}
                  <span className="text-[8px] font-black uppercase">Flash</span>
                </button>

                <button 
                  onClick={() => setMode('input')}
                  className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-white active:scale-90 transition-all shadow-2xl shadow-red-600/30 border-2 border-red-500/50"
                >
                  <X className="w-10 h-10" />
                </button>

                <button 
                  onClick={() => setActiveCamera(prev => prev === 'environment' ? 'user' : 'environment')}
                  className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white active:scale-90 transition-all border-2 border-white/20"
                >
                  <RefreshCw className="w-8 h-8" />
                </button>
              </div>
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
