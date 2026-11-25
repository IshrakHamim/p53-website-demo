// Generated "folded set" flat-lay images (SVG) so every product gets a
// consistent studio-style folded shot — top, trouser and matching cap.
import { shade, luminance } from './garment.js';

const rgb = (a) => `rgb(${a.map((v) => Math.round(v)).join(',')})`;
let uid = 0;

function defs(id, hex) {
  const light = luminance(hex) > 0.6;
  return `
  <defs>
    <linearGradient id="bg${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f7f8f7"/><stop offset="1" stop-color="#e9ecec"/>
    </linearGradient>
    <linearGradient id="fab${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${rgb(shade(hex, light ? 0.3 : 0.12))}"/>
      <stop offset="0.55" stop-color="${hex}"/>
      <stop offset="1" stop-color="${rgb(shade(hex, light ? -0.08 : -0.22))}"/>
    </linearGradient>
    <linearGradient id="fold${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${light ? 0.08 : 0.22}"/>
    </linearGradient>
    <pattern id="tw${id}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="6" height="6" fill="none"/><line x1="0" y1="0" x2="0" y2="6" stroke="${light ? '#000' : '#fff'}" stroke-opacity="${light ? 0.03 : 0.045}" stroke-width="2"/>
    </pattern>
    <filter id="sh${id}" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#14202c" flood-opacity="0.22"/>
    </filter>
  </defs>`;
}
function pal(hex) {
  const light = luminance(hex) > 0.6;
  return {
    seam: rgb(shade(hex, light ? -0.2 : -0.42)),
    stitch: light ? 'rgba(70,80,90,0.45)' : rgb(shade(hex, 0.38)),
    inner: rgb(shade(hex, light ? -0.28 : -0.5)),
    logo: light ? '#2aa1c9' : 'rgba(240,244,248,0.9)',
  };
}
const logo = (x, y, s, color) => `
  <g transform="translate(${x},${y})" fill="${color}" stroke="${color}">
    <line x1="0" y1="${-s * 0.55}" x2="${s * 0.45}" y2="${-s * 0.62}" stroke-width="${s * 0.07}" stroke-linecap="round"/>
    <line x1="0" y1="${-s * 0.33}" x2="${s * 0.45}" y2="${-s * 0.4}" stroke-width="${s * 0.07}" stroke-linecap="round"/>
    <line x1="0" y1="${-s * 0.11}" x2="${s * 0.45}" y2="${-s * 0.18}" stroke-width="${s * 0.07}" stroke-linecap="round"/>
    <text x="${s * 0.5}" y="0" font-family="Plus Jakarta Sans, sans-serif" font-style="italic" font-weight="700" font-size="${s}" stroke="none">P53</text>
  </g>`;

function foldedTop(id, hex, p, g, { x, y, w, h, neck = 'v', pocket = true, sleeve = 'half', name = '' }) {
  const cx = x + w / 2;
  const neckW = w * 0.3, neckD = neck === 'v' ? h * 0.36 : h * 0.12;
  const sleeveCuff = sleeve === 'three-quarter'
    ? `<path d="M${x + 8},${y + h * 0.55} L${x + w * 0.42},${y + h * 0.72} L${x + w * 0.4},${y + h * 0.84} L${x + 8},${y + h * 0.68} Z" fill="url(#fab${id})" stroke="${p.seam}" stroke-width="2"/>
       <line x1="${x + w * 0.38}" y1="${y + h * 0.71}" x2="${x + w * 0.36}" y2="${y + h * 0.83}" stroke="${p.stitch}" stroke-dasharray="4 3" stroke-width="1.4"/>`
    : '';
  const neckPath = neck === 'v'
    ? `M${cx - neckW / 2},${y} L${cx},${y + neckD} L${cx + neckW / 2},${y} Z`
    : `M${cx - neckW / 2},${y} Q${cx},${y + neckD * 2} ${cx + neckW / 2},${y} Z`;
  return `
  <g filter="url(#sh${id})">
    <path d="M${x + 14},${y} L${x + w - 14},${y} Q${x + w},${y} ${x + w},${y + 14} L${x + w},${y + h} L${x},${y + h} L${x},${y + 14} Q${x},${y} ${x + 14},${y} Z" fill="url(#fab${id})"/>
  </g>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#tw${id})"/>
  <path d="${neckPath}" fill="${p.inner}"/>
  <path d="${neck === 'v' ? `M${cx - neckW / 2 - 9},${y} L${cx},${y + neckD + 12} L${cx + neckW / 2 + 9},${y}` : `M${cx - neckW / 2 - 8},${y} Q${cx},${y + neckD * 2 + 16} ${cx + neckW / 2 + 8},${y}`}" fill="none" stroke="${rgb(shade(hex, -0.12))}" stroke-width="12" stroke-linejoin="miter"/>
  <path d="${neck === 'v' ? `M${cx - neckW / 2 - 16},${y} L${cx},${y + neckD + 22} L${cx + neckW / 2 + 16},${y}` : `M${cx - neckW / 2 - 15},${y} Q${cx},${y + neckD * 2 + 30} ${cx + neckW / 2 + 15},${y}`}" fill="none" stroke="${p.stitch}" stroke-width="1.5" stroke-dasharray="5 4"/>
  <line x1="${x}" y1="${y + 16}" x2="${cx - neckW / 2 - 18}" y2="${y + 4}" stroke="${p.seam}" stroke-width="2"/>
  <line x1="${x + w}" y1="${y + 16}" x2="${cx + neckW / 2 + 18}" y2="${y + 4}" stroke="${p.seam}" stroke-width="2"/>
  ${sleeveCuff}
  ${pocket ? `<rect x="${x + w * 0.6}" y="${y + h * 0.42}" width="${w * 0.24}" height="${h * 0.3}" rx="4" fill="url(#fab${id})" stroke="${p.seam}" stroke-width="2"/>
  <path d="M${x + w * 0.6 + 5},${y + h * 0.42 + 10} h${w * 0.24 - 10}" stroke="${p.stitch}" stroke-dasharray="4 3" stroke-width="1.4"/>
  <line x1="${x + w * 0.78}" y1="${y + h * 0.42}" x2="${x + w * 0.78}" y2="${y + h * 0.72}" stroke="${p.seam}" stroke-width="1.6"/>` : ''}
  ${logo(x + w * 0.62, y + h * (pocket ? 0.38 : 0.45), w * 0.075, p.logo)}
  ${name ? `<text x="${x + w * 0.28}" y="${y + h * 0.47}" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="${w * 0.045}" fill="${luminance(hex) > 0.6 ? '#22324a' : '#eef2f6'}">${name}</text>` : ''}
  <rect x="${x}" y="${y + h * 0.82}" width="${w}" height="${h * 0.18}" fill="url(#fold${id})"/>
  <line x1="${x}" y1="${y + h * 0.82}" x2="${x + w}" y2="${y + h * 0.82}" stroke="${p.seam}" stroke-opacity="0.5" stroke-width="1.5"/>`;
}

function foldedTrouser(id, hex, p, { x, y, w, h }) {
  const band = h * 0.2;
  let ruche = '';
  for (let i = x + 30; i < x + w * 0.62; i += 9) ruche += `<line x1="${i}" y1="${y + 6}" x2="${i + 2}" y2="${y + band - 6}" stroke="${p.seam}" stroke-opacity="0.45" stroke-width="1.4"/>`;
  return `
  <g filter="url(#sh${id})">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="url(#fab${id})"/>
  </g>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="url(#tw${id})"/>
  <rect x="${x}" y="${y}" width="${w * 0.66}" height="${band}" rx="10" fill="${rgb(shade(hex, -0.06))}"/>
  ${ruche}
  <path d="M${x + w * 0.66},${y + 8} q12,${band * 0.4} 0,${band - 16}" stroke="${p.seam}" fill="none" stroke-width="2"/>
  <path d="M${x + w * 0.18},${y + band} c 6,40 -24,60 -14,${h * 0.55}" stroke="${rgb(shade(hex, -0.3))}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M${x + w * 0.24},${y + band} c 10,46 18,52 8,${h * 0.48}" stroke="${rgb(shade(hex, -0.3))}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <rect x="${x + w * 0.08}" y="${y + h * 0.8}" width="16" height="34" rx="3" fill="#f2f2f0"/>
  <text transform="translate(${x + w * 0.08 + 12},${y + h * 0.8 + 31}) rotate(-90)" font-family="Plus Jakarta Sans, sans-serif" font-style="italic" font-weight="800" font-size="11" fill="#2aa1c9">P53</text>
  <line x1="${x + w * 0.32}" y1="${y + band + 10}" x2="${x + w * 0.42}" y2="${y + h * 0.52}" stroke="${p.seam}" stroke-width="2"/>
  <line x1="${x}" y1="${y + h * 0.62}" x2="${x + w}" y2="${y + h * 0.62}" stroke="${p.seam}" stroke-opacity="0.35" stroke-width="1.5"/>
  <rect x="${x}" y="${y + h * 0.62}" width="${w}" height="${h * 0.38}" rx="10" fill="url(#fold${id})"/>
  <line x1="${x + 10}" y1="${y + h - 14}" x2="${x + w - 10}" y2="${y + h - 14}" stroke="${p.stitch}" stroke-dasharray="5 4" stroke-width="1.5"/>`;
}

function cap(id, hex, p, { x, y, s = 1 }) {
  return `
  <g transform="translate(${x},${y}) scale(${s})">
    <path d="M30,250 C20,300 70,330 90,320" stroke="${rgb(shade(hex, -0.1))}" stroke-width="10" fill="none" stroke-linecap="round" filter="url(#sh${id})"/>
    <path d="M52,250 C70,310 120,300 130,330" stroke="${rgb(shade(hex, -0.1))}" stroke-width="10" fill="none" stroke-linecap="round"/>
    <g filter="url(#sh${id})">
      <path d="M10,180 C10,60 180,40 190,170 L190,210 C130,232 70,232 10,210 Z" fill="url(#fab${id})"/>
    </g>
    <path d="M10,180 C10,60 180,40 190,170 L190,210 C130,232 70,232 10,210 Z" fill="url(#tw${id})"/>
    <path d="M100,60 C96,110 98,150 100,196" stroke="${p.seam}" stroke-width="2" fill="none"/>
    <path d="M10,180 C70,196 130,196 190,172" stroke="${p.seam}" stroke-width="2" fill="none"/>
    <path d="M14,190 C70,206 130,206 186,184" stroke="${p.stitch}" stroke-dasharray="5 4" stroke-width="1.4" fill="none"/>
    <rect x="128" y="182" width="40" height="22" rx="3" fill="#f4f4f2" transform="rotate(-6 148 193)"/>
    <text x="134" y="200" transform="rotate(-6 148 193)" font-family="Plus Jakarta Sans, sans-serif" font-style="italic" font-weight="800" font-size="15" fill="#2aa1c9">P53</text>
  </g>`;
}

function foldedCoat(id, hex, p, { x, y, w, h }) {
  const cx = x + w / 2;
  return `
  <g filter="url(#sh${id})"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="url(#fab${id})"/></g>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="url(#tw${id})"/>
  <path d="M${cx - 60},${y} L${cx},${y + h * 0.42} L${cx + 60},${y} Z" fill="#dfe6ee"/>
  <path d="M${cx - 10},${y} L${cx},${y + h * 0.34} L${cx + 10},${y} Z" fill="#9fb3c8"/>
  <path d="M${cx - 60},${y} L${cx - 2},${y + h * 0.42} L${cx - 70},${y + h * 0.24} L${cx - 58},${y + h * 0.2} L${cx - 84},${y + h * 0.12} L${cx - 78},${y} Z" fill="url(#fab${id})" stroke="${p.seam}" stroke-width="2"/>
  <path d="M${cx + 60},${y} L${cx + 2},${y + h * 0.42} L${cx + 70},${y + h * 0.24} L${cx + 58},${y + h * 0.2} L${cx + 84},${y + h * 0.12} L${cx + 78},${y} Z" fill="url(#fab${id})" stroke="${p.seam}" stroke-width="2"/>
  <line x1="${cx + 2}" y1="${y + h * 0.42}" x2="${cx + 2}" y2="${y + h}" stroke="${p.seam}" stroke-width="2"/>
  ${[0.55, 0.72, 0.89].map((t) => `<circle cx="${cx - 12}" cy="${y + h * t}" r="7" fill="#e6e6e2" stroke="rgba(0,0,0,.25)" stroke-width="1.5"/>`).join('')}
  <line x1="${x + w * 0.66}" y1="${y + h * 0.36}" x2="${x + w * 0.88}" y2="${y + h * 0.35}" stroke="${p.seam}" stroke-width="3"/>
  ${logo(x + w * 0.68, y + h * 0.32, 18, '#2aa1c9')}
  <rect x="${x + w * 0.08}" y="${y + h * 0.66}" width="${w * 0.28}" height="${h * 0.26}" rx="5" fill="url(#fab${id})" stroke="${p.seam}" stroke-width="2"/>
  <rect x="${x + w * 0.64}" y="${y + h * 0.66}" width="${w * 0.28}" height="${h * 0.26}" rx="5" fill="url(#fab${id})" stroke="${p.seam}" stroke-width="2"/>
  <rect x="${x}" y="${y + h * 0.84}" width="${w}" height="${h * 0.16}" rx="12" fill="url(#fold${id})"/>`;
}

/** Return an SVG string for a product's folded flat-lay. */
export function flatlaySVG(product, { color, name = '', garment } = {}) {
  const id = ++uid;
  const hex = color || product.colors[0].hex;
  const p = pal(hex);
  const g = { ...product.garment, ...(garment || {}) };
  let body = '';
  if (g.type === 'cap') {
    const vs = [hex, ...product.colors.map((c) => c.hex).filter((c) => c !== hex)].slice(0, 3);
    body = vs.map((c, i) => {
      const pid = `${id}_${i}`;
      return `${defs(pid, c)}${cap(pid, c, pal(c), { x: 60 + i * 150, y: 120 + (i % 2) * 70, s: 1.05 })}`;
    }).join('');
  } else if (g.type === 'coat') {
    body = defs(id, hex) + foldedCoat(id, hex, p, { x: 100, y: 70, w: 400, h: 460 });
  } else {
    body = defs(id, hex)
      + foldedTop(id, hex, p, g, { x: 50, y: 46, w: 320, h: 270, neck: g.neck, pocket: g.chestPocket !== false, sleeve: g.sleeve, name })
      + cap(id, hex, p, { x: 388, y: 30, s: 0.88 })
      + foldedTrouser(id, hex, p, { x: 70, y: 345, w: 470, h: 215 });
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" role="img" aria-label="${product.name} folded set">
    <rect width="600" height="600" fill="#f2f4f3"/>${body}</svg>`;
}
