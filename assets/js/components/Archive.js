import { $, $$, esc, pad2 } from '../lib/dom.js';
import { projectTitle } from './ProjectItem.js';
import { Title, WorkMedia } from './Sections.js';

/* =========================================================================
   ARCHIVE — the rest of the work as a filterable masonry grid, every piece
   at its real proportions. Filters: Film / Design and sector (each project's
   "industry"). Films open the player, designs open the lightbox.
   ========================================================================= */

const discipline = (p) => (p.videos.length ? 'Film' : 'Design');
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function Card(p, i) {
  return `
  <li class="card" data-type="${discipline(p)}" data-sector="${esc(slug(p.industry))}" data-rv="clip">
    ${WorkMedia(p, i)}
    <div class="card__meta">
      <h3 class="card__title">${esc(p.client || projectTitle(p, i))}</h3>
      <p class="meta card__tags">${discipline(p)}${p.industry ? ` · ${esc(p.industry)}` : ''}</p>
    </div>
  </li>`;
}

export function Archive({ copy, projects, all }) {
  if (!projects.length) return '';
  const sectors = [...new Set(projects.map((p) => p.industry).filter(Boolean))];
  const chip = (group, value, label, on = false) =>
    `<button class="chip" type="button" data-filter="${group}" data-value="${esc(value)}" aria-pressed="${on}">${esc(label)}</button>`;
  return `
  <section class="archive" id="archive" aria-labelledby="archive-title" data-archive>
    <header class="wrap sec-head sec-head--row">
      <div>
        ${copy.archive.label ? `<p class="meta label" data-rv="fade"><span class="label__n">${pad2(projects.length)}</span>${esc(copy.archive.label)}</p>` : ''}
        ${Title(copy.archive.title, { id: 'archive-title' })}
      </div>
      <div class="archive__filters" role="group" aria-label="Filter projects" data-rv="fade">
        <div class="archive__group">
          ${chip('type', 'all', 'All', true)}${chip('type', 'Film', 'Film')}${chip('type', 'Design', 'Design')}
        </div>
        <div class="archive__group">
          ${chip('sector', 'all', 'Every sector', true)}${sectors.map((s) => chip('sector', slug(s), s)).join('')}
        </div>
      </div>
    </header>
    <p class="wrap meta archive__status" aria-live="polite" data-archive-status></p>
    <ul class="wrap archive__grid">${projects.map((p) => Card(p, all.indexOf(p))).join('')}</ul>
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

  const select = (group, value) => {
    state[group] = value;
    $$(`[data-filter="${group}"]`, root).forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.value === value)));
    apply();
  };
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter]');
    if (b) select(b.dataset.filter, b.dataset.value);
  });
  // "See related work" links elsewhere on the page pre-select a sector.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-filter-link]');
    if (!a) return;
    const value = slug(a.dataset.filterLink);
    if ($(`[data-filter="sector"][data-value="${value}"]`, root)) { select('type', 'all'); select('sector', value); }
  });
  apply();
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
    window.setTimeout(() => { box.hidden = true; window.dispatchEvent(new Event('ttm:modal-closed')); }, 400);
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
