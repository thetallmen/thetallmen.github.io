import { $, $$, esc, pad2, prefersReducedMotion, hasFinePointer, lerp } from '../lib/dom.js';
import { Title } from './Sections.js';
import { ObjectArt } from './Objects.js';
import { smooth } from './Trace.js';
import { directLinks, socialLinks, mapsHref } from './contactLinks.js';
import { play, mood } from './Sound.js';

/* =========================================================================
   THE JOURNEY — the page as one continuous visual story.
   Each chapter is a full-screen composition: one faceless tall man, one
   marketing object, one headline, one red gesture. On desktop the chapters
   stack: the next one rises over the last like a turned page, while the one
   underneath sinks back a little. Every figure enters in its own way, told by
   its object (camera pushes in, binoculars come into focus, the phone swipes
   up, the clapper waits in the dark for the light...). Figures are moved only
   with masks, position, scale and a few degrees: the artwork is never warped.

   pose → [object point on the image (fractions), side the figure stands on, sound]
   ========================================================================= */

const POSES = {
  camera: { at: [0.8, 0.49], side: 'right', sfx: 'shutter' },
  laptop: { at: [0.57, 0.42], side: 'left', sfx: 'startup' },
  keyboard: { at: [0.57, 0.6], side: 'right', sfx: 'keys' },
  binoculars: { at: [0.66, 0.16], side: 'right', sfx: 'focus' },
  stylus: { at: [0.37, 0.52], side: 'left', sfx: 'stylus' },
  phone: { at: [0.33, 0.3], side: 'right', sfx: 'swipe' },
  mouse: { at: [0.38, 0.6], side: 'left', sfx: 'click' },
  clapper: { at: [0.43, 0.5], side: 'right', sfx: 'clap' },
  hand: { at: [0.27, 0.42], side: 'right', sfx: 'rise' },
};

const Btn = ({ href, label, kind = 'solid', external = false }) => `
  <a class="btn btn--${kind}" href="${esc(href)}" data-magnetic${external ? ' target="_blank" rel="noopener"' : ''}>
    <span class="btn__label">${esc(label)}</span><span class="btn__arrow" aria-hidden="true">→</span>
  </a>`;

const Figure = (fig, pose, eager = false) => (fig ? `
  <div class="ch__fig" data-ch-fig>
    <img class="ch__img" src="${esc(fig.src)}" alt="${esc(fig.alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" draggable="false">
  </div>` : `<div class="ch__fig ch__fig--drawn" data-ch-fig>${ObjectArt(pose)}</div>`);

const Bg = (src) => (src ? `<div class="ch__bg" aria-hidden="true"><img src="${esc(src)}" alt="" loading="lazy" decoding="async"></div>` : '');

const Route = () => `
  <svg class="ch__route" aria-hidden="true" focusable="false"><path class="ch__route-line" pathLength="1"/><path class="ch__route-mark" pathLength="1"/></svg>`;

function Chapter({ id, pose, n, label, ghost, title, text = '', extra = '', fig, bg, cls = '', side, eager = false }) {
  const p = POSES[pose] || POSES.camera;
  // Chapters are sticky on desktop, so links aim at a plain anchor in the flow instead.
  return `
  <span class="ch-anchor" id="${id}" aria-hidden="true"></span>
  <section class="ch ch--${pose} ch--${side || p.side} ${cls}" data-ch="${pose}" aria-labelledby="${id}-title">
    ${Bg(bg)}
    <span class="ch__ghost" aria-hidden="true">${esc(ghost)}</span>
    ${Figure(fig, pose, eager)}
    <div class="ch__shade" aria-hidden="true"></div>
    <div class="ch__copy wrap">
      <div class="ch__text-col">
        <p class="meta ch__n" data-rv="fade"><span class="ch__num">${n}</span><span class="ch__dash" aria-hidden="true"></span>${esc(label)}</p>
        ${Title(title, { id: `${id}-title`, cls: 'title ch__title' })}
        ${text ? `<p class="ch__text" data-rv="fade">${esc(text)}</p>` : ''}
        ${extra}
      </div>
    </div>
    ${Route()}
  </section>`;
}

/* ---------- Hero: the poster comes to life ---------- */

export function Hero({ agency, copy, items }) {
  const h = copy.hero;
  const p = POSES.camera;
  return `
  <span class="ch-anchor" id="top" aria-hidden="true"></span>
  <section class="ch ch--camera ch--right ch--hero" data-ch="camera" data-hero aria-labelledby="hero-title">
    ${Bg(h.background)}
    ${Figure(h.figure, 'camera', true)}
    <div class="ch__shade" aria-hidden="true"></div>
    <div class="hx wrap">
      <div class="hx__left">
        <h1 class="hx__mark" id="hero-title" data-rv aria-label="${esc(h.lines.join(' '))}">
          ${h.lines.map((l, i) => `<span class="line" aria-hidden="true"><span class="line__i${/tall/i.test(l) ? ' hx__tall' : ''}" style="--l:${i}">${esc(l)}</span></span>`).join('')}
        </h1>
        <span class="hx__bar" aria-hidden="true"></span>
        <p class="meta hx__desc" data-step>${esc(agency.descriptor).split(' ').join('<br>')}</p>
      </div>
      <ul class="meta hx__list" data-step aria-label="What we do">
        ${items.slice(0, 5).map((it) => `<li>${esc(it.name)}</li>`).join('')}
      </ul>
      <p class="meta hx__persp" data-step aria-hidden="true"><span class="hx__plus"></span>A<br>taller<br>perspective</p>
      <div class="hx__foot" data-step>
        <p class="hx__lede">${esc(h.lede)}</p>
        <div class="hx__actions">${Btn({ href: '#contact', label: h.primaryLabel })}${Btn({ href: '#work', label: h.secondaryLabel, kind: 'ghost' })}</div>
      </div>
      <a class="hx__cue meta" href="#about" data-step><span class="hx__cue-line" aria-hidden="true"></span>Scroll</a>
    </div>
    ${Route()}
  </section>`;
}

/* ---------- Chapters ---------- */

export function About({ copy }) {
  const s = copy.studio;
  return Chapter({
    id: 'about', pose: 'laptop', n: '02', label: s.label || 'About', ghost: 'Perspective',
    title: s.statement, text: s.story, fig: s.figure, bg: s.background,
    extra: s.points.length ? `<ul class="ch__points" data-rv="stagger">${s.points.map((pt, i) => `<li style="--k:${i}"><span class="meta">${pad2(i + 1)}</span>${esc(pt.term)}</li>`).join('')}</ul>` : '',
  });
}

export function Capabilities({ copy }) {
  const s = copy.services;
  const items = copy.capabilities.items;
  const list = `
    <ol class="ch-list" data-rv="stagger">
      ${items.map((it, i) => `<li style="--k:${i}"><a class="ch-list__link" href="#service-${i + 1}"><span class="meta">${pad2(i + 1)}</span><span class="ch-list__name">${esc(it.name)}</span><span class="ch-list__tag">${esc(it.tagline)}</span></a></li>`).join('')}
    </ol>`;
  return Chapter({
    id: 'capabilities', pose: 'keyboard', n: '03', label: s.label || 'Capabilities', ghost: 'Execution',
    title: s.title, text: s.text, fig: s.figure, bg: s.background, extra: list, cls: 'ch--overview',
  });
}

export function Services({ copy }) {
  return copy.capabilities.items.map((it, i) => Chapter({
    id: `service-${i + 1}`, pose: it.pose, n: pad2(i + 4), label: it.name, ghost: it.name,
    title: [it.tagline || it.name], text: it.text, fig: it.figure, bg: it.background,
    extra: it.bullets.length ? `<ul class="ch__tags${it.pose === 'mouse' ? ' ch__tags--data' : ''}" data-rv="stagger">${it.bullets.map((b, k) => `<li style="--k:${k}">${esc(b)}</li>`).join('')}</ul>` : '',
  })).join('');
}

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
  const extra = `
    ${action ? `<div class="ch__cta" data-rv="fade" data-route-target>${Btn({ href: action.href, label: action.label, kind: 'big', external: action.external })}</div>` : ''}
    <div class="ch__details" data-rv="fade">
      ${direct.map((d) => `<p><span class="meta">${esc(d.label)}</span><a class="link-line" href="${esc(d.href)}"${d.key === 'whatsapp' ? ' target="_blank" rel="noopener"' : ''}>${esc(d.value)}</a></p>`).join('')}
      ${location.addressLines.length ? `<p><span class="meta">${esc(copy.location.label)}</span><span>${location.addressLines.map(esc).join(', ')}</span></p>` : ''}
      ${socials.length ? `<p class="ch__social">${socials.map((s) => `<a class="link-line" href="${esc(s.href)}" target="_blank" rel="noopener">${esc(s.label)}</a>`).join('')}</p>` : ''}
    </div>`;
  return Chapter({
    id: 'contact', pose: 'hand', n: '11', label: c.label || 'Contact', ghost: 'Look',
    title: c.lines, text: c.text, fig: c.figure, bg: c.background, extra, cls: 'ch--contact',
  });
}

/* ---------- Behaviour ---------- */

const reduce = prefersReducedMotion();

// The red route: from the headline to the object the man holds (or to the CTA).
function drawRoute(ch) {
  const svg = $('.ch__route', ch);
  const img = $('.ch__img', ch);
  if (!svg || !img || !img.naturalWidth) return 0;
  const pose = POSES[ch.dataset.ch] || POSES.camera;
  const s = ch.getBoundingClientRect();
  const r = img.getBoundingClientRect();
  const t = ($('[data-route-target] .btn', ch) || $('.ch__title, .hx__mark', ch)).getBoundingClientRect();
  const w = s.width, h = s.height;
  svg.setAttribute('viewBox', `0 0 ${w.toFixed(0)} ${h.toFixed(0)}`);
  const ox = r.left - s.left + r.width * pose.at[0];
  const oy = r.top - s.top + r.height * pose.at[1];
  const toRight = ox > (t.left - s.left) + t.width / 2;
  const sx = toRight ? t.right - s.left + 14 : t.left - s.left - 14;
  const sy = t.bottom - s.top - t.height * 0.25;
  const mx = (sx + ox) / 2, my = Math.max(sy, oy) + h * 0.06;
  const rad = Math.max(26, r.width * 0.07);
  // On phones the figure sits above the copy: only the circle, no route.
  const wide = window.innerWidth >= 900;
  const ex = ox + (toRight ? -rad : rad);
  $('.ch__route-line', svg).setAttribute('d', wide ? smooth([[sx, sy], [lerp(sx, mx, 0.6), my], [lerp(mx, ex, 0.6), lerp(my, oy, 0.5)], [ex, oy]]) : '');
  const pts = [];
  for (let k = -0.55; k <= 1.6; k += 0.09) {
    const a = k * Math.PI * (toRight ? -1 : 1) + (toRight ? 0 : Math.PI);
    pts.push([ox + Math.cos(a) * rad * (1 + 0.04 * Math.sin(a * 3)), oy + Math.sin(a) * rad * 0.82]);
  }
  $('.ch__route-mark', svg).setAttribute('d', smooth(pts));
  return 1;
}

// How each figure enters. Masks, position and scale only.
const ENTER = {
  camera: (g, f, img) => g.fromTo(f, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.out' })
    .fromTo(img, { scale: 1.12, yPercent: 6 }, { scale: 1, yPercent: 0, duration: 1.8, ease: 'expo.out' }, 0)
    .to(img, { scale: 1.025, duration: 2.4, ease: 'sine.inOut', transformOrigin: '80% 49%' }, 1.1),
  laptop: (g, f, img) => g.fromTo(f, { clipPath: 'polygon(0% 100%, 0% 100%, 0% 100%, 0% 100%)' }, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', duration: 1.3, ease: 'power3.inOut' })
    .fromTo(img, { xPercent: -6, rotate: -2 }, { xPercent: 0, rotate: 0, duration: 1.6, ease: 'expo.out' }, 0),
  keyboard: (g, f, img) => g.fromTo(img, { scale: 1.3, yPercent: 14, autoAlpha: 0 }, { scale: 1, yPercent: 0, autoAlpha: 1, duration: 1.5, ease: 'expo.out' }),
  binoculars: (g, f, img) => g.fromTo(f, { clipPath: 'inset(0% 48% 0% 48%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power3.inOut' })
    .fromTo(img, { filter: 'blur(10px)', scale: 1.06 }, { filter: 'blur(0px)', scale: 1, duration: 1.1, ease: 'power2.out' }, 0.5),
  stylus: (g, f, img) => g.fromTo(f, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power3.inOut' })
    .fromTo(img, { xPercent: -4 }, { xPercent: 0, duration: 1.4, ease: 'expo.out' }, 0),
  phone: (g, f, img) => g.fromTo(img, { yPercent: 100 }, { yPercent: 0, duration: 1.2, ease: 'expo.out' })
    .fromTo(img, { rotate: 3 }, { rotate: 0, duration: 1.4, ease: 'power2.out' }, 0),
  mouse: (g, f, img) => g.fromTo(img, { xPercent: -18, scale: 1.15, autoAlpha: 0 }, { xPercent: 0, scale: 1, autoAlpha: 1, duration: 1.4, ease: 'expo.out' }),
  clapper: (g, f, img, ch) => g.fromTo(ch, { '--lamp': 0 }, { '--lamp': 1, duration: 1.6, ease: 'power2.inOut' })
    .fromTo(f, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power3.out' }, 0.2)
    .fromTo(img, { scale: 1.08 }, { scale: 1, duration: 1.8, ease: 'expo.out' }, 0.2),
  hand: (g, f, img) => g.fromTo(f, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power3.inOut' })
    .fromTo(img, { xPercent: 12, rotate: 2 }, { xPercent: 0, rotate: 0, duration: 1.5, ease: 'expo.out' }, 0),
};

function enter(ch) {
  if (ch.dataset.entered) return;
  ch.dataset.entered = '1';
  const pose = ch.dataset.ch;
  const f = $('[data-ch-fig]', ch);
  const img = $('.ch__img', f) || f;
  const { gsap } = window;
  const finish = () => {
    ch.classList.add('is-entered');
    if (!drawRoute(ch)) return;
    ch.classList.add('is-routed');
    // The object's own sound lands with the red mark.
    setTimeout(() => play((POSES[pose] || {}).sfx), reduce ? 0 : 900);
  };
  if (reduce || !gsap) { finish(); return; }
  const g = gsap.timeline({ onComplete: () => gsap.set([f, img], { clearProps: 'clipPath,filter' }) });
  gsap.set(f, { clipPath: 'inset(0% 0% 0% 0%)' });
  (ENTER[pose] || ENTER.camera)(g, f, img, ch);
  g.call(finish, null, Math.min(g.duration(), 1.1));
}

export function initJourney() {
  const chapters = $$('[data-ch]');
  if (!chapters.length) return;
  const { gsap } = window;
  if (!reduce && gsap) chapters.forEach((ch) => { if (!ch.hasAttribute('data-hero')) gsap.set($('[data-ch-fig]', ch), { clipPath: 'inset(0% 0% 100% 0%)' }); });

  // Enter each chapter once; tell the sound world where we are.
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const ch = e.target;
      mood(ch.dataset.ch);
      if (!ch.hasAttribute('data-hero')) { enter(ch); play('whoosh'); }
    });
  }, { threshold: 0.42 });
  chapters.forEach((ch) => io.observe(ch));
  [['work', 'work'], ['clients', 'clients']].forEach(([id, m]) => {
    const el = document.getElementById(id);
    if (el) new IntersectionObserver(([e]) => { if (e.isIntersecting) { mood(m); play('whoosh'); } }, { threshold: 0.3 }).observe(el);
  });

  // Redraw routes when the layout changes.
  let t;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => $$('.is-routed').forEach(drawRoute), 150); });

  // Desktop: the page turns. The chapter underneath sinks back while the next rises over it.
  if (!reduce && gsap && window.ScrollTrigger) {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px) and (min-height: 620px)', () => {
      chapters.forEach((ch, i) => {
        const next = chapters[i + 1] || ch.nextElementSibling;
        if (!next) return;
        gsap.fromTo($('.ch__shade', ch), { opacity: 0 }, { opacity: 1, ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: true } });
        gsap.fromTo([$('[data-ch-fig]', ch), $('.ch__ghost', ch)].filter(Boolean), { scale: 1 }, { scale: 0.92, yPercent: -4, ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: true } });
        if (next.matches('[data-ch]')) {
          gsap.fromTo(next, { clipPath: 'inset(14% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 30%', scrub: true } });
        }
        // The ghost word drifts across while the chapter is on screen.
        const ghost = $('.ch__ghost', ch);
        if (ghost) gsap.fromTo(ghost, { xPercent: 6 }, { xPercent: -6, ease: 'none', scrollTrigger: { trigger: ch, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    });
  }

  // Desktop: figures lean a few pixels toward the pointer (depth, not distortion).
  if (!reduce && hasFinePointer()) {
    let tx = 0, ty = 0, x = 0, y = 0;
    window.addEventListener('pointermove', (e) => { tx = e.clientX / window.innerWidth - 0.5; ty = e.clientY / window.innerHeight - 0.5; }, { passive: true });
    const imgs = $$('.ch__img');
    const tick = () => {
      x = lerp(x, tx, 0.05); y = lerp(y, ty, 0.05);
      imgs.forEach((im) => { im.parentElement.style.translate = `${(x * 14).toFixed(2)}px ${(y * 10).toFixed(2)}px`; });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}

// The hero's own entrance, right after the intro: rise, push in, mark the lens, click.
export function playHero() {
  const ch = $('[data-hero]');
  if (!ch) return;
  mood('camera');
  const f = $('[data-ch-fig]', ch);
  const img = $('.ch__img', ch);
  const steps = $$('[data-step]', ch);
  const { gsap } = window;
  const done = () => { ch.classList.add('is-entered'); if (drawRoute(ch)) { ch.classList.add('is-routed'); setTimeout(() => play('shutter'), reduce ? 0 : 1300); } };
  if (reduce || !gsap) { steps.forEach((s) => s.classList.add('is-in')); done(); return; }
  const g = gsap.timeline();
  ENTER.camera(g, f, img);
  g.call(() => steps.forEach((s, i) => setTimeout(() => s.classList.add('is-in'), i * 120)), null, 0.5);
  g.call(done, null, 1.2);
  if (img && !img.complete) img.addEventListener('load', () => $$('.is-routed').forEach(drawRoute), { once: true });
}
