import { esc } from '../lib/dom.js';
import { directLinks, socialLinks, mapsHref } from './contactLinks.js';
import { Figure } from './Figure.js';

// The button points at the first contact route that exists, falling back to the map,
// so the section reads complete before any contact detail is filled in.
function primaryAction({ copy, contact, location }) {
  const direct = directLinks(contact);
  if (direct.length) return { href: direct[0].href, label: copy.cta.buttonLabel, external: direct[0].key === 'whatsapp' };
  const map = mapsHref(location);
  if (map) return { href: map, label: copy.cta.visitLabel, external: true };
  return null;
}

// "Let's make it bigger." The character offers a mouse: the next click is yours.
export function CTA({ copy, contact, location }) {
  const direct = directLinks(contact);
  const socials = socialLinks(contact);
  const action = primaryAction({ copy, contact, location });
  return `
  <section class="cta scene" id="contact" aria-labelledby="cta-title">
    <div class="scene__text wrap">
      <p class="meta scene__label">${esc(copy.cta.label)}</p>
      <h2 class="scene__title cta__title" id="cta-title">
        ${copy.cta.lines.map((l) => `<span class="scene__line" data-reveal="words">${esc(l)}</span>`).join('')}
      </h2>
      ${copy.cta.text ? `<p class="cta__text" data-reveal="fade">${esc(copy.cta.text)}</p>` : ''}
      ${action ? `
        <a class="btn-trace" href="${esc(action.href)}" data-cursor="go" data-magnetic${action.external ? ' target="_blank" rel="noopener"' : ''}>
          <span>${esc(action.label)}</span><span aria-hidden="true">→</span>
          <svg class="trace btn-trace__trace" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M8 18 C30 4 80 2 96 20 C106 40 98 86 70 94 C40 102 6 92 3 62 C0 38 12 22 30 14" pathLength="1"/></svg>
        </a>` : ''}
      <div class="cta__details">
        ${direct.length ? `
          <ul class="cta__list">
            ${direct.map((d) => `<li><span class="meta">${esc(d.label)}</span><a class="link-line" href="${esc(d.href)}"${d.key === 'whatsapp' ? ' target="_blank" rel="noopener"' : ''}>${esc(d.value)}</a></li>`).join('')}
          </ul>` : ''}
        <p class="cta__address"><span class="meta">Studio</span>${location.addressLines.map(esc).join(', ')}</p>
        ${socials.length ? `
          <ul class="cta__social">
            ${socials.map((s) => `<li><a class="link-line" href="${esc(s.href)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`).join('')}
          </ul>` : ''}
      </div>
    </div>
    ${Figure(copy.cta.figure, { className: 'scene__fig', seed: 97 })}
  </section>`;
}
