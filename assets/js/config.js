/* =========================================================================
   THE TALL MEN — CONTENT LOADER
   All editable content lives in /content/*.json and is edited from /admin
   (no code needed). This module loads those files and fills in safe defaults,
   so an empty or deleted field never breaks the page.

   content/agency.json    EDIT AGENCY INFO, LOCATION, CONTACT DETAILS HERE
   content/copy.json      EDIT SITE COPY HERE
   content/services.json  EDIT CAPABILITIES + PROCESS HERE
   content/work.json      ADD PORTFOLIO PROJECTS HERE
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

  // Every block is optional: a missing block or field renders as empty, never breaks.
  const block = (b) => ({ label: '', text: '', ...(b || {}), title: arr(b && b.title) });

  copy.capabilities = services.capabilities || { title: 'Services', items: [] };
  copy.capabilities.items = arr(copy.capabilities.items).map((item) => ({
    name: str(item.name),
    pose: str(item.pose),
    sector: str(item.sector),
    tagline: str(item.tagline),
    text: str(item.text),
    bullets: arr(item.bullets),
    figure: normalizeFigure(item.figure),
  }));
  copy.process = services.process || { title: 'How we work', steps: [] };
  copy.process.steps = arr(copy.process.steps);

  copy.hero = { lede: '', primaryLabel: 'Start a project', secondaryLabel: 'See the work', ...(copy.hero || {}) };
  copy.hero.lines = arr(copy.hero.lines);
  copy.hero.figure = normalizeFigure(copy.hero.figure);
  copy.clients = { label: '', note: '', ...(copy.clients || {}) };
  copy.work = block(copy.work);
  copy.archive = block(copy.archive);
  copy.services = { workLabel: 'See related work', ...block(copy.services) };
  copy.studio = { story: '', ...(copy.studio || {}) };
  copy.studio.statement = arr(copy.studio.statement);
  copy.studio.points = arr(copy.studio.points).filter((p) => p && p.term);
  copy.studio.figure = normalizeFigure(copy.studio.figure);
  copy.cta = { label: '', text: '', buttonLabel: 'Start a project', visitLabel: 'Visit the studio', ...(copy.cta || {}) };
  copy.cta.lines = arr(copy.cta.lines);
  copy.cta.figure = normalizeFigure(copy.cta.figure);
  copy.location = { label: 'Studio', mapsLabel: 'Open in Google Maps', ...(copy.location || {}) };
  copy.footer = { backToTop: 'Back to top', rights: 'All rights reserved.', ...(copy.footer || {}) };
  copy.services.figure = normalizeFigure(copy.services.figure);
  copy.footer.figure = normalizeFigure(copy.footer.figure);
  // Optional full-bleed background photo per chapter (empty = the beige paper).
  [copy.hero, copy.services, copy.studio, copy.cta, ...copy.capabilities.items].forEach((b) => { b.background = asset(b.background); });
  copy.capabilities.items.forEach((item, i) => { item.background = asset(services.capabilities.items[i].background); });

  const projects = arr(work.projects).map(normalizeProject).filter((p) => p.videos.length || p.images.length);
  // Every project sits in the work carousel. Featured ones come first.
  const featured = [...projects.filter((p) => p.featured), ...projects.filter((p) => !p.featured)];
  const rest = [];

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
    rest,
  };
}
