import { $, $$, esc } from '../lib/dom.js';
import { Wordmark } from './Wordmark.js';
import { socialLinks } from './contactLinks.js';
import { SoundToggle } from './Sound.js';

export function Header({ agency, nav }) {
  return `
  <header class="site-header" data-header>
    <a class="site-header__brand" href="#top" aria-label="${esc(agency.name)}, back to top">${Wordmark(agency)}</a>
    <nav class="site-nav" aria-label="Primary">
      <ul class="site-nav__list">
        ${nav.filter((item) => item.href !== '#contact').map((item) => `<li><a class="site-nav__link" href="${esc(item.href)}" data-nav-link><span>${esc(item.label)}</span></a></li>`).join('')}
      </ul>
    </nav>
    ${SoundToggle()}
    <a class="btn btn--sm site-header__cta" href="#contact" data-magnetic><span class="btn__label">Let's talk</span><span class="btn__arrow" aria-hidden="true">→</span></a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" data-menu-toggle>
      <span class="menu-toggle__label" data-menu-label>Menu</span>
      <span class="menu-toggle__bars" aria-hidden="true"><span></span><span></span></span>
    </button>
  </header>`;
}

export function MobileMenu({ nav, location, contact }) {
  const socials = socialLinks(contact);
  return `
  <div class="mobile-menu" id="mobile-menu" data-mobile-menu hidden>
    <nav class="mobile-menu__nav" aria-label="Mobile">
      <ol class="mobile-menu__list">
        ${nav.map((item, i) => `
          <li class="mobile-menu__item" style="--i:${i}">
            <a class="mobile-menu__link" href="${esc(item.href)}" data-menu-link>
              <span class="mobile-menu__index">${String(i + 1).padStart(2, '0')}</span>
              <span class="mobile-menu__label">${esc(item.label)}</span>
            </a>
          </li>`).join('')}
      </ol>
    </nav>
    <div class="mobile-menu__foot">
      <p class="meta">${location.addressLines.map(esc).join('<br>')}</p>
      ${socials.length ? `<ul class="mobile-menu__social">${socials.map((s) => `<li><a class="meta link-line" href="${esc(s.href)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`).join('')}</ul>` : ''}
    </div>
  </div>`;
}

export function initHeader() {
  const toggle = $('[data-menu-toggle]');
  const menu = $('[data-mobile-menu]');
  const label = $('[data-menu-label]');
  if (!toggle || !menu) return;

  let open = false;
  const setOpen = (next) => {
    open = next;
    toggle.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'Close' : 'Menu';
    document.documentElement.classList.toggle('menu-open', open);
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add('is-open'));
      $('[data-menu-link]', menu)?.focus({ preventScroll: true });
    } else {
      menu.classList.remove('is-open');
      window.setTimeout(() => { if (!open) menu.hidden = true; }, 500);
    }
  };

  toggle.addEventListener('click', () => setOpen(!open));
  $$('[data-menu-link]', menu).forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) { setOpen(false); toggle.focus(); }
  });
  // Close the overlay if the viewport grows past the mobile breakpoint.
  window.matchMedia('(min-width: 900px)').addEventListener('change', (e) => { if (e.matches && open) setOpen(false); });
}
