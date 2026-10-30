import { esc } from '../lib/dom.js';

/* =========================================================================
   THE OBJECTS — one tool per discipline, drawn in black ink with a single red
   gesture. Each has its own entrance (motion.js + CSS):
     binoculars  sight line draws, the far target zooms into focus
     stylus      the stylus sketches a red line across the tablet
     phone       story bars fill, the feed swipes up
     mouse       the cursor travels its path and clicks the ad
     clapper     the arm snaps shut
     keyboard    keys land one by one, a line of text types itself
     notebook    the page fills, the red marker circles the peak
   When a character image is uploaded for a section, the image takes the
   object's place (the object is in the photograph).
   Parts: .d = ink line drawn on entrance (pathLength 1), .r = the red gesture.
   ========================================================================= */

const d = (path, k = 0, extra = '') => `<path class="d" d="${path}" pathLength="1" style="--k:${k}"${extra}/>`;

const OBJECTS = {
  binoculars: () => `
    ${d('M96 62h36v30H96z', 0)}${d('M188 62h36v30h-36z', 1)}
    ${d('M88 92h52v96a14 14 0 0 1-14 14h-24a14 14 0 0 1-14-14z', 2)}
    ${d('M180 92h52v96a14 14 0 0 1-14 14h-24a14 14 0 0 1-14-14z', 3)}
    ${d('M140 112h40M140 150h40', 4)}
    ${d('M150 131a10 10 0 1 0 20 0a10 10 0 1 0-20 0', 5)}
    ${d('M92 202a22 7 0 1 0 44 0a22 7 0 1 0-44 0M184 202a22 7 0 1 0 44 0a22 7 0 1 0-44 0', 6)}
    ${d('M88 110C52 122 40 196 70 236', 7)}
    <path class="o-sight" d="M132 66L254 44" pathLength="1"/>
    <g class="o-target"><circle class="r" cx="270" cy="40" r="15"/><path class="r" d="M270 18v10M270 52v10M248 40h10M282 40h10"/></g>`,

  stylus: () => `
    ${d('M40 70h220a12 12 0 0 1 12 12v130a12 12 0 0 1-12 12H40a12 12 0 0 1-12-12V82a12 12 0 0 1 12-12z', 0)}
    ${d('M48 86h204v122H48z', 1, ' opacity=".35"')}
    <path class="r o-sketch" d="M70 182C88 122 120 108 140 150S190 192 210 132S236 102 242 116" pathLength="1" data-follow-path/>
    <g class="o-pen" data-follower><g transform="rotate(8)">${d('M0 0L6-16L40-110L52-106L18-12Z', 2)}${d('M6-16L18-12M40-110l4-12l12 4l-4 12', 3)}</g></g>`,

  phone: () => `
    <defs><clipPath id="o-screen"><rect x="108" y="44" width="104" height="184" rx="6"/></clipPath></defs>
    ${d('M116 24h88a16 16 0 0 1 16 16v184a16 16 0 0 1-16 16h-88a16 16 0 0 1-16-16V40a16 16 0 0 1 16-16z', 0)}
    ${d('M148 33h24', 1)}
    <g clip-path="url(#o-screen)">
      <g class="o-feed">
        <rect class="o-card" x="116" y="64" width="88" height="112" rx="4"/>
        <circle class="o-ink" cx="160" cy="108" r="14"/><path class="o-ink" d="M136 160c4-18 14-26 24-26s20 8 24 26"/>
        <path class="o-ink" d="M116 188h64M116 198h44"/>
        <rect class="o-card" x="116" y="214" width="88" height="112" rx="4"/>
        <path class="o-ink" d="M126 300l20-30l16 18l12-12l20 24"/>
      </g>
    </g>
    <g class="o-bars"><path class="o-bar" d="M116 52h26M148 52h26M180 52h24"/><path class="r o-bar-fill" d="M116 52h26M148 52h26" pathLength="1"/></g>`,

  mouse: () => `
    <g class="o-ad">${d('M34 56h120v84H34z', 0)}${d('M46 68h96v40H46z', 1, ' opacity=".5"')}${d('M46 120h60M46 128h38', 2)}</g>
    ${d('M216 124c0-30 52-30 52 0v52c0 38-52 38-52 0z', 3)}
    ${d('M242 98v38M216 136h52', 4)}
    ${d('M242 98C242 70 212 60 192 66S150 80 140 58', 5)}
    <path class="r o-route" d="M250 238C200 242 150 212 160 172S130 112 118 98" pathLength="1" data-follow-path/>
    <circle class="r o-click" cx="118" cy="98" r="20"/>
    <g class="o-cursor" data-follower><path d="M0 0v26l7-7l5 11l5-2l-5-11h10z"/></g>`,

  clapper: () => `
    ${d('M70 110h180v110H70z', 0)}
    ${d('M70 150h180M70 185h180M160 150v70', 1)}
    <g class="o-arm">
      ${d('M70 84h180v26H70z', 2)}
      <path class="o-fill" d="M84 84h20l-12 26H72zM164 84h20l-12 26h-20zM204 84h20l-12 26h-20z"/>
      <path class="o-fill o-fill--red" d="M124 84h20l-12 26h-20z"/>
    </g>
    <path class="r o-snap" d="M258 80l12-8M262 96h14M258 112l12 8"/>
    <text class="o-label" x="80" y="140">SCENE 01</text><text class="o-label" x="170" y="140">TAKE 01</text>`,

  keyboard: () => {
    let keys = '';
    for (let row = 0; row < 4; row += 1) {
      for (let col = 0; col < 10; col += 1) {
        const red = row === 2 && col === 9;
        keys += `<rect class="o-key${red ? ' o-key--red' : ''}" x="${col * 22}" y="${row * 18}" width="18" height="14" rx="2" style="--k:${row * 10 + col}"/>`;
      }
    }
    return `
    ${d('M40 160L254 128L292 200L78 236Z', 0)}
    <g transform="translate(70 152) rotate(-8.5) skewX(-24) scale(1 .78)">${keys}</g>
    <g class="o-type"><text class="o-text" x="58" y="92">imagine anything</text><rect class="r o-caret" x="226" y="78" width="3" height="18"/></g>`;
  },

  notebook: () => `
    ${d('M40 70Q100 58 158 74V222Q100 208 40 218Z', 0)}
    ${d('M162 74Q220 58 280 70V218Q220 208 162 222Z', 1)}
    ${d('M160 74V222', 2)}
    ${d('M56 100c6-8 10 6 16-2s10 6 16-2s10 6 18-1M56 122c8-6 14 4 22-2s12 4 20-1M56 144c6-6 12 4 18-1s14 5 22-1s10 3 16 0M56 166c8-6 14 4 22-2', 3)}
    ${d('M180 196V96M180 196h86', 4)}
    ${d('M184 186l18-22l16 10l22-38l20-24', 5)}
    <path class="r o-mark" d="M262 102c14-8 24 8 16 22c-8 14-30 12-32-2c-2-12 12-22 24-18" pathLength="1"/>
    ${d('M250 214L292 140L300 145L258 219Z', 6)}`,
};

const VIEW = { keyboard: '0 0 320 260', default: '0 0 320 260' };

// The object illustration on its own.
export function ObjectArt(name) {
  const make = OBJECTS[name];
  if (!make) return '';
  return `<svg class="obj obj--${name}" viewBox="${VIEW[name] || VIEW.default}" aria-hidden="true" focusable="false">${make()}</svg>`;
}

// An editorial plate: the character photograph when there is one, otherwise the object.
// caption: "Fig. 01 — Binoculars".
export function Plate({ object, figure, caption = '', className = '' }) {
  const art = figure
    ? `<img class="plate__img" src="${esc(figure.src)}" alt="${esc(figure.alt)}" loading="lazy" decoding="async">`
    : ObjectArt(object);
  if (!art) return '';
  return `
  <figure class="plate${figure ? ' plate--figure' : ''} ${className}" data-rv="plate" data-object="${esc(object)}">
    <div class="plate__stage">${art}</div>
    ${caption ? `<figcaption class="meta plate__cap">${esc(caption)}</figcaption>` : ''}
  </figure>`;
}
