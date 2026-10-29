// The film's motion language.
//  1. Scene entrances (IntersectionObserver + CSS): headline lines rise, copy
//     fades up, the Tall Man racks into focus, then the RED TRACE draws itself.
//  2. Scroll-scrubbed camera work (GSAP ScrollTrigger, when it loads): depth
//     layers parallax at different speeds, each scene racks out of focus as
//     the next one arrives, the sector roll slides, the process line fills.
// With prefers-reduced-motion everything is simply shown, nothing moves.

import { $, $$, prefersReducedMotion, hasFinePointer } from './lib/dom.js';

const root = document.documentElement;

export function initFilm() {
  const reduce = prefersReducedMotion();
  const scenes = $$('[data-scene]');

  // 1. Entrances.
  if (reduce || !('IntersectionObserver' in window)) {
    scenes.forEach((s) => s.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.18 });
    scenes.forEach((s) => { if (!s.hasAttribute('data-hero')) io.observe(s); });
  }

  initChrome(reduce);
  if (!reduce) initCamera();
}

export function playOpening() {
  $('[data-hero]')?.classList.add('is-in');
}

// Progress bar + header that steps aside while reading down.
function initChrome(reduce) {
  const bar = $('[data-progress]');
  const header = $('[data-header]');
  let lastY = window.scrollY, ticking = false;
  const frame = () => {
    ticking = false;
    const y = window.scrollY, vh = window.innerHeight, max = root.scrollHeight - vh;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (header && !root.classList.contains('menu-open')) {
      header.classList.toggle('is-hidden', !reduce && y > lastY && y > vh * 0.6);
      header.classList.toggle('is-solid', y > 24);
    }
    lastY = y;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  frame();
}

// 2. Scrubbed camera work. GSAP is loaded from a CDN in index.html; if it
// isn't there, the site still works with entrances only.
function initCamera() {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  root.classList.add('has-gsap');

  const mm = gsap.matchMedia();
  mm.add({ desktop: '(min-width: 900px)', mobile: '(max-width: 899px)' }, (ctx) => {
    const { desktop } = ctx.conditions;

    $$('[data-scene]').forEach((scene) => {
      const inner = $('.scene__inner', scene);
      const stage = $('[data-stage]', scene);

      // Depth layers drift at their own speed: far moves against the scroll, near with it.
      $$('[data-depth]', scene).forEach((layer) => {
        const d = Number(layer.dataset.depth) || 0;
        gsap.fromTo(layer, { yPercent: -d * 40 }, {
          yPercent: d * 40, ease: 'none',
          scrollTrigger: { trigger: scene, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });

      // The Tall Man rises a little as the scene plays: the low-angle push-in.
      if (stage) {
        gsap.fromTo(stage, { yPercent: 6, scale: 0.96 }, {
          yPercent: -4, scale: 1.02, ease: 'none',
          scrollTrigger: { trigger: scene, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      }

      // Rack focus out as the next scene takes over (blur only on desktop, it's costly on phones).
      if (inner && !scene.matches('.scene--reel, .scene--prints')) {
        gsap.to(inner, {
          opacity: 0.15, scale: desktop ? 1.05 : 1.02, filter: desktop ? 'blur(10px)' : 'none', ease: 'none',
          scrollTrigger: { trigger: scene, start: 'bottom 70%', end: 'bottom 10%', scrub: true },
        });
      }
    });

    // Sector credits slide sideways with the scroll.
    const roll = $('[data-roll]');
    if (roll) {
      gsap.fromTo(roll, { xPercent: 10 }, {
        xPercent: -45, ease: 'none',
        scrollTrigger: { trigger: roll, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      });
    }

    // Markets light up one after another.
    $$('[data-markets] .market').forEach((m, i, all) => {
      ScrollTrigger.create({
        trigger: m.closest('[data-scene]'), start: () => `top+=${(i / all.length) * 40}% 60%`,
        onEnter: () => m.classList.add('is-lit'), onLeaveBack: () => m.classList.remove('is-lit'),
      });
    });

    // Process line fills as the steps pass the middle of the screen.
    const proc = $('[data-process]');
    const fill = $('[data-process-fill]');
    if (proc && fill) {
      gsap.fromTo(fill, { scaleX: 0 }, {
        scaleX: 1, ease: 'none',
        scrollTrigger: {
          trigger: proc, start: 'top 75%', end: 'bottom 45%', scrub: true,
          onUpdate: (self) => {
            const steps = $$('[data-step]', proc);
            steps.forEach((s, i) => s.classList.toggle('is-active', self.progress >= i / steps.length - 0.02));
          },
        },
      });
    }
  });

  // Carousels and fonts change heights after load; re-measure once settled.
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

/* ---------- Magnetic buttons ---------- */

export function initMagnetic() {
  if (prefersReducedMotion() || !hasFinePointer()) return;
  $$('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate3d(${(e.clientX - (r.left + r.width / 2)) * 0.25}px, ${(e.clientY - (r.top + r.height / 2)) * 0.25}px, 0)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
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
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
}
