import { esc, plain, rich } from '../lib/dom.js';
import { Figure } from './Figure.js';

// Small stacked keyword column used beside the character in most sections.
export const Keywords = (words, extra = '') =>
  words.length ? `<ul class="keys meta ${extra}" aria-hidden="true">${words.map((w) => `<li>${esc(w)}</li>`).join('')}<li class="keys__rule"></li></ul>` : '';

export function Hero({ agency, copy }) {
  const { lines, lede, keywords, scrollLabel, figure } = copy.hero;
  return `
  <section class="hero" id="top" aria-labelledby="hero-title" data-hero>
    <div class="hero__text wrap">
      <h1 class="hero__title" id="hero-title" aria-label="${esc(plain(lines.join(' ')))}">
        ${lines.map((line, i) => `
          <span class="hero__line hero__line--${i + 1}" aria-hidden="true" data-depth="${(i + 1) * 0.12}">
            <span class="hero__line-i" style="--i:${i}">${rich(line)}</span>
          </span>`).join('')}
      </h1>
      <p class="hero__lede" data-reveal="fade">${rich(lede)}</p>
      <a class="scroll-cue" href="#intro">
        <span class="scroll-cue__line" aria-hidden="true"></span>
        <span class="meta">${esc(scrollLabel)}</span>
      </a>
    </div>
    ${Figure(figure, { className: 'hero__fig', seed: 11, eager: true })}
    <div class="hero__side">
      ${Keywords(keywords)}
      <p class="meta hero__place">${esc(agency.city)} — ${esc(agency.country)}</p>
    </div>
  </section>`;
}
