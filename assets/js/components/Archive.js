import { $, $$, esc, pad2 } from '../lib/dom.js';
import { SectionTitle } from './SectionTitle.js';
import { projectTitle, parseRatio } from './ProjectItem.js';

/* =========================================================================
   ALL WORK — every project in content/work.json as a filterable grid.
   Filters: discipline (Film / Design) and sector (from each project's
   "industry"). A card opens the lightbox with all of that project's media.
   ========================================================================= */

const discipline = (p) => (p.videos.length ? 'Film' : 'Design');
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function Card(p, i) {
  const v = p.videos[0];
  const img = p.images[0];
  const cover = v ? v.poster : img.src;
  const [w, h] = parseRatio(v ? v.ratio : img.ratio);
  const count = p.videos.length + p.images.length;
  const title = projectTitle(p, i);
  return `
  <li class="card" data-type="${discipline(p)}" data-sector="${esc(slug(p.industry))}">
    <button class="card__media" type="button" style="--ratio:${w} / ${h}" data-open-gallery="${esc(p.id)}"
      data-cursor="${v ? 'play' : 'view'}" aria-label="${v ? 'Play' : 'View'} ${esc(title)}${count > 1 ? `, ${count} pieces` : ''}">
      ${cover ? `<img src="${esc(cover)}" alt="" loading="lazy" decoding="async">` : ''}
      ${v ? `<video muted loop playsinline preload="none" aria-hidden="true" tabindex="-1" data-hover-video="${esc(v.preview)}"></video>` : ''}
      ${count > 1 ? `<span class="card__count meta" aria-hidden="true">${count}</span>` : ''}
    </button>
    <div class="card__meta">
      <h3 class="card__title">${esc(title)}</h3>
      <p class="meta card__tags"><span>${discipline(p)}</span>${p.industry ? `<span>${esc(p.industry)}</span>` : ''}</p>
    </div>
  </li>`;
}

export function Archive({ projects }) {
  const sectors = [...new Set(projects.map((p) => p.industry).filter(Boolean))];
  const chip = (group, value, label, on = false) =>
    `<button class="chip" type="button" data-filter="${group}" data-value="${esc(value)}" aria-pressed="${on}">${esc(label)}</button>`;
  return `
  <section class="archive" id="archive" aria-labelledby="archive-title" data-archive>
    ${SectionTitle({ id: 'archive-title', title: 'All *work*', count: projects.length })}
    <div class="wrap archive__filters" role="group" aria-label="Filter projects">
      <div class="archive__group">
        ${chip('type', 'all', 'All', true)}${chip('type', 'Film', 'Film')}${chip('type', 'Design', 'Design')}
      </div>
      <div class="archive__group">
        ${chip('sector', 'all', 'Every sector', true)}${sectors.map((s) => chip('sector', slug(s), s)).join('')}
      </div>
    </div>
    <p class="wrap meta archive__status" aria-live="polite" data-archive-status></p>
    <ul class="wrap archive__grid">${projects.map(Card).join('')}</ul>
  </section>`;
}

export function initArchive() {
  const root = $('[data-archive]');
  if (!root) return;
  const cards = $$('.card', root);
  const status = $('[data-archive-status]', root);
  const state = { type: 'all', sector: 'all' };

  const apply = () => {
    let shown = 0;
    cards.forEach((c) => {
      const ok = (state.type === 'all' || c.dataset.type === state.type) && (state.sector === 'all' || c.dataset.sector === state.sector);
      c.hidden = !ok;
      if (ok) shown += 1;
    });
    status.textContent = shown ? `${pad2(shown)} projects` : 'Nothing here yet. Try another filter.';
  };

  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter]');
    if (!b) return;
    state[b.dataset.filter] = b.dataset.value;
    $$(`[data-filter="${b.dataset.filter}"]`, root).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    apply();
  });
  apply();

  // Desktop hover: play the short silent loop over the cover.
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    $$('[data-hover-video]', root).forEach((video) => {
      const btn = video.closest('.card__media');
      btn.addEventListener('pointerenter', () => {
        if (!video.src) video.src = video.dataset.hoverVideo;
        video.play().then(() => btn.classList.add('is-playing')).catch(() => {});
      });
      btn.addEventListener('pointerleave', () => { video.pause(); btn.classList.remove('is-playing'); });
    });
  }
}

/* =========================================================================
   LIGHTBOX — one project's images and films, one at a time.
   Esc closes, arrow keys move, focus returns to the card that opened it.
   ========================================================================= */

export function Lightbox() {
  return `
  <div class="lbox" role="dialog" aria-modal="true" aria-labelledby="lbox-title" data-lbox hidden>
    <div class="lbox__backdrop" data-lclose></div>
    <div class="lbox__head wrap">
      <h2 class="visually-hidden" id="lbox-title" data-ltitle></h2>
      <span class="meta lbox__count" data-lcount></span>
      <button class="vbtn lbox__close" type="button" data-lclose>Close</button>
    </div>
    <div class="lbox__stage" data-lstage></div>
    <div class="lbox__nav wrap" data-lnav>
      <button class="vbtn" type="button" data-lprev>← Prev</button>
      <button class="vbtn" type="button" data-lnext>Next →</button>
    </div>
  </div>`;
}

export function initLightbox(projects) {
  const box = $('[data-lbox]');
  if (!box) return;
  const stage = $('[data-lstage]', box);
  const byId = Object.fromEntries(projects.map((p, i) => [p.id, { p, i }]));
  let items = [], at = 0, opener = null;

  const render = () => {
    const it = items[at];
    const [w, h] = parseRatio(it.ratio);
    stage.style.setProperty('--ratio', `${w} / ${h}`);
    stage.classList.toggle('is-portrait', h > w);
    stage.innerHTML = it.kind === 'video'
      ? `<video src="${esc(it.src)}" poster="${esc(it.poster)}" controls playsinline autoplay aria-label="${esc(it.alt)}"></video>`
      : `<img src="${esc(it.src)}" alt="${esc(it.alt)}">`;
    $('[data-lcount]', box).textContent = items.length > 1 ? `${pad2(at + 1)} / ${pad2(items.length)}` : '';
    $('[data-lnav]', box).hidden = items.length < 2;
  };

  const open = (id, from) => {
    const hit = byId[id];
    if (!hit) return;
    const { p, i } = hit;
    items = [
      ...p.videos.map((v) => ({ kind: 'video', ...v })),
      ...p.images.map((m) => ({ kind: 'image', ...m })),
    ];
    at = 0; opener = from;
    $('[data-ltitle]', box).textContent = projectTitle(p, i);
    render();
    box.hidden = false;
    document.documentElement.classList.add('modal-open');
    requestAnimationFrame(() => box.classList.add('is-open'));
    $('[data-lclose].lbox__close', box).focus({ preventScroll: true });
  };

  const close = () => {
    box.classList.remove('is-open');
    document.documentElement.classList.remove('modal-open');
    stage.innerHTML = '';
    window.setTimeout(() => { box.hidden = true; }, 400);
    opener?.focus({ preventScroll: true });
  };
  const step = (d) => { at = (at + d + items.length) % items.length; render(); };

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-open-gallery]');
    if (t) { e.preventDefault(); open(t.dataset.openGallery, t); return; }
    if (box.hidden) return;
    if (e.target.closest('[data-lclose]')) close();
    else if (e.target.closest('[data-lprev]')) step(-1);
    else if (e.target.closest('[data-lnext]')) step(1);
  });
  document.addEventListener('keydown', (e) => {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'Tab') {
      // Keep focus inside the dialog.
      const f = $$('button:not([hidden]), video', box).filter((el) => !el.closest('[hidden]'));
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}
