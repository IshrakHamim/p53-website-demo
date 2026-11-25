// Hero: a minimalist "p53" double helix built from the logo's dot-and-line motif.
// Brand blue + green dots, connected base pairs, gentle mouse parallax,
// and the helix unwinds into a particle field as you scroll.
import * as THREE from 'three';

export function initHero(container) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xf3f7fa, 9, 22);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
  camera.position.set(0, 0, 13);

  const BLUE = new THREE.Color('#29a3d6');
  const GREEN = new THREE.Color('#8cc63f');
  const NAVY = new THREE.Color('#0f2a44');

  const helix = new THREE.Group();
  scene.add(helix);

  // ---- helix nodes ----
  const PAIRS = 64, H = 15, TURNS = 3.2, R = 1.55;
  const sphere = new THREE.SphereGeometry(1, 20, 14);
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.05 });
  const nodes = new THREE.InstancedMesh(sphere, mat, PAIRS * 2);
  const home = [];
  const scatter = [];
  const dummy = new THREE.Object3D();
  for (let i = 0; i < PAIRS; i++) {
    const t = i / (PAIRS - 1);
    const a = t * TURNS * Math.PI * 2;
    const y = (t - 0.5) * H;
    for (let s = 0; s < 2; s++) {
      const ang = a + s * Math.PI;
      home.push(new THREE.Vector3(Math.cos(ang) * R, y, Math.sin(ang) * R));
      scatter.push(new THREE.Vector3((Math.random() - 0.5) * 22, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 10 - 2));
      nodes.setColorAt(i * 2 + s, s === 0 ? BLUE : GREEN);
    }
  }
  helix.add(nodes);

  // ---- base-pair rungs (the logo's lines) ----
  const rungGeo = new THREE.BufferGeometry();
  const rungPos = new Float32Array(PAIRS * 2 * 3);
  const rungCol = new Float32Array(PAIRS * 2 * 3);
  for (let i = 0; i < PAIRS; i++) {
    BLUE.toArray(rungCol, i * 6);
    GREEN.toArray(rungCol, i * 6 + 3);
  }
  rungGeo.setAttribute('position', new THREE.BufferAttribute(rungPos, 3));
  rungGeo.setAttribute('color', new THREE.BufferAttribute(rungCol, 3));
  const rungs = new THREE.LineSegments(rungGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.55 }));
  helix.add(rungs);

  // ---- backbone curves ----
  const backbones = [0, 1].map((s) => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(PAIRS * 3), 3));
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: s ? GREEN : BLUE, transparent: true, opacity: 0.35 }));
    helix.add(line);
    return line;
  });

  // ---- ambient dust ----
  const DUST = 420;
  const dustGeo = new THREE.BufferGeometry();
  const dp = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) {
    dp[i * 3] = (Math.random() - 0.5) * 30;
    dp[i * 3 + 1] = (Math.random() - 0.5) * 18;
    dp[i * 3 + 2] = (Math.random() - 0.5) * 14 - 3;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: NAVY, size: 0.035, transparent: true, opacity: 0.35 }));
  scene.add(dust);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xcfe3ee, 1.4));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(4, 6, 8);
  scene.add(key);

  // ---- interaction ----
  const mouse = new THREE.Vector2(), smoothMouse = new THREE.Vector2();
  const onMove = (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener('pointermove', onMove, { passive: true });

  let progress = 0; // 0 = helix, 1 = scattered
  const onScroll = () => {
    const r = container.getBoundingClientRect();
    progress = Math.min(1, Math.max(0, -r.top / (r.height * 0.85)));
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  const resize = () => {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // helix sits right of the headline on desktop, centred behind it on mobile
    helix.position.x = w > 900 ? 3.4 : 2.6;
    helix.scale.setScalar(w > 900 ? 1 : 0.62);
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  let visible = true;
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
  io.observe(container);

  const tmp = new THREE.Vector3();
  const clock = new THREE.Clock();
  let raf, intro = 0;
  const tick = () => {
    raf = requestAnimationFrame(tick);
    if (!visible) return;
    const t = clock.getElapsedTime();
    intro = Math.min(1, intro + 0.012);
    const ease = 1 - Math.pow(1 - intro, 3);
    smoothMouse.lerp(mouse, 0.05);

    const p = reduced ? 0 : progress;
    const sp = p * p * (3 - 2 * p);
    const pos = rungPos;
    for (let i = 0; i < PAIRS * 2; i++) {
      const pair = i >> 1;
      const wave = Math.sin(t * 1.2 + pair * 0.18) * 0.08;
      tmp.copy(home[i]).multiplyScalar(1 + wave);
      tmp.y = home[i].y * (0.2 + 0.8 * ease);
      tmp.lerp(scatter[i], sp);
      const size = (i % 2 ? 0.13 : 0.16) * (1 + 0.25 * Math.sin(t * 2 + pair)) * (0.4 + 0.6 * ease);
      dummy.position.copy(tmp);
      dummy.scale.setScalar(size);
      dummy.updateMatrix();
      nodes.setMatrixAt(i, dummy.matrix);
      tmp.toArray(pos, i * 3);
      tmp.toArray(backbones[i % 2].geometry.attributes.position.array, pair * 3);
    }
    nodes.instanceMatrix.needsUpdate = true;
    rungGeo.attributes.position.needsUpdate = true;
    backbones.forEach((b) => (b.geometry.attributes.position.needsUpdate = true));
    rungs.material.opacity = 0.55 * (1 - sp);
    backbones.forEach((b) => (b.material.opacity = 0.35 * (1 - sp)));

    helix.rotation.y = t * (reduced ? 0 : 0.18) + smoothMouse.x * 0.5;
    helix.rotation.x = smoothMouse.y * 0.12;
    helix.rotation.z = 0.32;
    dust.rotation.y = t * 0.01 + smoothMouse.x * 0.08;
    dust.position.y = Math.sin(t * 0.2) * 0.2;
    camera.position.x = smoothMouse.x * 0.6;
    camera.position.y = -smoothMouse.y * 0.4;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  };
  tick();

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('scroll', onScroll);
    ro.disconnect(); io.disconnect();
    renderer.dispose();
    renderer.forceContextLoss?.();
    renderer.domElement.remove();
  };
}
