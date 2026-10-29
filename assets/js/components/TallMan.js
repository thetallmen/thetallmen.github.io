/* =========================================================================
   THE TALL MAN — drawn in code, not photographed.
   One recurring character seen from a low angle: long coat flaring toward
   the camera, small head high above, wild hair. Each scene hands him a
   different tool of the trade. Poses:
     camera · laptop · binoculars · stylus · phone · mouse · clapper · keyboard
   Everything is SVG, so it stays sharp at any size and costs a few KB.
   ========================================================================= */

import { loopPath, strokePath } from './Figure.js';

let uid = 0;

// RED TRACE per pose, in the figure's own 400×760 coordinates, so it always
// lands on the object: a loose loop around it and a quick slash across the eyes.
const TRACE = {
  camera: { loop: { cx: 190, cy: 548, rx: 104, ry: 90, rot: -12 }, slash: true },
  laptop: { loop: { cx: 288, cy: 452, rx: 84, ry: 112, rot: 14 }, slash: true },
  binoculars: { loop: { cx: 205, cy: 216, rx: 96, ry: 48, rot: -6 } },
  stylus: { sweep: { x1: 66, y1: 712, x2: 392, y2: 600 }, slash: true },
  phone: { loop: { cx: 206, cy: 396, rx: 86, ry: 130, rot: -8 }, slash: true },
  mouse: { loop: { cx: 206, cy: 600, rx: 102, ry: 122, rot: -6 }, slash: true },
  clapper: { loop: { cx: 152, cy: 512, rx: 146, ry: 104, rot: -10 }, slash: true },
  keyboard: { loop: { cx: 200, cy: 676, rx: 150, ry: 64, rot: -6 }, slash: true },
};

function traceFor(pose, seed) {
  const t = TRACE[pose] || TRACE.camera;
  const paths = [];
  if (t.loop) paths.push(`<path class="tm-trace" d="${loopPath(t.loop, seed)}" pathLength="1" style="--t:0"/>`);
  if (t.sweep) paths.push(`<path class="tm-trace" d="${strokePath(t.sweep, 40)}" pathLength="1" style="--t:0"/>`);
  if (t.slash) paths.push(`<path class="tm-trace tm-trace--slash" d="${strokePath({ x1: 170, y1: 216, x2: 244, y2: 208 }, 3)}" pathLength="1" style="--t:1"/>`);
  return `<g class="tm-traces">${paths.join('')}</g>`;
}

// Spiky hair as one jagged path around the top of the head.
function hair(cx, cy) {
  const spikes = [[-34, 4], [-40, -18], [-28, -12], [-30, -42], [-14, -24], [-8, -56], [2, -30], [14, -52], [18, -26], [34, -44], [30, -14], [44, -20], [36, 6]];
  const pts = spikes.map(([x, y]) => `${cx + x},${cy + y}`).join(' L');
  return `<path d="M${cx - 30},${cy + 10} L${pts} L${cx + 30},${cy + 12} Z" fill="#050505"/>
    <path d="M${cx - 22},${cy - 30} l-14,-30 M${cx + 6},${cy - 40} l4,-34 M${cx + 26},${cy - 28} l22,-26 M${cx + 34},${cy - 4} l26,-6" stroke="#0a0a0a" stroke-width="3" stroke-linecap="round"/>`;
}

// The body every pose shares: coat, lapels, neck, head, hair, rim light.
function body(id) {
  const coat = 'M24,760 C60,640 96,520 128,420 C136,360 138,318 150,292 L186,272 L203,266 L222,272 L258,290 C272,330 280,380 292,430 C318,540 350,650 380,760 Z';
  return `
    <path d="${coat}" fill="url(#${id}-coat)"/>
    <path d="${coat}" fill="none" stroke="url(#${id}-rim)" stroke-width="3.5"/>
    <path d="M140,300 C128,380 112,470 96,560 M268,300 C282,380 300,470 320,560" stroke="#3a3a3a" stroke-width="2" fill="none" opacity=".7"/>
    <path d="M203,300 C206,420 208,600 212,760" stroke="#000" stroke-width="7" fill="none"/>
    <path d="M186,274 L198,370 M222,276 L212,370" stroke="#2a2a2a" stroke-width="3" fill="none"/>
    <path d="M150,640 C170,700 186,740 194,760 M262,630 C250,700 240,740 236,760" stroke="#000" stroke-width="10" opacity=".7" fill="none"/>
    <rect x="193" y="238" width="22" height="34" fill="#0d0d0d"/>
    <ellipse cx="204" cy="214" rx="25" ry="30" fill="#141414"/>
    <ellipse cx="212" cy="224" rx="12" ry="16" fill="#232323"/>
    ${hair(204, 200)}`;
}

// A thick, foreshortened arm from a shoulder to a hand.
const arm = (pts, hand) => `
  <path d="M${pts.join(' L')} Z" fill="#1d1d1d" stroke="#4a4a4a" stroke-opacity=".7" stroke-width="2"/>
  ${hand ? `<ellipse cx="${hand[0]}" cy="${hand[1]}" rx="${hand[2] || 26}" ry="${hand[3] || 22}" fill="#2a2724" stroke="#555" stroke-opacity=".5" stroke-width="1.5"/>` : ''}`;

const glass = (id, cx, cy, r) => `
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id}-glass)"/>
  <path d="M${cx - r * 0.55},${cy - r * 0.35} A${r * 0.7},${r * 0.7} 0 0 1 ${cx + r * 0.2},${cy - r * 0.62}" stroke="#ffffff" stroke-opacity=".55" stroke-width="${Math.max(2, r * 0.08)}" fill="none" stroke-linecap="round"/>
  <circle cx="${cx + r * 0.25}" cy="${cy + r * 0.2}" r="${r * 0.12}" fill="#ff3b24" opacity=".8"/>`;

const POSES = {
  camera: (id) => `
    ${arm([[146, 300], [176, 318], [176, 470], [112, 482]], [140, 486, 34, 28])}
    <rect x="62" y="452" width="190" height="122" rx="16" fill="#121212" stroke="#2c2c2c" stroke-width="2"/>
    <rect x="96" y="430" width="70" height="30" rx="6" fill="#161616"/>
    <circle cx="190" cy="548" r="78" fill="#0b0b0b" stroke="#333" stroke-width="3"/>
    <circle cx="190" cy="548" r="58" fill="#060606" stroke="#3a3a3a" stroke-width="2"/>
    ${glass(id, 190, 548, 40)}`,
  laptop: (id) => `
    ${arm([[258, 292], [290, 302], [304, 486], [272, 492]], [290, 500, 24, 30])}
    <path d="M222,378 L330,352 L352,520 L244,548 Z" fill="url(#${id}-metal)" stroke="#bdbdbd" stroke-opacity=".5" stroke-width="2"/>
    <path d="M244,548 L352,520 L356,532 L248,560 Z" fill="#3a3a3a"/>
    <circle cx="288" cy="450" r="9" fill="#2b2b2b" opacity=".6"/>`,
  binoculars: (id) => `
    ${arm([[150, 292], [178, 300], [186, 236], [160, 228]], null)}
    ${arm([[256, 290], [230, 300], [226, 236], [250, 228]], null)}
    <rect x="146" y="190" width="58" height="52" rx="12" fill="#141414" stroke="#333" stroke-width="2"/>
    <rect x="206" y="190" width="58" height="52" rx="12" fill="#141414" stroke="#333" stroke-width="2"/>
    <rect x="196" y="204" width="20" height="22" fill="#0a0a0a"/>
    ${glass(id, 175, 216, 22)}${glass(id, 235, 216, 22)}`,
  stylus: (id) => `
    <path d="M0,690 L270,640 L340,760 L0,760 Z" fill="#0e0e0e" stroke="#333" stroke-width="2"/>
    <path d="M30,700 L250,662" stroke="#ff3b24" stroke-opacity=".35" stroke-width="2"/>
    ${arm([[146, 300], [178, 316], [168, 560], [108, 552]], [132, 566, 36, 30])}
    <path d="M150,520 L70,700" stroke="#d9d9d9" stroke-width="9" stroke-linecap="round"/>
    <path d="M70,700 L64,716" stroke="#ff3b24" stroke-width="5" stroke-linecap="round"/>`,
  phone: (id) => `
    ${arm([[150, 296], [182, 312], [214, 470], [160, 478]], null)}
    <g transform="rotate(-8 205 390)">
      <rect x="150" y="290" width="112" height="210" rx="20" fill="#121212" stroke="#4a4a4a" stroke-width="3"/>
      <rect x="164" y="306" width="46" height="46" rx="12" fill="#1d1d1d"/>
      ${glass(id, 179, 321, 9)}${glass(id, 197, 339, 9)}
    </g>
    <ellipse cx="208" cy="472" rx="50" ry="40" fill="#191919"/>`,
  mouse: (id) => `
    ${arm([[146, 300], [178, 316], [228, 540], [170, 552]], null)}
    <ellipse cx="206" cy="600" rx="74" ry="96" fill="url(#${id}-metal)"/>
    <ellipse cx="206" cy="600" rx="74" ry="96" fill="#000" opacity=".55"/>
    <path d="M206,506 L206,582" stroke="#3c3c3c" stroke-width="3"/>
    <rect x="199" y="530" width="14" height="30" rx="7" fill="#ff3b24" opacity=".85"/>
    <path d="M206,696 C214,730 260,740 300,760" stroke="#1a1a1a" stroke-width="6" fill="none"/>
    <ellipse cx="190" cy="546" rx="44" ry="30" fill="#191919"/>`,
  clapper: (id) => `
    ${arm([[146, 300], [178, 316], [176, 470], [118, 480]], [146, 486, 30, 26])}
    <g transform="rotate(-10 150 500)">
      <rect x="40" y="470" width="230" height="150" rx="8" fill="#121212" stroke="#333" stroke-width="2"/>
      <rect x="40" y="430" width="230" height="38" fill="#e8e6e1"/>
      <path d="M60,430 L84,468 M110,430 L134,468 M160,430 L184,468 M210,430 L234,468" stroke="#0a0a0a" stroke-width="18"/>
      <path d="M62,520 L240,520 M62,560 L200,560" stroke="#3a3a3a" stroke-width="3"/>
    </g>`,
  keyboard: (id) => `
    ${arm([[150, 296], [180, 310], [150, 600], [100, 596]], [124, 606, 34, 26])}
    ${arm([[256, 292], [228, 306], [262, 596], [312, 590]], [288, 600, 34, 26])}
    <path d="M-10,610 L410,566 L410,760 L-10,760 Z" fill="#111" stroke="#333" stroke-width="2"/>
    ${Array.from({ length: 5 }, (_, r) => Array.from({ length: 12 }, (_, c) => {
      const x = 6 + c * 34 + r * 2, y = 626 + r * 26 - c * 3.6;
      const hot = (r === 1 && c === 4) || (r === 2 && c === 7);
      return `<rect x="${x}" y="${y}" width="28" height="20" rx="4" fill="${hot ? '#ff3b24' : '#1c1c1c'}" opacity="${hot ? 0.9 : 1}"/>`;
    }).join('')).join('')}`,
};

export const POSE_NAMES = Object.keys(POSES);

// Main figure. `pose` picks the object; unknown poses fall back to the camera.
export function TallMan(pose = 'camera', { className = '', label = '', trace = true } = {}) {
  const id = `tm${(uid += 1)}`;
  const draw = POSES[pose] || POSES.camera;
  return `
  <svg class="tallman ${className}" viewBox="0 0 400 760" preserveAspectRatio="xMidYMax meet" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'} focusable="false">
    <defs>
      <linearGradient id="${id}-coat" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#2b2b2b"/><stop offset=".5" stop-color="#151515"/><stop offset="1" stop-color="#060606"/>
      </linearGradient>
      <linearGradient id="${id}-rim" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#ff3b24" stop-opacity=".55"/><stop offset=".45" stop-color="#ffffff" stop-opacity=".08"/><stop offset="1" stop-color="#ffffff" stop-opacity=".6"/>
      </linearGradient>
      <radialGradient id="${id}-glass" cx=".4" cy=".35" r=".7">
        <stop offset="0" stop-color="#3a3a3a"/><stop offset=".6" stop-color="#0a0a0a"/><stop offset="1" stop-color="#000"/>
      </radialGradient>
      <linearGradient id="${id}-metal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#a9a9a9"/><stop offset=".5" stop-color="#5b5b5b"/><stop offset="1" stop-color="#2a2a2a"/>
      </linearGradient>
    </defs>
    ${body(id)}
    ${draw(id)}
    ${trace ? traceFor(pose, uid * 13) : ''}
  </svg>`;
}

// Small floating props for the blurred foreground layer (depth of field).
const PROPS = {
  camera: '<rect x="4" y="18" width="92" height="60" rx="10" fill="#151515" stroke="#333" stroke-width="2"/><circle cx="56" cy="48" r="24" fill="#070707" stroke="#3a3a3a" stroke-width="3"/><circle cx="56" cy="48" r="12" fill="#222"/>',
  phone: '<rect x="28" y="4" width="44" height="88" rx="9" fill="#141414" stroke="#444" stroke-width="2"/><circle cx="40" cy="16" r="4" fill="#2a2a2a"/>',
  mouse: '<ellipse cx="50" cy="50" rx="28" ry="40" fill="#161616" stroke="#333" stroke-width="2"/><path d="M50,12 L50,44" stroke="#ff3b24" stroke-width="3"/>',
  laptop: '<path d="M14,20 L86,14 L90,70 L18,76 Z" fill="#6b6b6b"/><path d="M18,76 L90,70 L94,80 L20,86 Z" fill="#333"/>',
  lens: '<circle cx="50" cy="50" r="40" fill="#0a0a0a" stroke="#3a3a3a" stroke-width="3"/><circle cx="50" cy="50" r="24" fill="#1a1a1a"/><circle cx="58" cy="42" r="6" fill="#ff3b24" opacity=".7"/>',
};
export const Prop = (name, className = '') =>
  `<svg class="prop ${className}" viewBox="0 0 100 100" aria-hidden="true" focusable="false">${PROPS[name] || PROPS.lens}</svg>`;
