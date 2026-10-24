import { useCallback, useRef, useState } from 'react';

export function useGameSound() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const ctxRef = useRef(null);

  const getContext = useCallback(() => {
    if (!soundEnabled || typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!ctxRef.current) {
      ctxRef.current = new AudioCtx();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume().catch(() => {});
    }
    return ctxRef.current;
  }, [soundEnabled]);

  const playTone = useCallback(
    (freq, duration = 0.12, type = 'sine', volume = 0.08, delay = 0) => {
      const ctx = getContext();
      if (!ctx) return;

      const startTime = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.02);
    },
    [getContext]
  );

  const playPulse = useCallback(() => {
    playTone(320, 0.09, 'sine', 0.07, 0);
    playTone(540, 0.12, 'triangle', 0.08, 0.05);
    playTone(760, 0.14, 'sine', 0.06, 0.11);
  }, [playTone]);

  const playUpgrade = useCallback(() => {
    playTone(440, 0.1, 'triangle', 0.08, 0);
    playTone(660, 0.12, 'triangle', 0.09, 0.08);
    playTone(880, 0.18, 'sine', 0.09, 0.16);
  }, [playTone]);

  const playVictory = useCallback(() => {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      playTone(n, 0.22, 'triangle', 0.1, idx * 0.09);
    });
  }, [playTone]);

  const playReset = useCallback(() => {
    playTone(420, 0.08, 'sine', 0.06, 0);
    playTone(260, 0.12, 'sine', 0.06, 0.06);
  }, [playTone]);

  return {
    soundEnabled,
    setSoundEnabled,
    playPulse,
    playUpgrade,
    playVictory,
    playReset,
  };
}
