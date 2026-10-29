import { esc } from '../lib/dom.js';

export function Intro({ copy }) {
  return `
  <section class="intro s-light" id="intro" aria-labelledby="intro-label">
    <div class="wrap intro__grid">
      <p class="meta intro__label" id="intro-label">${esc(copy.intro.label)}</p>
      <p class="intro__text" data-scrub-words>${esc(copy.intro.text)}</p>
    </div>
  </section>`;
}

export function Marquee({ copy }) {
  const run = copy.marquee.map((t) => `<span class="marquee__item">${esc(t)}</span><span class="marquee__sep" aria-hidden="true">/</span>`).join('');
  return `
  <div class="marquee s-dark" aria-label="${esc(copy.marquee.join(', '))}">
    <div class="marquee__track" aria-hidden="true">
      <div class="marquee__run">${run}</div>
      <div class="marquee__run">${run}</div>
    </div>
  </div>`;
}
