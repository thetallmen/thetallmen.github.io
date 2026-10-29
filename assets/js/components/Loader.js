import { esc, prefersReducedMotion } from '../lib/dom.js';

const KEY = 'ttm-intro-seen';

const seen = () => {
  try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; }
};
const markSeen = () => {
  try { sessionStorage.setItem(KEY, '1'); } catch { /* storage blocked: loader simply plays again */ }
};

// Short typographic reveal. Skipped on repeat visits within the session and for reduced motion.
// Resolves when the page is ready to start its own entrance.
export function runLoader(agency) {
  const el = document.querySelector('[data-loader]');
  if (!el) return Promise.resolve();
  if (seen() || prefersReducedMotion()) {
    el.remove();
    return Promise.resolve();
  }
  markSeen();
  el.innerHTML = `
    <div class="loader__mark" aria-hidden="true">
      ${agency.name.split(' ').map((w, i) => `<span class="loader__word${w === 'TALL' ? ' loader__word--tall' : ''}"><span style="--i:${i}">${esc(w)}</span></span>`).join('')}
      <svg class="trace loader__trace" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M30 30 C48 6 90 10 97 40 C104 72 70 96 40 92 C10 88 -2 60 8 38 C16 22 34 14 52 16" pathLength="1"/></svg>
    </div>`;
  el.hidden = false;
  requestAnimationFrame(() => el.classList.add('is-in'));

  return new Promise((resolve) => {
    window.setTimeout(() => {
      el.classList.add('is-out');
      resolve();
      window.setTimeout(() => el.remove(), 900);
    }, 1500);
  });
}
