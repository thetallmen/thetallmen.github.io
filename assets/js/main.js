// Entry point: loads content/*.json, renders the page, then wires up behaviour.

import { loadContent } from './config.js';
import { $ } from './lib/dom.js';
import { Header, MobileMenu, initHeader } from './components/Header.js';
import { Clients } from './components/Sections.js';
import { Hero, About, Capabilities, Services, Contact, initJourney, playHero } from './components/Journey.js';
import { IntroMarkup, runIntro } from './components/Intro.js';
import { initSound } from './components/Sound.js';
import { Selected, initCarousel } from './components/Carousel.js';
import { Lightbox, initLightbox } from './components/Archive.js';
import { VideoModal, initVideoModal } from './components/VideoPlayer.js';
import { Footer } from './components/Footer.js';
import { initCustomCursor } from './components/CustomCursor.js';
import { initTraces } from './components/Trace.js';
import { initMotion, initMagnetic, initAnchors } from './motion.js';

async function start() {
  const { agency, nav, copy, contact, location, projects, featured, locale } = await loadContent();

  document.documentElement.lang = locale.lang;
  document.documentElement.dir = locale.dir;

  $('[data-slot="header"]').innerHTML = Header({ agency, nav }) + MobileMenu({ nav, location, contact });

  // The journey: hero → about → capabilities → one chapter per service → work → clients → contact.
  // The stacked chapters live in one wrapper, so they stop sticking where the work begins.
  $('[data-slot="main"]').innerHTML = [
    '<div class="journey">',
    Hero({ agency, copy, items: copy.capabilities.items }),
    About({ copy }),
    Capabilities({ copy }),
    Services({ copy }),
    '</div>',
    Selected({ copy, featured, projects }),
    Clients({ copy, featured, projects }),
    Contact({ copy, contact, location }),
  ].join('');

  $('[data-slot="footer"]').innerHTML = Footer({ agency, nav, contact, copy });
  $('[data-slot="modal"]').innerHTML = VideoModal() + Lightbox() + IntroMarkup(agency);

  initHeader();
  initSound();
  initCarousel();
  initVideoModal();
  initLightbox(projects);
  initTraces();
  initMagnetic();
  initAnchors();
  initCustomCursor();
  initMotion();
  initJourney();

  document.documentElement.classList.add('is-ready');
  if (window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
  await runIntro();
  // The hero's headline rises with the figure (motion.js reveals [data-rv] in the hero).
  document.querySelectorAll('[data-hero] [data-rv]').forEach((el) => el.classList.add('is-in'));
  setTimeout(() => document.querySelectorAll('[data-hero] [data-rv]').forEach((el) => el.classList.add('is-settled')), 1100);
  playHero();
}

start().catch((err) => {
  console.error(err);
  $('[data-slot="main"]').innerHTML = '<p class="noscript">The content could not be loaded. Please refresh the page.</p>';
});
