import { hasFinePointer, prefersReducedMotion, lerp } from '../lib/dom.js';

// Desktop only: a dot that grows into a label over projects (VIEW) and films (PLAY),
// and expands slightly over links. Touch devices never get it.
export function initCustomCursor() {
  if (!hasFinePointer()) return;

  const el = document.createElement('div');
  el.className = 'cursor';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<span class="cursor__dot"></span><span class="cursor__label"></span>';
  document.body.appendChild(el);
  const label = el.querySelector('.cursor__label');
  document.documentElement.classList.add('has-cursor');

  let x = -100, y = -100, cx = -100, cy = -100;
  const ease = prefersReducedMotion() ? 1 : 0.22;

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    x = e.clientX; y = e.clientY;
    el.classList.add('is-visible');
  }, { passive: true });
  document.addEventListener('pointerleave', () => el.classList.remove('is-visible'));

  document.addEventListener('pointerover', (e) => {
    const target = e.target.closest('[data-cursor], a, button, input, label');
    const mode = target && target.dataset.cursor;
    el.classList.toggle('is-label', Boolean(mode));
    el.classList.toggle('is-link', Boolean(target) && !mode);
    label.textContent = mode ? mode.toUpperCase() : '';
  });
  document.addEventListener('pointerdown', () => el.classList.add('is-down'));
  document.addEventListener('pointerup', () => el.classList.remove('is-down'));

  const tick = () => {
    cx = lerp(cx, x, ease);
    cy = lerp(cy, y, ease);
    el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
