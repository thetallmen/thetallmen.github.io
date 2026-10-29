import { esc } from '../lib/dom.js';
import { directLinks, socialLinks, mapsHref } from './contactLinks.js';

// The button points at the first contact route that exists, falling back to the map,
// so the section reads complete before any contact detail is filled in.
function primaryAction({ copy, contact, location }) {
  const direct = directLinks(contact);
  if (direct.length) return { href: direct[0].href, label: copy.cta.buttonLabel, external: direct[0].key === 'whatsapp' };
  const map = mapsHref(location);
  if (map) return { href: map, label: copy.cta.visitLabel, external: true };
  return null;
}

export function CTA({ copy, contact, location }) {
  const direct = directLinks(contact);
  const socials = socialLinks(contact);
  const action = primaryAction({ copy, contact, location });
  return `
  <section class="cta s-light" id="contact" aria-labelledby="cta-title">
    <div class="wrap">
      <p class="meta">${esc(copy.cta.label)}</p>
      <h2 class="cta__title" id="cta-title">
        ${copy.cta.lines.map((l, i) => `<span class="cta__line cta__line--${i + 1}" data-reveal="words">${esc(l)}</span>`).join('')}
      </h2>
      <div class="cta__row">
        ${action ? `
          <a class="cta__button" href="${esc(action.href)}" data-magnetic${action.external ? ' target="_blank" rel="noopener"' : ''}>
            <span>${esc(action.label)}</span>
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
    </div>
  </section>`;
}
