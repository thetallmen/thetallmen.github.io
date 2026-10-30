import { hasFinePointer, prefersReducedMotion, lerp } from '../lib/dom.js';

// Desktop only, and only over the work: a small label (PLAY / VIEW) follows the
// pointer. Everywhere else the normal cursor is left alone.
export function initCustomCursor() {
  if (!hasFinePointer()) return;

  const el = document.createElement('div');
  el.className = 'cursor';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<span class="cursor__label"></span>';
  document.body.appendChild(el);
  const label = el.firstChild;

  let x = -100, y = -100, cx = -100, cy = -100, running = false;
  const ease = prefersReducedMotion() ? 1 : 0.2;

  const tick = () => {
    cx = lerp(cx, x, ease);
    cy = lerp(cy, y, ease);
    el.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
    if (running) requestAnimationFrame(tick);
  };

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    x = e.clientX; y = e.clientY;
  }, { passive: true });

  document.addEventListener('pointerover', (e) => {
    const target = e.target.closest('[data-cursor]');
    const on = Boolean(target) && !document.documentElement.classList.contains('modal-open');
    if (on) {
      label.textContent = target.dataset.cursor;
      if (!running) { running = true; cx = x; cy = y; requestAnimationFrame(tick); }
    }
    el.classList.toggle('is-on', on);
    if (!on) running = false;
  });
}
