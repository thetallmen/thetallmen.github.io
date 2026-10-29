/* =========================================================================
   THE TALL MEN — CONTENT LOADER
   All editable content lives in /content/*.json and is edited from /admin
   (no code needed). This module loads those files and fills in safe defaults,
   so an empty or deleted field never breaks the page.

   content/agency.json    EDIT AGENCY INFO, LOCATION, CONTACT DETAILS HERE
   content/copy.json      EDIT SITE COPY HERE
   content/services.json  EDIT CAPABILITIES + PROCESS HERE
   content/work.json      ADD PORTFOLIO PROJECTS + FEATURED FILM HERE
   ========================================================================= */

const FILES = ['agency', 'copy', 'services', 'work'];

async function getJSON(name) {
  const res = await fetch(`content/${name}.json`, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`content/${name}.json: ${res.status}`);
  return res.json();
}

// CMS uploads are saved as "/assets/uploads/x.jpg". Strip the leading slash so
// paths also work when the site is served from a sub-folder (e.g. GitHub Pages).
export const asset = (p) => (p ? String(p).replace(/^\/(?!\/)/, '') : '');

const arr = (v) => (Array.isArray(v) ? v.filter((x) => x !== null && x !== '') : []);
const str = (v) => (v === null || v === undefined ? '' : String(v));

function normalizeProject(p = {}, i = 0) {
  return {
    id: str(p.id) || `project-${String(i + 1).padStart(2, '0')}`,
    name: str(p.name),
    client: str(p.client),
    industry: str(p.industry),
    services: arr(p.services),
    year: str(p.year),
    description: str(p.description),
    type: str(p.type),
    featured: Boolean(p.featured),
    images: arr(p.images)
      .filter((img) => img && img.src)
      .map((img) => ({ src: asset(img.src), alt: str(img.alt), ratio: str(img.ratio) || '4:5' })),
    videos: arr(p.videos)
      // An external link (e.g. Cloudflare R2) wins over an uploaded file.
      .map((v) => ({ ...v, src: asset(v.url || v.src) }))
      .filter((v) => v.src)
      .map((v) => ({
        src: v.src,
        // Short silent loop for in-page previews; the full film opens in the player.
        preview: asset(v.preview) || v.src,
        poster: asset(v.poster),
        ratio: str(v.ratio) || '9:16',
        duration: Number(v.duration) || 0,
        hasAudio: Boolean(v.hasAudio),
        alt: str(v.alt),
      })),
    caseStudyUrl: str(p.caseStudyUrl),
  };
}

// Character figure: image + RED TRACE settings. No image means no figure.
function normalizeFigure(fig) {
  if (!fig || !fig.src) return null;
  return { src: asset(fig.src), alt: str(fig.alt), trace: fig.trace || {} };
}

export async function loadContent() {
  const [agency, copy, services, work] = await Promise.all(FILES.map(getJSON));

  copy.capabilities = services.capabilities || { title: 'Capabilities', items: [] };
  copy.capabilities.items = arr(copy.capabilities.items).map((item) => ({
    name: str(item.name),
    pose: str(item.pose),
    tagline: str(item.tagline),
    text: str(item.text),
    bullets: arr(item.bullets),
    keywords: arr(item.keywords),
    figure: normalizeFigure(item.figure),
  }));
  copy.capabilitiesIntro = copy.capabilitiesIntro || { label: '', title: [] };
  copy.capabilitiesIntro.title = arr(copy.capabilitiesIntro.title);
  copy.capabilitiesIntro.figure = normalizeFigure(copy.capabilitiesIntro.figure);
  copy.hero.keywords = arr(copy.hero.keywords);
  copy.hero.figure = normalizeFigure(copy.hero.figure);
  copy.intro.title = arr(copy.intro.title);
  copy.intro.keywords = arr(copy.intro.keywords);
  copy.intro.figure = normalizeFigure(copy.intro.figure);
  copy.cta.figure = normalizeFigure(copy.cta.figure);
  copy.footer.keywords = arr(copy.footer.keywords);
  copy.footer.figure = normalizeFigure(copy.footer.figure);
  // Scenes added for the one-page film. Missing blocks render as empty, never break.
  const block = (b, extra = {}) => ({ label: '', text: '', ...extra, ...(b || {}), title: arr(b && b.title) });
  copy.sectors = block(copy.sectors); copy.sectors.items = arr(copy.sectors.items);
  copy.reel = block(copy.reel);
  copy.designs = block(copy.designs);
  copy.markets = block(copy.markets); copy.markets.items = arr(copy.markets.items).filter((m) => m && m.name);
  copy.clients = copy.clients || { title: [], items: [] };
  copy.clients.title = arr(copy.clients.title);
  copy.clients.items = arr(copy.clients.items)
    .filter((c) => c && (c.name || c.logo))
    .map((c) => ({ name: str(c.name), logo: asset(c.logo), url: str(c.url) }));
  copy.process = services.process || { title: 'Process', steps: [] };
  copy.process.steps = arr(copy.process.steps);
  copy.marquee = arr(copy.marquee);
  copy.about.team = arr(copy.about.team);
  copy.about.culture = arr(copy.about.culture);
  copy.about.locations = arr(copy.about.locations);

  const projects = arr(work.projects).map(normalizeProject).filter((p) => p.videos.length || p.images.length);
  // Homepage shows the featured projects; if none are marked, the first four.
  const featured = projects.some((p) => p.featured) ? projects.filter((p) => p.featured) : projects.slice(0, 4);
  const film = work.featuredFilm ? normalizeProject(work.featuredFilm) : null;

  return {
    locale: agency.locale || { lang: 'en', dir: 'ltr' },
    agency: {
      name: str(agency.name) || 'THE TALL MEN',
      descriptor: str(agency.descriptor),
      city: str(agency.city),
      country: str(agency.country),
      logo: { src: asset(agency.logo && agency.logo.src), alt: str(agency.logo && agency.logo.alt) },
    },
    location: {
      addressLines: arr(agency.location && agency.location.addressLines),
      mapsUrl: str(agency.location && agency.location.mapsUrl),
    },
    contact: { email: '', phone: '', whatsapp: '', instagram: '', facebook: '', linkedin: '', ...(agency.contact || {}) },
    nav: arr(agency.nav),
    copy,
    projects,
    featured,
    featuredFilm: film && film.videos.length ? film : null,
  };
}
