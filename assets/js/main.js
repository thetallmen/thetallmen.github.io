// Entry point: loads content/*.json, renders every section, then wires up behaviour.

import { loadContent } from './config.js';
import { $ } from './lib/dom.js';
import { Header, MobileMenu, initHeader } from './components/Header.js';
import { Hero } from './components/Hero.js';
import { Intro, Marquee } from './components/Intro.js';
import { Work } from './components/ProjectItem.js';
import { FeaturedFilm, VideoModal, initVideoModal, initLazyVideos } from './components/VideoPlayer.js';
import { Capabilities, Clients, Philosophy, Process } from './components/Capabilities.js';
import { About, Location } from './components/About.js';
import { CTA } from './components/CTA.js';
import { Footer } from './components/Footer.js';
import { initCustomCursor } from './components/CustomCursor.js';
import { runLoader } from './components/Loader.js';
import { initReveals, playHeroEntrance, initScrollEffects, initMagnetic, initAnchors } from './motion.js';

async function start() {
  const { agency, nav, copy, contact, location, projects, featuredFilm, locale } = await loadContent();

  document.documentElement.lang = locale.lang;
  document.documentElement.dir = locale.dir;

  $('[data-slot="header"]').innerHTML = Header({ agency, nav }) + MobileMenu({ nav, location, contact });

  $('[data-slot="main"]').innerHTML = [
    Hero({ agency, copy }),
    Intro({ copy }),
    copy.marquee.length ? Marquee({ copy }) : '',
    projects.length ? Work({ copy, projects }) : '',
    featuredFilm ? FeaturedFilm({ copy, film: featuredFilm }) : '',
    copy.capabilities.items.length ? Capabilities({ copy }) : '',
    copy.clients.items.length ? Clients({ copy }) : '',
    Philosophy({ copy }),
    copy.process.steps.length ? Process({ copy }) : '',
    About({ copy }),
    location.addressLines.length ? Location({ copy, location }) : '',
    CTA({ copy, contact, location }),
  ].join('');

  $('[data-slot="footer"]').innerHTML = Footer({ agency, nav, contact, copy });
  $('[data-slot="modal"]').innerHTML = VideoModal();

  initHeader();
  initReveals();
  initScrollEffects();
  initMagnetic();
  initAnchors();
  initVideoModal();
  initLazyVideos();
  initCustomCursor();

  document.documentElement.classList.add('is-ready');
  // Content arrives after first paint, so honour a #section link once it exists.
  if (window.location.hash) {
    document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
  }
  return runLoader(agency).then(playHeroEntrance);
}

start().catch((err) => {
  console.error(err);
  document.querySelector('[data-loader]')?.remove();
  $('[data-slot="main"]').innerHTML = '<p class="noscript">The content could not be loaded. Please refresh the page.</p>';
});
