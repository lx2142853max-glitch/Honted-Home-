// ============================================================
// ENGINE — renderer, night atmosphere, colliders, builders
// ============================================================
import * as THREE from 'three';
import { buildTextures } from './textures.js';

export const FLOOR = { BASEMENT: -3.6, G: 0, F1: 4.2, F2: 8.4, SANCTUM: 16.8 };

export function initEngine(canvas) {
  const E = {};
  E.canvas = canvas;
  E.colliders = [];      // {minX,maxX,minZ,maxZ, top} — AABB, top used for step-up logic
  E.interactables = [];  // {object, radius, prompt(), enabled(), onInteract()}
  E.tick = [];           // fn(dt, elapsed)
  E.flags = {};          // game state flags

  // ---------- renderer ----------
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  E.renderer = renderer;

  // ---------- scene / camera ----------
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070c18);
  scene.fog = new THREE.FogExp2(0x0a1120, 0.020);
  E.scene = scene;
  const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.08, 420);
  camera.position.set(0, 1.62, 60);
  E.camera = camera;

  // ---------- lights ----------
  const hemi = new THREE.HemisphereLight(0x8fa8d8, 0x11141c, 0.62);
  scene.add(hemi);
  E.hemi = hemi;

  const moonLight = new THREE.DirectionalLight(0xb9cdf0, 1.35);
  moonLight.position.set(38, 52, 30);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.set(1024, 1024);
  const sc = moonLight.shadow.camera;
  sc.left = -46; sc.right = 46; sc.top = 46; sc.bottom = -46; sc.far = 140;
  moonLight.shadow.bias = -0.0006;
  scene.add(moonLight);
  E.moonLight = moonLight;

  const ambient = new THREE.AmbientLight(0x1a2236, 0.9);
  scene.add(ambient);

  // ---------- sky dome, stars, moon ----------
  E.textures = buildTextures();
  const skyGeo = new THREE.SphereGeometry(360, 24, 16);
  const skyTex = makeSkyTexture();
  const skyMat = new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false, depthWrite: false });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  sky.renderOrder = -10;
  scene.add(sky);

  const starGeo = new THREE.BufferGeometry();
  const starPos = [];
  for (let i = 0; i < 700; i++) {
    const theta = Math.random() * Math.PI * 2, phi = Math.random() * Math.PI * 0.42;
    const r = 350;
    starPos.push(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi) + 10, r * Math.sin(phi) * Math.sin(theta));
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xdde6ff, size: 1.6, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.9 }));
  scene.add(stars);

  const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: E.textures.moon, fog: false, transparent: true, depthWrite: false }));
  moon.scale.set(46, 46, 1);
  moon.position.set(120, 105, -95);
  scene.add(moon);

  // low scudding cloud sprites
  const cloudTex = makeCloudTexture();
  E.clouds = [];
  for (let i = 0; i < 14; i++) {
    const cl = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, transparent: true, opacity: 0.5 + Math.random() * 0.3, depthWrite: false, fog: false, color: 0x9db1d4 }));
    const a = Math.random() * Math.PI * 2, r = 130 + Math.random() * 130;
    cl.position.set(Math.cos(a) * r, 46 + Math.random() * 46, Math.sin(a) * r);
    cl.scale.set(120 + Math.random() * 130, 34 + Math.random() * 30, 1);
    scene.add(cl);
    E.clouds.push(cl);
  }

  // ---------- rain ----------
  const RAIN = 850;
  const rainGeo = new THREE.BufferGeometry();
  const rp = new Float32Array(RAIN * 3);
  for (let i = 0; i < RAIN; i++) { rp[i * 3] = (Math.random() - 0.5) * 70; rp[i * 3 + 1] = Math.random() * 30; rp[i * 3 + 2] = (Math.random() - 0.5) * 70; }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rp, 3));
  const rain = new THREE.Points(rainGeo, new THREE.PointsMaterial({ color: 0xa8bdd8, size: 0.09, transparent: true, opacity: 0.55, depthWrite: false }));
  rain.frustumCulled = false;
  scene.add(rain);
  E.rain = rain;

  // ---------- lightning state ----------
  E.lightning = { next: 6 + Math.random() * 9, flash: 0 };

  // ================= helpers =================

  // solid box (mesh + optional collider)
  E.solidBox = function ({ x, y, z, w, h, d, mat, collider = true, castShadow = false, receiveShadow = true, name = '' }) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = castShadow; m.receiveShadow = receiveShadow;
    if (name) m.name = name;
    scene.add(m);
    if (collider) E.colliders.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2, top: y + h / 2, bottom: y - h / 2 });
    return m;
  };

  // wall with rectangular openings (door/window holes) — axis aligned
  // openings: [{offset (m from wall start), w, h, sill (default 0)}]
  E.addWall = function ({ x1, z1, x2, z2, y = 0, h = 4.2, t = 0.42, mat, openings = [], collider = true, castShadow = false }) {
    const horizontal = Math.abs(z2 - z1) < 0.001;
    const len = horizontal ? Math.abs(x2 - x1) : Math.abs(z2 - z1);
    const sx = horizontal ? Math.min(x1, x2) : x1;
    const sz = horizontal ? z1 : Math.min(z1, z2);
    // interval-sweep decomposition: handles openings that overlap in x (each vertical strip keeps only the solid complement of its covering openings)
    const cuts = [...new Set([0, len, ...openings.flatMap(o => [o.offset, o.offset + o.w])])].sort((a, b) => a - b);
    const pieces = [];
    for (let i = 0; i < cuts.length - 1; i++) {
      const a = cuts[i], b = cuts[i + 1];
      if (b - a <= 0.01) continue;
      const covering = openings.filter(o => o.offset < b && o.offset + o.w > a);
      const spans = covering.map(o => [o.sill || 0, (o.sill || 0) + o.h]).sort((p, q) => p[0] - q[0]);
      let y = 0;
      for (const [s, e] of spans) {
        if (s > y) pieces.push({ a, b, y0: y, y1: Math.min(s, h) });
        y = Math.max(y, Math.min(e, h));
      }
      if (y < h) pieces.push({ a, b, y0: y, y1: h });
    }

    for (const p of pieces) {
      const plen = p.b - p.a, ph = p.y1 - p.y0;
      if (plen <= 0.01 || ph <= 0.01) continue;
      const mid = (p.a + p.b) / 2;
      const cy = y + p.y0 + ph / 2;
      if (horizontal) {
        E.solidBox({ x: sx + mid, y: cy, z: z1, w: plen, h: ph, d: t, mat, collider, castShadow });
      } else {
        E.solidBox({ x: x1, y: cy, z: sz + mid, w: t, h: ph, d: plen, mat, collider, castShadow });
      }
    }
  };

  // floor/ceiling slab with rectangular holes (stairwells)
  E.addSlab = function ({ x1, z1, x2, z2, y, t = 0.34, mat, openings = [] }) {
    let rects = [{ x1: Math.min(x1, x2), z1: Math.min(z1, z2), x2: Math.max(x1, x2), z2: Math.max(z1, z2) }];
    for (const o of openings) {
      const next = [];
      for (const r of rects) {
        const ox1 = Math.max(r.x1, Math.min(o.x1, o.x2)), ox2 = Math.min(r.x2, Math.max(o.x1, o.x2));
        const oz1 = Math.max(r.z1, Math.min(o.z1, o.z2)), oz2 = Math.min(r.z2, Math.max(o.z1, o.z2));
        if (ox1 >= ox2 || oz1 >= oz2) { next.push(r); continue; }
        if (r.x1 < ox1) next.push({ x1: r.x1, z1: r.z1, x2: ox1, z2: r.z2 });
        if (ox2 < r.x2) next.push({ x1: ox2, z1: r.z1, x2: r.x2, z2: r.z2 });
        if (r.z1 < oz1) next.push({ x1: ox1, z1: r.z1, x2: ox2, z2: oz1 });
        if (oz2 < r.z2) next.push({ x1: ox1, z1: oz2, x2: ox2, z2: r.z2 });
      }
      rects = next;
    }
    for (const r of rects) {
      const w = r.x2 - r.x1, d = r.z2 - r.z1;
      E.solidBox({ x: (r.x1 + r.x2) / 2, y: y - t / 2, z: (r.z1 + r.z2) / 2, w, h: t, d, mat, collider: true });
    }
  };

  // stairs — visual steps + step-colliders (works with 0.35 m step-up)
  E.addStairs = function ({ x, z, dir, length, width, y0, y1, mat, steps = Math.ceil((y1 - y0) / 0.21) }) {
    const rise = (y1 - y0) / steps, run = length / steps;
    for (let i = 0; i < steps; i++) {
      const sy = y0 + rise * i + rise / 2;
      const off = run * i + run / 2;
      let cx = x, cz = z, w = width, d = run + 0.02;
      if (dir === 'north') { cz = z - off; }
      else if (dir === 'south') { cz = z + off; }
      else if (dir === 'west') { cx = x - off; w = run + 0.02; d = width; }
      else if (dir === 'east') { cx = x + off; w = run + 0.02; d = width; }
      E.solidBox({ x: cx, y: sy, z: cz, w, h: rise, d, mat, collider: true });
    }
  };

  // gable roof prism (ridge along z)
  E.addGableRoof = function ({ cx, z1, z2, baseY, apexY, halfWidth, mat }) {
    const shape = new THREE.Shape();
    shape.moveTo(-halfWidth, 0); shape.lineTo(halfWidth, 0); shape.lineTo(0, apexY - baseY); shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: Math.abs(z2 - z1), bevelEnabled: false });
    geo.translate(0, 0, Math.min(z1, z2));
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(cx, baseY, 0);
    mesh.castShadow = true; mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  };

  // pyramid spire (cones with few segments) — towers, turret, chimneys caps
  E.addSpire = function ({ x, y, z, radius, height, mat, segments = 4, rotY = Math.PI / 4 }) {
    const geo = new THREE.ConeGeometry(radius, height, segments);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y + height / 2, z);
    m.rotation.y = rotY;
    m.castShadow = true;
    scene.add(m);
    return m;
  };

  // symbol plane (glowing, no lighting needed)
  E.addSymbol = function ({ tex, x, y, z, ry = 0, size = 1.2, opacity = 1 }) {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(size, size),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity, side: THREE.DoubleSide, fog: false })
    );
    m.position.set(x, y, z);
    m.rotation.y = ry;
    scene.add(m);
    return m;
  };

  // glowing window pane (double-sided, always lit look)
  E.addGlowPane = function ({ tex, x, y, z, ry = 0, w = 1.0, h = 1.3, color = 0xffffff }) {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: tex, color, transparent: false, side: THREE.DoubleSide, fog: false })
    );
    m.position.set(x, y, z);
    m.rotation.y = ry;
    scene.add(m);
    return m;
  };

  // window frame (simple crossed frame inset)
  E.addWindowFrame = function ({ x, y, z, ry = 0, w = 1.14, h = 1.44, mat }) {
    const g = new THREE.Group();
    const bar = 0.09;
    const mk = (bw, bh, ox, oy) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.1), mat);
      b.position.set(ox, oy, 0);
      g.add(b);
    };
    mk(w + bar, bar, 0, h / 2); mk(w + bar, bar, 0, -h / 2);
    mk(bar, h, -w / 2, 0); mk(bar, h, w / 2, 0);
    mk(bar * 0.8, h, 0, 0); mk(w, bar * 0.8, 0, 0);
    g.position.set(x, y, z);
    g.rotation.y = ry;
    scene.add(g);
    return g;
  };

  // register an interactable
  E.addInteractable = function (cfg) { E.interactables.push(cfg); };

  // point light helper (few, no shadows)
  E.addPointLight = function ({ x, y, z, color = 0xffc37a, intensity = 14, distance = 13, decay = 2 }) {
    const l = new THREE.PointLight(color, intensity, distance, decay);
    l.position.set(x, y, z);
    scene.add(l);
    return l;
  };

  // ================= frame update =================
  const rainVel = 26;
  E.update = function (dt, elapsed, camPos) {
    // rain fall, wrapped around camera
    const arr = E.rain.geometry.attributes.position.array;
    for (let i = 0; i < arr.length; i += 3) {
      arr[i + 1] -= rainVel * dt;
      if (arr[i + 1] < 0) {
        arr[i + 1] = 26 + Math.random() * 4;
        arr[i] = camPos.x + (Math.random() - 0.5) * 70;
        arr[i + 2] = camPos.z + (Math.random() - 0.5) * 70;
      }
    }
    E.rain.geometry.attributes.position.needsUpdate = true;
    E.rain.position.set(0, 0, 0);

    // drifting clouds
    for (const cl of E.clouds) { cl.position.x += dt * 1.35; if (cl.position.x > 280) cl.position.x = -280; }

    // lightning scheduler → E.lightning.flash consumed by main loop for HUD flash + thunder
    E.lightning.next -= dt;
    if (E.lightning.next <= 0) {
      E.lightning.flash = 1;
      E.lightning.next = 9 + Math.random() * 17;
    }
    if (E.lightning.flash > 0) {
      E.lightning.flash = Math.max(0, E.lightning.flash - dt * 1.6);
      const f = E.lightning.flash;
      E.hemi.intensity = 0.62 + Math.pow(f, 2.4) * 2.1;
      E.moonLight.intensity = 1.35 + Math.pow(f, 2.4) * 2.6;
    } else {
      E.hemi.intensity += (0.62 - E.hemi.intensity) * 0.1;
      E.moonLight.intensity += (1.35 - E.moonLight.intensity) * 0.1;
    }

    for (const fn of E.tick) fn(dt, elapsed);
  };

  // ================= floor height query =================
  E.floorHeightAt = function (x, z, feetY) {
    let best = -Infinity;
    for (const c of E.colliders) {
      if (c.enabled === false) continue;
      if (x < c.minX - 0.05 || x > c.maxX + 0.05 || z < c.minZ - 0.05 || z > c.maxZ + 0.05) continue;
      const top = c.top;
      if (top <= feetY + 0.38 && top > best) best = top;
    }
    return best === -Infinity ? 0.0 : best;
  };

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return E;
}

// ---------- internal texture painters ----------
function makeSkyTexture() {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 512;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, '#02040a');
  g.addColorStop(0.36, '#060b18');
  g.addColorStop(0.52, '#0d1626');
  g.addColorStop(0.62, '#16233a');
  g.addColorStop(0.72, '#0b1220');
  g.addColorStop(1, '#05070d');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1024, 512);
  // storm cloud bands
  const grad = (x, y, rx, ry, a) => {
    const rg = ctx.createRadialGradient(x, y, 4, x, y, rx);
    rg.addColorStop(0, `rgba(64,82,116,${a})`);
    rg.addColorStop(1, 'rgba(64,82,116,0)');
    ctx.fillStyle = rg;
    ctx.save(); ctx.scale(1, ry / rx); ctx.beginPath(); ctx.arc(x, y * (rx / ry), rx, 0, 7); ctx.fill(); ctx.restore();
  };
  grad(240, 250, 260, 90, .8); grad(560, 205, 300, 110, .9); grad(830, 275, 280, 100, .75); grad(420, 330, 340, 70, .55);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeCloudTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 256, 128);
  const st = { s: 77 };
  const rnd = () => { const x = Math.sin(st.s++) * 10000; return x - Math.floor(x); };
  for (let i = 0; i < 46; i++) {
    const x = 30 + rnd() * 196, y = 34 + rnd() * 60, r = 12 + rnd() * 34;
    const g = ctx.createRadialGradient(x, y, 1, x, y, r);
    g.addColorStop(0, 'rgba(120,140,175,.5)');
    g.addColorStop(1, 'rgba(120,140,175,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 128);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
