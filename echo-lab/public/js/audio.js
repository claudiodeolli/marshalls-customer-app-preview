// Small WebAudio cue. Created lazily on a user gesture to satisfy autoplay
// policies; failures are silent and never block the session.

let context = null;

function getContext() {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!context) context = new AudioContextClass();
  return context;
}

export function unlockAudio() {
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
}

function tone(ctx, frequency, at, duration, volume = 0.05) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + at);
  gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + at + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(ctx.currentTime + at);
  oscillator.stop(ctx.currentTime + at + duration + 0.02);
}

export function playCue(kind = 'pause') {
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  try {
    if (kind === 'pause') {
      tone(ctx, 880, 0, 0.09, 0.045);
      tone(ctx, 1174.66, 0.1, 0.13, 0.035);
    } else if (kind === 'good') {
      tone(ctx, 659.25, 0, 0.1, 0.04);
      tone(ctx, 987.77, 0.1, 0.16, 0.035);
    } else {
      tone(ctx, 440, 0, 0.08, 0.03);
    }
  } catch {
    // Audio feedback is optional.
  }
}
