import { $, $$, esc, pad2, prefersReducedMotion, hasFinePointer, saveData } from '../lib/dom.js';
import { parseRatio, projectTitle } from './ProjectItem.js';

/* =========================================================================
   SELECTED WORK — an editorial carousel of large canvases.
   Images and films live in one sequence. Every piece keeps its own colours
   and its real proportions: vertical reels stand inside a wider canvas with
   their details beside them, widescreen films take the whole canvas.
   The active canvas is full size; its neighbours are a little smaller and
   still sharp, so the next project is always recognisable.
   Move it by swipe, drag, trackpad, arrows (buttons or keyboard).
   Desktop: hovering a film plays its silent preview. Sound only in the player.
   ========================================================================= */

// "BYD — Cairo West launch" → name "Cairo West launch", client "BYD".
function names(p, i) {
  const full = projectTitle(p, i);
  const [head, ...tail] = full.split(/\s+[—–-]\s+/);
  const client = p.client || head;
  return { full, client, name: tail.join(' — ') || (head !== client ? head : '') };
}

function Slide(p, i, n, all) {
  const idx = all.indexOf(p);
  const v = p.videos[0];
  const img = p.images[0];
  const [w, h] = parseRatio(v ? v.ratio : img.ratio);
  const shape = w > h ? 'land' : 'tall';
  const { full, client, name } = names(p, idx);
  const count = p.videos.length + p.images.length;
  const cats = [v ? 'Film' : 'Design', p.industry, ...p.services].filter(Boolean).join(' / ');
  const open = v && count === 1
    ? `data-open-video="${esc(v.src)}" data-video-title="${esc(full)}" data-video-ratio="${w}/${h}" data-video-poster="${esc(v.poster)}"${v.hasAudio ? ' data-video-sound="true"' : ''}`
    : `data-open-gallery="${esc(p.id)}"`;
  const cta = v ? 'Play film' : 'View project';

  return `
  <li class="cs cs--${shape}" style="--i:${i}" aria-roledescription="slide" aria-label="${i + 1} of ${n}: ${esc(full)}" data-cs>
    <div class="cs__canvas">
      <button class="cs__media" type="button" style="--ratio:${w} / ${h}; --rw:${w}; --rh:${h}" ${open} data-cursor="${v ? 'Play' : 'View'}" tabindex="-1" aria-hidden="true">
        <span class="cs__frame">
          <img class="cs__img" src="${esc(v ? v.poster : img.src)}" alt="" loading="${i < 3 ? 'eager' : 'lazy'}" decoding="async" draggable="false">
          ${v ? `<video class="cs__video" muted loop playsinline preload="none" tabindex="-1" data-preview="${esc(v.preview)}"></video>` : ''}
        </span>
        ${v ? '<span class="cs__badge meta">▶ Film</span>' : count > 1 ? `<span class="cs__badge meta">${count} designs</span>` : ''}
      </button>
      <div class="cs__meta">
        <span class="cs__big" aria-hidden="true"><span>${pad2(i + 1)}</span></span>
        <p class="cs__n meta"><span>${pad2(i + 1)}</span></p>
        <h3 class="cs__name">${esc(name || client)}</h3>
        ${name ? `<p class="cs__client">${esc(client)}</p>` : ''}
        <p class="cs__cats meta">${esc(cats)}</p>
        <button class="cs__cta" type="button" ${open} data-trace-hover>
          <span class="cs__cta-label">${cta}</span><span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  </li>`;
}

export function Selected({ copy, featured, projects }) {
  if (!featured.length) return '';
  const w = copy.work;
  const n = featured.length;
  return `
  <section class="selected" id="work" aria-labelledby="work-title" data-carousel>
    <header class="wrap selected__head">
      <h2 class="selected__title" id="work-title" data-rv aria-label="Selected work">
        <span class="line" aria-hidden="true"><span class="line__i">Selected</span></span>
        <span class="line" aria-hidden="true"><span class="line__i" style="--l:1">Work</span></span>
      </h2>
      <div class="selected__side" data-rv="fade">
        ${w.text ? `<p class="selected__text">${esc(w.text)}</p>` : ''}
        <div class="selected__nav">
          <p class="cs-count meta" aria-live="polite"><span class="cs-count__mask"><span data-cs-now>01</span></span><span class="cs-count__line" aria-hidden="true"><span data-cs-progress></span></span><span>${pad2(n)}</span></p>
          <div class="cs-arrows">
            <button class="cs-arrow" type="button" data-cs-prev aria-label="Previous project">←</button>
            <button class="cs-arrow" type="button" data-cs-next aria-label="Next project">→</button>
          </div>
        </div>
      </div>
    </header>
    <div class="cs-viewport" role="region" aria-roledescription="carousel" aria-label="Selected work" tabindex="0" data-cursor="Drag">
      <ol class="cs-track" data-cs-track data-rv="carousel">
        ${featured.map((p, i) => Slide(p, i, n, projects)).join('')}
      </ol>
    </div>
  </section>`;
}

/* ---------- Behaviour ---------- */

export function initCarousel() {
  const root = $('[data-carousel]');
  if (!root) return;
  const viewport = $('.cs-viewport', root);
  const track = $('[data-cs-track]', root);
  const slides = $$('[data-cs]', track);
  const now = $('[data-cs-now]', root);
  const progress = $('[data-cs-progress]', root);
  const reduce = prefersReducedMotion();
  let active = -1, ticking = false;

  const centerOf = (el) => el.offsetLeft + el.offsetWidth / 2;
  const go = (i) => {
    const el = slides[Math.max(0, Math.min(slides.length - 1, i))];
    viewport.scrollTo({ left: centerOf(el) - viewport.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
  };

  const setActive = (i) => {
    if (i === active) return;
    const dir = i > active ? 1 : -1;
    // A committed change (not the first layout) gets its soft sound.
    if (active !== -1) window.dispatchEvent(new CustomEvent('ttm:slide', { detail: { video: Boolean($('video', slides[i])) } }));
    active = i;
    slides.forEach((s, k) => {
      const on = k === i;
      s.classList.toggle('is-active', on);
      // Only the active canvas is in the tab order.
      $$('button', s).forEach((b) => { if (!b.classList.contains('cs__media')) b.tabIndex = on ? 0 : -1; });
      if (!on) stopPreview(s);
    });
    // The counter rolls in the direction of travel.
    now.style.setProperty('--dir', dir);
    now.classList.remove('is-rolling'); void now.offsetWidth;
    now.textContent = pad2(i + 1);
    now.classList.add('is-rolling');
    progress.style.transform = `scaleX(${(i + 1) / slides.length})`;
  };

  // Each canvas knows how far it is from the centre: scale and inner parallax follow.
  const update = () => {
    ticking = false;
    const mid = viewport.scrollLeft + viewport.clientWidth / 2;
    let best = 0, bestD = Infinity;
    slides.forEach((s, k) => {
      const d = (centerOf(s) - mid) / s.offsetWidth;
      const c = Math.max(-1.5, Math.min(1.5, d));
      s.style.setProperty('--d', c.toFixed(3));
      s.style.setProperty('--ad', Math.min(1, Math.abs(c)).toFixed(3));
      if (Math.abs(d) < bestD) { bestD = Math.abs(d); best = k; }
    });
    setActive(best);
  };
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  viewport.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);

  $('[data-cs-prev]', root).addEventListener('click', () => go(active - 1));
  $('[data-cs-next]', root).addEventListener('click', () => go(active + 1));
  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1); }
  });

  // A click on a neighbour brings it to the centre instead of opening it.
  track.addEventListener('click', (e) => {
    const s = e.target.closest('[data-cs]');
    if (dragged) { e.preventDefault(); e.stopPropagation(); return; }
    if (s && !s.classList.contains('is-active')) { e.preventDefault(); e.stopPropagation(); go(slides.indexOf(s)); }
  }, true);

  // Mouse drag (touch and trackpads scroll natively).
  let drag = null, dragged = false;
  viewport.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    drag = { x: e.clientX, left: viewport.scrollLeft };
    dragged = false;
  });
  window.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (!dragged && Math.abs(dx) > 6) { dragged = true; root.classList.add('is-dragging'); }
    if (dragged) viewport.scrollLeft = drag.left - dx;
  });
  window.addEventListener('pointerup', () => {
    if (!drag) return;
    drag = null;
    root.classList.remove('is-dragging');
    if (dragged) { go(active); setTimeout(() => { dragged = false; }, 0); }
  });

  // Desktop: the active film's silent preview plays while hovered.
  const canPreview = hasFinePointer() && !reduce && !saveData();
  function stopPreview(s) {
    const v = $('video', s);
    if (!v) return;
    v.pause(); s.classList.remove('is-playing');
  }
  if (canPreview) {
    slides.forEach((s) => {
      const v = $('video', s);
      if (!v) return;
      const media = $('.cs__media', s);
      media.addEventListener('pointerenter', () => {
        if (!s.classList.contains('is-active') || dragged || document.documentElement.classList.contains('modal-open')) return;
        if (!v.src) v.src = v.dataset.preview;
        v.currentTime = 0;
        v.play().then(() => s.classList.add('is-playing')).catch(() => {});
      });
      media.addEventListener('pointerleave', () => stopPreview(s));
    });
  }

  requestAnimationFrame(() => { viewport.scrollLeft = centerOf(slides[0]) - viewport.clientWidth / 2; update(); });
}
