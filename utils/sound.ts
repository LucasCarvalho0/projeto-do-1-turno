/**
 * Utilitário para feedback sonoro industrial
 */
export const playSuccessSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
  
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
  
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      oscillator.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.1);
  
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
  
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      console.error("Audio feedback failed", e);
    }
  };
  
  export const playErrorSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
  
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
  
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
      oscillator.frequency.linearRampToValueAtTime(110, audioCtx.currentTime + 0.3);
  
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
  
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.error("Audio feedback failed", e);
    }
  };
