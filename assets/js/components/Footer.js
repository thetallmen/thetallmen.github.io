import { esc } from '../lib/dom.js';
import { Wordmark } from './Wordmark.js';
import { socialLinks } from './contactLinks.js';

export function Footer({ agency, nav, contact, copy }) {
  const socials = socialLinks(contact);
  const year = new Date().getFullYear();
  return `
  <footer class="site-footer s-dark" aria-label="Footer">
    <div class="wrap footer__top">
      <p class="meta">${esc(agency.city)} — ${esc(agency.country)}</p>
      <nav aria-label="Footer">
        <ul class="footer__nav">
          ${nav.map((n) => `<li><a class="link-line" href="${esc(n.href)}">${esc(n.label)}</a></li>`).join('')}
        </ul>
      </nav>
      ${socials.length ? `<ul class="footer__social">${socials.map((s) => `<li><a class="link-line" href="${esc(s.href)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`).join('')}</ul>` : ''}
      <a class="link-line footer__top-link" href="#top">${esc(copy.footer.backToTop)}</a>
    </div>
    <div class="footer__mark wrap" aria-hidden="true">${Wordmark(agency, { size: 'wordmark--xl' })}</div>
    <div class="wrap footer__legal">
      <p class="meta">© ${year} ${esc(agency.name)}. ${esc(copy.footer.rights)}</p>
      <p class="meta">${esc(agency.descriptor)}</p>
    </div>
  </footer>`;
}
