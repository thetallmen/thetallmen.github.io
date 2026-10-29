import { esc } from '../lib/dom.js';

export function Hero({ agency, copy }) {
  const { lines, lede, scrollLabel } = copy.hero;
  return `
  <section class="hero s-dark" id="top" aria-labelledby="hero-title" data-hero>
    <div class="hero__meta wrap">
      <span class="meta">${esc(agency.descriptor)}</span>
      <span class="meta">${esc(agency.city)} — ${esc(agency.country)}</span>
    </div>

    <h1 class="hero__title" id="hero-title" aria-label="${esc(lines.join(' '))}">
      ${lines.map((line, i) => `
        <span class="hero__line hero__line--${i + 1}" aria-hidden="true" data-depth="${(i + 1) * 0.35}">
          <span class="hero__line-i" style="--i:${i}">${esc(line)}</span>
        </span>`).join('')}
    </h1>

    <span class="hero__rule" aria-hidden="true"></span>

    <div class="hero__foot wrap">
      <p class="hero__lede" data-reveal="fade">${esc(lede)}</p>
      <a class="scroll-cue" href="#intro">
        <span class="meta">${esc(scrollLabel)}</span>
        <span class="scroll-cue__line" aria-hidden="true"></span>
      </a>
    </div>
  </section>`;
}
