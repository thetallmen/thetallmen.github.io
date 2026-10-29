// Small DOM helpers shared by every component.

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

export const pad2 = (n) => String(n).padStart(2, '0');

export const formatTime = (seconds) => {
  const s = Math.max(0, Math.floor(seconds || 0));
  return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`;
};

export const mq = {
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
  finePointer: window.matchMedia('(hover: hover) and (pointer: fine)'),
  desktop: window.matchMedia('(min-width: 900px)'),
};

export const prefersReducedMotion = () => mq.reducedMotion.matches;
export const hasFinePointer = () => mq.finePointer.matches;
export const isDesktop = () => mq.desktop.matches && mq.finePointer.matches;
export const saveData = () => Boolean(navigator.connection && navigator.connection.saveData);

// Wrap each word in a mask span so it can slide up. The readable text stays on
// the parent through aria-label, and the word spans are hidden from screen readers.
export function splitWords(el) {
  if (!el || el.dataset.split === 'done') return [];
  const text = el.textContent.trim().replace(/\s+/g, ' ');
  el.setAttribute('aria-label', text);
  el.innerHTML = text
    .split(' ')
    .map((w, i) => `<span class="w" aria-hidden="true"><span class="w-i" style="--i:${i}">${esc(w)}</span></span>`)
    .join(' ');
  el.dataset.split = 'done';
  return $$('.w-i', el);
}

// Call cb once when el first comes near the viewport.
export function whenNear(el, cb, rootMargin = '200px 0px') {
  if (!('IntersectionObserver' in window)) return cb();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        io.disconnect();
        cb();
      }
    });
  }, { rootMargin });
  io.observe(el);
}

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
export const lerp = (a, b, t) => a + (b - a) * t;
