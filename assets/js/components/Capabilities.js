import { esc, pad2 } from '../lib/dom.js';
import { SectionTitle } from './SectionTitle.js';

export function Capabilities({ copy }) {
  const { title, items } = copy.capabilities;
  return `
  <section class="caps s-dark" id="capabilities" aria-labelledby="caps-title">
    ${SectionTitle({ id: 'caps-title', title, count: items.length })}
    <ul class="caps__list">
      ${items.map((item, i) => `
        <li class="cap">
          <div class="cap__inner wrap">
            <span class="cap__index meta" aria-hidden="true">${pad2(i + 1)}</span>
            <h3 class="cap__name">${esc(item.name)}</h3>
            <p class="cap__text">${esc(item.text)}</p>
          </div>
        </li>`).join('')}
    </ul>
  </section>`;
}

export function Philosophy({ copy }) {
  const { label, statement, points } = copy.philosophy;
  return `
  <section class="philo s-light" id="philosophy" aria-labelledby="philo-title">
    <div class="wrap">
      <p class="meta">${esc(label)}</p>
      <h2 class="philo__statement" id="philo-title">
        ${statement.map((l) => `<span class="philo__line" data-reveal="words">${esc(l)}</span>`).join('')}
      </h2>
      <dl class="philo__points">
        ${points.map((p) => `
          <div class="philo__point" data-reveal="fade">
            <dt class="philo__term">${esc(p.term)}</dt>
            <dd class="philo__def">${esc(p.text)}</dd>
          </div>`).join('')}
      </dl>
    </div>
  </section>`;
}

export function Process({ copy }) {
  const { title, steps } = copy.process;
  return `
  <section class="process s-dark" id="process" aria-labelledby="process-title" data-process>
    ${SectionTitle({ id: 'process-title', title, count: steps.length })}
    <div class="wrap process__body">
      <div class="process__rail" aria-hidden="true"><span class="process__fill" data-process-fill></span></div>
      <ol class="process__steps">
        ${steps.map((s, i) => `
          <li class="step" data-step>
            <span class="step__num meta">${pad2(i + 1)}</span>
            <h3 class="step__name">${esc(s.name)}</h3>
            <p class="step__text">${esc(s.text)}</p>
          </li>`).join('')}
      </ol>
    </div>
  </section>`;
}
