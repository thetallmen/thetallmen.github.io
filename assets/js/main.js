// Entry point: loads content/*.json, renders the page, then wires up behaviour.

import { loadContent } from './config.js';
import { $ } from './lib/dom.js';
import { Header, MobileMenu, initHeader } from './components/Header.js';
import { Hero, Clients, Selected, Services, Studio, Contact } from './components/Sections.js';
import { Archive, Lightbox, initArchive, initLightbox } from './components/Archive.js';
import { VideoModal, initVideoModal } from './components/VideoPlayer.js';
import { Footer } from './components/Footer.js';
import { initCustomCursor } from './components/CustomCursor.js';
import { initTraces } from './components/Trace.js';
import { initMotion, playIntro, initMagnetic, initAnchors } from './motion.js';

async function start() {
  const { agency, nav, copy, contact, location, projects, featured, rest, locale } = await loadContent();

  document.documentElement.lang = locale.lang;
  document.documentElement.dir = locale.dir;

  $('[data-slot="header"]').innerHTML = Header({ agency, nav }) + MobileMenu({ nav, location, contact });

  // The running order: promise, proof, work, services, more work, studio, contact.
  $('[data-slot="main"]').innerHTML = [
    Hero({ agency, copy, featured }),
    Clients({ copy, featured, projects }),
    Selected({ copy, featured, projects }),
    Services({ copy }),
    Archive({ copy, projects: rest, all: projects }),
    Studio({ copy }),
    Contact({ copy, contact, location }),
  ].join('');

  $('[data-slot="footer"]').innerHTML = Footer({ agency, nav, contact, copy });
  $('[data-slot="modal"]').innerHTML = VideoModal() + Lightbox();

  initHeader();
  initArchive();
  initVideoModal();
  initLightbox(projects);
  initTraces();
  initMagnetic();
  initAnchors();
  initCustomCursor();
  initMotion();

  document.documentElement.classList.add('is-ready');
  if (window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
  playIntro();
}

start().catch((err) => {
  console.error(err);
  $('[data-slot="main"]').innerHTML = '<p class="noscript">The content could not be loaded. Please refresh the page.</p>';
});
