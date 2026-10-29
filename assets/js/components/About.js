import { esc } from '../lib/dom.js';
import { SectionTitle } from './SectionTitle.js';
import { mapsHref } from './contactLinks.js';

function Team(team) {
  if (!team.length) return '';
  return `
  <div class="about__block">
    <h3 class="meta">Team</h3>
    <ul class="about__team">
      ${team.map((m) => `
        <li>
          ${m.photo ? `<img src="${esc(m.photo)}" alt="${esc(m.name)}" loading="lazy" decoding="async">` : ''}
          <span class="about__team-name">${esc(m.name)}</span>
          ${m.role ? `<span class="meta">${esc(m.role)}</span>` : ''}
        </li>`).join('')}
    </ul>
  </div>`;
}

function Culture(lines) {
  if (!lines.length) return '';
  return `
  <div class="about__block">
    <h3 class="meta">Culture</h3>
    <ul class="about__culture">${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
  </div>`;
}

export function About({ copy }) {
  const a = copy.about;
  return `
  <section class="about" id="about" aria-labelledby="about-title">
    ${SectionTitle({ id: 'about-title', title: a.title })}
    <div class="wrap about__grid">
      <p class="about__statement">${a.statement.map((l) => `<span class="about__line" data-reveal="words">${esc(l)}</span>`).join('')}</p>
      <div class="about__story">
        ${a.story.map((p) => `<p data-reveal="fade">${esc(p)}</p>`).join('')}
      </div>
      ${Team(a.team)}
      ${Culture(a.culture)}
    </div>
  </section>`;
}

export function Location({ copy, location }) {
  const href = mapsHref(location);
  const extra = copy.about.locations;
  return `
  <section class="location" id="location" aria-labelledby="location-title">
    <div class="wrap location__grid">
      <h2 class="meta" id="location-title">${esc(copy.location.label)}</h2>
      <address class="location__address" data-reveal="fade">
        ${location.addressLines.map((l) => `<span>${esc(l)}</span>`).join('')}
      </address>
      ${href ? `<a class="link-arrow" href="${esc(href)}" target="_blank" rel="noopener" data-magnetic>${esc(copy.location.mapsLabel)}<span aria-hidden="true">&nbsp;↗</span><span class="visually-hidden"> (opens in a new tab)</span></a>` : ''}
      ${extra.length ? `<ul class="location__more">${extra.map((loc) => `<li><span class="meta">${esc(loc.city)}</span> ${loc.addressLines.map(esc).join(', ')}</li>`).join('')}</ul>` : ''}
    </div>
  </section>`;
}
