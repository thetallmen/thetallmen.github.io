import { esc, pad2, plain, rich } from '../lib/dom.js';
import { Prop } from './Props.js';
import { directLinks, socialLinks, mapsHref } from './contactLinks.js';

/* =========================================================================
   ONE CONTINUOUS PAGE.
   Each part says which light it wants (data-tone="light" | "dark"). As it
   reaches the middle of the screen the whole page eases into that tone, so
   white and black follow each other without hard page breaks (motion.js).
   Depth of field: blurred studio props drift close to the lens, a soft red
   glow sits low in every part, and each part racks out of focus as you leave.
   ========================================================================= */

const Title = (lines, { tag = 'h2', id = '', cls = 'title' } = {}) =>
  `<${tag} class="${cls}"${id ? ` id="${id}"` : ''} aria-label="${esc(plain(lines.join(' ')))}">${lines
    .map((l) => `<span class="line" aria-hidden="true"><span class="line__i">${rich(l)}</span></span>`).join('')}</${tag}>`;

const Keys = (words) =>
  words && words.length ? `<ul class="keys meta" aria-hidden="true">${words.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>` : '';

// Depth-of-field layer: out-of-focus props + bokeh + the low red glow.
const Depth = (props = ['lens', 'phone']) => `
  <div class="depth" aria-hidden="true">
    <div class="depth__glow"></div>
    <div class="depth__near" data-depth="0.5">
      ${props.map((p, i) => Prop(p, `prop--${i + 1}`)).join('')}
      <span class="bokeh bokeh--1"></span><span class="bokeh bokeh--2"></span><span class="bokeh bokeh--3"></span>
    </div>
  </div>`;

/* ---------- Opening (light) ---------- */

export function Opening({ agency, copy }) {
  const h = copy.hero;
  return `
  <section class="part part--open" id="top" data-part data-tone="light" data-hero aria-labelledby="hero-title">
    ${Depth(['camera', 'lens', 'phone'])}
    <div class="part__inner part__inner--open">
      <p class="meta label" data-fx>${esc(agency.descriptor)} — ${esc(agency.city)}</p>
      <h1 class="title title--mega" id="hero-title" aria-label="${esc(plain(h.lines.join(' ')))}">${h.lines
        .map((l) => `<span class="line" aria-hidden="true"><span class="line__i">${rich(l)}</span></span>`).join('')}<span class="signature title__sig" aria-hidden="true">agency</span></h1>
      <div class="open__foot">
        <p class="lede" data-fx>${rich(h.lede)}</p>
        ${Keys(h.keywords)}
      </div>
      <a class="scroll-cue" href="#intro" data-fx><span class="scroll-cue__line" aria-hidden="true"></span><span class="meta">${esc(h.scrollLabel)}</span></a>
    </div>
  </section>`;
}

/* ---------- The view (dark) ---------- */

export function Perspective({ copy }) {
  const s = copy.intro;
  return `
  <section class="part part--intro" id="intro" data-part data-tone="dark" aria-labelledby="intro-title">
    ${Depth(['laptop', 'lens'])}
    <div class="part__inner part__inner--split">
      <div>
        <p class="meta label" data-fx>${esc(s.label)}</p>
        ${Title(s.title, { id: 'intro-title' })}
      </div>
      <div class="part__aside">
        <p class="text text--lg" data-fx>${esc(s.text)}</p>
        ${Keys(s.keywords)}
      </div>
    </div>
  </section>`;
}

/* ---------- The crafts (light): one flowing section ---------- */

const PROP_FOR = { binoculars: 'lens', stylus: 'phone', phone: 'phone', mouse: 'mouse', clapper: 'camera', keyboard: 'keyboard' };

export function Crafts({ copy }) {
  const intro = copy.capabilitiesIntro;
  const items = copy.capabilities.items;
  return `
  <section class="part part--crafts" id="capabilities" data-part data-tone="light" aria-labelledby="crafts-title">
    ${Depth(['camera', 'mouse', 'keyboard'])}
    <div class="part__inner">
      <p class="meta label" data-fx>${esc(intro.label)}</p>
      ${Title(intro.title, { id: 'crafts-title' })}
      <ol class="crafts">
        ${items.map((it, i) => `
          <li class="craft" data-fx id="craft-${i + 1}">
            <span class="craft__glyph" aria-hidden="true">${Prop(PROP_FOR[it.pose] || 'lens')}</span>
            <span class="meta craft__n">${pad2(i + 1)}</span>
            <h3 class="craft__name">${esc(it.name)}<span class="craft__tag hl">${esc(it.tagline)}</span></h3>
            ${it.text ? `<p class="text">${esc(it.text)}</p>` : ''}
            ${it.bullets.length ? `<ul class="bullets">${it.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
          </li>`).join('')}
      </ol>
    </div>
  </section>`;
}

/* ---------- Sectors (light), a credit roll that slides with the scroll ---------- */

export function Sectors({ copy }) {
  const s = copy.sectors;
  if (!s.items.length) return '';
  return `
  <section class="part part--sectors" id="sectors" data-part data-tone="light" aria-labelledby="sectors-title">
    ${Depth(['lens', 'camera'])}
    <div class="part__inner part__inner--center">
      <p class="meta label" data-fx>${esc(s.label)}</p>
      ${Title(s.title, { id: 'sectors-title', cls: 'title title--center' })}
    </div>
    <ul class="roll" data-roll>
      ${s.items.map((it, i) => `<li class="roll__item${i % 3 === 1 ? ' is-solid' : ''}">${esc(it)}<span class="roll__dot" aria-hidden="true"></span></li>`).join('')}
    </ul>
  </section>`;
}

/* ---------- The idea + process (light) ---------- */

export function Idea({ copy }) {
  const p = copy.philosophy;
  const steps = copy.process.steps;
  return `
  <section class="part part--idea" id="philosophy" data-part data-tone="light" aria-labelledby="idea-title">
    ${Depth(['lens', 'laptop'])}
    <div class="part__inner">
      <p class="meta label" data-fx>${esc(p.label)}</p>
      ${Title(p.statement, { id: 'idea-title', cls: 'title title--wide' })}
      <dl class="points" data-fx>
        ${p.points.map((pt) => `<div class="point"><dt>${rich(pt.term)}</dt><dd>${rich(pt.text)}</dd></div>`).join('')}
      </dl>
      ${steps.length ? `
      <div class="process" id="process" data-process>
        <h3 class="meta label">${esc(copy.process.title)}</h3>
        <div class="process__rail" aria-hidden="true"><span class="process__fill" data-process-fill></span></div>
        <ol class="process__steps">
          ${steps.map((s, i) => `<li class="step" data-step><span class="meta step__n">${pad2(i + 1)}</span><span class="step__name">${esc(s.name)}</span><span class="step__text">${esc(s.text)}</span></li>`).join('')}
        </ol>
      </div>` : ''}
    </div>
  </section>`;
}

/* ---------- Finale (dark) ---------- */

function primaryAction({ copy, contact, location }) {
  const direct = directLinks(contact);
  if (direct.length) return { href: direct[0].href, label: copy.cta.buttonLabel, external: direct[0].key === 'whatsapp' };
  const map = mapsHref(location);
  if (map) return { href: map, label: copy.cta.visitLabel, external: true };
  return null;
}

export function Finale({ copy, contact, location }) {
  const c = copy.cta;
  const direct = directLinks(contact);
  const socials = socialLinks(contact);
  const action = primaryAction({ copy, contact, location });
  return `
  <section class="part part--finale" id="contact" data-part data-tone="dark" aria-labelledby="cta-title">
    ${Depth(['mouse', 'lens', 'phone'])}
    <div class="part__inner part__inner--center">
      <p class="meta label" data-fx>${esc(c.label)}</p>
      ${Title(c.lines, { id: 'cta-title', cls: 'title title--mega title--center' })}
      ${c.text ? `<p class="text text--center" data-fx>${esc(c.text)}</p>` : ''}
      ${action ? `
      <a class="btn-fire" href="${esc(action.href)}" data-cursor="go" data-magnetic data-fx${action.external ? ' target="_blank" rel="noopener"' : ''}>
        <span>${esc(action.label)}</span><span aria-hidden="true">→</span>
      </a>` : ''}
      <div class="contact" data-fx>
        ${direct.length ? `<ul class="contact__list">${direct.map((d) => `<li><span class="meta">${esc(d.label)}</span><a class="link-line" href="${esc(d.href)}"${d.key === 'whatsapp' ? ' target="_blank" rel="noopener"' : ''}>${esc(d.value)}</a></li>`).join('')}</ul>` : ''}
        <p class="contact__address"><span class="meta">${esc(copy.location.label)}</span>${location.addressLines.map(esc).join(', ')}</p>
        ${socials.length ? `<ul class="contact__social">${socials.map((s) => `<li><a class="link-line" href="${esc(s.href)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`).join('')}</ul>` : ''}
      </div>
    </div>
  </section>`;
}
