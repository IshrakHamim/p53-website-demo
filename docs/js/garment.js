// Procedural 3D garment builder for P53 products.
// Every product is generated from parameters (cut, sleeve, neck, colour, pockets)
// so the whole catalogue gets a consistent, rotatable 360° presentation.
import * as THREE from 'three';

/* ---------------- colour helpers ---------------- */
export function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const rgbStr = ([r, g, b], a = 1) => `rgba(${r | 0},${g | 0},${b | 0},${a})`;
export function shade(hex, f) {
  // f < 0 darkens, f > 0 lightens
  const c = hexToRgb(hex);
  return c.map((v) => (f < 0 ? v * (1 + f) : v + (255 - v) * f));
}
export function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/* ---------------- shared textures ---------------- */
let _weave;
function weaveTexture() {
  if (_weave) return _weave;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#808080';
  g.fillRect(0, 0, 128, 128);
  // fine twill
  for (let i = -128; i < 256; i += 4) {
    g.strokeStyle = 'rgba(255,255,255,0.22)';
    g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 128, 128); g.stroke();
    g.strokeStyle = 'rgba(0,0,0,0.18)';
    g.beginPath(); g.moveTo(i + 2, 0); g.lineTo(i + 130, 128); g.stroke();
  }
  const img = g.getImageData(0, 0, 128, 128);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 30;
    img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
  _weave = new THREE.CanvasTexture(c);
  _weave.wrapS = _weave.wrapT = THREE.RepeatWrapping;
  return _weave;
}

let _shadow;
function shadowTexture() {
  if (_shadow) return _shadow;
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(128, 128, 4, 128, 128, 128);
  grd.addColorStop(0, 'rgba(10,25,40,0.42)');
  grd.addColorStop(0.45, 'rgba(10,25,40,0.16)');
  grd.addColorStop(1, 'rgba(10,25,40,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  _shadow = new THREE.CanvasTexture(c);
  return _shadow;
}

/* ---------------- canvas drawing kit ---------------- */
function makeCanvas(w, h, hex) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = hex;
  g.fillRect(0, 0, w, h);
  // subtle tonal variation (fabric isn't flat)
  const grd = g.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0, 'rgba(255,255,255,0.04)');
  grd.addColorStop(1, 'rgba(0,0,0,0.05)');
  g.fillStyle = grd;
  g.fillRect(0, 0, w, h);
  return { c, g };
}

function palette(hex) {
  const light = luminance(hex) > 0.6;
  return {
    base: hex,
    seam: rgbStr(shade(hex, light ? -0.22 : -0.45), 0.9),
    shadow: rgbStr([0, 0, 0], light ? 0.1 : 0.28),
    hi: rgbStr([255, 255, 255], light ? 0.5 : 0.1),
    stitch: light ? 'rgba(80,90,100,0.45)' : rgbStr(shade(hex, 0.4), 0.55),
    inner: rgbStr(shade(hex, light ? -0.3 : -0.55)),
    logo: light ? '#2aa1c9' : 'rgba(235,240,245,0.92)',
    light,
  };
}

function stitchLine(g, pts, color, w = 2, dash = [7, 6]) {
  g.save();
  g.strokeStyle = color; g.lineWidth = w; g.setLineDash(dash); g.lineCap = 'round';
  g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
  g.restore();
}
function seamLine(g, pts, pal, w = 3) {
  g.save();
  g.lineCap = 'round';
  g.strokeStyle = pal.seam; g.lineWidth = w;
  g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
  g.strokeStyle = pal.hi; g.lineWidth = 1.2;
  g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x + 2.5, y + 1) : g.moveTo(x + 2.5, y + 1))); g.stroke();
  g.restore();
}
function patchPocket(g, x, y, w, h, pal, opts = {}) {
  g.save();
  // soft drop shadow so the patch reads as raised
  g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = 6; g.shadowOffsetY = 3;
  g.fillStyle = pal.base;
  roundRect(g, x, y, w, h, opts.r ?? 6); g.fill();
  g.shadowColor = 'transparent';
  g.strokeStyle = pal.seam; g.lineWidth = 2.2; roundRect(g, x, y, w, h, opts.r ?? 6); g.stroke();
  stitchLine(g, [[x + 6, y + h - 6], [x + 6, y + 6], [x + w - 6, y + 6], [x + w - 6, y + h - 6], [x + 6, y + h - 6]], pal.stitch, 1.6, [5, 4]);
  // hem at the opening
  stitchLine(g, [[x + 4, y + 14], [x + w - 4, y + 14]], pal.stitch, 1.6, [5, 4]);
  if (opts.pen) seamLine(g, [[x + w * 0.72, y + 2], [x + w * 0.72, y + h - 4]], pal, 2);
  g.restore();
}
function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r);
  g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r);
  g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath();
}
function logo(g, x, y, s, pal) {
  // "≡P53" embroidery mark, as on the garments
  g.save();
  g.fillStyle = pal.logo; g.strokeStyle = pal.logo;
  g.lineWidth = Math.max(1.5, s * 0.07); g.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    g.beginPath(); g.moveTo(x, y - s * 0.55 + i * s * 0.22); g.lineTo(x + s * 0.45, y - s * 0.62 + i * s * 0.22); g.stroke();
  }
  g.font = `italic 700 ${s}px "Plus Jakarta Sans", system-ui, sans-serif`;
  g.textBaseline = 'alphabetic';
  g.fillText('P53', x + s * 0.5, y);
  g.restore();
}
function embroideredName(g, x, y, text, pal, size = 26) {
  if (!text) return;
  g.save();
  g.font = `800 ${size}px "Plus Jakarta Sans", system-ui, sans-serif`;
  g.fillStyle = pal.light ? '#22324a' : 'rgba(240,244,248,0.95)';
  g.textAlign = 'center';
  g.fillText(text.toUpperCase().slice(0, 15), x, y);
  g.restore();
}

/* ---------------- geometry helpers ---------------- */
function sampleProfile(keys, n = 90) {
  // smooth Catmull-Rom spline through (radius, y) keys → no lighting bands
  const curve = new THREE.SplineCurve(keys.map(([y, r]) => new THREE.Vector2(r, y)));
  const pts = curve.getSpacedPoints(n);
  return { pts, y0: keys[0][0], y1: keys[keys.length - 1][0] };
}
function remapUVByHeight(geo, y0, y1) {
  // make texture v proportional to height so drawn details land where expected
  const pos = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setY(i, (pos.getY(i) - y0) / (y1 - y0));
  uv.needsUpdate = true;
}

function fabricMaterial(map, hex) {
  const sheen = new THREE.Color().setRGB(...shade(hex, 0.35).map((v) => v / 255), THREE.SRGBColorSpace);
  const weave = weaveTexture().clone();
  weave.needsUpdate = true;
  weave.repeat.set(24, 24);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  return new THREE.MeshPhysicalMaterial({
    map,
    roughness: 0.88,
    metalness: 0,
    sheen: 0.35,
    sheenRoughness: 0.75,
    sheenColor: sheen,
    bumpMap: weave,
    bumpScale: 0.35,
  });
}
function innerMaterial(hex) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color().setRGB(...shade(hex, -0.55).map((v) => v / 255), THREE.SRGBColorSpace),
    roughness: 1,
    side: THREE.BackSide,
  });
}
function addShell(group, geo, mat, inner, transform) {
  const outer = new THREE.Mesh(geo, mat);
  const back = new THREE.Mesh(geo, inner);
  [outer, back].forEach((m) => { transform?.(m); group.add(m); });
  return outer;
}

/* ---------------- torso (top / coat) ---------------- */
const TORSO = {
  male: [[0.1, 0.64], [0.5, 0.62], [0.9, 0.63], [1.25, 0.66], [1.45, 0.665], [1.57, 0.6], [1.65, 0.46], [1.7, 0.25]],
  female: [[0.05, 0.64], [0.35, 0.585], [0.72, 0.535], [1.05, 0.6], [1.3, 0.6], [1.45, 0.575], [1.55, 0.5], [1.62, 0.37], [1.665, 0.23]],
  coat: [[-0.95, 0.72], [-0.3, 0.67], [0.5, 0.645], [1.0, 0.66], [1.45, 0.675], [1.57, 0.61], [1.65, 0.46], [1.7, 0.26]],
};
const Z_SCALE = 0.62;

function drawTorsoTexture(cv, spec, prof) {
  const { g, c } = cv;
  const W = c.width, H = c.height;
  const pal = palette(spec.hex);
  const rFront = 0.64;
  // world → canvas helpers (front centre is u = 0.5)
  const X = (dx) => (0.5 + dx / (2 * Math.PI * rFront)) * W;
  const Y = (y) => (1 - (y - prof.y0) / (prof.y1 - prof.y0)) * H;
  const U = (u) => u * W;

  // side seams
  [0.25, 0.75].forEach((u) => seamLine(g, [[U(u), 0], [U(u), H]], pal));
  // back yoke
  seamLine(g, [[U(0.79), Y(1.38)], [U(1.0), Y(1.38)]], pal, 2.4);
  seamLine(g, [[0, Y(1.38)], [U(0.21), Y(1.38)]], pal, 2.4);
  // hem stitch
  stitchLine(g, [[0, H - 14], [W, H - 14]], pal.stitch, 2);
  seamLine(g, [[0, H - 4], [W, H - 4]], pal, 3);

  if (spec.type === 'coat') return drawCoatFront(g, pal, X, Y, U, H, spec);

  // side slits (female cut / scrub tops)
  [0.25, 0.75].forEach((u) => {
    g.fillStyle = pal.inner;
    g.beginPath(); g.moveTo(U(u) - 6, H); g.lineTo(U(u), Y(prof.y0 + 0.16)); g.lineTo(U(u) + 6, H); g.fill();
    stitchLine(g, [[U(u) - 14, H], [U(u) - 4, Y(prof.y0 + 0.19)], [U(u) + 4, Y(prof.y0 + 0.19)], [U(u) + 14, H]], pal.stitch, 1.6, [5, 4]);
  });

  // neckline
  const top = prof.y1;
  if (spec.neck === 'round') {
    const yb = top - 0.12;
    g.fillStyle = pal.inner;
    g.beginPath(); g.moveTo(U(0.38), 0);
    g.quadraticCurveTo(U(0.5), Y(yb) * 2.0, U(0.62), 0); g.closePath(); g.fill();
    g.strokeStyle = pal.seam; g.lineWidth = 9;
    g.beginPath(); g.moveTo(U(0.38), 0); g.quadraticCurveTo(U(0.5), Y(yb) * 2.0, U(0.62), 0); g.stroke();
    stitchLine(g, [[U(0.385), 10], [U(0.5), Y(yb) * 2.0 - 20], [U(0.615), 10]], pal.stitch, 1.6);
  } else {
    const yb = spec.cut === 'female' ? top - 0.36 : top - 0.46;
    g.fillStyle = pal.inner;
    g.beginPath(); g.moveTo(U(0.405), 0); g.lineTo(X(0), Y(yb)); g.lineTo(U(0.595), 0); g.closePath(); g.fill();
    // collar binding
    g.save();
    g.lineJoin = 'miter';
    g.strokeStyle = rgbStr(shade(spec.hex, pal.light ? -0.08 : -0.18)); g.lineWidth = 22;
    g.beginPath(); g.moveTo(U(0.405), -10); g.lineTo(X(0), Y(yb)); g.lineTo(U(0.595), -10); g.stroke();
    g.strokeStyle = pal.seam; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(U(0.405) - 11, -10); g.lineTo(X(0), Y(yb) + 15); g.lineTo(U(0.595) + 11, -10); g.stroke();
    g.restore();
    stitchLine(g, [[U(0.405) - 6, 0], [X(0), Y(yb) + 8], [U(0.595) + 6, 0]], pal.stitch, 1.5, [5, 4]);
    // back neck binding
    seamLine(g, [[0, 12], [U(0.4), 12]], pal, 2); seamLine(g, [[U(0.6), 12], [W, 12]], pal, 2);
  }

  // chest pocket (wearer's left = viewer's right) + logo
  if (spec.chestPocket) {
    patchPocket(g, X(0.14), Y(1.2), X(0.4) - X(0.14), Y(0.96) - Y(1.2), pal, { pen: true });
    logo(g, X(0.2), Y(1.24), 30, pal);
  } else {
    logo(g, X(0.18), Y(1.18), 28, pal);
  }
  if (spec.shoulderLoop) {
    g.fillStyle = rgbStr(shade(spec.hex, -0.2));
    roundRect(g, U(0.635), Y(1.58), 26, Y(1.4) - Y(1.58), 6); g.fill();
    stitchLine(g, [[U(0.635) + 5, Y(1.56)], [U(0.635) + 5, Y(1.42)]], pal.stitch, 1.4, [4, 3]);
  }
  // lower front pockets
  const py0 = prof.y0 + (spec.cut === 'female' ? 0.16 : 0.14);
  const py1 = py0 + 0.3;
  patchPocket(g, X(-0.5), Y(py1), X(-0.14) - X(-0.5), Y(py0) - Y(py1), pal);
  patchPocket(g, X(0.14), Y(py1), X(0.5) - X(0.14), Y(py0) - Y(py1), pal);
  if (spec.cut === 'female') {
    // princess seams for the tailored cut
    seamLine(g, [[X(-0.3), Y(1.42)], [X(-0.24), Y(0.9)], [X(-0.3), Y(py1)]], pal, 2);
    seamLine(g, [[X(0.3), Y(1.42)], [X(0.24), Y(0.9)], [X(0.3), Y(py1)]], pal, 2);
  }
  embroideredName(g, X(-0.27), Y(1.15), spec.embroidery, pal, 26);
}

function drawCoatFront(g, pal, X, Y, U, H, spec) {
  // shirt/inner visible in the V
  const yb = 0.85;
  g.fillStyle = '#dfe6ee';
  g.beginPath(); g.moveTo(U(0.41), 0); g.lineTo(X(0), Y(yb)); g.lineTo(U(0.59), 0); g.closePath(); g.fill();
  g.fillStyle = '#9fb3c8';
  g.beginPath(); g.moveTo(X(-0.05), 0); g.lineTo(X(0), Y(1.05)); g.lineTo(X(0.05), 0); g.closePath(); g.fill();
  // lapels
  const lapel = (s) => {
    g.save();
    g.shadowColor = 'rgba(0,0,0,0.25)'; g.shadowBlur = 10; g.shadowOffsetX = s * 3;
    g.fillStyle = pal.base;
    g.beginPath();
    g.moveTo(U(0.5 + s * 0.09), 0);
    g.lineTo(X(s * 0.02), Y(yb));
    g.lineTo(X(s * 0.36), Y(1.28));
    g.lineTo(X(s * 0.3), Y(1.36));
    g.lineTo(X(s * 0.4), Y(1.42));
    g.lineTo(U(0.5 + s * 0.13), 0);
    g.closePath(); g.fill();
    g.restore();
    g.strokeStyle = pal.seam; g.lineWidth = 2.4; g.stroke();
  };
  lapel(-1); lapel(1);
  // placket + buttons
  seamLine(g, [[X(0.02), Y(yb)], [X(0.02), H]], pal, 2.4);
  [0.65, 0.25, -0.15, -0.55].forEach((y) => {
    g.fillStyle = '#e8e8e4'; g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 2;
    g.beginPath(); g.arc(X(-0.04), Y(y), 9, 0, Math.PI * 2); g.fill(); g.stroke();
  });
  // breast welt pocket + logo
  seamLine(g, [[X(0.22), Y(1.02)], [X(0.46), Y(1.04)]], pal, 3);
  logo(g, X(0.24), Y(1.1), 24, { ...pal, logo: '#2aa1c9' });
  // patch pockets
  patchPocket(g, X(-0.55), Y(0.15), X(-0.16) - X(-0.55), Y(-0.3) - Y(0.15), pal);
  patchPocket(g, X(0.16), Y(0.15), X(0.55) - X(0.16), Y(-0.3) - Y(0.15), pal);
  // back vent
  seamLine(g, [[U(0.0) + 2, Y(-0.4)], [U(0.0) + 2, H]], pal, 2.4);
  seamLine(g, [[U(1) - 2, Y(-0.4)], [U(1) - 2, H]], pal, 2.4);
  embroideredName(g, X(-0.3), Y(1.0), spec.embroidery, pal, 22);
}

/* ---------------- sleeves & legs ---------------- */
function sleeveTexture(hex) {
  const cv = makeCanvas(512, 512, hex);
  const pal = palette(hex);
  stitchLine(cv.g, [[0, 512 - 22], [512, 512 - 22]], pal.stitch, 2);
  seamLine(cv.g, [[0, 509], [512, 509]], pal, 4);
  seamLine(cv.g, [[512 * 0.5, 0], [512 * 0.5, 512]], pal, 2.2); // underarm seam
  return new THREE.CanvasTexture(cv.c);
}
function legTexture(hex, side, opts) {
  const W = 512, H = 1024, len = opts.len;
  const cv = makeCanvas(W, H, hex);
  const { g } = cv;
  const pal = palette(hex);
  const outer = side > 0 ? 0.25 : 0.75;
  const inner = side > 0 ? 0.75 : 0.25;
  const Yw = (d) => (d / len) * H; // distance from top of leg → canvas y
  seamLine(g, [[outer * W, 0], [outer * W, H]], pal, 3);
  seamLine(g, [[inner * W, 0], [inner * W, H]], pal, 2);
  // front crease
  g.strokeStyle = pal.light ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(1, Yw(0.25)); g.lineTo(1, H); g.stroke();
  g.beginPath(); g.moveTo(W - 1, Yw(0.25)); g.lineTo(W - 1, H); g.stroke();
  // slant side pocket
  const ox = outer * W, dir = side > 0 ? -1 : 1;
  seamLine(g, [[ox + dir * 60, Yw(0.02)], [ox, Yw(0.36)]], pal, 3);
  stitchLine(g, [[ox + dir * 68, Yw(0.02)], [ox + dir * 6, Yw(0.4)]], pal.stitch, 1.6, [5, 4]);
  if (opts.cargo) {
    const px = ox - 70;
    patchPocket(g, px, Yw(0.55), 140, Yw(0.95) - Yw(0.55), pal);
    g.fillStyle = rgbStr(shade(hex, -0.08));
    roundRect(g, px - 4, Yw(0.52), 148, 46, 6); g.fill();
    g.strokeStyle = pal.seam; g.lineWidth = 2; g.stroke();
  }
  if (opts.label && side > 0) {
    g.fillStyle = '#f2f2f0';
    roundRect(g, ox + 22, Yw(0.48), 26, 44, 3); g.fill();
    g.save(); g.translate(ox + 39, Yw(0.48) + 40); g.rotate(-Math.PI / 2);
    g.fillStyle = '#2aa1c9'; g.font = 'italic 700 15px "Plus Jakarta Sans", sans-serif'; g.fillText('P53', 0, 0); g.restore();
  }
  // hem
  stitchLine(g, [[0, H - 30], [W, H - 30]], pal.stitch, 2);
  seamLine(g, [[0, H - 6], [W, H - 6]], pal, 4);
  return new THREE.CanvasTexture(cv.c);
}

/* ---------------- builders ---------------- */
function buildTorso(group, spec) {
  const keys = spec.type === 'coat' ? TORSO.coat : TORSO[spec.cut];
  const prof = sampleProfile(keys, 110);
  const geo = new THREE.LatheGeometry(prof.pts, 128, Math.PI, Math.PI * 2);
  remapUVByHeight(geo, prof.y0, prof.y1);
  const cv = makeCanvas(2048, spec.type === 'coat' ? 1536 : 1024, spec.hex);
  const draw = () => {
    cv.g.clearRect(0, 0, cv.c.width, cv.c.height);
    const fresh = makeCanvas(cv.c.width, cv.c.height, spec.hex);
    cv.g.drawImage(fresh.c, 0, 0);
    drawTorsoTexture(cv, spec, prof);
  };
  draw();
  const tex = new THREE.CanvasTexture(cv.c);
  const mat = fabricMaterial(tex, spec.hex);
  addShell(group, geo, mat, innerMaterial(spec.hex), (m) => m.scale.set(1, 1, Z_SCALE));
  return {
    setEmbroidery(text) { spec.embroidery = text; draw(); tex.needsUpdate = true; },
  };
}

function buildSleeves(group, spec) {
  const female = spec.cut === 'female';
  const vis = { half: 0.5, 'three-quarter': 0.98, long: 1.5 }[spec.sleeve];
  const rTop = female ? 0.2 : 0.22;
  const rBot = { half: female ? 0.165 : 0.18, 'three-quarter': 0.125, long: 0.12 }[spec.sleeve];
  const len = vis + 0.26;
  const angle = female ? 0.3 : 0.38;
  [-1, 1].forEach((side) => {
    const geo = new THREE.CylinderGeometry(rTop, rBot, len, 48, 6, true);
    geo.translate(0, -len / 2, 0);
    const mat = fabricMaterial(sleeveTexture(spec.hex), spec.hex);
    const pivot = new THREE.Group();
    pivot.position.set(side * (female ? 0.4 : 0.43), female ? 1.38 : 1.42, 0);
    pivot.rotation.z = side * angle;
    addShell(pivot, geo, mat, innerMaterial(spec.hex), (m) => m.scale.set(1, 1, 0.92));
    group.add(pivot);
  });
}

function buildTrousers(group, spec, { hex, top = 0.05, len = 1.8, hip = true, cargo = false, label = true } = {}) {
  const female = spec.cut === 'female';
  if (hip) {
    const prof = sampleProfile(female ? [[-0.05, 0.58], [0.3, 0.5], [0.6, 0.44]] : [[-0.05, 0.58], [0.3, 0.56], [0.62, 0.55]], 20);
    const geo = new THREE.LatheGeometry(prof.pts, 64);
    const mat = fabricMaterial(makeCanvasTexture(hex), hex);
    addShell(group, geo, mat, innerMaterial(hex), (m) => m.scale.set(1, 1, female ? 0.6 : 0.66));
    const cap = new THREE.Mesh(new THREE.CircleGeometry(0.58, 48), new THREE.MeshStandardMaterial({ color: new THREE.Color(hex), roughness: 1 }));
    cap.rotation.x = Math.PI / 2; cap.position.y = -0.05; cap.scale.set(1, 0.66, 1);
    group.add(cap);
  }
  const rTop = female ? 0.29 : 0.3;
  const rBot = female ? 0.175 : 0.19;
  [-1, 1].forEach((side) => {
    const geo = new THREE.CylinderGeometry(rTop, rBot, len, 48, 12, true);
    geo.translate(0, -len / 2, 0);
    const mat = fabricMaterial(legTexture(hex, side, { len, cargo, label }), hex);
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.28, top, 0);
    pivot.rotation.z = side * 0.03;
    addShell(pivot, geo, mat, innerMaterial(hex), (m) => m.scale.set(1, 1, 0.94));
    group.add(pivot);
  });
}
function makeCanvasTexture(hex) {
  return new THREE.CanvasTexture(makeCanvas(256, 256, hex).c);
}

function buildCap(group, hex) {
  const pal = palette(hex);
  // crown
  const crownCv = makeCanvas(1024, 512, hex);
  for (let i = 0; i < 4; i++) seamLine(crownCv.g, [[i * 256, 0], [i * 256, 512]], pal, 3);
  const crown = new THREE.SphereGeometry(0.5, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2);
  addShell(group, crown, fabricMaterial(new THREE.CanvasTexture(crownCv.c), hex), innerMaterial(hex), (m) => m.scale.set(1, 0.78, 1.12));
  // band
  const bandCv = makeCanvas(1024, 128, hex);
  stitchLine(bandCv.g, [[0, 14], [1024, 14]], pal.stitch, 2); stitchLine(bandCv.g, [[0, 114], [1024, 114]], pal.stitch, 2);
  seamLine(bandCv.g, [[0, 3], [1024, 3]], pal, 3);
  // woven label on the back (u = 0.5)
  bandCv.g.fillStyle = '#f4f4f2'; roundRect(bandCv.g, 470, 34, 84, 60, 4); bandCv.g.fill();
  bandCv.g.fillStyle = '#2aa1c9'; bandCv.g.font = 'italic 800 34px "Plus Jakarta Sans", sans-serif'; bandCv.g.fillText('P53', 482, 78);
  const band = new THREE.CylinderGeometry(0.505, 0.5, 0.2, 64, 1, true);
  addShell(group, band, fabricMaterial(new THREE.CanvasTexture(bandCv.c), hex), innerMaterial(hex), (m) => { m.position.y = -0.1; m.scale.set(1, 1, 1.12); });
  // ties
  const tieMat = fabricMaterial(makeCanvasTexture(hex), hex);
  [-1, 1].forEach((s) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(s * 0.06, -0.14, -0.555),
      new THREE.Vector3(s * 0.1, -0.24, -0.58),
      new THREE.Vector3(s * 0.15, -0.36, -0.57),
      new THREE.Vector3(s * 0.13, -0.46, -0.58),
    ]);
    const tie = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.022, 10), tieMat);
    tie.scale.set(1, 1, 1);
    group.add(tie);
  });
}

/**
 * Build a THREE.Group for a product.
 * Returns { group, frame: {y, dist}, setEmbroidery }
 */
export function buildGarment(product, opts = {}) {
  const g = { ...product.garment, ...(opts.garment || {}) };
  const hex = opts.color || product.colors[0].hex;
  const spec = { ...g, hex, embroidery: opts.embroidery || '' };
  const group = new THREE.Group();
  let api = { setEmbroidery() {} };
  let frame = { y: -0.02, dist: 7.7, floor: -1.78 };

  if (g.type === 'cap') {
    buildCap(group, hex);
    group.scale.setScalar(1.9);
    group.position.y = 0.0;
    frame = { y: -0.05, dist: 5.4, floor: -0.95 };
  } else if (g.type === 'coat') {
    api = buildTorso(group, spec);
    buildSleeves(group, spec);
    buildTrousers(group, spec, { hex: '#2c3440', top: -0.4, len: 1.38, hip: false, label: false });
  } else {
    api = buildTorso(group, spec);
    buildSleeves(group, spec);
    buildTrousers(group, spec, { hex, cargo: !!g.cargo });
  }

  // contact shadow
  const sh = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 2.6),
    new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false })
  );
  sh.rotation.x = -Math.PI / 2;
  sh.position.y = frame.floor;
  sh.renderOrder = -1;

  return { group, shadow: sh, frame, setEmbroidery: api.setEmbroidery };
}

export function disposeObject(obj) {
  obj.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) {
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => {
        ['map', 'bumpMap'].forEach((k) => { if (m[k] && m[k] !== _weave && m[k] !== _shadow) m[k].dispose(); });
        m.dispose();
      });
    }
  });
}
