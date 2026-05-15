export type SEName =
  | 'attack'
  | 'crit'
  | 'heal'
  | 'levelup'
  | 'victory'
  | 'defeat'
  | 'menu';

const MUTE_KEY = 'browser-rpg.muted';

let ctx: AudioContext | null = null;

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === 'true';
  } catch {
    return false;
  }
}

let muted = readMuted();

export function isMuted(): boolean {
  return muted;
}

export function setMuted(b: boolean): void {
  muted = b;
  try {
    localStorage.setItem(MUTE_KEY, String(b));
  } catch {
    /* ignore */
  }
}

function getCtx(): AudioContext | null {
  if (ctx) {
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {
        /* ignore */
      });
    }
    return ctx;
  }
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    return ctx;
  } catch {
    return null;
  }
}

function envelope(
  ac: AudioContext,
  gain: GainNode,
  peak: number,
  attack: number,
  duration: number,
  offset = 0,
) {
  const t = ac.currentTime + offset;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(peak, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
}

function tone(
  freq: number,
  type: OscillatorType,
  duration: number,
  peak = 0.2,
  offset = 0,
) {
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + offset);
  envelope(ac, gain, peak, 0.01, duration, offset);
  osc.connect(gain).connect(ac.destination);
  osc.start(ac.currentTime + offset);
  osc.stop(ac.currentTime + offset + duration + 0.05);
}

function sweep(
  from: number,
  to: number,
  type: OscillatorType,
  duration: number,
  peak = 0.2,
) {
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), ac.currentTime + duration);
  envelope(ac, gain, peak, 0.01, duration);
  osc.connect(gain).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration + 0.05);
}

function noise(duration: number, peak = 0.2, lowpassHz?: number) {
  const ac = getCtx();
  if (!ac) return;
  const samples = Math.floor(ac.sampleRate * duration);
  const buf = ac.createBuffer(1, samples, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < samples; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const gain = ac.createGain();
  envelope(ac, gain, peak, 0.005, duration);
  if (lowpassHz) {
    const filt = ac.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = lowpassHz;
    src.connect(filt).connect(gain).connect(ac.destination);
  } else {
    src.connect(gain).connect(ac.destination);
  }
  src.start();
}

export function playSE(name: SEName): void {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;
  switch (name) {
    case 'attack':
      noise(0.08, 0.25, 1000);
      break;
    case 'crit':
      tone(800, 'square', 0.07, 0.22);
      tone(1200, 'square', 0.08, 0.22, 0.07);
      break;
    case 'heal':
      sweep(440, 880, 'sine', 0.25, 0.2);
      break;
    case 'levelup':
      tone(440, 'triangle', 0.12, 0.18);
      tone(554, 'triangle', 0.12, 0.18, 0.12);
      tone(659, 'triangle', 0.12, 0.18, 0.24);
      tone(880, 'triangle', 0.24, 0.22, 0.36);
      break;
    case 'victory':
      tone(660, 'square', 0.12, 0.2);
      tone(880, 'square', 0.24, 0.22, 0.14);
      break;
    case 'defeat':
      sweep(440, 110, 'sine', 0.5, 0.22);
      break;
    case 'menu':
      tone(800, 'sine', 0.03, 0.15);
      break;
  }
}
