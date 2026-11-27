// sound.js — small WebAudio bleeps made in code (no audio files). The
// context is created lazily on the first user gesture, and every call is
// guarded: a browser that refuses audio simply stays silent.

let audioContext = null;

function getContext() {
  if (audioContext) return audioContext;
  try {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    audioContext = new Ctor();
    return audioContext;
  } catch {
    return null;
  }
}

function tone({ frequency, endFrequency, startAt, duration, type = 'square', volume = 0.06 }) {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = ctx.currentTime + startAt;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  } catch {
    // Silence is an acceptable soundtrack.
  }
}

export function unlockAudio() {
  const ctx = getContext();
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
}

export function playGobble() {
  tone({ frequency: 620, endFrequency: 240, startAt: 0, duration: 0.09 });
  tone({ frequency: 540, endFrequency: 200, startAt: 0.1, duration: 0.11 });
}

export function playCornChime(golden) {
  tone({ frequency: golden ? 880 : 660, startAt: 0, duration: 0.07, type: 'sine', volume: 0.08 });
  tone({ frequency: golden ? 1320 : 990, startAt: 0.07, duration: 0.1, type: 'sine', volume: 0.08 });
}

export function playThud() {
  tone({ frequency: 160, endFrequency: 60, startAt: 0, duration: 0.18, type: 'triangle', volume: 0.12 });
}

export function playCaughtSting() {
  tone({ frequency: 392, startAt: 0, duration: 0.16 });
  tone({ frequency: 330, startAt: 0.16, duration: 0.16 });
  tone({ frequency: 262, endFrequency: 130, startAt: 0.32, duration: 0.34 });
}

export function playEscapeFanfare() {
  tone({ frequency: 523, startAt: 0, duration: 0.12, type: 'triangle', volume: 0.09 });
  tone({ frequency: 659, startAt: 0.12, duration: 0.12, type: 'triangle', volume: 0.09 });
  tone({ frequency: 784, startAt: 0.24, duration: 0.12, type: 'triangle', volume: 0.09 });
  tone({ frequency: 1047, endFrequency: 1319, startAt: 0.36, duration: 0.3, type: 'triangle', volume: 0.09 });
}
