/**
 * Web Audio API Synth to generate futuristic sound effects
 * and stuttering tones to simulate cognitive glitching and system warnings
 */

let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. Play standard UI trigger beep
export function playClick(frequency = 800, duration = 0.05) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Ignore context blocked
  }
}

// 2. Play digital warning alarm (cyber alarm)
export function playWaringBeep(highPitch = 1200, lowPitch = 400, rounds = 3) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    for (let i = 0; i < rounds; i++) {
      const start = now + i * 0.25;
      const duration = 0.18;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(highPitch, start);
      osc.frequency.exponentialRampToValueAtTime(lowPitch, start + duration);

      gain.gain.setValueAtTime(0.04, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      // Lowpass filter to make it sound slightly choked/retro
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1500, start);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + duration);
    }
  } catch (e) {
    // Ignore Context blocked
  }
}

// 3. Play deep stutter noise (Cognitive fog trigger)
export function playGlitchHum(duration = 0.8) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Create multiple small audio events representing a stuttering, failing connection
    const steps = 12;
    for (let i = 0; i < steps; i++) {
      const start = now + (i * (duration / steps)) * (0.8 + Math.random() * 0.4);
      const pieceDur = (duration / steps) * (0.4 + Math.random() * 0.6);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = Math.random() > 0.5 ? 'square' : 'triangle';
      osc.frequency.setValueAtTime(120 + Math.random() * 200, start);

      gain.gain.setValueAtTime(0.07, start);
      gain.gain.setValueAtTime(0.001, start + pieceDur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + pieceDur + 0.05);
    }
  } catch (e) {
    // Ignore Context blocked
  }
}

// 4. Play success sequence chime
export function playChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const pitches = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    pitches.forEach((f, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + index * 0.1);

      gain.gain.setValueAtTime(0.03, now + index * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.1);
      osc.stop(now + index * 0.1 + 0.35);
    });
  } catch (e) {
    // Ignore Context blocked
  }
}
