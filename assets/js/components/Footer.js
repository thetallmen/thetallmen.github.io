import { esc } from '../lib/dom.js';
import { Wordmark } from './Wordmark.js';
import { socialLinks } from './contactLinks.js';
import { Figure } from './Figure.js';
import { Keywords } from './Hero.js';

// Clean footer. Only the Tall Man's stride is visible, walking out of the page,
// with the red trace running off the edge.
export function Footer({ agency, nav, contact, copy }) {
  const socials = socialLinks(contact);
  const year = new Date().getFullYear();
  return `
  <footer class="site-footer" aria-label="Footer">
    <div class="wrap footer__grid">
      <div class="footer__brand">
        ${Wordmark(agency)}
        <p class="meta">${esc(agency.descriptor)}</p>
        <p class="meta">${esc(agency.city)} — ${esc(agency.country)}</p>
      </div>
      <nav aria-label="Footer">
        <ul class="footer__nav">
          ${nav.map((n) => `<li><a class="link-line" href="${esc(n.href)}">${esc(n.label)}</a></li>`).join('')}
        </ul>
      </nav>
      ${socials.length ? `<ul class="footer__social">${socials.map((s) => `<li><a class="link-line" href="${esc(s.href)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`).join('')}</ul>` : ''}
      <a class="link-line footer__top-link" href="#top"><span aria-hidden="true">↑</span> ${esc(copy.footer.backToTop)}</a>
      ${Keywords(copy.footer.keywords, 'footer__keys')}
    </div>
    ${Figure(copy.footer.figure, { className: 'footer__fig', seed: 101 })}
    <div class="wrap footer__legal">
      <p class="meta">© ${year} ${esc(agency.name)}. ${esc(copy.footer.rights)}</p>
    </div>
  </footer>`;
}
