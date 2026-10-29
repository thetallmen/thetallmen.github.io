import { $, $$, esc, pad2, plain, rich, prefersReducedMotion } from '../lib/dom.js';
import { parseRatio, projectTitle } from './ProjectItem.js';

/* =========================================================================
   THE REEL (films) and THE PRINTS (designs) — two coverflow carousels.
   Swipe or drag on phones, arrows on desktop. The frame in the middle is in
   focus; its neighbours turn away and fall out of focus (depth of field).
   Films: the centred film plays a silent preview; tap to watch with sound.
   Designs: advance on their own every few seconds, pausing while touched.
   Content comes from content/work.json — add a project and it appears here.
   ========================================================================= */

const Head = (block, id) => `
  <div class="part__inner part__inner--center">
    <p class="meta label" data-fx>${esc(block.label)}</p>
    <h2 class="title title--center" id="${id}" aria-label="${esc(plain(block.title.join(' ')))}">${block.title
      .map((l) => `<span class="line" aria-hidden="true"><span class="line__i">${rich(l)}</span></span>`).join('')}</h2>
    ${block.text ? `<p class="text text--center" data-fx>${esc(block.text)}</p>` : ''}
  </div>`;

const Controls = (label) => `
  <div class="cf__controls">
    <button class="cf__btn" type="button" data-cf-prev aria-label="Previous ${label}">←</button>
    <span class="meta cf__count" data-cf-count aria-live="polite"></span>
    <button class="cf__btn" type="button" data-cf-next aria-label="Next ${label}">→</button>
  </div>`;

// The work speaks for the studio: no project names or write-ups on the frames.
export function Reel({ copy, projects }) {
  const films = [];
  projects.forEach((p, i) => p.videos.forEach((v, k) => films.push({ title: projectTitle(p, i) + (k ? ` ${k + 1}` : ''), v })));
  if (!films.length) return '';
  return `
  <section class="part part--reel" id="work" data-part data-tone="dark" aria-labelledby="reel-title">
    <div class="depth" aria-hidden="true"><div class="depth__glow"></div></div>
    ${Head(copy.reel, 'reel-title')}
    <div class="cf cf--reel" data-cf="reel" data-cf-autoplay="5000" aria-roledescription="carousel" aria-label="Films">
      <ul class="cf__track" data-cf-track>
        ${films.map((f, i) => {
          const [w, h] = parseRatio(f.v.ratio);
          return `
          <li class="cf__item" style="--ar:${w} / ${h}" aria-roledescription="slide" aria-label="${i + 1} of ${films.length}">
            <button class="cf__card" type="button" data-open-video="${esc(f.v.src)}" data-video-title="${esc(f.title)}"
              data-video-ratio="${w}/${h}" data-video-poster="${esc(f.v.poster)}" ${f.v.hasAudio ? 'data-video-sound="true"' : ''}
              data-cursor="play" aria-label="Play ${esc(f.title)}">
              ${f.v.poster ? `<img src="${esc(f.v.poster)}" alt="" loading="lazy" decoding="async">` : ''}
              <video muted loop playsinline preload="none" aria-hidden="true" tabindex="-1" data-cf-preview="${esc(f.v.preview || f.v.src)}"></video>
              <span class="cf__play" aria-hidden="true">▶</span>
            </button>
          </li>`;
        }).join('')}
      </ul>
      ${Controls('film')}
      <div class="cf__bar" aria-hidden="true"><span data-cf-bar></span></div>
    </div>
  </section>`;
}

export function Prints({ copy, projects }) {
  const prints = [];
  projects.forEach((p, i) => p.images.forEach((img) => prints.push({ id: p.id, title: projectTitle(p, i), img })));
  if (!prints.length) return '';
  return `
  <section class="part part--prints" id="designs" data-part data-tone="dark" aria-labelledby="prints-title">
    <div class="depth" aria-hidden="true"><div class="depth__glow depth__glow--alt"></div></div>
    ${Head(copy.designs, 'prints-title')}
    <div class="cf cf--prints" data-cf="prints" data-cf-autoplay="3200" aria-roledescription="carousel" aria-label="Designs">
      <ul class="cf__track" data-cf-track>
        ${prints.map((d, i) => {
          const [w, h] = parseRatio(d.img.ratio);
          return `
          <li class="cf__item" style="--ar:${w} / ${h}" aria-roledescription="slide" aria-label="${i + 1} of ${prints.length}">
            <button class="cf__card" type="button" data-open-gallery="${esc(d.id)}" data-cursor="view" aria-label="View ${esc(d.title)}">
              <img src="${esc(d.img.src)}" alt="${esc(d.img.alt)}" loading="lazy" decoding="async">
            </button>
          </li>`;
        }).join('')}
      </ul>
      ${Controls('design')}
      <div class="cf__bar" aria-hidden="true"><span data-cf-bar></span></div>
    </div>
  </section>`;
}

/* ---------- Behaviour ---------- */

export function initCarousels() {
  $$('[data-cf]').forEach(setup);
}

function setup(root) {
  const track = $('[data-cf-track]', root);
  const items = $$('.cf__item', track);
  const count = $('[data-cf-count]', root);
  const bar = $('[data-cf-bar]', root);
  const isReel = root.dataset.cf === 'reel';
  const reduce = prefersReducedMotion();
  let active = -1, ticking = false;
  items.forEach((el, i) => el.style.setProperty('--i', i));

  const centerOf = (el) => el.offsetLeft + el.offsetWidth / 2;

  // Coverflow: each item's distance from the centre drives tilt, scale and blur.
  const update = () => {
    ticking = false;
    const mid = track.scrollLeft + track.clientWidth / 2;
    let best = 0, bestD = Infinity;
    items.forEach((el, i) => {
      const d = (centerOf(el) - mid) / el.offsetWidth;
      const c = Math.max(-2, Math.min(2, d));
      el.style.setProperty('--d', c.toFixed(3));
      el.style.setProperty('--ad', Math.abs(c).toFixed(3));
      if (Math.abs(d) < bestD) { bestD = Math.abs(d); best = i; }
    });
    if (best !== active) {
      active = best;
      items.forEach((el, i) => el.classList.toggle('is-active', i === best));
      count.textContent = `${pad2(best + 1)} / ${pad2(items.length)}`;
      if (isReel) playActive();
    }
  };
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };

  const go = (i) => {
    const n = (i + items.length) % items.length;
    const el = items[n];
    track.scrollTo({ left: centerOf(el) - track.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
  };

  $('[data-cf-prev]', root).addEventListener('click', () => { go(active - 1); pause(); });
  $('[data-cf-next]', root).addEventListener('click', () => { go(active + 1); pause(); });
  track.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);

  // Desktop: drag to scroll.
  let drag = null;
  track.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') drag = { x: e.clientX, left: track.scrollLeft, moved: false }; });
  window.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 4) { drag.moved = true; root.classList.add('is-dragging'); }
    track.scrollLeft = drag.left - dx;
  });
  window.addEventListener('pointerup', () => { if (!drag) return; const moved = drag.moved; drag = null; root.classList.remove('is-dragging'); if (moved) { go(active); pause(); } });
  track.addEventListener('click', (e) => { if (root.classList.contains('was-dragged')) e.stopPropagation(); }, true);

  // Films: only the centred film plays its silent preview, and only while in view.
  let inView = false;
  function playActive() {
    items.forEach((el, i) => {
      const v = $('video', el);
      if (!v) return;
      if (i === active && inView && !reduce && !document.documentElement.classList.contains('modal-open')) {
        if (!v.src) v.src = v.dataset.cfPreview;
        if (!el.classList.contains('is-playing')) { try { v.currentTime = 0; } catch { /* not loaded yet */ } }
        v.play().then(() => el.classList.add('is-playing')).catch(() => {});
      } else { v.pause(); el.classList.remove('is-playing'); }
    });
  }

  // Designs: autoplay, paused while the visitor is touching or hovering.
  const delay = Number(root.dataset.cfAutoplay) || 0;
  let timer = null, paused = false, idle = null;
  const startBar = () => {
    if (!bar) return;
    bar.style.transition = 'none'; bar.style.transform = 'scaleX(0)';
    requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.transition = `transform ${delay}ms linear`; bar.style.transform = 'scaleX(1)'; }));
  };
  const schedule = () => {
    clearTimeout(timer);
    if (!delay || paused || !inView || reduce) return;
    startBar();
    timer = setTimeout(() => { go(active + 1); schedule(); }, delay);
  };
  function pause() {
    if (!delay) return;
    paused = true; clearTimeout(timer); if (bar) { bar.style.transition = 'none'; bar.style.transform = 'scaleX(0)'; }
    clearTimeout(idle); idle = setTimeout(() => { paused = false; schedule(); }, 5000);
  }
  ['pointerdown', 'touchstart', 'wheel', 'focusin'].forEach((ev) => track.addEventListener(ev, pause, { passive: true }));
  root.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { paused = true; clearTimeout(timer); } });
  root.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { paused = false; schedule(); } });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (isReel) playActive();
      if (inView) schedule(); else clearTimeout(timer);
    }, { threshold: 0.35 }).observe(root);
  }

  // Start on the first item, centred.
  requestAnimationFrame(() => { track.scrollLeft = centerOf(items[0]) - track.clientWidth / 2; update(); });
}
