// 360° turntable viewer (horizontal rotation only — no top/bottom views)
// plus an offscreen still renderer that produces homogeneous catalogue images.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildGarment, disposeObject } from './garment.js';

function setupScene(renderer) {
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8dee6, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(2.5, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xbfe6ff, 0.9);
  rim.position.set(-4, 2, -4);
  scene.add(rim);
  return scene;
}
function makeRenderer(canvas, opts = {}) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: !!opts.preserve });
  r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 0.92;
  return r;
}

export class GarmentViewer {
  constructor(container, product, { color, embroidery, onAngle, autoRotate = true } = {}) {
    this.container = container;
    this.onAngle = onAngle;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'viewer-canvas';
    container.appendChild(this.canvas);
    this.renderer = makeRenderer(this.canvas);
    this.scene = setupScene(this.renderer);
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    this.pivot = new THREE.Group();
    this.scene.add(this.pivot);

    this.rot = -0.45; this.vel = 0; this.target = null;
    this.autoRotate = autoRotate; this.lastInteract = -1e9;
    this.visible = true;

    this.setProduct(product, { color, embroidery });
    this._bind();
    this._resize();
    this._loop = this._loop.bind(this);
    this.raf = requestAnimationFrame(this._loop);
  }

  setProduct(product, { color, embroidery } = {}) {
    if (this.model) {
      this.pivot.remove(this.model.group);
      this.scene.remove(this.model.shadow);
      disposeObject(this.model.group);
    }
    this.product = product;
    this.model = buildGarment(product, { color, embroidery });
    this.pivot.add(this.model.group);
    this.scene.add(this.model.shadow);
    const f = this.model.frame;
    this.camera.position.set(0, f.y + 0.15, f.dist);
    this.camera.lookAt(0, f.y, 0);
    this._pop = 0;
  }
  setColor(hex) { this.setProduct(this.product, { color: hex, embroidery: this.embroidery }); }
  setEmbroidery(text) { this.embroidery = text; this.model.setEmbroidery(text); }

  snapTo(deg) {
    // shortest path to the requested facing
    const want = THREE.MathUtils.degToRad(-deg);
    const cur = this.rot;
    let d = (want - cur) % (Math.PI * 2);
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    this.target = cur + d;
    this.vel = 0;
    this.lastInteract = performance.now();
  }

  _bind() {
    const c = this.canvas;
    let down = false, lastX = 0, lastT = 0;
    c.addEventListener('pointerdown', (e) => {
      down = true; lastX = e.clientX; lastT = performance.now();
      this.target = null; this.vel = 0;
      c.setPointerCapture(e.pointerId);
      this.container.classList.add('is-dragging');
    });
    c.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - lastX; lastX = e.clientX;
      const now = performance.now();
      const d = dx * 0.011;
      this.rot += d;
      this.vel = d / Math.max(1, (now - lastT) / 16.7);
      lastT = now;
      this.lastInteract = now;
    });
    const up = () => { down = false; this.container.classList.remove('is-dragging'); this.lastInteract = performance.now(); };
    c.addEventListener('pointerup', up);
    c.addEventListener('pointercancel', up);
    this.ro = new ResizeObserver(() => this._resize());
    this.ro.observe(this.container);
    this.io = new IntersectionObserver(([en]) => (this.visible = en.isIntersecting));
    this.io.observe(this.container);
  }
  _resize() {
    const w = this.container.clientWidth || 1, h = this.container.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // keep the whole garment in frame on narrow screens
    const f = this.model.frame;
    const fitDist = w / h < 0.62 ? f.dist * (0.62 / (w / h)) * 0.92 : f.dist;
    this.camera.position.z = fitDist;
    this.camera.updateProjectionMatrix();
  }
  _loop(t) {
    this.raf = requestAnimationFrame(this._loop);
    if (!this.visible) return;
    const idle = t - this.lastInteract > 3500;
    if (this.target != null) {
      this.rot += (this.target - this.rot) * 0.12;
      if (Math.abs(this.target - this.rot) < 0.001) { this.rot = this.target; this.target = null; }
    } else {
      this.rot += this.vel;
      this.vel *= 0.93;
      if (this.autoRotate && idle) this.rot += 0.0045;
    }
    // entrance "pop"
    if (this._pop < 1) {
      this._pop = Math.min(1, this._pop + 0.05);
      const s = 0.94 + 0.06 * (1 - Math.pow(1 - this._pop, 3));
      this.pivot.scale.setScalar(s);
    }
    this.pivot.rotation.y = this.rot;
    if (this.onAngle) {
      let deg = Math.round(THREE.MathUtils.radToDeg(-this.rot)) % 360;
      if (deg < 0) deg += 360;
      if (deg !== this._lastDeg) { this._lastDeg = deg; this.onAngle(deg); }
    }
    this.renderer.render(this.scene, this.camera);
  }
  dispose() {
    cancelAnimationFrame(this.raf);
    this.ro?.disconnect(); this.io?.disconnect();
    if (this.model) disposeObject(this.model.group);
    this.renderer.dispose();
    this.renderer.forceContextLoss?.();
    this.canvas.remove();
  }
}

/* ---------------- still renderer (catalogue images) ---------------- */
let still = null;
const cache = new Map();
const queue = [];
let busy = false;

function getStill() {
  if (still !== null) return still;
  const canvas = document.createElement('canvas');
  let renderer;
  try { renderer = makeRenderer(canvas, { preserve: true }); } catch (e) { still = false; return still; }
  renderer.setPixelRatio(1);
  const scene = setupScene(renderer);
  const camera = new THREE.PerspectiveCamera(30, 0.8, 0.1, 50);
  still = { renderer, scene, camera };
  return still;
}

function renderNow({ product, angle = -28, color, w = 640, h = 800 }) {
  const s = getStill();
  if (!s) return '';
  const { renderer, scene, camera } = s;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  const model = buildGarment(product, { color });
  model.group.rotation.y = THREE.MathUtils.degToRad(angle);
  scene.add(model.group); scene.add(model.shadow);
  const f = model.frame;
  camera.position.set(0, f.y + 0.15, f.dist * (w / h < 0.8 ? 1.06 : 1));
  camera.lookAt(0, f.y, 0);
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
  const url = renderer.domElement.toDataURL('image/png');
  scene.remove(model.group); scene.remove(model.shadow);
  disposeObject(model.group);
  return url;
}

/** Async, queued, cached still render. Returns a data URL. */
export function renderStill(opts) {
  const key = `${opts.product.slug}|${opts.angle ?? -28}|${opts.color || ''}|${opts.w || 640}x${opts.h || 800}`;
  if (cache.has(key)) return cache.get(key);
  const p = new Promise((resolve) => queue.push({ opts, resolve }));
  cache.set(key, p);
  pump();
  return p;
}
function pump() {
  if (busy || !queue.length) return;
  busy = true;
  const run = () => {
    const job = queue.shift();
    try { job.resolve(renderNow(job.opts)); } catch (e) { console.error(e); job.resolve(''); }
    busy = false;
    if (queue.length) setTimeout(pump, 0);
  };
  (window.requestIdleCallback || ((f) => setTimeout(f, 16)))(run);
}
