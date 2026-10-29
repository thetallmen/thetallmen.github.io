import { esc } from '../lib/dom.js';

/* =========================================================================
   THE TALL MAN + RED TRACE
   Every section shows the same character with a different marketing object.
   The RED TRACE is the brand device: a loose, hand-drawn red marker line
   that circles the object and slashes across the eyes, drawn in on enter.

   Trace numbers are percentages of the image box (0–100), set per figure in
   content/copy.json and content/services.json:
     loop:  { cx, cy, rx, ry, rot }   ellipse-ish loop around the object
     slash: { x1, y1, x2, y2 }        quick stroke across the face
     sweep: { x1, y1, x2, y2 }        long gesture that can run off the frame
   ========================================================================= */

// Small deterministic wobble so every trace looks hand-made but never changes between loads.
function rand(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
const n = (v) => Number(v) || 0;
const f = (v) => v.toFixed(2);

// A loop that overshoots its start, wobbles in radius and drifts slightly, like a marker circle.
export function loopPath({ cx, cy, rx, ry, rot = 0 }, seed = 7) {
  const r = rand(seed);
  const a = (n(rot) * Math.PI) / 180;
  const start = -2.3 + r() * 0.6;
  const turns = Math.PI * 2 * (1.12 + r() * 0.1);
  const phase = r() * 6;
  const pts = [];
  for (let i = 0; i <= 64; i += 1) {
    const t = i / 64;
    const ang = start + turns * t;
    const k = 1 + 0.07 * Math.sin(ang * 3 + phase) + 0.1 * t; // second pass sits a little wider
    const ex = n(rx) * k * Math.cos(ang);
    const ey = n(ry) * k * Math.sin(ang);
    pts.push([n(cx) + ex * Math.cos(a) - ey * Math.sin(a), n(cy) + ex * Math.sin(a) + ey * Math.cos(a)]);
  }
  return `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L')}`;
}

// A single loose stroke with a slight bow and an overshooting tail.
export function strokePath({ x1, y1, x2, y2 }, bow = 3) {
  const mx = (n(x1) + n(x2)) / 2;
  const my = (n(y1) + n(y2)) / 2 - bow;
  return `M${f(n(x1))} ${f(n(y1))} Q${f(mx)} ${f(my)} ${f(n(x2))} ${f(n(y2))}`;
}

export function tracePaths(trace = {}, seed = 7) {
  const paths = [];
  if (trace.loop) paths.push({ d: loopPath(trace.loop, seed), cls: 'trace__loop' });
  if (trace.slash) paths.push({ d: strokePath(trace.slash, 1.5), cls: 'trace__slash' });
  if (trace.sweep) paths.push({ d: strokePath(trace.sweep, 12), cls: 'trace__sweep' });
  return paths;
}

export function Trace(trace, seed) {
  const paths = tracePaths(trace, seed);
  if (!paths.length) return '';
  return `<svg class="trace" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">${paths
    .map((p, i) => `<path class="${p.cls}" d="${p.d}" pathLength="1" style="--t:${i}"/>`)
    .join('')}</svg>`;
}

// The character image with its trace. Nothing renders when no image is set.
export function Figure(fig, { className = '', seed = 7, eager = false } = {}) {
  if (!fig || !fig.src) return '';
  return `
  <figure class="fig ${className}" data-fig>
    <img class="fig__img" src="${esc(fig.src)}" alt="${esc(fig.alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
    ${Trace(fig.trace, seed)}
  </figure>`;
}
