// ============================================================
// PROPS — BASEMENT (y=-3.6): boiler · wine cellar · storage ·
//         crypt · tunnels · THE NULL CHAMBER (PRD §9)
// ============================================================
import * as THREE from 'three';
import { FLOOR } from './engine.js';
import { makeSlider } from './doors.js';
import { audio } from './audio.js';
import { nearXZ, box, cyl, readable, portrait, candleGlow, cobweb } from './props_common.js';

export function buildBasementProps(E, M) {
  const T = E.textures;
  const scene = E.scene;
  const Y = FLOOR.BASEMENT; // -3.6

  const woodDark = new THREE.MeshStandardMaterial({ color: 0x20180f, roughness: 0.85 });
  const woodMid = new THREE.MeshStandardMaterial({ map: T.wood, roughness: 0.85, color: 0x8a7254 });
  const ironDark = new THREE.MeshStandardMaterial({ color: 0x191c22, roughness: 0.45, metalness: 0.8 });
  const coalMat = new THREE.MeshStandardMaterial({ color: 0x0b0b0d, roughness: 0.95, flatShading: true });
  const bottleGreen = new THREE.MeshStandardMaterial({ color: 0x18281e, roughness: 0.15, metalness: 0.1 });
  const bottleBlack = new THREE.MeshStandardMaterial({ color: 0x0e0e12, roughness: 0.2 });

  const at = (y) => Y + y;

  // ============ BOILER ROOM ============
  // the great boiler — horizontal drum on a brick plinth
  box(E, { x: -2.6, y: at(0.22), z: -12.2, w: 4.4, h: 0.44, d: 2.2, mat: M.brick, collider: true });
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(1.02, 1.02, 3.6, 18), new THREE.MeshStandardMaterial({ color: 0x23262c, roughness: 0.35, metalness: 0.8 }));
  drum.rotation.z = Math.PI / 2;
  drum.position.set(-2.6, at(1.5), -12.2);
  drum.castShadow = true;
  scene.add(drum);
  E.colliders.push({ minX: -4.5, maxX: -0.7, minZ: -13.3, maxZ: -11.1, top: at(2.6) });
  // rivets & banding
  for (const bx of [-4.1, -2.6, -1.1]) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(1.04, 0.05, 6, 20), ironDark);
    band.rotation.y = Math.PI / 2;
    band.position.set(bx, at(1.5), -12.2);
    scene.add(band);
  }
  // pressure gauges
  for (const [gx, gy] of [[-1.6, 2.15], [-3.4, 2.3]]) {
    const gauge = new THREE.Mesh(new THREE.CircleGeometry(0.17, 16), new THREE.MeshStandardMaterial({ color: 0xd8d2c0, roughness: 0.3, emissive: 0x28241c, emissiveIntensity: 0.6 }));
    gauge.position.set(gx, at(gy), -11.14);
    scene.add(gauge);
    const needle = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 0.15), new THREE.MeshBasicMaterial({ color: 0x8e2f2f }));
    needle.position.set(gx, at(gy + 0.03), -11.13); needle.rotation.z = -0.7; scene.add(needle);
  }
  readable(E, { x: -2.6, z: -10.9, y: Y, r: 2.2, prompt: () => 'Boiler gauges frozen at 3 · 1 · 4.\nA brass plate beneath reads: "THE MANOR DRINKS AT 3-1-4."\nThe pipes tick, faintly, like a clock learning to walk.', onRead: () => E.hooks && E.hooks.onClue('boilerGauges') });
  // coal pile
  for (let i = 0; i < 12; i++) {
    const lump = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16 + (i % 4) * 0.07, 0), coalMat);
    lump.position.set(3.1 + Math.sin(i * 9.3) * 1.15, at(0.14 + (i % 3) * 0.13), -13.2 + Math.cos(i * 5.7) * 1.0);
    scene.add(lump);
  }
  // valves
  for (const [vx, vz] of [[-5.9, -8.3], [5.9, -7.6]]) {
    const valve = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.05, 6, 14), new THREE.MeshStandardMaterial({ color: 0x5a2a1a, roughness: 0.5, metalness: 0.6 }));
    valve.position.set(vx, at(1.4), vz);
    valve.rotation.x = Math.PI / 2.6;
    scene.add(valve);
  }
  // THE POWER LEVER — restores the manor (lights come on above)
  const leverBox = box(E, { x: 0, y: at(1.15), z: -6.35, w: 0.55, h: 0.72, d: 0.22, mat: ironDark, collider: false });
  const lever = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.55, 8), new THREE.MeshStandardMaterial({ color: 0x8e2f2f, roughness: 0.4 }));
  lever.position.set(0, at(1.32), -6.2);
  lever.rotation.z = 0.7;
  scene.add(lever);
  E.addInteractable({
    object: leverBox, radius: 2.4,
    prompt: () => E.flags.powerRestored
      ? 'The lever is thrown. The manor hums above you.'
      : 'RESTORE POWER TO THE MANOR\n(the boiler answers reluctantly)',
    enabled: () => nearXZ(E, 0, -6.35, 2.4) && Math.abs(E.camera.position.y - Y) < 2.8,
    onInteract: () => {
      if (E.flags.powerRestored) return;
      E.flags.powerRestored = true;
      lever.rotation.z = -0.7;
      audio.boilerPower();
      // wake the house — chandelier, maintenance window, flames
      if (E.powerRefs.chandelierLight) E.powerRefs.chandelierLight.intensity = 26;
      if (E.powerRefs.chandelierFlames) E.powerRefs.chandelierFlames.color.set(0xffc37a);
      if (E.glowPanes) for (const p of E.glowPanes) if (p.kind === 'maintenance') p.mesh.material.color.set(0xffd9a0);
      if (E.hooks) E.hooks.onPower();
    },
  });
  // safe on the west wall
  box(E, { x: -6.6, y: at(1.25), z: -10.5, w: 0.5, h: 0.8, d: 0.6, mat: ironDark, collider: false });
  readable(E, { x: -6.3, z: -10.5, y: Y, r: 1.9, prompt: () => 'The safe door is ajar a finger\'s width. Inside:\nrows of unpaid bills, and a wedding ring, size unknown,\nengraved: "M — until the house lets go."', onRead: () => E.hooks && E.hooks.onClue('safe') });

  // ============ WINE CELLAR ============
  // racks of dusty bottles
  for (const rz of [-12.4, -9.4, -6.4, -3.4]) {
    box(E, { x: -12.4, y: at(0.9), z: rz, w: 5.2, h: 1.8, d: 0.62, mat: woodDark, collider: true });
    for (let i = 0; i < 10; i++) {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.34, 8), i % 3 ? bottleGreen : bottleBlack);
      b.rotation.x = Math.PI / 2;
      b.position.set(-14.6 + (i % 5) * 1.12, at(0.62 + Math.floor(i / 5) * 0.72), rz);
      scene.add(b);
    }
  }
  // locked cage at the far end
  box(E, { x: -19.6, y: at(1.1), z: -13.4, w: 1.5, h: 2.2, d: 1.5, mat: ironDark, collider: true });
  readable(E, { x: -19.0, z: -13.3, y: Y, r: 1.8, prompt: () => 'The cage lock glints brand new against two centuries of rust.\nInside: a single chair, facing the wall.', onRead: () => E.hooks && E.hooks.onClue('cage') });
  // sliding rack — reveals the 1897 vintage niche
  makeSlider(E, {
    x: -9.6, y: Y, z: -1.4, w: 1.7, h: 2.3, t: 0.6,
    mat: woodDark, axis: 'z', slideTo: 1.55,
    name: 'A bottle rack sitting a finger too proud of the rack-line',
    reveals: 'The rack slides aside on oiled runners.\nA single black bottle, labelled 1897, waits.',
  });
  readable(E, { x: -9.7, z: -1.35, y: Y, r: 1.8, prompt: () => 'VELLACOTT 1897 — "The last vintage. Never opened.\nNot for weddings. Not for wakes. Not for HER."', onRead: () => E.hooks && E.hooks.onClue('vintage') });

  // ============ STORAGE ROOM ============
  const crateMat = woodMid;
  const crates = [
    [10.6, 0.42, -13.2, 1.15], [12.0, 0.34, -12.7, 0.9], [11.2, 1.12, -13.1, 0.78],
    [16.4, 0.46, -8.2, 1.3], [17.8, 0.32, -6.9, 0.85], [15.1, 0.3, -4.4, 0.8],
    [9.6, 0.38, 0.4, 1.0], [18.6, 0.4, 0.8, 1.05],
  ];
  for (const [cx, cy, cz, s] of crates) box(E, { x: cx, y: at(cy), z: cz, w: s, h: s, d: s, mat: crateMat, collider: true, castShadow: true, ry: (cx * 7.3) % 0.6 });
  // the original front-gate crest, leaning against the wall
  E.addSymbol({ tex: T.symCrest, x: 20.35, y: at(1.15), z: -11.8, ry: -Math.PI / 2, size: 1.35, opacity: 0.95 });
  readable(E, { x: 19.8, z: -11.8, y: Y, r: 2.1, prompt: () => 'The original House Crest from the front gate.\nThe recess in its centre is FRESH — the iron is shiny there.\nSomeone has recently fitted three round objects into it.', onRead: () => E.hooks && E.hooks.onClue('gateCrest') });
  // old estate map on the wall
  const mapTex = makeTunnelMap();
  const map = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.1), new THREE.MeshStandardMaterial({ map: mapTex, roughness: 0.92 }));
  map.position.set(13.6, at(1.75), -14.72);
  scene.add(map);
  readable(E, { x: 13.6, z: -14.3, y: Y, r: 1.9, prompt: () => 'Estate plan, 1711. Tunnels branch beneath the manor in five arms.\nFour are inked in. One — the centre, directly beneath the tower — is inked in BLACK,\nand scratched out, and inked in again.', onRead: () => E.hooks && E.hooks.onClue('tunnelMap') });

  // ============ CRYPT ============
  // three guardian sarcophagi
  const sarcophagi = [
    { x: -16.4, z: 9.6, tex: T.symSpiral, ry: 0.16 },
    { x: -12.3, z: 10.4, tex: T.symKnot, ry: -0.1 },
    { x: -8.6, z: 9.2, tex: T.symCrown, ry: 0.07 },
  ];
  for (const s of sarcophagi) {
    box(E, { x: s.x, y: at(0.42), z: s.z, w: 1.5, h: 0.72, d: 3.1, mat: M.marble, collider: true, ry: s.ry, castShadow: true });
    const lid = box(E, { x: s.x, y: at(0.86), z: s.z, w: 1.34, h: 0.3, d: 2.95, mat: M.marble, collider: false, ry: s.ry });
    lid.rotation.z = s.ry * 0.7;
    E.addSymbol({ tex: s.tex, x: s.x, y: at(1.03), z: s.z, ry: s.ry, size: 0.62, opacity: 0.75 }).rotation.x = -Math.PI / 2;
  }
  // central floor — three emblems set into the stone
  const floorRing = new THREE.Mesh(new THREE.CircleGeometry(1.6, 26), new THREE.MeshStandardMaterial({ color: 0x2a2c30, roughness: 0.6 }));
  floorRing.rotation.x = -Math.PI / 2; floorRing.position.set(-12.3, at(0.03), 5.0); scene.add(floorRing);
  E.addSymbol({ tex: T.symSpiral, x: -12.9, y: at(0.05), z: 5.0, ry: 0, size: 0.52, opacity: 0.85 }).rotation.x = -Math.PI / 2;
  E.addSymbol({ tex: T.symKnot, x: -11.7, y: at(0.05), z: 5.0, ry: 0, size: 0.52, opacity: 0.85 }).rotation.x = -Math.PI / 2;
  E.addSymbol({ tex: T.symCrown, x: -12.3, y: at(0.05), z: 6.1, ry: 0, size: 0.52, opacity: 0.85 }).rotation.x = -Math.PI / 2;
  // the guardian record niche
  readable(E, { x: -12.3, z: 4.6, y: Y, r: 2.2, prompt: () => 'A stone tablet, milled by generations of hands:\n\n"WE WERE PROTECTORS BEFORE WE WERE KEEPERS.\nWHAT SLEEP BELOW, WE DID NOT BIND — WE ASKED IT TO WAIT.\nIT IS STILL WAITING. BE PATIENT WITH IT."', onRead: () => E.hooks && E.hooks.onClue('guardianRecord') });
  // candle sconces
  candleGlow(E, { x: -19.8, y: at(1.75), z: 4.2, scale: 0.5, color: 0xffb46a });
  candleGlow(E, { x: -8.0, y: at(1.75), z: 13.2, scale: 0.5, color: 0xffb46a });
  // triple symbol on the east wall — carved by the keepers
  E.addSymbol({ tex: T.symCrest, x: -7.3, y: at(1.9), z: 9.6, ry: Math.PI / 2, size: 0.9, opacity: 0.6 });

  // ============ TUNNEL ROOM (collapsed) ============
  // rubble fall — the old way out is sealed
  for (let i = 0; i < 14; i++) {
    const chunk = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22 + (i % 5) * 0.13, 0), i % 2 ? M.stone : M.darkStone);
    chunk.position.set(13.4 + Math.sin(i * 8.1) * 2.6, at(0.25 + (i % 4) * 0.32), 13.3 + Math.cos(i * 6.3) * 1.15);
    chunk.rotation.set(i * 1.3, i * 2.1, i * 0.7);
    chunk.castShadow = true;
    scene.add(chunk);
  }
  E.colliders.push({ minX: 9.5, maxX: 17.5, minZ: 11.8, maxZ: 14.8, top: at(1.8) });
  // directional plaques
  E.addSymbol({ tex: T.symCrest, x: 13.4, y: at(1.9), z: 2.35, ry: Math.PI, size: 0.5, opacity: 0.7 });
  readable(E, { x: 13.4, z: 2.7, y: Y, r: 2.1, prompt: () => 'A brass plaque, green with age:\n"WEST — CRYPT · EAST — WORKS · BELOW — THE SILENCE.\nNO MAN SHALL PASS BELOW. NO MAN SHALL BE SENT BELOW."', onRead: () => E.hooks && E.hooks.onClue('plaque') });
  cobweb(E, { x: 8.2, y: at(3.1), z: 12.6, ry: 0.4, size: 1.5 });
  // dripping stain
  const stain = new THREE.Mesh(new THREE.CircleGeometry(0.75, 12), new THREE.MeshBasicMaterial({ color: 0x060808, transparent: true, opacity: 0.7, depthWrite: false }));
  stain.rotation.x = -Math.PI / 2; stain.position.set(16.2, at(0.03), 9.4); scene.add(stain);

  // ============ THE NULL CHAMBER ============
  buildNullChamber(E, M);
}

// ------------------------------------------------------------
function buildNullChamber(E, M) {
  const T = E.textures;
  const scene = E.scene;
  const Y = FLOOR.BASEMENT;
  const CX = 0, CZ = 10.4;

  // circular floor pattern — the Unknown Mark, vast
  const floorMark = new THREE.Mesh(new THREE.CircleGeometry(3.1, 30), new THREE.MeshBasicMaterial({ map: T.symUnknown, transparent: true, opacity: 0.5, depthWrite: false, fog: false }));
  floorMark.rotation.x = -Math.PI / 2; floorMark.position.set(CX, Y + 0.045, CZ); scene.add(floorMark);
  const ring = new THREE.Mesh(new THREE.RingGeometry(3.6, 3.72, 30), new THREE.MeshStandardMaterial({ color: 0x1a2a2e, roughness: 0.6, emissive: 0x0a1a1e, emissiveIntensity: 1 }));
  ring.rotation.x = -Math.PI / 2; ring.position.set(CX, Y + 0.04, CZ); scene.add(ring);

  // four pedestals — three hollow sockets, one older
  const pedMat = new THREE.MeshStandardMaterial({ color: 0x1e2226, roughness: 0.35, metalness: 0.35 });
  const sockets = [
    { key: 'spiral', x: -2.3, z: 12.6, tex: T.symSpiral, col: 0x59ff9c },
    { key: 'knot', x: 0, z: 13.5, tex: T.symKnot, col: 0xffb45e },
    { key: 'crown', x: 2.3, z: 12.6, tex: T.symCrown, col: 0xc9a2ff },
  ];
  for (const s of sockets) {
    cyl(E, { x: s.x, y: Y + 0.55, z: s.z, rTop: 0.32, rBottom: 0.44, h: 1.1, mat: pedMat, seg: 14, collider: true, top: Y + 1.1 });
    E.addSymbol({ tex: s.tex, x: s.x, y: Y + 1.12, z: s.z, ry: 0, size: 0.42, opacity: E.flags['seal_' + s.key] ? 0.95 : 0.22 }).rotation.x = -Math.PI / 2;
  }
  // the fourth pedestal — the Unknown Mark, older than the manor
  cyl(E, { x: CX, y: Y + 0.72, z: 7.4, rTop: 0.36, rBottom: 0.5, h: 1.44, mat: new THREE.MeshStandardMaterial({ color: 0x10161a, roughness: 0.25, metalness: 0.6, emissive: 0x081418, emissiveIntensity: 1 }), seg: 16, collider: true, top: Y + 1.44 });
  E.addSymbol({ tex: T.symUnknown, x: CX, y: Y + 1.46, z: 7.4, ry: 0, size: 0.55, opacity: 0.9 }).rotation.x = -Math.PI / 2;
  // faint cyan halo over the fourth pedestal (the only "light" down here)
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0x66ffe0, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false }));
  halo.scale.set(3.1, 3.1, 1); halo.position.set(CX, Y + 1.7, 7.4); scene.add(halo);
  E.tick.push((dt, t) => { halo.material.opacity = 0.16 + Math.sin(t * 0.6) * 0.07; });

  // the mural — three guardians facing the faceless one
  const mural = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 2.6), new THREE.MeshStandardMaterial({ map: makeMural(), roughness: 0.95 }));
  mural.position.set(0, Y + 1.9, 14.6); mural.rotation.y = Math.PI; scene.add(mural);

  // the fourth pedestal — ENDING trigger
  E.addInteractable({
    object: null, radius: 2.3,
    prompt: () => {
      if (!E.flags.pendant) return 'The fourth pedestal.\nA circular recess — exactly pendant-shaped.';
      return 'PLACE THE GUARDIAN PENDANT';
    },
    enabled: () => nearXZ(E, CX, 7.4, 2.3) && Math.abs(E.camera.position.y - Y) < 3,
    onInteract: () => {
      if (!E.flags.pendant) { audio.rumble(); if (E.hooks) E.hooks.onClue('noPendant'); return; }
      if (E.flags.ending) return;
      E.flags.ending = true;
      audio.bellToll(49, 1.0);
      setTimeout(() => audio.sealChime(), 1200);
      if (E.hooks) E.hooks.onEnding();
    },
  });
  // silence — the null chamber eats sound (marked; the mixer respects it)
  E.flags.inNullChamberZone = { minX: -7, maxX: 7, minZ: 6, maxZ: 15 };
}

// ---------- storage-room tunnel map ----------
function makeTunnelMap() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 352;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#cfc2a0'; ctx.fillRect(0, 0, 512, 352);
  ctx.strokeStyle = '#4a3f28'; ctx.lineWidth = 3; ctx.strokeRect(5, 5, 502, 342);
  ctx.fillStyle = '#3a3122'; ctx.font = 'bold 19px Georgia';
  ctx.fillText('THE UNDERWORKS · 1711', 24, 36);
  ctx.lineWidth = 5;
  const arms = [[256, 176, 90, 300], [256, 176, 420, 292], [256, 176, 76, 120], [256, 176, 436, 116], [256, 176, 256, 60]];
  for (let i = 0; i < arms.length; i++) {
    const [x1, y1, x2, y2] = arms[i];
    ctx.strokeStyle = i === 4 ? '#0a0a0a' : '#4a3f28';
    ctx.lineWidth = i === 4 ? 14 : 5;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }
  // scratch marks over the black arm
  ctx.strokeStyle = '#cfc2a0'; ctx.lineWidth = 2;
  for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(238 + i * 8, 128); ctx.lineTo(252 + i * 8, 92); ctx.stroke(); }
  ctx.fillStyle = '#3a3122'; ctx.font = '12px Georgia';
  ctx.fillText('(the centre arm is not recorded in any survey)', 60, 330);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------- the mural: three guardians, one faceless shape ----------
function makeMural() {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 416;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 416);
  g.addColorStop(0, '#141a24'); g.addColorStop(1, '#05070c');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1024, 416);
  // weathered arch
  ctx.strokeStyle = '#2c3444'; ctx.lineWidth = 10;
  ctx.beginPath(); ctx.arc(512, 420, 330, Math.PI, 0); ctx.stroke();
  const figure = (x, hood, scale = 1) => {
    ctx.save(); ctx.translate(x, 330); ctx.scale(scale, scale);
    ctx.fillStyle = hood;
    ctx.beginPath();
    ctx.moveTo(0, -260); ctx.quadraticCurveTo(-72, -200, -80, -60); ctx.lineTo(-92, 0); ctx.lineTo(92, 0); ctx.lineTo(80, -60); ctx.quadraticCurveTo(72, -200, 0, -260);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  };
  figure(180, '#232c3c', 0.94);
  figure(360, '#1d2531', 1.02);
  figure(540, '#232c3c', 0.9);
  // the faceless shape — larger, wrong, patient
  figure(800, '#05060a', 1.34);
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(800, 92, 34, 52, 0, 0, 7); ctx.fill();
  // halo of absence around it
  const haloG = ctx.createRadialGradient(800, 140, 10, 800, 140, 150);
  haloG.addColorStop(0, 'rgba(102,255,224,.12)'); haloG.addColorStop(1, 'rgba(102,255,224,0)');
  ctx.fillStyle = haloG; ctx.fillRect(620, 0, 360, 330);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
