import { esc } from '../lib/dom.js';
import { Figure } from './Figure.js';
import { Keywords } from './Hero.js';

// "A higher perspective on brands." The character with a laptop: the bigger picture.
export function Intro({ copy }) {
  const { label, title, text, keywords, figure } = copy.intro;
  return `
  <section class="intro scene" id="intro" aria-labelledby="intro-title">
    <div class="scene__text wrap">
      <p class="meta scene__label">${esc(label)}</p>
      <h2 class="scene__title" id="intro-title">${title.map((l) => `<span class="scene__line" data-reveal="words">${esc(l)}</span>`).join('')}</h2>
      <p class="intro__text" data-scrub-words>${esc(text)}</p>
    </div>
    ${Figure(figure, { className: 'scene__fig', seed: 23 })}
    <div class="scene__side">${Keywords(keywords)}</div>
  </section>`;
}

export function Marquee({ copy }) {
  const run = copy.marquee.map((t) => `<span class="marquee__item">${esc(t)}</span><span class="marquee__sep" aria-hidden="true">/</span>`).join('');
  return `
  <div class="marquee" aria-label="${esc(copy.marquee.join(', '))}">
    <div class="marquee__track" aria-hidden="true">
      <div class="marquee__run">${run}</div>
      <div class="marquee__run">${run}</div>
    </div>
  </div>`;
}
