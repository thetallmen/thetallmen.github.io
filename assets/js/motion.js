// One motion language for the whole site: masked word reveals, a scroll-scrubbed
// intro, restrained parallax, media scaling, magnetic buttons, process progress.
// Everything here is skipped or flattened when prefers-reduced-motion is set.

import { $, $$, esc, splitWords, clamp, lerp, prefersReducedMotion, hasFinePointer } from './lib/dom.js';

const root = document.documentElement;

/* ---------- Reveal on enter ---------- */

export function initReveals() {
  const targets = $$('[data-reveal]');
  targets.filter((el) => el.dataset.reveal === 'words').forEach(splitWords);

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  targets.forEach((el) => {
    if (el.closest('[data-hero]')) return; // the hero has its own entrance
    io.observe(el);
  });
}

export function playHeroEntrance() {
  const hero = $('[data-hero]');
  if (!hero) return;
  hero.classList.add('is-in');
  $$('[data-reveal]', hero).forEach((el) => el.classList.add('is-in'));
}

/* ---------- Scroll + pointer driven effects (single rAF loop) ---------- */

export function initScrollEffects() {
  const reduce = prefersReducedMotion();
  const progressBar = $('[data-progress]');
  const header = $('[data-header]');
  const hero = $('[data-hero]');
  const heroLines = $$('.hero__line', hero || document);
  const scrubEl = $('[data-scrub-words]');
  const scrubWords = scrubEl ? splitScrub(scrubEl) : [];
  const process = $('[data-process]');
  const fill = $('[data-process-fill]');
  const steps = $$('[data-step]');
  const scaleTargets = $$('.project__frame, .film__frame');

  let mouseX = 0, mouseY = 0, curX = 0, curY = 0;
  let lastY = window.scrollY;
  let ticking = false;

  if (!reduce && hasFinePointer() && hero) {
    hero.addEventListener('pointermove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      request();
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { mouseX = 0; mouseY = 0; request(); });
  }

  function frame() {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    const max = root.scrollHeight - vh;

    if (progressBar) progressBar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    // Header hides while reading downward, returns on the way up.
    if (header && !root.classList.contains('menu-open')) {
      const down = y > lastY && y > vh * 0.6;
      header.classList.toggle('is-hidden', down);
    }
    lastY = y;

    // Hero: lines drift apart on scroll and lean toward the pointer.
    curX = lerp(curX, mouseX, 0.08);
    curY = lerp(curY, mouseY, 0.08);
    if (!reduce && hero && y < vh * 1.2) {
      heroLines.forEach((line) => {
        const d = Number(line.dataset.depth || 0);
        line.style.transform = `translate3d(${curX * d * -14}px, ${-y * d * 0.22 + curY * d * -6}px, 0)`;
      });
    }

    // Intro: words brighten as the paragraph moves through the viewport.
    if (scrubWords.length) {
      const r = scrubEl.getBoundingClientRect();
      const p = reduce ? 1 : clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0, 1);
      const lit = p * scrubWords.length;
      scrubWords.forEach((w, i) => w.style.setProperty('--o', String(clamp(lit - i, 0.16, 1))));
    }

    // Process: the rail fills as the steps pass the middle of the screen.
    if (process && fill) {
      const r = $('.process__steps', process).getBoundingClientRect();
      const p = clamp((vh * 0.6 - r.top) / r.height, 0, 1);
      fill.style.transform = `scaleY(${p})`;
      steps.forEach((s) => s.classList.toggle('is-active', s.getBoundingClientRect().top < vh * 0.6));
    }

    // Media settles from a slight zoom to rest as it enters.
    if (!reduce) {
      scaleTargets.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = clamp((vh - r.top) / (vh + r.height * 0.5), 0, 1);
        el.style.setProperty('--zoom', (1.06 - p * 0.06).toFixed(4));
      });
    }

    if (Math.abs(curX - mouseX) > 0.001 || Math.abs(curY - mouseY) > 0.001) request();
  }

  function request() {
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
  }

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  request();
}

function splitScrub(el) {
  const text = el.textContent.trim().replace(/\s+/g, ' ');
  el.setAttribute('aria-label', text);
  el.innerHTML = text.split(' ').map((w) => `<span class="sw" aria-hidden="true">${esc(w)}</span>`).join(' ');
  return $$('.sw', el);
}

/* ---------- Magnetic buttons ---------- */

export function initMagnetic() {
  if (prefersReducedMotion() || !hasFinePointer()) return;
  $$('[data-magnetic]').forEach((el) => {
    const strength = 0.28;
    const target = el.closest('[data-open-video]') || el;
    target.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`;
    });
    target.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

/* ---------- Smooth anchor scrolling that respects focus ---------- */

export function initAnchors() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    // Move keyboard focus with the scroll so screen readers follow.
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
}
