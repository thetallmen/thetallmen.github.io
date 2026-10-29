import { esc, pad2, formatTime } from '../lib/dom.js';
import { SectionTitle } from './SectionTitle.js';

const TYPE_LABEL = {
  vertical: 'Vertical', horizontal: 'Horizontal', reel: 'Reel', static: 'Static',
  branding: 'Branding', campaign: 'Campaign', photo: 'Photo', motion: 'Motion',
};

export const projectTitle = (project, index) => project.name || `Project ${pad2(index + 1)}`;

// "9:16" -> [9, 16]; falls back to vertical.
export const parseRatio = (r) => {
  const [w, h] = String(r || '9:16').split(':').map(Number);
  return w > 0 && h > 0 ? [w, h] : [9, 16];
};

// Facts that exist are listed; empty ones are skipped.
function facts(project) {
  const v = project.videos[0];
  const rows = [
    ['Client', project.client],
    ['Sector', project.industry],
    ['Services', project.services.join(', ')],
    ['Year', project.year],
    ['Format', [TYPE_LABEL[project.type], v ? v.ratio : ''].filter(Boolean).join(' — ')],
    ['Length', v && v.duration ? formatTime(v.duration) : ''],
  ];
  return rows.filter(([, value]) => value);
}

function Media(project, title) {
  const v = project.videos[0];
  const img = project.images[0];
  const [w, h] = parseRatio(v ? v.ratio : img ? img.ratio : '4:5');
  const orientation = h > w ? 'portrait' : 'landscape';
  const ratio = `${w} / ${h}`;

  if (v) {
    return `
    <button class="project__media project__media--${orientation}" type="button" style="--ratio:${ratio}"
      data-open-video="${esc(v.src)}" data-video-title="${esc(title)}" data-video-ratio="${w}/${h}"
      ${v.hasAudio ? 'data-video-sound="true"' : ''}
      data-video-poster="${esc(v.poster)}" data-cursor="view" aria-label="Play ${esc(title)} in full screen">
      <span class="project__frame">
        <video class="project__video" muted loop playsinline preload="none" poster="${esc(v.poster)}"
          data-lazy-video="${esc(v.preview)}" aria-hidden="true" tabindex="-1"></video>
      </span>
    </button>`;
  }
  if (img) {
    const more = project.images.length > 1 ? `<span class="project__count meta" aria-hidden="true">1 / ${project.images.length}</span>` : '';
    return `
    <button class="project__media project__media--${orientation}" type="button" style="--ratio:${ratio}"
      data-open-gallery="${esc(project.id)}" data-cursor="view" aria-label="View ${esc(title)}${project.images.length > 1 ? `, ${project.images.length} images` : ''}">
      <span class="project__frame"><img src="${esc(img.src)}" alt="${esc(img.alt)}" loading="lazy" decoding="async"></span>
      ${more}
    </button>`;
  }
  return '';
}

export function ProjectItem(project, index) {
  const title = projectTitle(project, index);
  const list = facts(project);
  return `
  <article class="project${index % 2 ? ' project--flip' : ''}" id="${esc(project.id)}" aria-labelledby="${esc(project.id)}-title">
    <div class="project__text">
      <span class="project__index" aria-hidden="true">${pad2(index + 1)}</span>
      <h3 class="project__title" id="${esc(project.id)}-title" data-reveal="words">${esc(title)}</h3>
      ${project.description ? `<p class="project__desc">${esc(project.description)}</p>` : ''}
      ${list.length ? `<dl class="project__facts">${list.map(([k, val]) => `<div><dt class="meta">${esc(k)}</dt><dd>${esc(val)}</dd></div>`).join('')}</dl>` : ''}
      ${project.caseStudyUrl ? `<a class="link-line" href="${esc(project.caseStudyUrl)}">Case study</a>` : ''}
    </div>
    ${Media(project, title)}
  </article>`;
}

export function Work({ copy, projects, total = projects.length }) {
  return `
  <section class="work" id="work" aria-labelledby="work-title">
    ${SectionTitle({ id: 'work-title', title: copy.work.title, count: projects.length })}
    <div class="work__list wrap">
      ${projects.map(ProjectItem).join('')}
    </div>
    ${total > projects.length ? `<div class="wrap work__more"><a class="btn-trace" href="#archive" data-magnetic><span>See all ${total} projects</span><span aria-hidden="true">↓</span></a></div>` : ''}
  </section>`;
}
