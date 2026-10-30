import { $$ } from '../lib/dom.js';

/* =========================================================================
   THE RED TRACE — the agency's signature gesture.
   A creative director's red marker: it underlines one phrase or circles one
   thing, once, and only where it matters. Paths are built in real pixels from
   the size of the word they mark, so the line weight never distorts.
   Usage: put data-trace="underline" | "circle" on a headline; the trace is
   attached to its first *highlighted* word and drawn when the headline enters.
   ========================================================================= */

const SVG = 'http://www.w3.org/2000/svg';

// Catmull-Rom through the points, as cubic Béziers: a hand-drawn, even curve.
export function smooth(pts) {
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

// w/h: the box of the svg (the marked word plus its margin).
export function tracePath(kind, w, h) {
  if (kind === 'circle') {
    // A loose loop that overshoots where it started, like a marker circle.
    const cx = w / 2, cy = h / 2, rx = w / 2 - 4, ry = h / 2 - 4, pts = [];
    for (let t = -0.62; t <= 1.62; t += 0.08) {
      const a = t * Math.PI;
      const wob = 1 + 0.035 * Math.sin(a * 3) - (t > 1.3 ? (t - 1.3) * 0.18 : 0);
      pts.push([cx + Math.cos(a) * rx * wob, cy + Math.sin(a) * ry * wob * (t > 1 ? 0.96 : 1)]);
    }
    return smooth(pts);
  }
  // Underline: one confident stroke, slightly rising, with a small lift at the end.
  const y = h - 6;
  return smooth([[4, y], [w * 0.28, y - 3], [w * 0.62, y - 5], [w * 0.9, y - 8], [w - 4, y - 13]]);
}

function draw(svg) {
  const r = svg.getBoundingClientRect();
  if (!r.width) return;
  svg.setAttribute('viewBox', `0 0 ${r.width.toFixed(1)} ${r.height.toFixed(1)}`);
  svg.firstChild.setAttribute('d', tracePath(svg.dataset.kind, r.width, r.height));
}

export function makeTrace(kind) {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('class', `trace trace--${kind}`);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.dataset.kind = kind;
  const path = document.createElementNS(SVG, 'path');
  path.setAttribute('pathLength', '1');
  svg.appendChild(path);
  return svg;
}

export function initTraces() {
  const traces = [];
  $$('[data-trace]').forEach((host) => {
    const target = host.querySelector('.hl') || host;
    target.classList.add('has-trace');
    const svg = makeTrace(host.dataset.trace);
    target.appendChild(svg);
    traces.push(svg);
  });
  // Hover traces: a small circle that draws around a control while it is hovered.
  $$('[data-trace-hover]').forEach((host) => {
    const svg = makeTrace('circle');
    svg.classList.add('trace--hover');
    host.classList.add('has-trace');
    host.appendChild(svg);
    traces.push(svg);
  });
  const redraw = () => traces.forEach(draw);
  redraw();
  // Fonts change the size of the words they mark.
  if (document.fonts) document.fonts.ready.then(redraw);
  let t;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(redraw, 150); });
  return redraw;
}
