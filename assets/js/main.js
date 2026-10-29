// Entry point: loads content/*.json, renders the film scene by scene, then wires up behaviour.

import { loadContent } from './config.js';
import { $ } from './lib/dom.js';
import { Header, MobileMenu, initHeader } from './components/Header.js';
import { Opening, Perspective, Crafts, Sectors, Markets, Idea, Finale } from './components/Scenes.js';
import { Reel, Prints, initCarousels } from './components/Showcase.js';
import { VideoModal, initVideoModal } from './components/VideoPlayer.js';
import { Lightbox, initLightbox } from './components/Archive.js';
import { Footer } from './components/Footer.js';
import { initCustomCursor } from './components/CustomCursor.js';
import { runLoader } from './components/Loader.js';
import { initFilm, playOpening, initMagnetic, initAnchors } from './motion.js';

async function start() {
  const { agency, nav, copy, contact, location, projects, locale } = await loadContent();

  document.documentElement.lang = locale.lang;
  document.documentElement.dir = locale.dir;

  $('[data-slot="header"]').innerHTML = Header({ agency, nav }) + MobileMenu({ nav, location, contact });

  // The running order of the film.
  $('[data-slot="main"]').innerHTML = [
    Opening({ agency, copy }),
    Perspective({ copy }),
    copy.capabilities.items.length ? Crafts({ copy }) : '',
    Sectors({ copy }),
    Reel({ copy, projects }),
    Prints({ copy, projects }),
    Markets({ copy }),
    Idea({ copy }),
    Finale({ copy, contact, location }),
  ].join('');

  $('[data-slot="footer"]').innerHTML = Footer({ agency, nav, contact, copy });
  $('[data-slot="modal"]').innerHTML = VideoModal() + Lightbox();

  initHeader();
  initCarousels();
  initVideoModal();
  initLightbox(projects);
  initMagnetic();
  initAnchors();
  initCustomCursor();
  initFilm();

  document.documentElement.classList.add('is-ready');
  if (window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
  return runLoader(agency).then(playOpening);
}

start().catch((err) => {
  console.error(err);
  document.querySelector('[data-loader]')?.remove();
  $('[data-slot="main"]').innerHTML = '<p class="noscript">The content could not be loaded. Please refresh the page.</p>';
});
