import { $ } from '../lib/dom.js';

/* =========================================================================
   THE SOUND — one quiet, continuous sound world, made in the browser.
   Nothing plays until the visitor chooses sound (browsers block it anyway).
   - Ambient bed: a warm minor pad through a slow filter, a soft 90 BPM pulse
     and a very light tick. Each chapter shifts its colour, never restarts it.
   - One effect per meaningful moment: a chapter's object (shutter, keys, focus,
     stylus, swipe, click, clapper), a committed carousel slide, the player,
     the CTA. Never on plain scrolling or every pixel of a drag.
   - Music ducks while a film plays and comes back after.
   Levels: music ≈ 18 %, effects ≈ 28 %, interface ≈ 14 %.

   To use real recordings later, put MP3s in /assets/audio/ and list them in
   FILES (e.g. ambient: 'assets/audio/ambient-main.mp3'). Listed files replace
   the generated sound of the same name; everything else stays generated.
   ========================================================================= */

const FILES = {
  // ambient: 'assets/audio/ambient-main.mp3',
  // shutter: 'assets/audio/hero-camera.mp3',
};

const KEY = 'ttm-sound';
const LEVEL = { music: 0.18, sfx: 0.28, ui: 0.14 };
const store = {
  get() { try { return sessionStorage.getItem(KEY); } catch { return null; } },
  set(v) { try { sessionStorage.setItem(KEY, v); } catch { /* storage blocked */ } },
};

let ctx = null, master, music, sfx, ui, bedFilter, pulseGain, tickGain, noiseBuf;
let on = false, started = false, ducked = false, lastUi = 0;
const buffers = {};

function makeNoise() {
  const b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i += 1) d[i] = Math.random() * 2 - 1;
  return b;
}

function env(g, t, a, peak, release) {
  g.gain.cancelScheduledValues(t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + release);
}

function noise(dest, { t = ctx.currentTime, type = 'bandpass', f = 1200, f2 = f, q = 0.8, a = 0.005, peak = 0.5, release = 0.2 }) {
  const src = ctx.createBufferSource(); src.buffer = noiseBuf;
  const fl = ctx.createBiquadFilter(); fl.type = type; fl.Q.value = q;
  fl.frequency.setValueAtTime(f, t); fl.frequency.exponentialRampToValueAtTime(Math.max(40, f2), t + a + release);
  const g = ctx.createGain();
  src.connect(fl).connect(g).connect(dest);
  env(g, t, a, peak, release);
  src.start(t, Math.random()); src.stop(t + a + release + 0.05);
}

function tone(dest, { t = ctx.currentTime, type = 'sine', f = 440, f2 = f, a = 0.01, peak = 0.3, release = 0.2 }) {
  const o = ctx.createOscillator(); o.type = type;
  o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f2, t + a + release);
  const g = ctx.createGain();
  o.connect(g).connect(dest);
  env(g, t, a, peak, release);
  o.start(t); o.stop(t + a + release + 0.05);
}

/* ---------- Ambient bed ---------- */

function startBed() {
  if (FILES.ambient && buffers.ambient) {
    const src = ctx.createBufferSource(); src.buffer = buffers.ambient; src.loop = true;
    src.connect(music); src.start();
    return;
  }
  bedFilter = ctx.createBiquadFilter(); bedFilter.type = 'lowpass'; bedFilter.frequency.value = 700; bedFilter.Q.value = 0.6;
  const pad = ctx.createGain(); pad.gain.value = 0.16;
  pad.connect(bedFilter).connect(music);
  // A minor 9 voicing, each voice slightly detuned, breathing slowly.
  [110, 164.81, 196, 246.94, 261.63].forEach((f, i) => {
    [-4, 4].forEach((cents) => {
      const o = ctx.createOscillator(); o.type = i === 0 ? 'sine' : 'triangle';
      o.frequency.value = f; o.detune.value = cents;
      const g = ctx.createGain(); g.gain.value = i === 0 ? 0.5 : 0.16;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.05 + i * 0.013;
      const lg = ctx.createGain(); lg.gain.value = g.gain.value * 0.45;
      lfo.connect(lg).connect(g.gain); lfo.start();
      o.connect(g).connect(pad); o.start();
    });
  });
  const sweep = ctx.createOscillator(); sweep.frequency.value = 0.03;
  const sg = ctx.createGain(); sg.gain.value = 260;
  sweep.connect(sg).connect(bedFilter.frequency); sweep.start();

  // Soft pulse + light tick, scheduled ahead (90 BPM).
  pulseGain = ctx.createGain(); pulseGain.gain.value = 0.55; pulseGain.connect(music);
  tickGain = ctx.createGain(); tickGain.gain.value = 0.0; tickGain.connect(music);
  const beat = 60 / 90;
  let next = ctx.currentTime + 0.2, n = 0;
  const schedule = () => {
    while (next < ctx.currentTime + 0.6) {
      if (n % 2 === 0) tone(pulseGain, { t: next, f: 72, f2: 42, a: 0.004, peak: 0.5, release: 0.42 });
      noise(tickGain, { t: next + beat / 2, type: 'highpass', f: 7000, a: 0.002, peak: 0.35, release: 0.05 });
      next += beat; n += 1;
    }
  };
  setInterval(() => { if (ctx.state === 'running') schedule(); }, 200);
}

// Each chapter colours the same bed: filter brightness and how much tick.
const MOODS = {
  camera: [650, 0], laptop: [820, 0.1], keyboard: [900, 0.35], binoculars: [520, 0.05], stylus: [1000, 0.2],
  phone: [1100, 0.4], mouse: [1200, 0.3], clapper: [780, 0.15], work: [600, 0], clients: [650, 0], hand: [1300, 0.2], footer: [560, 0],
};
export function mood(name) {
  if (!started || !bedFilter) return;
  const [cut, tick] = MOODS[name] || MOODS.camera;
  const t = ctx.currentTime;
  bedFilter.frequency.cancelScheduledValues(t); bedFilter.frequency.setTargetAtTime(cut, t, 1.2);
  tickGain.gain.setTargetAtTime(tick * 0.4, t, 1.2);
  music.gain.setTargetAtTime((ducked ? 0.25 : 1) * LEVEL.music * (name === 'work' ? 0.6 : 1), t, 1);
}

/* ---------- Effects ---------- */

const FX = {
  whoosh: () => noise(sfx, { type: 'bandpass', f: 300, f2: 1800, q: 0.7, a: 0.16, peak: 0.35, release: 0.3 }),
  shutter: () => { const t = ctx.currentTime; noise(sfx, { t, type: 'highpass', f: 2500, a: 0.002, peak: 0.6, release: 0.04 }); noise(sfx, { t: t + 0.07, type: 'bandpass', f: 1800, a: 0.002, peak: 0.5, release: 0.06 }); tone(sfx, { t, f: 140, f2: 90, peak: 0.15, release: 0.08 }); },
  startup: () => { const t = ctx.currentTime; tone(sfx, { t, f: 392, a: 0.05, peak: 0.12, release: 0.9 }); tone(sfx, { t: t + 0.08, f: 587.33, a: 0.05, peak: 0.1, release: 0.9 }); noise(sfx, { t, type: 'highpass', f: 3000, peak: 0.25, release: 0.03 }); },
  keys: () => { const t = ctx.currentTime; [0, 0.11, 0.19, 0.34].forEach((d, i) => noise(sfx, { t: t + d, type: 'bandpass', f: 2600 + i * 300, q: 2, a: 0.002, peak: 0.45, release: 0.035 })); },
  focus: () => { const t = ctx.currentTime; noise(sfx, { t, type: 'bandpass', f: 3200, q: 3, a: 0.002, peak: 0.3, release: 0.03 }); noise(sfx, { t: t + 0.16, type: 'bandpass', f: 3600, q: 3, a: 0.002, peak: 0.35, release: 0.03 }); if (bedFilter) { bedFilter.frequency.setTargetAtTime(380, t, 0.1); bedFilter.frequency.setTargetAtTime(MOODS.binoculars[0], t + 0.9, 0.6); } },
  stylus: () => noise(sfx, { type: 'bandpass', f: 4200, f2: 2600, q: 4, a: 0.06, peak: 0.18, release: 0.55 }),
  swipe: () => noise(sfx, { type: 'highpass', f: 900, f2: 4000, a: 0.05, peak: 0.22, release: 0.22 }),
  click: () => { noise(sfx, { type: 'bandpass', f: 2000, q: 2, a: 0.002, peak: 0.45, release: 0.03 }); tone(sfx, { t: ctx.currentTime + 0.12, f: 520, f2: 780, a: 0.02, peak: 0.08, release: 0.35 }); },
  clap: () => { noise(sfx, { type: 'bandpass', f: 1400, q: 1.2, a: 0.001, peak: 0.7, release: 0.09 }); tone(sfx, { f: 180, f2: 70, a: 0.002, peak: 0.2, release: 0.12 }); },
  rise: () => tone(sfx, { type: 'sine', f: 330, f2: 660, a: 0.25, peak: 0.12, release: 0.6 }),
  slide: () => noise(sfx, { type: 'bandpass', f: 900, f2: 500, q: 0.9, a: 0.04, peak: 0.25, release: 0.18 }),
  film: () => { noise(sfx, { type: 'bandpass', f: 1600, q: 2, a: 0.002, peak: 0.35, release: 0.04 }); noise(sfx, { type: 'lowpass', f: 600, f2: 200, a: 0.05, peak: 0.25, release: 0.3 }); },
  open: () => noise(sfx, { type: 'lowpass', f: 900, f2: 120, a: 0.08, peak: 0.4, release: 0.5 }),
  tick: () => noise(ui, { type: 'highpass', f: 5000, a: 0.001, peak: 0.5, release: 0.025 }),
  confirm: () => { const t = ctx.currentTime; tone(ui, { t, f: 660, peak: 0.25, release: 0.12 }); tone(ui, { t: t + 0.09, f: 990, peak: 0.2, release: 0.2 }); },
};

export function play(name) {
  if (!on || !started) return;
  if (FILES[name] && buffers[name]) {
    const src = ctx.createBufferSource(); src.buffer = buffers[name]; src.connect(name === 'tick' || name === 'confirm' ? ui : sfx); src.start();
    return;
  }
  FX[name]?.();
}

function duck(down) {
  ducked = down;
  if (!started) return;
  music.gain.setTargetAtTime((down ? 0.25 : 1) * LEVEL.music, ctx.currentTime, down ? 0.25 : 0.8);
}

/* ---------- On / off ---------- */

async function boot() {
  if (started) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
  music = ctx.createGain(); music.gain.value = LEVEL.music; music.connect(master);
  sfx = ctx.createGain(); sfx.gain.value = LEVEL.sfx; sfx.connect(master);
  ui = ctx.createGain(); ui.gain.value = LEVEL.ui; ui.connect(master);
  noiseBuf = makeNoise();
  await Promise.all(Object.entries(FILES).map(async ([k, url]) => {
    try { buffers[k] = await ctx.decodeAudioData(await (await fetch(url)).arrayBuffer()); } catch { /* keep the generated sound */ }
  }));
  startBed();
  started = true;
}

export async function setSound(next) {
  on = next;
  store.set(on ? 'on' : 'off');
  document.documentElement.classList.toggle('sound-on', on);
  const btn = $('[data-sound-toggle]');
  if (btn) {
    btn.setAttribute('aria-pressed', String(on));
    $('[data-sound-label]', btn).textContent = on ? 'Sound on' : 'Sound off';
  }
  if (on) {
    await boot();
    if (!ctx) return;
    await ctx.resume();
    // Fade in over ~2.5 s, never a sudden start.
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(1, ctx.currentTime, 0.8);
  } else if (ctx) {
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
  }
}

export const soundWanted = () => store.get() === 'on';

export function SoundToggle() {
  return `
  <button class="sound-toggle" type="button" aria-pressed="false" data-sound-toggle aria-label="Sound">
    <span class="sound-toggle__bars" aria-hidden="true"><span></span><span></span><span></span><span></span></span>
    <span class="sound-toggle__label meta" data-sound-label>Sound off</span>
  </button>`;
}

export function initSound() {
  const btn = $('[data-sound-toggle]');
  btn?.addEventListener('click', () => { setSound(!on); if (!on) return; play('confirm'); });

  // Remembered "on" from earlier in the session: resume on the first gesture.
  if (soundWanted()) {
    const resume = () => { setSound(true); window.removeEventListener('pointerdown', resume); window.removeEventListener('keydown', resume); };
    window.addEventListener('pointerdown', resume, { once: true });
    window.addEventListener('keydown', resume, { once: true });
  }

  // Film open / close: duck the music and mark the moment.
  new MutationObserver(() => {
    const open = document.documentElement.classList.contains('modal-open');
    if (open !== ducked) { duck(open); play(open ? 'open' : 'slide'); }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  // Committed carousel slides only.
  window.addEventListener('ttm:slide', (e) => play(e.detail && e.detail.video ? 'film' : 'slide'));

  // Small tactile ticks on deliberate controls (throttled).
  document.addEventListener('pointerover', (e) => {
    const el = e.target.closest('.btn, .site-nav__link, .cs-arrow, .cs__cta, .sound-toggle, .ch-list__link');
    if (!el || el.contains(e.relatedTarget)) return;
    const now = performance.now();
    if (now - lastUi > 90) { lastUi = now; play('tick'); }
  });
  document.addEventListener('click', (e) => { if (e.target.closest('.btn--big, .site-header__cta')) play('confirm'); });
}
