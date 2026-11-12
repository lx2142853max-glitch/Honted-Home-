// ============================================================
// PROPS COMMON — shared builders & interaction helpers
// ============================================================
import * as THREE from 'three';

export function nearXZ(E, x, z, r) {
  const p = E.camera.position;
  const dx = p.x - x, dz = p.z - z;
  return dx * dx + dz * dz <= r * r;
}

export function box(E, { x, y, z, w, h, d, mat, collider = true, castShadow = false, ry = 0, scene: sc }) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  if (ry) m.rotation.y = ry;
  m.castShadow = castShadow; m.receiveShadow = true;
  E.scene.add(m);
  if (collider) {
    if (ry) {
      // conservative expanded AABB for rotated props
      const ex = Math.abs(Math.cos(ry)) * w / 2 + Math.abs(Math.sin(ry)) * d / 2;
      const ez = Math.abs(Math.sin(ry)) * w / 2 + Math.abs(Math.cos(ry)) * d / 2;
      E.colliders.push({ minX: x - ex, maxX: x + ex, minZ: z - ez, maxZ: z + ez, top: y + h / 2, bottom: y - h / 2 });
    } else {
      E.colliders.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2, top: y + h / 2, bottom: y - h / 2 });
    }
  }
  return m;
}

export function cyl(E, { x, y, z, rTop, rBottom, h, mat, seg = 12, collider = true, castShadow = true, open = false, top: colTop }) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, h, seg, 1, open), mat);
  m.position.set(x, y, z);
  m.castShadow = castShadow; m.receiveShadow = true;
  E.scene.add(m);
  if (collider) {
    const r = Math.max(rTop, rBottom);
    E.colliders.push({ minX: x - r, maxX: x + r, minZ: z - r, maxZ: z + r, top: colTop !== undefined ? colTop : y + h / 2, bottom: y - h / 2 });
  }
  return m;
}

// flavor interactable (read/notice/lore)
export function readable(E, { x, z, y = 0, r = 2.3, prompt, onRead }) {
  E.addInteractable({
    object: null, radius: r,
    prompt: () => (typeof prompt === 'function' ? prompt() : prompt),
    enabled: () => nearXZ(E, x, z, r) && Math.abs((E.camera.position.y - y) - 1.62) < 1.75,
    onInteract: () => { if (onRead) onRead(); },
  });
}

export function portrait(E, { x, y, z, ry, size = 1.0 }) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size * 1.35),
    new THREE.MeshStandardMaterial({ map: E.textures.portrait, roughness: 0.85 })
  );
  m.position.set(x, y, z);
  m.rotation.y = ry;
  E.scene.add(m);
  return m;
}

// glowing seal pickup (halo + symbol disc). Returns the group.
export function sealPickup(E, { x, y, z, tex, colorName }) {
  const g = new THREE.Group();
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.07, 18),
    new THREE.MeshStandardMaterial({ color: 0x2a2a30, roughness: 0.4, metalness: 0.85, emissive: 0x111111 })
  );
  disc.rotation.x = 0;
  g.add(disc);
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(0.52, 0.52),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false, fog: false })
  );
  face.rotation.x = -Math.PI / 2;
  face.position.y = 0.05;
  g.add(face);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xaaffcc, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
  halo.scale.set(1.5, 1.5, 1);
  halo.position.y = 0.25;
  g.add(halo);
  g.position.set(x, y, z);
  E.scene.add(g);
  // gentle spin + bob
  const baseY = y, seed = Math.random() * 10;
  E.tick.push((dt, t) => {
    g.rotation.y = (t + seed) * 0.8;
    g.position.y = baseY + Math.sin(t * 1.7 + seed) * 0.06;
  });
  return g;
}

// point light must be reserved for special moments — but small fake flame glows are free:
export function candleGlow(E, { x, y, z, scale = 0.55, color = 0xffa050 }) {
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ color, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false }));
  halo.scale.set(scale, scale, 1);
  halo.position.set(x, y, z);
  E.scene.add(halo);
  const stick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.05, 0.32, 6),
    new THREE.MeshStandardMaterial({ color: 0xd8cfb8, roughness: 0.7 })
  );
  stick.position.set(x, y - 0.22, z);
  E.scene.add(stick);
  // flicker
  const seed = Math.random() * 100;
  E.tick.push((dt, t) => { halo.material.opacity = 0.55 + Math.sin(t * 13 + seed) * 0.14 + Math.sin(t * 31 + seed * 2) * 0.07; });
  return halo;
}

// cobweb — two crossed transparent planes
export function cobweb(E, { x, y, z, ry = 0, size = 0.9 }) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 128, 128);
  ctx.strokeStyle = 'rgba(220,220,225,.6)';
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 7; i++) {
    const a = (Math.PI / 2) * (i / 6);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 124, Math.sin(a) * 124); ctx.stroke();
  }
  for (const r of [24, 46, 68, 92, 116]) { ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI / 2); ctx.stroke(); }
  const tex = new THREE.CanvasTexture(c);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide, opacity: 0.85 }));
  m.position.set(x, y, z); m.rotation.y = ry;
  E.scene.add(m);
  return m;
}

// simple marionette puppet on strings (Morvex territory)
export function marionette(E, { x, z, yTop, mats, facing = 0, scale = 1 }) {
  const g = new THREE.Group();
  const H = 1.15 * scale;
  const woodM = mats.puppetWood, clothM = mats.puppetCloth;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.085 * scale, 8, 8), woodM);
  head.position.y = H - 0.085 * scale; g.add(head);
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.075 * scale, 0.095 * scale, 0.32 * scale, 8), clothM);
  torso.position.y = H - 0.32 * scale; g.add(torso);
  for (const s of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.03 * scale, 0.03 * scale, 0.3 * scale, 6), woodM);
    arm.position.set(s * 0.13 * scale, H - 0.28 * scale, 0);
    arm.rotation.z = s * 0.35;
    g.add(arm);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.032 * scale, 0.032 * scale, 0.34 * scale, 6), clothM);
    leg.position.set(s * 0.07 * scale, H - 0.72 * scale, 0);
    g.add(leg);
  }
  g.position.set(x, yTop - H, z);
  g.rotation.y = facing;
  E.scene.add(g);
  // strings from a ceiling bar
  const barY = yTop + 0.02;
  const ctrl = new THREE.Mesh(new THREE.BoxGeometry(0.5 * scale, 0.045, 0.045), mats.puppetWood);
  ctrl.position.set(x, barY, z); E.scene.add(ctrl);
  const stringMat = new THREE.MeshBasicMaterial({ color: 0xcfd4da, transparent: true, opacity: 0.55 });
  for (const off of [-0.18, 0, 0.18]) {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, H + 0.02, 3), stringMat);
    s.position.set(x + off, yTop - H / 2, z);
    E.scene.add(s);
  }
  // sway
  const seed = Math.random() * 10;
  E.tick.push((dt, t) => {
    g.rotation.z = Math.sin(t * 0.7 + seed) * 0.055;
    g.rotation.x = Math.cos(t * 0.5 + seed) * 0.04;
  });
  return g;
}
