import { esc, pad2, rich } from '../lib/dom.js';
import { SectionTitle } from './SectionTitle.js';
import { Figure } from './Figure.js';
import { Keywords } from './Hero.js';

const slug = (name) => `cap-${String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

// Overview ("Ideas that go further.") followed by one scene per capability,
// each with the Tall Man holding that capability's object.
export function Capabilities({ copy }) {
  const { items } = copy.capabilities;
  const intro = copy.capabilitiesIntro;
  const total = pad2(items.length);
  const ids = items.map((item) => slug(item.name));

  return `
  <section class="caps" id="capabilities" aria-labelledby="caps-title">
    <div class="scene caps__overview">
      <div class="scene__text wrap">
        ${intro.label ? `<p class="meta scene__label">${esc(intro.label)}</p>` : ''}
        <h2 class="scene__title" id="caps-title">${intro.title.map((l) => `<span class="scene__line" data-reveal="words">${esc(l)}</span>`).join('')}</h2>
      </div>
      ${Figure(intro.figure, { className: 'scene__fig', seed: 31 })}
      <ol class="caps__index scene__side">
        ${items.map((item, i) => `<li><a class="caps__index-link" href="#${ids[i]}"><span class="meta">${pad2(i + 1)}</span><span>${esc(item.name)}</span></a></li>`).join('')}
      </ol>
    </div>

    ${items.map((item, i) => `
      <article class="scene cap" id="${ids[i]}" aria-labelledby="${ids[i]}-title">
        <div class="scene__text wrap">
          <p class="meta cap__count">${pad2(i + 1)} / ${total}</p>
          <h3 class="cap__name" id="${ids[i]}-title"><span data-reveal="words">${esc(item.name)}</span>
            ${item.tagline ? `<span class="cap__tagline hl" data-reveal="words">${esc(item.tagline)}</span>` : ''}</h3>
          ${item.text ? `<p class="cap__text" data-reveal="fade">${esc(item.text)}</p>` : ''}
          ${item.bullets.length ? `<ul class="cap__bullets" data-reveal="fade">${item.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
          <nav class="cap__nav" aria-label="${esc(item.name)}">
            <a class="link-line" href="#${i ? ids[i - 1] : 'capabilities'}"><span aria-hidden="true">←</span> Prev</a>
            <a class="link-line" href="#${i < items.length - 1 ? ids[i + 1] : 'process'}">Next <span aria-hidden="true">→</span></a>
          </nav>
        </div>
        ${Figure(item.figure, { className: 'scene__fig', seed: 41 + i * 7 })}
        <div class="scene__side">${Keywords(item.keywords)}</div>
      </article>`).join('')}
  </section>`;
}

// Hidden until client names or logos are added in the admin panel.
export function Clients({ copy }) {
  const { title, note, items } = copy.clients;
  return `
  <section class="clients wrap" id="clients" aria-labelledby="clients-title">
    <div class="clients__head">
      <h2 class="scene__title" id="clients-title">${title.map((l) => `<span class="scene__line" data-reveal="words">${esc(l)}</span>`).join('')}</h2>
      ${note ? `<p class="meta clients__note">${esc(note)}</p>` : ''}
    </div>
    <ul class="clients__list">
      ${items.map((c) => {
        const inner = c.logo ? `<img src="${esc(c.logo)}" alt="${esc(c.name)}" loading="lazy" decoding="async">` : `<span>${esc(c.name)}</span>`;
        return `<li class="client">${c.url ? `<a href="${esc(c.url)}" target="_blank" rel="noopener">${inner}</a>` : inner}</li>`;
      }).join('')}
    </ul>
  </section>`;
}

export function Philosophy({ copy }) {
  const { label, statement, points } = copy.philosophy;
  return `
  <section class="philo" id="philosophy" aria-labelledby="philo-title">
    <div class="wrap">
      <p class="meta">${esc(label)}</p>
      <h2 class="philo__statement" id="philo-title">
        ${statement.map((l) => `<span class="philo__line" data-reveal="words">${esc(l)}</span>`).join('')}
      </h2>
      <dl class="philo__points">
        ${points.map((p) => `
          <div class="philo__point" data-reveal="fade">
            <dt class="philo__term">${rich(p.term)}</dt>
            <dd class="philo__def">${rich(p.text)}</dd>
          </div>`).join('')}
      </dl>
    </div>
  </section>`;
}

export function Process({ copy }) {
  const { title, steps } = copy.process;
  return `
  <section class="process" id="process" aria-labelledby="process-title" data-process>
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
