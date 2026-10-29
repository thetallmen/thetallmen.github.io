import { esc, pad2 } from '../lib/dom.js';

// Oversized section heading with an optional count, e.g. SELECTED WORK (01).
export function SectionTitle({ id, title, count, level = 2 }) {
  const tag = `h${level}`;
  return `
  <div class="section-title wrap">
    <${tag} class="section-title__text" id="${esc(id)}" data-reveal="words">${esc(title)}</${tag}>
    ${typeof count === 'number' ? `<span class="section-title__count meta" aria-label="${count} ${count === 1 ? 'item' : 'items'}">(${pad2(count)})</span>` : ''}
  </div>`;
}
