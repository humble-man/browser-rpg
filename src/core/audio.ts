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
  // Smoothly fade BGM master if running
  if (bgmMasterGain) {
    const ac = getCtx();
    if (ac) {
      bgmMasterGain.gain.cancelScheduledValues(ac.currentTime);
      bgmMasterGain.gain.linearRampToValueAtTime(
        b ? 0 : BGM_MASTER_VOLUME,
        ac.currentTime + 0.2,
      );
    }
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

// === BGM ===

type BgmTrack = 'overworld' | 'battle';
type WaveType = 'triangle' | 'square' | 'sawtooth' | 'sine';

interface BgmNote {
  beat: number;
  pitch: number;
  duration: number;
  type: WaveType;
  voice: 'lead' | 'bass';
}

interface BgmPattern {
  bpm: number;
  totalBeats: number;
  notes: BgmNote[];
}

const BGM_MASTER_VOLUME = 0.12;
const BGM_LEAD_VOLUME = 0.6;
const BGM_BASS_VOLUME = 0.5;
const CROSSFADE_SEC = 0.5;

const NOTE = {
  C3: 130.81, D3: 146.83, F3: 174.61, G3: 196.0, A3: 220.0,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0,
  Bb5: 932.33, B5: 987.77, D6: 1174.66,
};

const OVERWORLD_PATTERN: BgmPattern = {
  bpm: 80,
  totalBeats: 16,
  notes: [
    { beat: 0, pitch: NOTE.C5, duration: 2, type: 'triangle', voice: 'lead' },
    { beat: 2, pitch: NOTE.E5, duration: 2, type: 'triangle', voice: 'lead' },
    { beat: 4, pitch: NOTE.G5, duration: 2, type: 'triangle', voice: 'lead' },
    { beat: 6, pitch: NOTE.E5, duration: 2, type: 'triangle', voice: 'lead' },
    { beat: 8, pitch: NOTE.A5, duration: 2, type: 'triangle', voice: 'lead' },
    { beat: 10, pitch: NOTE.G5, duration: 2, type: 'triangle', voice: 'lead' },
    { beat: 12, pitch: NOTE.F5, duration: 2, type: 'triangle', voice: 'lead' },
    { beat: 14, pitch: NOTE.E5, duration: 2, type: 'triangle', voice: 'lead' },
    { beat: 0, pitch: NOTE.C3, duration: 4, type: 'sawtooth', voice: 'bass' },
    { beat: 4, pitch: NOTE.F3, duration: 4, type: 'sawtooth', voice: 'bass' },
    { beat: 8, pitch: NOTE.A3, duration: 4, type: 'sawtooth', voice: 'bass' },
    { beat: 12, pitch: NOTE.G3, duration: 4, type: 'sawtooth', voice: 'bass' },
  ],
};

const BATTLE_PATTERN: BgmPattern = {
  bpm: 120,
  totalBeats: 16,
  notes: [
    { beat: 0, pitch: NOTE.D5, duration: 1, type: 'square', voice: 'lead' },
    { beat: 1, pitch: NOTE.F5, duration: 1, type: 'square', voice: 'lead' },
    { beat: 2, pitch: NOTE.A5, duration: 1, type: 'square', voice: 'lead' },
    { beat: 3, pitch: NOTE.F5, duration: 1, type: 'square', voice: 'lead' },
    { beat: 4, pitch: NOTE.A5, duration: 1, type: 'square', voice: 'lead' },
    { beat: 5, pitch: NOTE.F5, duration: 1, type: 'square', voice: 'lead' },
    { beat: 6, pitch: NOTE.D5, duration: 1, type: 'square', voice: 'lead' },
    { beat: 7, pitch: NOTE.F5, duration: 1, type: 'square', voice: 'lead' },
    { beat: 8, pitch: NOTE.G5, duration: 1, type: 'square', voice: 'lead' },
    { beat: 9, pitch: NOTE.Bb5, duration: 1, type: 'square', voice: 'lead' },
    { beat: 10, pitch: NOTE.D6, duration: 1, type: 'square', voice: 'lead' },
    { beat: 11, pitch: NOTE.Bb5, duration: 1, type: 'square', voice: 'lead' },
    { beat: 12, pitch: NOTE.A5, duration: 1, type: 'square', voice: 'lead' },
    { beat: 13, pitch: NOTE.F5, duration: 1, type: 'square', voice: 'lead' },
    { beat: 14, pitch: NOTE.D5, duration: 1, type: 'square', voice: 'lead' },
    { beat: 15, pitch: NOTE.D5, duration: 1, type: 'square', voice: 'lead' },
    { beat: 0, pitch: NOTE.D3, duration: 4, type: 'sawtooth', voice: 'bass' },
    { beat: 4, pitch: NOTE.D3, duration: 4, type: 'sawtooth', voice: 'bass' },
    { beat: 8, pitch: NOTE.G3, duration: 4, type: 'sawtooth', voice: 'bass' },
    { beat: 12, pitch: NOTE.A3, duration: 4, type: 'sawtooth', voice: 'bass' },
  ],
};

const PATTERNS: Record<BgmTrack, BgmPattern> = {
  overworld: OVERWORLD_PATTERN,
  battle: BATTLE_PATTERN,
};

let bgmMasterGain: GainNode | null = null;
let currentTrack: BgmTrack | null = null;
let currentBeat = 0;
let nextNoteTime = 0;
let schedulerTimer: number | null = null;

function ensureBgmMaster(ac: AudioContext): GainNode {
  if (!bgmMasterGain) {
    bgmMasterGain = ac.createGain();
    bgmMasterGain.gain.value = 0;
    bgmMasterGain.connect(ac.destination);
  }
  return bgmMasterGain;
}

function playBgmNote(ac: AudioContext, note: BgmNote, when: number, bpm: number, master: GainNode) {
  const osc = ac.createOscillator();
  const voiceGain = ac.createGain();
  osc.type = note.type;
  osc.frequency.setValueAtTime(note.pitch, when);
  const durationSec = note.duration * (60 / bpm);
  const peak = note.voice === 'lead' ? BGM_LEAD_VOLUME : BGM_BASS_VOLUME;
  voiceGain.gain.setValueAtTime(0, when);
  voiceGain.gain.linearRampToValueAtTime(peak, when + 0.02);
  voiceGain.gain.exponentialRampToValueAtTime(0.001, when + durationSec * 0.95);
  osc.connect(voiceGain).connect(master);
  osc.start(when);
  osc.stop(when + durationSec + 0.05);
}

function scheduler() {
  const ac = getCtx();
  if (!ac || !currentTrack || !bgmMasterGain) {
    schedulerTimer = null;
    return;
  }
  const pattern = PATTERNS[currentTrack];
  const secPerBeat = 60 / pattern.bpm;
  while (nextNoteTime < ac.currentTime + 0.1) {
    const notesAtBeat = pattern.notes.filter(n => n.beat === currentBeat);
    for (const note of notesAtBeat) {
      playBgmNote(ac, note, nextNoteTime, pattern.bpm, bgmMasterGain);
    }
    nextNoteTime += secPerBeat;
    currentBeat = (currentBeat + 1) % pattern.totalBeats;
  }
  schedulerTimer = window.setTimeout(scheduler, 25);
}

export function startBgm(track: BgmTrack): void {
  const ac = getCtx();
  if (!ac) return;
  if (currentTrack === track) return;

  const master = ensureBgmMaster(ac);

  if (currentTrack !== null) {
    master.gain.cancelScheduledValues(ac.currentTime);
    master.gain.setValueAtTime(master.gain.value, ac.currentTime);
    master.gain.linearRampToValueAtTime(0, ac.currentTime + CROSSFADE_SEC / 2);
    master.gain.linearRampToValueAtTime(
      muted ? 0 : BGM_MASTER_VOLUME,
      ac.currentTime + CROSSFADE_SEC,
    );
  } else {
    master.gain.setValueAtTime(0, ac.currentTime);
    master.gain.linearRampToValueAtTime(
      muted ? 0 : BGM_MASTER_VOLUME,
      ac.currentTime + CROSSFADE_SEC,
    );
  }

  currentTrack = track;
  currentBeat = 0;
  nextNoteTime = ac.currentTime + 0.05;
  if (!schedulerTimer) scheduler();
}

export function stopBgm(): void {
  const ac = getCtx();
  if (!ac || !bgmMasterGain) {
    currentTrack = null;
    return;
  }
  bgmMasterGain.gain.cancelScheduledValues(ac.currentTime);
  bgmMasterGain.gain.setValueAtTime(bgmMasterGain.gain.value, ac.currentTime);
  bgmMasterGain.gain.linearRampToValueAtTime(0, ac.currentTime + CROSSFADE_SEC);
  currentTrack = null;
  if (schedulerTimer) {
    clearTimeout(schedulerTimer);
    schedulerTimer = null;
  }
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
