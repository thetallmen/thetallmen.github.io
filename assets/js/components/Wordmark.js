import { esc } from '../lib/dom.js';

// Typographic placeholder for the logo. "TALL" is set taller than its neighbours.
// When agency.logo.src is filled in config.js, the image replaces the type.
export function Wordmark(agency, { size = '' } = {}) {
  if (agency.logo && agency.logo.src) {
    return `<img class="wordmark wordmark--image ${size}" src="${esc(agency.logo.src)}" alt="${esc(agency.logo.alt || agency.name)}">`;
  }
  const words = agency.name.split(' ');
  // "agency" signed underneath in a handwritten script, quiet on purpose.
  return `<span class="wordmark ${size}" aria-hidden="true">${words
    .map((w) => `<span class="wordmark__word${w.toUpperCase() === 'TALL' ? ' wordmark__word--tall' : ''}">${esc(w)}</span>`)
    .join('')}<span class="signature wordmark__sig">agency</span></span>`;
}
