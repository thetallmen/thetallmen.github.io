import { esc, pad2, plain, rich } from '../lib/dom.js';
import { Plate } from './Objects.js';
import { parseRatio, projectTitle } from './ProjectItem.js';
import { directLinks, socialLinks, mapsHref } from './contactLinks.js';

/* =========================================================================
   THE PAGE, top to bottom:
   Hero → Clients → Selected work → Services → Archive → Studio → Contact.
   Warm beige page, black type, and one red gesture (the Red Trace) per
   composition at most. The work is shown at its real proportions, sharp.
   ========================================================================= */

// Headline whose lines slide up out of a mask. trace: 'underline' | 'circle'.
export const Title = (lines, { tag = 'h2', id = '', cls = 'title', trace = '' } = {}) =>
  `<${tag} class="${cls}"${id ? ` id="${id}"` : ''} data-rv${trace ? ` data-trace="${trace}"` : ''} aria-label="${esc(plain(lines.join(' ')))}">${lines
    .map((l, i) => `<span class="line" aria-hidden="true"><span class="line__i" style="--l:${i}">${rich(l)}</span></span>`).join('')}</${tag}>`;

const Label = (text, n = '') => (text ? `<p class="meta label" data-rv="fade">${n ? `<span class="label__n">${n}</span>` : ''}${esc(text)}</p>` : '');

const Btn = ({ href, label, kind = 'solid', external = false, attrs = '' }) => `
  <a class="btn btn--${kind}" href="${esc(href)}" data-magnetic${external ? ' target="_blank" rel="noopener"' : ''} ${attrs}>
    <span class="btn__label">${esc(label)}</span><span class="btn__arrow" aria-hidden="true">→</span>
  </a>`;

// "BYD — Cairo West launch" → client "BYD", line "Cairo West launch".
function names(p, i) {
  const full = projectTitle(p, i);
  const [head, ...tail] = full.split(/\s+[—–-]\s+/);
  return { full, client: p.client || head, line: tail.join(' — ') || (p.client && p.client !== head ? head : '') };
}

const kind = (p) => (p.videos.length ? 'Film' : 'Design');

// Media trigger shared by selected work and the archive: films open the player, designs the lightbox.
export function WorkMedia(p, i, { lazyPreview = true } = {}) {
  const v = p.videos[0];
  const img = p.images[0];
  const [w, h] = parseRatio(v ? v.ratio : img.ratio);
  const { full } = names(p, i);
  const cover = v ? v.poster : img.src;
  const count = p.videos.length + p.images.length;
  const open = v && count === 1
    ? `data-open-video="${esc(v.src)}" data-video-title="${esc(full)}" data-video-ratio="${w}/${h}" data-video-poster="${esc(v.poster)}"${v.hasAudio ? ' data-video-sound="true"' : ''}`
    : `data-open-gallery="${esc(p.id)}"`;
  return `
    <button class="media" type="button" style="--ratio:${w} / ${h}" ${open} data-cursor="${v ? 'Play' : 'View'}"
      aria-label="${v ? 'Play' : 'View'} ${esc(full)}${count > 1 ? `, ${count} pieces` : ''}">
      <span class="media__frame">
        ${cover ? `<img class="media__img" src="${esc(cover)}" alt="${esc(v ? v.alt : img.alt)}" loading="lazy" decoding="async">` : ''}
        ${v && lazyPreview ? `<video class="media__video" muted loop playsinline preload="none" aria-hidden="true" tabindex="-1" data-preview="${esc(v.preview)}"></video>` : ''}
      </span>
      ${v ? '<span class="media__play" aria-hidden="true"><span>▶</span></span>' : ''}
      ${count > 1 ? `<span class="media__count meta" aria-hidden="true">${count}</span>` : ''}
    </button>`;
}

/* ---------- Hero ---------- */

export function Hero({ agency, copy, featured }) {
  const h = copy.hero;
  // The viewfinder plays a cut of the vertical films, one after another.
  const reel = featured.flatMap((p) => p.videos).filter((v) => parseRatio(v.ratio)[1] > parseRatio(v.ratio)[0]).slice(0, 5);
  const first = reel[0];
  return `
  <section class="hero" id="top" data-hero aria-labelledby="hero-title">
    <div class="hero__copy wrap">
      <p class="meta label hero__eyebrow" data-step="0"><span class="label__dot" aria-hidden="true"></span>${esc(agency.descriptor)} — ${esc(agency.city)}</p>
      ${Title(h.lines, { tag: 'h1', id: 'hero-title', cls: 'title title--hero', trace: 'underline' })}
      <p class="hero__lede" data-step="2">${esc(h.lede)}</p>
      <div class="hero__actions" data-step="3">
        ${Btn({ href: '#contact', label: h.primaryLabel })}
        ${Btn({ href: '#work', label: h.secondaryLabel, kind: 'ghost' })}
      </div>
    </div>
    ${first ? `
    <div class="hero__shot" data-parallax="-0.08">
      <div class="viewfinder" data-viewfinder data-cursor="Play">
        <div class="viewfinder__media">
          <video class="viewfinder__video" muted playsinline preload="metadata" poster="${esc(first.poster)}" aria-hidden="true" tabindex="-1"
            data-reel='${esc(JSON.stringify(reel.map((v) => ({ src: v.preview, full: v.src, poster: v.poster }))))}'></video>
        </div>
        <span class="vf__corner vf__corner--tl" aria-hidden="true"></span><span class="vf__corner vf__corner--tr" aria-hidden="true"></span>
        <span class="vf__corner vf__corner--bl" aria-hidden="true"></span><span class="vf__corner vf__corner--br" aria-hidden="true"></span>
        <span class="vf__focus" aria-hidden="true"></span>
        <span class="vf__rec meta" aria-hidden="true"><span class="vf__dot"></span>REC</span>
        <span class="vf__tc meta" aria-hidden="true" data-timecode>00:00:00:00</span>
        <span class="vf__meta meta" aria-hidden="true">4K · 25 FPS</span>
        <button class="vf__play" type="button" data-open-video="${esc(first.src)}" data-video-title="Showreel" data-video-ratio="9/16"
          data-video-poster="${esc(first.poster)}"${first.hasAudio ? ' data-video-sound="true"' : ''} aria-label="Play this film with sound"></button>
      </div>
      ${h.figure ? `<img class="hero__figure" src="${esc(h.figure.src)}" alt="${esc(h.figure.alt)}" data-parallax="0.06">` : ''}
    </div>` : ''}
    <a class="hero__cue meta" href="#clients" aria-label="Scroll down"><span class="hero__cue-line" aria-hidden="true"></span>Scroll</a>
  </section>`;
}

/* ---------- Clients: proof, straight after the promise ---------- */

export function Clients({ copy, featured, projects }) {
  const seen = new Set();
  const list = [...featured, ...projects].map((p) => p.client).filter((c) => c && !seen.has(c) && seen.add(c));
  if (!list.length) return '';
  return `
  <section class="clients" id="clients" aria-labelledby="clients-title">
    <div class="wrap clients__inner">
      <h2 class="meta label clients__label" id="clients-title" data-rv="fade">${esc(copy.clients.label)}</h2>
      <ul class="clients__list" data-rv="stagger">
        ${list.map((c, i) => `<li class="clients__item" style="--k:${i}">${esc(c)}</li>`).join('')}
      </ul>
      ${copy.clients.note ? `<p class="clients__note" data-rv="fade">${esc(copy.clients.note)}</p>` : ''}
    </div>
  </section>`;
}

/* ---------- Selected work ---------- */

export function Selected({ copy, featured, projects }) {
  if (!featured.length) return '';
  const w = copy.work;
  return `
  <section class="selected" id="work" aria-labelledby="work-title">
    <header class="wrap sec-head">
      ${Label(w.label, pad2(featured.length))}
      ${Title(w.title, { id: 'work-title', trace: 'circle' })}
      ${w.text ? `<p class="sec-head__text" data-rv="fade">${esc(w.text)}</p>` : ''}
    </header>
    <ol class="wrap selected__grid">
      ${featured.map((p) => {
        const i = projects.indexOf(p);
        const [rw, rh] = parseRatio(p.videos[0] ? p.videos[0].ratio : p.images[0].ratio);
        const shape = rw > rh ? 'land' : rh / rw > 1.5 ? 'tall' : 'print';
        const n = names(p, i);
        return `
        <li class="wk wk--${shape}" data-rv="clip">
          ${WorkMedia(p, i)}
          <div class="wk__meta">
            <h3 class="wk__client"><span class="wk__name">${esc(n.client)}</span></h3>
            ${n.line ? `<p class="wk__line">${esc(n.line)}</p>` : ''}
            <p class="meta wk__tags">${esc(kind(p))}${p.industry ? ` · ${esc(p.industry)}` : ''}</p>
          </div>
        </li>`;
      }).join('')}
    </ol>
  </section>`;
}

/* ---------- Services: one discipline, one object, one composition ---------- */

export function Services({ copy }) {
  const s = copy.services;
  const items = copy.capabilities.items;
  if (!items.length) return '';
  return `
  <section class="services" id="services" aria-labelledby="services-title">
    <header class="wrap sec-head">
      ${Label(s.label, pad2(items.length))}
      ${Title(s.title, { id: 'services-title', trace: 'underline' })}
      ${s.text ? `<p class="sec-head__text" data-rv="fade">${esc(s.text)}</p>` : ''}
    </header>
    <ol class="svc-list">
      ${items.map((it, i) => `
      <li class="svc svc--${i % 3}" id="service-${i + 1}">
        <div class="wrap svc__grid">
          ${Plate({ object: it.pose, figure: it.figure, caption: `Fig. ${pad2(i + 1)} — ${it.name}`, className: 'svc__plate' })}
          <div class="svc__body">
            <p class="meta svc__n" data-rv="fade">${pad2(i + 1)} / ${pad2(items.length)}</p>
            <h3 class="svc__name" data-rv><span class="line"><span class="line__i">${esc(it.name)}</span></span></h3>
            ${it.tagline ? `<p class="svc__tag" data-rv="fade">${esc(it.tagline)}</p>` : ''}
            ${it.text ? `<p class="svc__text" data-rv="fade">${esc(it.text)}</p>` : ''}
            ${it.bullets.length ? `<ul class="svc__bullets" data-rv="stagger">${it.bullets.map((b, k) => `<li style="--k:${k}">${esc(b)}</li>`).join('')}</ul>` : ''}
            ${it.sector ? `<a class="link-line svc__link" href="#archive" data-filter-link="${esc(it.sector)}" data-rv="fade">${esc(s.workLabel)} →</a>` : ''}
          </div>
        </div>
      </li>`).join('')}
    </ol>
  </section>`;
}

/* ---------- Studio: who we are, how we think, how we work ---------- */

export function Studio({ copy }) {
  const s = copy.studio;
  const steps = copy.process.steps;
  return `
  <section class="studio" id="studio" aria-labelledby="studio-title">
    <div class="wrap studio__top">
      <div class="studio__statement">
        ${Label(s.label)}
        ${Title(s.statement, { id: 'studio-title', cls: 'title title--statement', trace: 'circle' })}
      </div>
      <div class="studio__side">
        ${Plate({ object: 'notebook', figure: s.figure, caption: 'Fig. 07 — The notebook', className: 'studio__plate' })}
        ${s.story ? `<p class="studio__story" data-rv="fade">${esc(s.story)}</p>` : ''}
      </div>
    </div>
    ${s.points.length ? `
    <dl class="wrap points">
      ${s.points.map((p, i) => `<div class="point" data-rv="fade" style="--k:${i}"><dt><span class="meta point__n">${pad2(i + 1)}</span>${esc(p.term)}</dt><dd>${esc(p.text)}</dd></div>`).join('')}
    </dl>` : ''}
    ${steps.length ? `
    <div class="wrap process" id="process" data-process>
      <h3 class="meta label" data-rv="fade">${esc(copy.process.title)}</h3>
      <div class="process__rail" aria-hidden="true"><span class="process__fill" data-process-fill></span></div>
      <ol class="process__steps">
        ${steps.map((st, i) => `<li class="step" data-step><span class="meta step__n">${pad2(i + 1)}</span><span class="step__name">${esc(st.name)}</span><span class="step__text">${esc(st.text)}</span></li>`).join('')}
      </ol>
    </div>` : ''}
  </section>`;
}

/* ---------- Contact ---------- */

function primaryAction({ copy, contact, location }) {
  const direct = directLinks(contact);
  if (direct.length) {
    const best = direct.find((x) => x.key === 'whatsapp') || direct[0];
    return { href: best.href, label: copy.cta.buttonLabel, external: best.key === 'whatsapp' };
  }
  const map = mapsHref(location);
  return map ? { href: map, label: copy.cta.visitLabel, external: true } : null;
}

export function Contact({ copy, contact, location }) {
  const c = copy.cta;
  const direct = directLinks(contact);
  const socials = socialLinks(contact);
  const action = primaryAction({ copy, contact, location });
  return `
  <section class="contact" id="contact" aria-labelledby="cta-title" data-contact>
    <div class="wrap contact__inner">
      ${Label(c.label)}
      ${Title(c.lines, { id: 'cta-title', cls: 'title title--cta', trace: 'underline' })}
      ${c.text ? `<p class="contact__text" data-rv="fade">${esc(c.text)}</p>` : ''}
      ${action ? `<div class="contact__action" data-rv="fade" data-cta-target>${Btn({ href: action.href, label: action.label, kind: 'big', external: action.external })}</div>` : ''}
      <div class="contact__details" data-rv="fade">
        ${direct.map((d) => `<p><span class="meta">${esc(d.label)}</span><a class="link-line" href="${esc(d.href)}"${d.key === 'whatsapp' ? ' target="_blank" rel="noopener"' : ''}>${esc(d.value)}</a></p>`).join('')}
        ${location.addressLines.length ? `<p><span class="meta">${esc(copy.location.label)}</span><span>${location.addressLines.map(esc).join(', ')}</span></p>` : ''}
        ${socials.length ? `<p class="contact__social">${socials.map((s) => `<a class="link-line" href="${esc(s.href)}" target="_blank" rel="noopener">${esc(s.label)}</a>`).join('')}</p>` : ''}
      </div>
    </div>
    ${c.figure ? `<img class="contact__figure" src="${esc(c.figure.src)}" alt="${esc(c.figure.alt)}" loading="lazy" data-rv="rise">` : ''}
    <svg class="contact__path" aria-hidden="true" focusable="false"><path class="contact__route" pathLength="1"/><g class="contact__cursor"><path d="M0 0v26l7-7l5 11l5-2l-5-11h10z"/></g></svg>
  </section>`;
}
