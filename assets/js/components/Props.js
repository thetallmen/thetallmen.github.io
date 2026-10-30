/* =========================================================================
   Studio props for the depth-of-field layers: camera, lens, phone, mouse,
   laptop, keyboard. Drawn in currentColor so they suit white and black
   scenes alike, then blurred in CSS as if close to the lens.
   ========================================================================= */

const PROPS = {
  camera: '<rect x="4" y="22" width="92" height="58" rx="10"/><rect x="18" y="12" width="26" height="12" rx="3"/><circle cx="58" cy="51" r="22" fill-opacity=".35"/><circle cx="58" cy="51" r="12"/>',
  lens: '<circle cx="50" cy="50" r="42" fill-opacity=".55"/><circle cx="50" cy="50" r="28"/><circle cx="60" cy="40" r="7" fill="#E10600"/>',
  phone: '<rect x="28" y="4" width="44" height="92" rx="10"/><circle cx="41" cy="16" r="4" fill-opacity=".4"/>',
  mouse: '<ellipse cx="50" cy="52" rx="28" ry="42"/><rect x="47" y="16" width="6" height="22" rx="3" fill="#E10600"/>',
  laptop: '<path d="M14,18 L86,12 L90,68 L18,74 Z" fill-opacity=".7"/><path d="M18,74 L90,68 L96,80 L20,88 Z"/>',
  keyboard: '<path d="M2,40 L98,26 L98,74 L2,88 Z"/><rect x="40" y="48" width="10" height="8" fill="#E10600"/>',
};

export const Prop = (name, className = '') =>
  `<svg class="prop ${className}" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><g fill="currentColor">${PROPS[name] || PROPS.lens}</g></svg>`;
