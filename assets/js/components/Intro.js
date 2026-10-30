import { $, $$, esc, prefersReducedMotion } from '../lib/dom.js';
import { setSound, play } from './Sound.js';

/* =========================================================================
   THE INTRO — about two seconds, then the visitor decides how to enter.
   1. A red line grows up the middle of the page: height.
   2. THE / TALL / MEN rise out of their masks; TALL stands taller.
   3. "Enter with sound" or "Enter without sound" (the click is what lets the
      browser play sound at all). Nothing chosen within a few seconds: enter quietly.
   4. A camera shutter closes and opens on the hero; with sound, it clicks.
   Later visits in the same session get a short version without the question.
   ========================================================================= */

const KEY = 'ttm-intro';
const seen = () => { try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; } };
const markSeen = () => { try { sessionStorage.setItem(KEY, '1'); } catch { /* storage blocked */ } };

export function IntroMarkup(agency) {
  const words = agency.name.split(' ');
  return `
  <div class="intro" data-intro role="dialog" aria-modal="true" aria-label="${esc(agency.name)}">
    <div class="intro__stage">
      <span class="intro__line" aria-hidden="true"></span>
      <p class="intro__mark" aria-hidden="true">${words.map((w, i) => `<span class="intro__w${/tall/i.test(w) ? ' intro__w--tall' : ''}"><span style="--i:${i}">${esc(w)}</span></span>`).join('')}</p>
      <p class="meta intro__sub">${esc(agency.descriptor)} — ${esc(agency.city)}</p>
      <p class="meta intro__count" aria-hidden="true"><span data-intro-count>000</span></p>
      <div class="intro__enter" data-intro-enter>
        <button class="btn intro__btn" type="button" data-enter="sound"><span class="btn__label">Enter with sound</span><span class="btn__arrow" aria-hidden="true">→</span></button>
        <button class="link-line intro__quiet" type="button" data-enter="quiet">Enter without sound</button>
      </div>
    </div>
    <div class="intro__shutter intro__shutter--a" aria-hidden="true"></div>
    <div class="intro__shutter intro__shutter--b" aria-hidden="true"></div>
  </div>`;
}

// Resolves once the hero is uncovered.
export function runIntro() {
  const el = $('[data-intro]');
  if (!el) return Promise.resolve();
  const reduce = prefersReducedMotion();
  const short = seen();
  markSeen();
  document.documentElement.classList.add('intro-open');
  const count = $('[data-intro-count]', el);

  return new Promise((resolve) => {
    let left = false, auto;
    const leave = (withSound) => {
      if (left) return;
      left = true;
      clearTimeout(auto);
      if (withSound) setSound(true).then(() => setTimeout(() => play('shutter'), 120));
      el.classList.add('is-shut');
      setTimeout(() => {
        el.classList.add('is-open');
        document.documentElement.classList.remove('intro-open');
        resolve();
        setTimeout(() => el.remove(), 900);
      }, reduce ? 0 : 420);
    };

    $$('[data-enter]', el).forEach((b) => b.addEventListener('click', () => leave(b.dataset.enter === 'sound')));
    el.addEventListener('keydown', (e) => { if (e.key === 'Escape') leave(false); });

    requestAnimationFrame(() => el.classList.add('is-1'));
    // The counter runs to 100 while the letters rise.
    const t0 = performance.now(), dur = reduce ? 1 : short ? 500 : 1500;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      count.textContent = String(Math.round(p * 100)).padStart(3, '0');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    if (short) {
      // Second visit: no question; sound follows the earlier choice on first gesture.
      setTimeout(() => leave(false), reduce ? 0 : 1100);
      return;
    }
    setTimeout(() => {
      el.classList.add('is-ready');
      $('[data-enter="sound"]', el).focus({ preventScroll: true });
      // Nobody chose: enter quietly (the header toggle still turns sound on).
      auto = setTimeout(() => leave(false), 6000);
    }, reduce ? 0 : 1650);
  });
}
