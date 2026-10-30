// The motion language. Every move has a job:
//  - Headlines rise out of a mask, then the Red Trace marks the one phrase that matters.
//  - Work is revealed by a clip (never blurred, tilted or darkened) and then stays still.
//  - Each discipline's object performs its own short entrance, once.
//  - The hero viewfinder cuts through the films; the contact cursor travels to the button.
//  - Light parallax on desktop only. Scrolling itself stays native: it never fights
//    the keyboard, find-in-page or assistive technology.
// With prefers-reduced-motion everything is simply shown in its final state.

import { $, $$, pad2, prefersReducedMotion, hasFinePointer, saveData, lerp } from './lib/dom.js';

const root = document.documentElement;
const reduce = prefersReducedMotion();

export function initMotion() {
  initReveals();
  initChrome();
  initPreviews();
  initHeroReel();
  initContact();
  if (!reduce) initCamera();
  // Fonts and lazy images change heights after the first render.
  window.addEventListener('load', () => window.ScrollTrigger?.refresh());
}

/* ---------- Reveals ---------- */

function reveal(el) {
  if (el.classList.contains('is-in')) return;
  el.classList.add('is-in');
  // Once the lines have risen, let the Red Trace overflow the line masks.
  if (el.querySelector('.line')) setTimeout(() => el.classList.add('is-settled'), reduce ? 0 : 1100);
  if (el.dataset.rv === 'plate') playObject(el);
}

function initReveals() {
  const els = $$('[data-rv]').filter((el) => !el.closest('[data-hero]'));
  if (reduce || !('IntersectionObserver' in window)) { els.forEach(reveal); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      reveal(e.target);
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
  els.forEach((el) => io.observe(el));
}

export function playIntro() {
  const hero = $('[data-hero]');
  if (!hero) return;
  requestAnimationFrame(() => {
    hero.classList.add('is-in');
    $$('[data-rv]', hero).forEach(reveal);
  });
}

/* ---------- Object entrances ---------- */

// Move a follower along a path while the path draws behind it.
function follow(path, follower, ms, done) {
  const len = path.getTotalLength();
  const set = (t) => {
    const p = path.getPointAtLength(len * t);
    path.style.strokeDashoffset = String(1 - t);
    follower.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
  };
  if (reduce) { set(1); done?.(); return; }
  set(0);
  const start = performance.now();
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const tick = (now) => {
    const t = Math.min(1, (now - start) / ms);
    set(ease(t));
    if (t < 1) requestAnimationFrame(tick); else done?.();
  };
  requestAnimationFrame(tick);
}

function playObject(plate) {
  const path = $('[data-follow-path]', plate);
  const follower = $('[data-follower]', plate);
  if (!path || !follower) return;
  // Park at the start of the route until the ink has drawn, then move.
  const p0 = path.getPointAtLength(0);
  follower.setAttribute('transform', `translate(${p0.x} ${p0.y})`);
  setTimeout(() => follow(path, follower, 1500, () => plate.classList.add('is-done')), reduce ? 0 : 900);
}

/* ---------- Header, progress, active section ---------- */

function initChrome() {
  const bar = $('[data-progress]');
  const header = $('[data-header]');
  let lastY = window.scrollY, ticking = false;
  const frame = () => {
    ticking = false;
    const y = window.scrollY, vh = window.innerHeight, max = root.scrollHeight - vh;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (header && !root.classList.contains('menu-open')) {
      header.classList.toggle('is-hidden', !reduce && y > lastY + 2 && y > vh * 0.8);
      if (y < lastY - 2) header.classList.remove('is-hidden');
      header.classList.toggle('is-solid', y > 24);
    }
    lastY = y;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  frame();

  // Underline the menu item of the section in view.
  const links = $$('[data-nav-link]');
  if (!links.length || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.toggleAttribute('aria-current', a.getAttribute('href') === `#${e.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach((a) => { const s = document.getElementById(a.getAttribute('href').slice(1)); if (s) io.observe(s); });
}

/* ---------- Work previews: hover on desktop, in view on phones ---------- */

function initPreviews() {
  if (reduce || saveData()) return;
  const items = $$('.media').filter((m) => $('[data-preview]', m));
  const play = (m) => {
    const v = $('video', m);
    if (root.classList.contains('modal-open')) return;
    if (!v.src) v.src = v.dataset.preview;
    v.play().then(() => m.classList.add('is-playing')).catch(() => {});
  };
  const stop = (m) => { $('video', m).pause(); m.classList.remove('is-playing'); };

  if (hasFinePointer()) {
    items.forEach((m) => {
      m.addEventListener('pointerenter', () => play(m));
      m.addEventListener('pointerleave', () => stop(m));
    });
    return;
  }
  // Touch: the film most in view plays its silent loop, one at a time.
  let current = null;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting && e.intersectionRatio >= 0.7) {
        if (current && current !== e.target) stop(current);
        current = e.target; play(e.target);
      } else if (e.target === current) { stop(e.target); current = null; }
    });
  }, { threshold: [0, 0.7] });
  items.forEach((m) => io.observe(m));
}

/* ---------- Hero viewfinder: a silent cut through the films ---------- */

function initHeroReel() {
  const vf = $('[data-viewfinder]');
  if (!vf) return;
  const video = $('video', vf);
  const btn = $('.vf__play', vf);
  const tc = $('[data-timecode]', vf);
  let list = [];
  try { list = JSON.parse(video.dataset.reel || '[]'); } catch { /* no reel */ }
  if (!list.length) return;
  let at = 0, inView = true, frames = 0, last = 0;

  const load = (i) => {
    at = i % list.length;
    const it = list[at];
    video.poster = it.poster;
    video.src = it.src;
    btn.dataset.openVideo = it.full;
    btn.dataset.videoPoster = it.poster;
    vf.classList.remove('is-cut'); void vf.offsetWidth; vf.classList.add('is-cut');
  };
  const allowed = !reduce && !saveData();
  const tryPlay = () => { if (allowed && inView && !root.classList.contains('modal-open')) video.play().catch(() => {}); };

  if (allowed) {
    load(0);
    video.addEventListener('ended', () => { load(at + 1); tryPlay(); });
    video.addEventListener('canplay', tryPlay);
    window.addEventListener('ttm:modal-closed', tryPlay);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { inView = e.isIntersecting; if (inView) tryPlay(); else video.pause(); }, { threshold: 0.2 }).observe(vf);
    }
    // Timecode runs while the camera rolls (25 fps).
    const tick = (now) => {
      if (!video.paused) {
        frames += ((now - last) / 1000) * 25;
        const f = Math.floor(frames), s = Math.floor(f / 25);
        tc.textContent = `00:${pad2(Math.floor(s / 60) % 60)}:${pad2(s % 60)}:${pad2(f % 25)}`;
      }
      last = now;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame((t) => { last = t; tick(t); });
  }
  // The whole frame is a play button.
  vf.addEventListener('click', (e) => { if (e.target !== btn) btn.click(); });

  // Desktop: the camera follows the pointer a little.
  if (!reduce && hasFinePointer()) {
    const hero = $('[data-hero]');
    let tx = 0, ty = 0, x = 0, y = 0;
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
    });
    hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; });
    const move = () => {
      x = lerp(x, tx, 0.06); y = lerp(y, ty, 0.06);
      vf.style.transform = `translate3d(${(x * 18).toFixed(2)}px, ${(y * 14).toFixed(2)}px, 0) rotate(${(x * 1.2).toFixed(3)}deg)`;
      requestAnimationFrame(move);
    };
    requestAnimationFrame(move);
  }
}

/* ---------- Contact: the cursor travels to the button and clicks ---------- */

function initContact() {
  const sec = $('[data-contact]');
  const target = $('[data-cta-target] .btn', sec || document);
  if (!sec || !target) return;
  const svg = $('.contact__path', sec);
  const path = $('.contact__route', svg);
  const cursor = $('.contact__cursor', svg);

  const run = () => {
    const s = sec.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    const w = s.width, h = s.height;
    svg.setAttribute('viewBox', `0 0 ${w.toFixed(0)} ${h.toFixed(0)}`);
    const bx = b.left - s.left + b.width * 0.82, by = b.top - s.top + b.height * 0.62;
    const sx = w * 0.94, sy = Math.min(h - 30, by + h * 0.32);
    path.setAttribute('d', `M${sx.toFixed(1)} ${sy.toFixed(1)} C${(sx - w * 0.04).toFixed(1)} ${(sy - h * 0.2).toFixed(1)} ${(bx + w * 0.3).toFixed(1)} ${(by + h * 0.12).toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`);
    sec.classList.add('is-routing');
    follow(path, cursor, 1700, () => {
      sec.classList.add('is-clicked');
      setTimeout(() => sec.classList.add('is-rested'), 700);
    });
  };
  if (reduce || !('IntersectionObserver' in window)) { sec.classList.add('is-clicked', 'is-rested'); return; }
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    setTimeout(run, 900);
  }, { threshold: 0.45 });
  io.observe(sec);
}

/* ---------- Scroll-scrubbed camera work (GSAP, desktop) ---------- */

function initCamera() {
  const { gsap, ScrollTrigger } = window;
  const fill = $('[data-process-fill]');
  const proc = $('[data-process]');
  if (!gsap || !ScrollTrigger) {
    if (fill) fill.style.transform = 'scaleX(1)';
    $$('[data-step]').forEach((s) => s.classList.add('is-active'));
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  root.classList.add('has-gsap');

  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    // Light parallax on the hero camera and character.
    $$('[data-parallax]').forEach((el) => {
      const p = Number(el.dataset.parallax) || 0;
      gsap.fromTo(el, { yPercent: 0 }, {
        yPercent: p * -100, ease: 'none',
        scrollTrigger: { trigger: el.closest('section') || el, start: 'top top', end: 'bottom top', scrub: true },
      });
    });
    // The picture drifts slowly inside its frame while the frame stays put.
    $$('.selected .media__frame > *').forEach((el) => {
      gsap.fromTo(el, { yPercent: -4 }, {
        yPercent: 4, ease: 'none',
        scrollTrigger: { trigger: el.closest('.media'), start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  });

  // The process line fills as the steps pass the middle of the screen.
  if (proc && fill) {
    gsap.fromTo(fill, { scaleX: 0 }, {
      scaleX: 1, ease: 'none',
      scrollTrigger: {
        trigger: proc, start: 'top 75%', end: 'bottom 50%', scrub: true,
        onUpdate: (self) => {
          const steps = $$('[data-step]', proc);
          steps.forEach((s, i) => s.classList.toggle('is-active', self.progress >= i / steps.length - 0.02));
        },
      },
    });
  }
}

/* ---------- Magnetic buttons ---------- */

export function initMagnetic() {
  if (reduce || !hasFinePointer()) return;
  $$('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate3d(${(e.clientX - (r.left + r.width / 2)) * 0.22}px, ${(e.clientY - (r.top + r.height / 2)) * 0.3}px, 0)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

/* ---------- Anchor scrolling that respects focus ---------- */

export function initAnchors() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
}

