import { esc, pad2, plain, rich } from '../lib/dom.js';
import { TallMan, Prop } from './TallMan.js';
import { directLinks, socialLinks, mapsHref } from './contactLinks.js';

/* =========================================================================
   THE FILM — the whole site is one continuous sequence of scenes.
   Every scene shares the same stage: a dark studio with three depth layers
   (a blurred Tall Man far back, the sharp Tall Man in focus, blurred props
   drifting close to the lens). Scroll moves the layers at different speeds
   and racks focus from one scene to the next (see motion.js).
   ========================================================================= */

// Lines of a headline, each masked so words can rise in.
const Title = (lines, { tag = 'h2', id = '', cls = 'scene__title' } = {}) =>
  `<${tag} class="${cls}"${id ? ` id="${id}"` : ''} aria-label="${esc(plain(lines.join(' ')))}">${lines
    .map((l) => `<span class="line" aria-hidden="true"><span class="line__i">${rich(l)}</span></span>`).join('')}</${tag}>`;

const Keys = (words) =>
  words && words.length ? `<ul class="keys meta" aria-hidden="true">${words.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>` : '';

// Background + foreground depth layers. `far` is a second, defocused pose.
function Depth({ far = 'camera', props = ['lens', 'phone'], flip = false } = {}) {
  return `
  <div class="depth" aria-hidden="true">
    <div class="depth__glow"></div>
    <div class="depth__far ${flip ? 'is-left' : ''}" data-depth="-0.18">${TallMan(far, { className: 'tallman--far', trace: false })}</div>
    <div class="depth__near" data-depth="0.45">
      ${props.map((p, i) => Prop(p, `prop--${i + 1}`)).join('')}
      <span class="bokeh bokeh--1"></span><span class="bokeh bokeh--2"></span><span class="bokeh bokeh--3"></span>
    </div>
  </div>`;
}

const Stage = (pose, label, flip = false) =>
  `<div class="scene__stage ${flip ? 'is-left' : ''}" data-stage>${TallMan(pose, { className: 'tallman--main', label })}</div>`;

/* ---------- Opening ---------- */

// The two Ls of TALL are two tall men: each stem is a body, each has a head
// with a wild crop of hair and a face you can't quite make out. The second
// man stands shorter than the first.
const HAIR = '<svg class="lp__hair" viewBox="0 0 40 26" aria-hidden="true"><path d="M2,24 L4,12 L9,18 L10,4 L15,14 L19,0 L22,13 L28,3 L28,15 L35,7 L33,18 L39,14 L37,24 Z"/></svg>';
const LPerson = (tall) => `
  <span class="lp ${tall ? 'lp--tall' : 'lp--short'}" aria-hidden="true">
    <span class="lp__head">${HAIR}<span class="lp__face"></span><span class="lp__slash"></span></span>
    <span class="lp__stem"></span><span class="lp__foot"></span>
  </span>`;

function MegaTitle(lines) {
  return `<h1 class="scene__title scene__title--mega" id="hero-title" aria-label="${esc(plain(lines.join(' ')))}">${lines
    .map((l) => {
      const word = plain(l);
      const inner = /^tall$/i.test(word)
        ? `${esc(word.slice(0, 2))}${LPerson(true)}${LPerson(false)}`
        : rich(l);
      return `<span class="line${/^tall$/i.test(word) ? ' line--tall' : ''}" aria-hidden="true"><span class="line__i">${inner}</span></span>`;
    }).join('')}<span class="signature scene__sig" aria-hidden="true">agency</span></h1>`;
}

export function Opening({ agency, copy }) {
  const h = copy.hero;
  return `
  <section class="scene scene--open" id="top" data-scene data-hero aria-labelledby="hero-title">
    ${Depth({ far: 'phone', props: ['lens', 'camera', 'phone'] })}
    <div class="scene__inner">
      <div class="scene__copy">
        <p class="meta scene__label" data-fx>${esc(agency.descriptor)} — ${esc(agency.city)}</p>
        ${MegaTitle(h.lines)}
        <p class="scene__lede" data-fx>${rich(h.lede)}</p>
        <a class="scroll-cue" href="#intro" data-fx><span class="scroll-cue__line" aria-hidden="true"></span><span class="meta">${esc(h.scrollLabel)}</span></a>
      </div>
      ${Stage(h.pose || 'camera', 'The Tall Man pointing a camera at the viewer')}
      ${Keys(h.keywords)}
    </div>
  </section>`;
}

/* ---------- Scene 01: perspective ---------- */

export function Perspective({ copy }) {
  const s = copy.intro;
  return `
  <section class="scene scene--intro" id="intro" data-scene aria-labelledby="intro-title">
    ${Depth({ far: 'binoculars', props: ['laptop', 'lens'], flip: true })}
    <div class="scene__inner">
      <div class="scene__copy">
        <p class="meta scene__label" data-fx>${esc(s.label)}</p>
        ${Title(s.title, { id: 'intro-title' })}
        <p class="scene__text" data-fx>${esc(s.text)}</p>
      </div>
      ${Stage(s.pose || 'laptop', 'The Tall Man with a laptop under his arm')}
      ${Keys(s.keywords)}
    </div>
  </section>`;
}

/* ---------- Scene 02: the six crafts, one scene each ---------- */

const FAR_FOR = { binoculars: 'laptop', stylus: 'camera', phone: 'mouse', mouse: 'phone', clapper: 'keyboard', keyboard: 'clapper' };
const PROPS_FOR = {
  binoculars: ['lens', 'laptop'], stylus: ['lens', 'phone'], phone: ['phone', 'camera'],
  mouse: ['mouse', 'laptop'], clapper: ['camera', 'lens'], keyboard: ['laptop', 'mouse'],
};

export function Crafts({ copy }) {
  const intro = copy.capabilitiesIntro;
  const items = copy.capabilities.items;
  const total = pad2(items.length);
  return `
  <section class="crafts" id="capabilities" aria-labelledby="crafts-title">
    <div class="scene scene--crafts-intro" data-scene>
      ${Depth({ far: 'clapper', props: ['camera', 'mouse', 'phone'] })}
      <div class="scene__inner scene__inner--center">
        <p class="meta scene__label" data-fx>${esc(intro.label)}</p>
        ${Title(intro.title, { id: 'crafts-title', cls: 'scene__title scene__title--center' })}
        <ol class="crafts__index" data-fx>
          ${items.map((it, i) => `<li><a href="#craft-${i + 1}"><span class="meta">${pad2(i + 1)}</span>${esc(it.name)}</a></li>`).join('')}
        </ol>
      </div>
    </div>
    ${items.map((it, i) => {
      const flip = i % 2 === 1;
      return `
      <article class="scene scene--craft ${flip ? 'is-flipped' : ''}" id="craft-${i + 1}" data-scene aria-labelledby="craft-${i + 1}-title">
        ${Depth({ far: FAR_FOR[it.pose] || 'camera', props: PROPS_FOR[it.pose] || ['lens', 'phone'], flip: !flip })}
        <div class="scene__inner">
          <div class="scene__copy">
            <p class="meta scene__label" data-fx>${pad2(i + 1)} / ${total}</p>
            <h3 class="scene__title" id="craft-${i + 1}-title" aria-label="${esc(`${it.name}. ${it.tagline}`)}">
              <span class="line" aria-hidden="true"><span class="line__i">${esc(it.name)}</span></span>
              ${it.tagline ? `<span class="line line--tag" aria-hidden="true"><span class="line__i hl">${esc(it.tagline)}</span></span>` : ''}
            </h3>
            ${it.text ? `<p class="scene__text" data-fx>${esc(it.text)}</p>` : ''}
            ${it.bullets.length ? `<ul class="bullets" data-fx>${it.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
          </div>
          ${Stage(it.pose || 'camera', `The Tall Man: ${it.name}`, flip)}
          ${Keys(it.keywords)}
        </div>
      </article>`;
    }).join('')}
  </section>`;
}

/* ---------- Scene 03: sectors, a scroll-scrubbed credit roll ---------- */

export function Sectors({ copy }) {
  const s = copy.sectors;
  if (!s.items.length) return '';
  return `
  <section class="scene scene--sectors" id="sectors" data-scene aria-labelledby="sectors-title">
    ${Depth({ far: 'camera', props: ['lens', 'camera'], flip: true })}
    <div class="scene__inner scene__inner--center">
      <p class="meta scene__label" data-fx>${esc(s.label)}</p>
      ${Title(s.title, { id: 'sectors-title', cls: 'scene__title scene__title--center' })}
    </div>
    <ul class="roll" data-roll>
      ${s.items.map((it, i) => `<li class="roll__item${i % 3 === 1 ? ' is-hot' : ''}">${esc(it)}<span class="roll__dot" aria-hidden="true"></span></li>`).join('')}
    </ul>
  </section>`;
}

/* ---------- Scene 06: markets ---------- */

export function Markets({ copy }) {
  const m = copy.markets;
  if (!m.items.length) return '';
  return `
  <section class="scene scene--markets" id="markets" data-scene aria-labelledby="markets-title">
    ${Depth({ far: 'phone', props: ['mouse', 'phone'] })}
    <div class="scene__inner">
      <div class="scene__copy">
        <p class="meta scene__label" data-fx>${esc(m.label)}</p>
        ${Title(m.title, { id: 'markets-title' })}
        <p class="scene__text" data-fx>${esc(m.text)}</p>
        <ol class="markets" data-markets>
          ${m.items.map((it, i) => `<li class="market"><span class="meta market__n">${pad2(i + 1)}</span><span class="market__name">${esc(it.name)}</span><span class="meta market__code">${esc(it.code || '')}</span></li>`).join('')}
        </ol>
      </div>
      ${Stage(m.pose || 'mouse', 'The Tall Man steering a campaign with a mouse')}
    </div>
  </section>`;
}

/* ---------- Scene 07: philosophy + process ---------- */

export function Idea({ copy }) {
  const p = copy.philosophy;
  const steps = copy.process.steps;
  return `
  <section class="scene scene--idea" id="philosophy" data-scene aria-labelledby="idea-title">
    ${Depth({ far: 'binoculars', props: ['lens', 'laptop'], flip: true })}
    <div class="scene__inner scene__inner--stack">
      <p class="meta scene__label" data-fx>${esc(p.label)}</p>
      ${Title(p.statement, { id: 'idea-title', cls: 'scene__title scene__title--wide' })}
      <dl class="points" data-fx>
        ${p.points.map((pt) => `<div class="point"><dt>${rich(pt.term)}</dt><dd>${rich(pt.text)}</dd></div>`).join('')}
      </dl>
      ${steps.length ? `
      <div class="process" id="process" data-process>
        <h3 class="meta process__title">${esc(copy.process.title)}</h3>
        <div class="process__rail" aria-hidden="true"><span class="process__fill" data-process-fill></span></div>
        <ol class="process__steps">
          ${steps.map((s, i) => `<li class="step" data-step><span class="meta step__n">${pad2(i + 1)}</span><span class="step__name">${esc(s.name)}</span><span class="step__text">${esc(s.text)}</span></li>`).join('')}
        </ol>
      </div>` : ''}
    </div>
  </section>`;
}

/* ---------- Final scene: contact ---------- */

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
  <section class="scene scene--finale" id="contact" data-scene aria-labelledby="cta-title">
    ${Depth({ far: 'camera', props: ['mouse', 'lens', 'phone'], flip: true })}
    <div class="scene__inner">
      <div class="scene__copy">
        <p class="meta scene__label" data-fx>${esc(c.label)}</p>
        ${Title(c.lines, { id: 'cta-title', cls: 'scene__title scene__title--mega' })}
        ${c.text ? `<p class="scene__text" data-fx>${esc(c.text)}</p>` : ''}
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
      ${Stage(c.pose || 'mouse', 'The Tall Man offering a mouse: the next click is yours')}
    </div>
  </section>`;
}
