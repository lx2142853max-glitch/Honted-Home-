// ============================================================
// MANSION — structure reverse-engineered from the reference photo:
// 42 m × 30 m main block · 3 storeys · central tower (~22 m)
// west gable · east turret · front porch + balcony · mansard roof
// ============================================================
import * as THREE from 'three';
import { FLOOR } from './engine.js';
import { makeDoor } from './doors.js';
import { audio } from './audio.js';

const X0 = -21, X1 = 21, Z0 = -15, Z1 = 15;

export function buildMansion(E) {
  const T = E.textures;
  const scene = E.scene;

  // ---------- materials ----------
  const M = {};
  M.stone = new THREE.MeshStandardMaterial({ map: T.stone, roughness: 0.96 });
  M.brick = new THREE.MeshStandardMaterial({ map: T.brick, roughness: 0.92 });
  M.roof = new THREE.MeshStandardMaterial({ map: T.roof, roughness: 0.88 });
  M.wood = new THREE.MeshStandardMaterial({ map: T.wood, roughness: 0.85 });
  M.plaster = new THREE.MeshStandardMaterial({ color: 0x6f6c62, roughness: 0.94 });
  M.wallpaper = new THREE.MeshStandardMaterial({ map: T.wallpaper, roughness: 0.92 });
  M.ceiling = new THREE.MeshStandardMaterial({ color: 0x35322c, roughness: 0.96 });
  M.marble = new THREE.MeshStandardMaterial({ map: T.marble, roughness: 0.55 });
  M.iron = new THREE.MeshStandardMaterial({ color: 0x1c1f26, roughness: 0.5, metalness: 0.78 });
  M.darkStone = new THREE.MeshStandardMaterial({ color: 0x3a3e3b, roughness: 1, flatShading: true });
  M.glass = new THREE.MeshStandardMaterial({ color: 0x9fd0d8, transparent: true, opacity: 0.25, roughness: 0.1, metalness: 0.25, side: THREE.DoubleSide, depthWrite: false });
  M.doorWood = new THREE.MeshStandardMaterial({ map: T.wood, roughness: 0.7, color: 0x9a7a52 });
  M.doorIron = new THREE.MeshStandardMaterial({ color: 0x23262d, roughness: 0.42, metalness: 0.82 });

  E.glowPanes = [];   // {mesh, kind} — power/seal driven
  E.sealRecess = {};  // filled in props (hall emblem)
  E.powerRefs = {};   // filled in props (chandelier, flames)

  // ================= EXTERIOR SHELL =================
  const EXT_T = 0.5;
  // ---- FRONT wall (z = +15) ----
  const front = { x1: X0, z1: Z1, x2: X1, z2: Z1 };
  E.addWall({ ...front, y: FLOOR.G, h: 4.2, t: EXT_T, mat: M.stone, castShadow: true, openings: [
    { offset: 2.93, w: 1.14, h: 1.5, sill: 1.0 }, { offset: 7.93, w: 1.14, h: 1.5, sill: 1.0 },
    { offset: 15.85, w: 1.3, h: 1.8, sill: 1.1 },
    { offset: 19.7, w: 2.6, h: 3.15, sill: 0 },
    { offset: 24.85, w: 1.3, h: 1.8, sill: 1.1 },
    { offset: 32.93, w: 1.14, h: 1.5, sill: 1.0 }, { offset: 37.93, w: 1.14, h: 1.5, sill: 1.0 },
  ]});
  E.addWall({ ...front, y: FLOOR.F1, h: 4.2, t: EXT_T, mat: M.wallpaper, castShadow: true, openings: [
    { offset: 2.9, w: 1.2, h: 1.6, sill: 0.95 }, { offset: 7.9, w: 1.2, h: 1.6, sill: 0.95 },
    { offset: 15.85, w: 1.3, h: 1.9, sill: 0.8 },
    { offset: 19.6, w: 1.2, h: 2.3, sill: 0.05 },
    { offset: 24.85, w: 1.3, h: 1.9, sill: 0.8 },
    { offset: 32.9, w: 1.2, h: 1.6, sill: 0.95 }, { offset: 37.9, w: 1.2, h: 1.6, sill: 0.95 },
  ]});
  E.addWall({ ...front, y: FLOOR.F2, h: 4.2, t: EXT_T, mat: M.plaster, openings: [
    { offset: 3.2, w: 1.0, h: 1.05, sill: 1.15 }, { offset: 8.2, w: 1.0, h: 1.05, sill: 1.15 },
    { offset: 16.0, w: 1.0, h: 1.05, sill: 1.15 }, { offset: 25.0, w: 1.0, h: 1.05, sill: 1.15 },
    { offset: 32.9, w: 1.0, h: 1.05, sill: 1.15 }, { offset: 37.8, w: 1.0, h: 1.05, sill: 1.15 },
  ]});

  // ---- BACK wall (z = -15) ----
  const back = { x1: X0, z1: Z0, x2: X1, z2: Z0 };
  E.addWall({ ...back, y: FLOOR.G, h: 4.2, t: EXT_T, mat: M.stone, castShadow: true, openings: [
    { offset: 4.43, w: 1.0, h: 1.3, sill: 1.1 },
    { offset: 7.42, w: 1.15, h: 2.35, sill: 0 },
    { offset: 9.95, w: 0.8, h: 1.0, sill: 1.35 },
    { offset: 15.93, w: 1.14, h: 1.5, sill: 1.0 },
    { offset: 24.93, w: 1.14, h: 1.5, sill: 1.0 },
    { offset: 29.0, w: 0.8, h: 1.0, sill: 1.35 },
    { offset: 33.42, w: 1.15, h: 2.35, sill: 0 },
    { offset: 37.5, w: 1.0, h: 1.3, sill: 1.1 },
  ]});
  E.addWall({ ...back, y: FLOOR.F1, h: 4.2, t: EXT_T, mat: M.wallpaper, castShadow: true, openings: [
    { offset: 3.4, w: 1.2, h: 1.6, sill: 0.95 }, { offset: 10.4, w: 1.2, h: 1.6, sill: 0.95 },
    { offset: 28.45, w: 0.9, h: 1.3, sill: 1.35 }, { offset: 31.45, w: 0.9, h: 1.3, sill: 1.35 },
    { offset: 37.4, w: 0.9, h: 1.3, sill: 1.2 },
  ]});
  E.addWall({ ...back, y: FLOOR.F2, h: 4.2, t: EXT_T, mat: M.plaster, openings: [
    { offset: 3.5, w: 1.0, h: 1.0, sill: 1.2 }, { offset: 11.5, w: 1.0, h: 1.0, sill: 1.2 },
    { offset: 19.75, w: 0.55, h: 1.4, sill: 1.35 },
    { offset: 29.0, w: 0.9, h: 1.4, sill: 1.25 }, { offset: 36.0, w: 0.9, h: 1.4, sill: 1.25 },
  ]});

  // ---- WEST wall (x = -21) ----
  const west = { x1: X0, z1: Z0, x2: X0, z2: Z1 };
  E.addWall({ ...west, y: FLOOR.G, h: 4.2, t: EXT_T, mat: M.stone, castShadow: true, openings: [
    { offset: 2.93, w: 1.0, h: 1.3, sill: 1.1 },
    { offset: 13.43, w: 1.14, h: 1.5, sill: 1.0 },
    { offset: 19.95, w: 1.1, h: 2.3, sill: 0 },
    { offset: 23.93, w: 1.14, h: 1.5, sill: 1.0 },
  ]});
  E.addWall({ ...west, y: FLOOR.F1, h: 4.2, t: EXT_T, mat: M.wallpaper, castShadow: true, openings: [
    { offset: 2.4, w: 0.9, h: 1.3, sill: 1.2 },
    { offset: 10.4, w: 1.2, h: 1.6, sill: 0.95 }, { offset: 15.4, w: 1.2, h: 1.6, sill: 0.95 },
    { offset: 21.4, w: 1.2, h: 1.6, sill: 0.95 }, { offset: 25.4, w: 1.2, h: 1.6, sill: 0.95 },
  ]});
  E.addWall({ ...west, y: FLOOR.F2, h: 4.2, t: EXT_T, mat: M.plaster, openings: [
    { offset: 5.0, w: 0.7, h: 1.5, sill: 1.3 }, { offset: 12.0, w: 0.7, h: 1.5, sill: 1.3 },
    { offset: 22.5, w: 1.0, h: 1.0, sill: 1.2 },
  ]});

  // ---- EAST wall (x = +21) ----
  const east = { x1: X1, z1: Z0, x2: X1, z2: Z1 };
  E.addWall({ ...east, y: FLOOR.G, h: 4.2, t: EXT_T, mat: M.stone, castShadow: true, openings: [
    { offset: 2.43, w: 0.8, h: 1.0, sill: 1.35 },
    { offset: 14.43, w: 1.14, h: 1.5, sill: 1.0 },
    { offset: 20.93, w: 1.14, h: 1.5, sill: 1.0 }, { offset: 24.43, w: 1.14, h: 1.5, sill: 1.0 },
  ]});
  E.addWall({ ...east, y: FLOOR.F1, h: 4.2, t: EXT_T, mat: M.wallpaper, castShadow: true, openings: [
    { offset: 2.9, w: 0.9, h: 1.3, sill: 1.2 },
    { offset: 15.4, w: 1.2, h: 1.6, sill: 0.95 },
    { offset: 22.9, w: 1.2, h: 1.6, sill: 0.95 }, { offset: 26.4, w: 1.2, h: 1.6, sill: 0.95 },
  ]});
  E.addWall({ ...east, y: FLOOR.F2, h: 4.2, t: EXT_T, mat: M.plaster, openings: [
    { offset: 8.5, w: 0.9, h: 1.5, sill: 1.2 },
    { offset: 23.5, w: 1.0, h: 1.0, sill: 1.2 },
  ]});

  // brick quoins on the four corners
  for (const [qx, qz] of [[X0, Z1], [X1, Z1], [X0, Z0], [X1, Z0]]) {
    for (let y = 0; y < 12.6; y += 1.2) {
      E.solidBox({ x: qx, y: y + 0.6, z: qz, w: 0.78, h: 1.14, d: 0.78, mat: M.brick, collider: false, castShadow: true });
    }
  }
  // half-timber strips on the front face
  for (const hx of [-18.2, -10.2, -6.8, 6.8, 10.2, 18.2]) {
    E.solidBox({ x: hx, y: 6.3, z: Z1 + 0.03, w: 0.28, h: 4.3, d: 0.1, mat: M.iron, collider: false });
    E.solidBox({ x: hx, y: 8.45, z: Z1 + 0.03, w: 0.28, h: 4.3, d: 0.1, mat: M.iron, collider: false });
  }
  E.solidBox({ x: 0, y: 8.42, z: Z1 + 0.03, w: 42, h: 0.22, d: 0.12, mat: M.iron, collider: false });
  E.solidBox({ x: 0, y: 4.22, z: Z1 + 0.03, w: 42, h: 0.22, d: 0.12, mat: M.iron, collider: false });

  // ================= FLOOR SLABS =================
  // Basement ceiling (= ground floor deck). Opening: kitchen service stair.
  E.addSlab({ x1: X0, z1: Z0, x2: X1, z2: Z1, y: FLOOR.G, t: 0.36, mat: M.ceiling,
    openings: [{ x1: 18.1, z1: -6.1, x2: 20.7, z2: 3.6 }] });
  // F1 deck (grand stair opening, west side of the hall)
  E.addSlab({ x1: X0, z1: Z0, x2: X1, z2: Z1, y: FLOOR.F1, t: 0.36, mat: M.ceiling,
    openings: [{ x1: -6.25, z1: 1.95, x2: -3.75, z2: 13.45 }] });
  // F2 (attic) deck (upper stair opening, east side of landing)
  E.addSlab({ x1: X0, z1: Z0, x2: X1, z2: Z1, y: FLOOR.F2, t: 0.36, mat: M.ceiling,
    openings: [{ x1: 3.75, z1: 1.95, x2: 6.25, z2: 13.45 }] });
  // attic ceiling / roof base — opening left for the tower stair flight 1 (8.4 → 12.6)
  E.addSlab({ x1: X0, z1: Z0, x2: X1, z2: Z1, y: 12.6, t: 0.36, mat: M.ceiling,
    openings: [{ x1: -2.65, z1: -14.65, x2: -1.15, z2: -9.15 }] });
  // basement floor
  E.addSlab({ x1: X0, z1: Z0, x2: X1, z2: Z1, y: FLOOR.BASEMENT, t: 0.36, mat: M.marble });

  // ================= ROOF & SILHOUETTE =================
  // west gable (front-facing triangular gable, like the photo's left wing)
  E.addGableRoof({ cx: -13.4, z1: Z0 - 0.35, z2: Z1 + 0.35, baseY: 12.6, apexY: 17.3, halfWidth: 7.6, mat: M.roof });
  // east gable
  E.addGableRoof({ cx: 13.4, z1: Z0 - 0.35, z2: Z1 + 0.35, baseY: 12.6, apexY: 16.5, halfWidth: 7.6, mat: M.roof });
  // central hall gable (front-facing)
  E.addGableRoof({ cx: 0, z1: -2.5, z2: Z1 + 0.4, baseY: 12.6, apexY: 15.6, halfWidth: 6.5, mat: M.roof });
  // mansard parapet behind the centre
  E.solidBox({ x: 0, y: 13.05, z: -11.5, w: 14.2, h: 0.9, d: 7.2, mat: M.roof, collider: false, castShadow: true });

  // front-east turret (photo's conical turret)
  const turret = new THREE.Group();
  const tBody = new THREE.Mesh(new THREE.CylinderGeometry(2.35, 2.5, 15.6, 14), M.stone);
  tBody.position.y = 7.8; tBody.castShadow = true; turret.add(tBody);
  const tCap = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.5, 14), M.brick);
  tCap.position.y = 15.8; turret.add(tCap);
  turret.position.set(22.6, 0, 16.4);
  scene.add(turret);
  E.colliders.push({ minX: 20.1, maxX: 25.1, minZ: 13.9, maxZ: 18.9, top: 15.6 });
  E.addSpire({ x: 22.6, y: 16.05, z: 16.4, radius: 2.5, height: 3.6, mat: M.roof, segments: 14, rotY: 0 });
  E.addSpire({ x: 22.6, y: 19.6, z: 16.4, radius: 0.16, height: 1.6, mat: M.iron, segments: 6, rotY: 0 });
  // turret windows (warm caretaker glow — the misleading safe window)
  E.addGlowPane({ tex: T.paneOrange, x: 22.6, y: 6.3, z: 19.12, ry: 0, w: 0.9, h: 1.3 });
  E.addGlowPane({ tex: T.paneOrange, x: 22.6, y: 10.4, z: 19.12, ry: 0, w: 0.9, h: 1.3 });
  const turretLight = E.addPointLight({ x: 22.6, y: 6.5, z: 18.0, color: 0xff9a3c, intensity: 7, distance: 7, decay: 2 });
  E.powerRefs.turretLight = turretLight;

  // porch (photo's pedimented entrance with lanterns)
  E.addGableRoof({ cx: 0, z1: 14.3, z2: 19.75, baseY: 3.85, apexY: 6.15, halfWidth: 5.15, mat: M.roof });
  E.solidBox({ x: 0, y: 3.62, z: 17.15, w: 9.8, h: 0.42, d: 4.9, mat: M.stone, collider: false, castShadow: true });
  for (const px of [-4.15, 4.15]) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 3.5, 12), M.plaster);
    col.position.set(px, 1.75, 18.45); col.castShadow = true; scene.add(col);
    E.colliders.push({ minX: px - 0.4, maxX: px + 0.4, minZ: 18.05, maxZ: 18.85, top: 3.5 });
    E.solidBox({ x: px, y: 3.6, z: 18.45, w: 0.95, h: 0.22, d: 0.95, mat: M.stone, collider: false });
    E.solidBox({ x: px, y: 0.14, z: 18.45, w: 0.95, h: 0.28, d: 0.95, mat: M.stone, collider: true });
  }
  // porch lanterns (the "working" lamp — warm welcome that lies)
  for (const lx of [-2.35, 2.35]) {
    E.solidBox({ x: lx, y: 2.92, z: 15.35, w: 0.34, h: 0.5, d: 0.2, mat: M.iron, collider: false });
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffbe6e, fog: false }));
    lamp.position.set(lx, 2.9, 15.42); scene.add(lamp);
    const pl = E.addPointLight({ x: lx, y: 2.9, z: 15.9, color: 0xffa050, intensity: 11, distance: 10, decay: 2 });
    E.tick.push((dt, t) => { pl.intensity = 10 + Math.sin(t * 11 + lx) * 1.8 + Math.sin(t * 27 + lx * 2) * 0.8; });
  }
  // entrance threshold
  E.solidBox({ x: 0, y: 0.07, z: 15.1, w: 3.6, h: 0.14, d: 0.9, mat: M.stone, collider: false });
  // house name board above the door
  const boardTex = makeNameBoard();
  const board = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.42), new THREE.MeshStandardMaterial({ map: boardTex, roughness: 0.8, transparent: true }));
  board.position.set(0, 3.62, 15.28); scene.add(board);
  // crest banners flanking the door
  E.addSymbol({ tex: T.symCrest, x: -1.95, y: 2.45, z: 15.29, ry: 0, size: 0.85 });
  E.addSymbol({ tex: T.symCrest, x: 1.95, y: 2.45, z: 15.29, ry: 0, size: 0.85 });

  // front balcony above the porch (door locked from inside)
  E.solidBox({ x: 0, y: 4.08, z: 15.62, w: 3.7, h: 0.24, d: 1.35, mat: M.stone, collider: true });
  E.solidBox({ x: 0, y: 4.6, z: 16.28, w: 3.7, h: 0.1, d: 0.1, mat: M.iron, collider: true });
  for (const bx of [-1.75, -0.9, 0, 0.9, 1.75]) {
    E.solidBox({ x: bx, y: 4.35, z: 16.28, w: 0.09, h: 0.55, d: 0.09, mat: M.iron, collider: false });
  }

  // chimneys
  const chimneys = [[-13.4, 15.2, -4.5, 2.9], [-9.2, 13.6, 7.5, 2.1], [9.2, 16.0, -9.8, 3.4], [17.6, 14.0, 2.5, 1.9]];
  for (const [cx, cy, cz, ch] of chimneys) {
    E.solidBox({ x: cx, y: cy - ch / 2 + 0.6, z: cz, w: 1.15, h: ch, d: 1.15, mat: M.brick, collider: false, castShadow: true });
    E.solidBox({ x: cx, y: cy + 0.72, z: cz, w: 1.5, h: 0.24, d: 1.5, mat: M.stone, collider: false });
  }

  // gargoyles perched on the gable apexes (abstract ravens)
  for (const [gx, gy, gz] of [[-13.4, 17.35, Z1 + 0.1], [13.4, 16.55, Z1 + 0.1], [0, 15.65, Z1 + 0.3]]) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.85, 6), M.darkStone); body.position.y = 0.35; g.add(body);
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.4, 5), M.darkStone); head.position.set(0, 0.82, 0.14); head.rotation.x = 0.7; g.add(head);
    for (const s of [-1, 1]) {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.3), M.darkStone);
      wing.position.set(s * 0.32, 0.5, 0); wing.rotation.z = s * 0.55; g.add(wing);
    }
    g.position.set(gx, gy, gz);
    scene.add(g);
  }

  // ================= CENTRAL TOWER =================
  buildTower(E, M);

  // ================= GROUND FLOOR PARTITIONS =================
  const INT = 0.35;
  const P = M.plaster, W = M.wallpaper;
  // x = -6 spine (west rooms | centre)
  E.addWall({ x1: -6, z1: Z0, x2: -6, z2: Z1, y: FLOOR.G, h: 4.2, t: INT, mat: P, openings: [
    { offset: 4.0, w: 1.15, h: 2.35, sill: 0 },    // west corridor ↔ conservatory (z=-11)
    { offset: 11.0, w: 1.15, h: 2.35, sill: 0 },   // library ↔ hall (z=-4)
    { offset: 28.9, w: 1.15, h: 2.35, sill: 0 },   // study ↔ hall (z=13.9, front corner)
  ]});
  // x = +6 spine (east rooms | centre)
  E.addWall({ x1: 6, z1: Z0, x2: 6, z2: Z1, y: FLOOR.G, h: 4.2, t: INT, mat: P, openings: [
    { offset: 4.0, w: 1.15, h: 2.35, sill: 0 },    // east corridor ↔ conservatory
    { offset: 11.0, w: 1.15, h: 2.35, sill: 0 },   // kitchen ↔ hall
    { offset: 28.9, w: 1.15, h: 2.35, sill: 0 },   // dining ↔ hall (z=13.9, front corner)
  ]});
  // z = 4 divider (front rooms | mid rooms) — two segments
  E.addWall({ x1: X0, z1: 4, x2: -6, z2: 4, y: FLOOR.G, h: 4.2, t: INT, mat: P, openings: [
    { offset: 7.4, w: 1.15, h: 2.35, sill: 0 },    // study ↔ library (x=-13)
  ]});
  E.addWall({ x1: 6, z1: 4, x2: X1, z2: 4, y: FLOOR.G, h: 4.2, t: INT, mat: P, openings: [
    { offset: 6.4, w: 1.15, h: 2.35, sill: 0 },    // dining ↔ kitchen (x=13)
  ]});
  // z = -2 divider (hall | conservatory) — centre segment only
  E.addWall({ x1: -6, z1: -2, x2: 6, z2: -2, y: FLOOR.G, h: 4.2, t: INT, mat: P, openings: [
    { offset: 5.42, w: 1.15, h: 2.35, sill: 0 },   // hall ↔ conservatory (x=0)
  ]});
  // z = -7 divider (mid | rear corridors) — two segments
  E.addWall({ x1: X0, z1: -7, x2: -6, z2: -7, y: FLOOR.G, h: 4.2, t: INT, mat: P, openings: [
    { offset: 7.4, w: 1.15, h: 2.35, sill: 0 },    // library ↔ west corridor
  ]});
  E.addWall({ x1: 6, z1: -7, x2: X1, z2: -7, y: FLOOR.G, h: 4.2, t: INT, mat: P, openings: [
    { offset: 6.4, w: 1.15, h: 2.35, sill: 0 },    // kitchen ↔ east corridor
  ]});
  // tower base side rooms (sealed spiral room · maintenance room)
  E.addWall({ x1: -6, z1: -15, x2: -6, z2: -7.5, y: FLOOR.G, h: 4.2, t: INT, mat: M.stone, openings: [
    { offset: 2.45, w: 1.1, h: 2.3, sill: 0 },     // west corridor → spiral room (z=-12)
  ]});
  E.addWall({ x1: 6, z1: -15, x2: 6, z2: -7.5, y: FLOOR.G, h: 4.2, t: INT, mat: M.stone, openings: [
    { offset: 2.45, w: 1.1, h: 2.3, sill: 0 },     // east corridor → maintenance (z=-12)
  ]});
  // tower masonry faces protruding inside corridors/conservatory zone (x -3..3, z -15..-8)
  E.solidBox({ x: 0, y: 2.1, z: -11.5, w: 6, h: 4.2, d: 7, mat: M.stone, collider: true, castShadow: true });

  // ================= GROUND FLOOR DOORS =================
  // entrance — grand double doors
  makeDoor(E, { x: 0, z: Z1, y: FLOOR.G, ry: 0, w: 2.6, h: 3.15, kind: 'wood', name: 'the Great Doors', mat: M.doorWood, double: true, swing: 1 });
  // conservatory rear exit — west & east corridor rear doors to rear garden
  makeDoor(E, { x: -13, z: Z0, y: FLOOR.G, ry: 0, w: 1.15, h: 2.35, kind: 'wood', name: 'the Rear Door', mat: M.doorWood, swing: 1 });
  makeDoor(E, { x: 13, z: Z0, y: FLOOR.G, ry: 0, w: 1.15, h: 2.35, kind: 'wood', name: 'the Rear Door', mat: M.doorWood, swing: -1 });
  // side courtyard service door (locked, swelled)
  makeDoor(E, { x: X0, z: 5.5, y: FLOOR.G, ry: Math.PI / 2, w: 1.1, h: 2.3, kind: 'locked', name: 'the Service Door', lockMsg: 'Swelled shut on a hundred wet winters.\nThe hinges will never budge.', mat: M.doorIron, swing: 1 });
  // interior room doors
  makeDoor(E, { x: -6, z: 13.9, y: FLOOR.G, ry: Math.PI / 2, w: 1.15, h: 2.35, kind: 'wood', name: 'the Study Door', mat: M.doorWood, swing: -1 });
  makeDoor(E, { x: -6, z: -4, y: FLOOR.G, ry: Math.PI / 2, w: 1.15, h: 2.35, kind: 'wood', name: 'the Library Door', mat: M.doorWood, swing: 1 });
  makeDoor(E, { x: -6, z: -11, y: FLOOR.G, ry: Math.PI / 2, w: 1.15, h: 2.35, kind: 'wood', name: "the Corridor Door", mat: M.doorWood, swing: -1 });
  makeDoor(E, { x: 6, z: 13.9, y: FLOOR.G, ry: Math.PI / 2, w: 1.15, h: 2.35, kind: 'wood', name: 'the Dining Room Door', mat: M.doorWood, swing: 1 });
  makeDoor(E, { x: 6, z: -4, y: FLOOR.G, ry: Math.PI / 2, w: 1.15, h: 2.35, kind: 'wood', name: 'the Kitchen Door', mat: M.doorWood, swing: -1 });
  makeDoor(E, { x: 6, z: -11, y: FLOOR.G, ry: Math.PI / 2, w: 1.15, h: 2.35, kind: 'wood', name: 'the Corridor Door', mat: M.doorWood, swing: 1 });
  makeDoor(E, { x: -13, z: 4, y: FLOOR.G, ry: 0, w: 1.15, h: 2.35, kind: 'wood', name: 'the Library Door', mat: M.doorWood, swing: 1 });
  makeDoor(E, { x: 13, z: 4, y: FLOOR.G, ry: 0, w: 1.15, h: 2.35, kind: 'wood', name: 'the Kitchen Door', mat: M.doorWood, swing: -1 });
  makeDoor(E, { x: 0, z: -2, y: FLOOR.G, ry: 0, w: 1.15, h: 2.35, kind: 'wood', name: 'the Conservatory Doors', mat: M.doorWood, double: true, swing: 1 });
  makeDoor(E, { x: -13, z: -7, y: FLOOR.G, ry: 0, w: 1.15, h: 2.35, kind: 'wood', name: 'the West Corridor Door', mat: M.doorWood, swing: 1 });
  makeDoor(E, { x: 13, z: -7, y: FLOOR.G, ry: 0, w: 1.15, h: 2.35, kind: 'wood', name: 'the East Corridor Door', mat: M.doorWood, swing: -1 });
  // spiral room — sealed forever, green light beneath
  makeDoor(E, { x: -6, z: -12, y: FLOOR.G, ry: Math.PI / 2, w: 1.1, h: 2.3, kind: 'spiral', name: 'the Spiral Door', mat: M.doorIron, swing: 1 });
  // maintenance room — needs boiler power (PRD mechanical lock)
  makeDoor(E, { x: 6, z: -12, y: FLOOR.G, ry: Math.PI / 2, w: 1.1, h: 2.3, kind: 'power', name: 'the Maintenance Door', mat: M.doorIron, swing: -1 });

  // ================= WINDOWS (frames + panes) =================
  addWindowSet(E, M, [
    // front F0
    { x: -17.5, y: 1.75, z: Z1, ry: 0, glow: 'dark' }, { x: -12.5, y: 1.75, z: Z1, ry: 0, glow: 'dark' },
    { x: -4.5, y: 2.0, z: Z1, ry: 0, glow: 'dark', w: 1.3, h: 1.8 }, { x: 4.5, y: 2.0, z: Z1, ry: 0, glow: 'dark', w: 1.3, h: 1.8 },
    { x: 12.5, y: 1.75, z: Z1, ry: 0, glow: 'amberDim' }, { x: 17.5, y: 1.75, z: Z1, ry: 0, glow: 'amberDim' },
    // front F1 — green pair (photo) + orange caretaker window
    { x: -17.5, y: 6.1, z: Z1, ry: 0, glow: 'dark' }, { x: -12.5, y: 6.1, z: Z1, ry: 0, glow: 'dark' },
    { x: -4.5, y: 6.05, z: Z1, ry: 0, glow: 'green', w: 1.3, h: 1.9 }, { x: 4.5, y: 6.05, z: Z1, ry: 0, glow: 'green', w: 1.3, h: 1.9 },
    { x: 12.5, y: 6.1, z: Z1, ry: 0, glow: 'dark' }, { x: 17.5, y: 6.1, z: Z1, ry: 0, glow: 'orange' },
    // front F2 attic
    { x: -17.3, y: 10.0, z: Z1, ry: 0, glow: 'dark', w: 1.0, h: 1.05 }, { x: -12.3, y: 10.0, z: Z1, ry: 0, glow: 'dark', w: 1.0, h: 1.05 },
    { x: -4.5, y: 10.0, z: Z1, ry: 0, glow: 'dark', w: 1.0, h: 1.05 }, { x: 4.5, y: 10.0, z: Z1, ry: 0, glow: 'dark', w: 1.0, h: 1.05 },
    { x: 12.4, y: 10.0, z: Z1, ry: 0, glow: 'dark', w: 1.0, h: 1.05 }, { x: 17.3, y: 10.0, z: Z1, ry: 0, glow: 'dark', w: 1.0, h: 1.05 },
    // back F0
    { x: -16.6, y: 1.75, z: Z0, ry: Math.PI, glow: 'dark', w: 1.0, h: 1.3 },
    { x: -10.6, y: 1.9, z: Z0, ry: Math.PI, glow: 'dark', w: 0.8, h: 1.0 },
    { x: -4.5, y: 1.75, z: Z0, ry: Math.PI, glow: 'green', w: 1.14, h: 1.5 },
    { x: 5.1, y: 1.75, z: Z0, ry: Math.PI, glow: 'amberDim', w: 1.14, h: 1.5, tag: 'maintenance' },
    { x: 9.0, y: 1.9, z: Z0, ry: Math.PI, glow: 'dark', w: 0.8, h: 1.0 },
    { x: 17.1, y: 1.75, z: Z0, ry: Math.PI, glow: 'dark', w: 1.0, h: 1.3 },
    // back F1 — séance (green) · cold chamber (green)
    { x: -17.6, y: 6.05, z: Z0, ry: Math.PI, glow: 'dark' }, { x: -10.6, y: 6.05, z: Z0, ry: Math.PI, glow: 'dark' },
    { x: 6.95, y: 6.1, z: Z0, ry: Math.PI, glow: 'greenDim', w: 0.9, h: 1.3 }, { x: 10.15, y: 6.1, z: Z0, ry: Math.PI, glow: 'greenDim', w: 0.9, h: 1.3 },
    { x: 17.1, y: 6.0, z: Z0, ry: Math.PI, glow: 'greenDim', w: 0.9, h: 1.3 },
    // back F2 — tower slit + attic
    { x: -17.5, y: 9.95, z: Z0, ry: Math.PI, glow: 'dark', w: 1.0, h: 1.0 }, { x: -9.5, y: 9.95, z: Z0, ry: Math.PI, glow: 'dark', w: 1.0, h: 1.0 },
    { x: 0, y: 10.35, z: Z0, ry: Math.PI, glow: 'dark', w: 0.55, h: 1.4 },
    { x: 9.0, y: 10.3, z: Z0, ry: Math.PI, glow: 'dark', w: 0.9, h: 1.4 }, { x: 15.5, y: 10.3, z: Z0, ry: Math.PI, glow: 'dark', w: 0.9, h: 1.4 },
    // west wall
    { x: X0, y: 1.75, z: -11.5, ry: Math.PI / 2, glow: 'dark', w: 1.0, h: 1.3 },
    { x: X0, y: 1.75, z: -1.0, ry: Math.PI / 2, glow: 'dark', w: 1.14, h: 1.5 },
    { x: X0, y: 1.85, z: 9.4, ry: Math.PI / 2, glow: 'dark', w: 1.14, h: 1.5 },
    { x: X0, y: 6.0, z: -12.6, ry: Math.PI / 2, glow: 'dark', w: 0.9, h: 1.3 },
    { x: X0, y: 6.05, z: -4.6, ry: Math.PI / 2, glow: 'dark' }, { x: X0, y: 6.05, z: 0.4, ry: Math.PI / 2, glow: 'dark' },
    { x: X0, y: 6.05, z: 6.4, ry: Math.PI / 2, glow: 'dark' }, { x: X0, y: 6.05, z: 10.4, ry: Math.PI / 2, glow: 'dark' },
    { x: X0, y: 10.35, z: -10.0, ry: Math.PI / 2, glow: 'dark', w: 0.7, h: 1.5 }, { x: X0, y: 10.35, z: -3.0, ry: Math.PI / 2, glow: 'dark', w: 0.7, h: 1.5 },
    { x: X0, y: 9.9, z: 7.5, ry: Math.PI / 2, glow: 'dark', w: 1.0, h: 1.0 },
    // east wall
    { x: X1, y: 1.75, z: -11.5, ry: -Math.PI / 2, glow: 'dark', w: 0.8, h: 1.0 },
    { x: X1, y: 1.75, z: 0.4, ry: -Math.PI / 2, glow: 'dark' },
    { x: X1, y: 1.75, z: 6.4, ry: -Math.PI / 2, glow: 'dark' }, { x: X1, y: 1.75, z: 9.9, ry: -Math.PI / 2, glow: 'dark' },
    { x: X1, y: 6.0, z: -11.6, ry: -Math.PI / 2, glow: 'greenDim', w: 0.9, h: 1.3 },
    { x: X1, y: 6.05, z: 0.4, ry: -Math.PI / 2, glow: 'dark' },
    { x: X1, y: 6.05, z: 8.4, ry: -Math.PI / 2, glow: 'dark' }, { x: X1, y: 6.05, z: 11.9, ry: -Math.PI / 2, glow: 'dark' },
    { x: X1, y: 10.2, z: -6.0, ry: -Math.PI / 2, glow: 'dark', w: 0.9, h: 1.5 },
    { x: X1, y: 9.9, z: 8.5, ry: -Math.PI / 2, glow: 'dark', w: 1.0, h: 1.0 },
  ]);

  // ================= FLOOR 2 / 3 / BASEMENT / TOWER INTERIOR =================
  buildUpperFloors(E, M);
  buildBasement(E, M);

  return M;
}

// ============================================================================
// TOWER — rises 0→23 m through the rear-centre of the block
// ============================================================================
function buildTower(E, M) {
  const T = E.textures;
  const scene = E.scene;
  const TX0 = -3, TX1 = 3, TZ0 = -15, TZ1 = -8;
  const t = 0.6;
  const F2 = FLOOR.F2;
  // front (z=-8) face y 8.4→21: iron door below, slit above (bell chamber)
  E.addWall({ x1: TX0, z1: TZ1, x2: TX1, z2: TZ1, y: F2, h: 12.6, t, mat: M.stone, castShadow: true, openings: [
    { offset: 2.2, w: 1.6, h: 3.0, sill: 0 },      // iron door opening (y 8.4–11.4)
    { offset: 2.72, w: 0.55, h: 1.3, sill: 5.0 },  // bell-chamber slit (y 13.4–14.7)
  ]});
  // north (z=-15) face y 12.6→21 — below 12.6 the mansion rear facade already provides the face
  E.addWall({ x1: TX0, z1: TZ0, x2: TX1, z2: TZ0, y: 12.6, h: 8.4, t, mat: M.stone, castShadow: true, openings: [
    { offset: 2.72, w: 0.55, h: 1.3, sill: 0.9 },  // bell-chamber slit (y 13.5)
    { offset: 2.72, w: 0.55, h: 1.3, sill: 4.9 },  // sanctum slit (y 17.5)
  ]});
  // side faces y 8.4→21: sanctum slits high up
  E.addWall({ x1: TX0, z1: TZ0, x2: TX0, z2: TZ1, y: F2, h: 12.6, t, mat: M.stone, castShadow: true, openings: [
    { offset: 3.22, w: 0.55, h: 1.3, sill: 9.0 },  // sanctum slit west (y 17.4)
  ]});
  E.addWall({ x1: TX1, z1: TZ0, x2: TX1, z2: TZ1, y: F2, h: 12.6, t, mat: M.stone, castShadow: true, openings: [
    { offset: 3.22, w: 0.55, h: 1.3, sill: 9.0 },  // sanctum slit east (y 17.4)
  ]});

  // iron door from the attic antechamber into the tower (requires 3 Seals)
  makeDoor(E, { x: 0, z: TZ1, y: FLOOR.F2, ry: 0, w: 1.6, h: 3.0, kind: 'seal3', name: 'the Tower Iron Door', mat: M.doorIron, swing: 1 });

  // interior slabs: bell-chamber floor is served by the attic-ceiling slab above (same y, same opening — a second slab here z-fought it) · sanctum floor (run-2 opening)
  E.addSlab({ x1: TX0, z1: TZ0, x2: TX1, z2: TZ1, y: 16.8, t: 0.4, mat: M.ceiling,
    openings: [{ x1: 1.15, z1: -14.65, x2: 2.65, z2: -9.15 }] });
  E.addSlab({ x1: TX0, z1: TZ0, x2: TX1, z2: TZ1, y: 21.0, t: 0.4, mat: M.ceiling });

  // stone stair, two flights (8.4 → 12.6 bell chamber → 16.8 sanctum)
  E.addStairs({ x: -1.9, z: -9.25, dir: 'north', length: 5.35, width: 1.5, y0: FLOOR.F2, y1: 12.6, mat: M.stone, steps: 16 });
  E.addStairs({ x: 1.9, z: -14.55, dir: 'south', length: 5.35, width: 1.5, y0: 12.6, y1: 16.8, mat: M.stone, steps: 16 });

  // tower spire (outside silhouette)
  E.addSpire({ x: 0, y: 21.0, z: -11.5, radius: 4.6, height: 6.4, mat: M.roof, segments: 4, rotY: Math.PI / 4 });
  E.addSpire({ x: 0, y: 27.3, z: -11.5, radius: 0.14, height: 2.1, mat: M.iron, segments: 6, rotY: 0 });
  // weather-vane crest
  const vane = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ map: T.symCrest, transparent: true, side: THREE.DoubleSide, fog: false, depthWrite: false }));
  vane.position.set(0, 28.6, -11.5);
  scene.add(vane);
  E.tick.push((dt) => { vane.rotation.y += dt * 0.55; });

  // sanctum moonbeam (fake volumetric cone)
  const beamGeo = new THREE.ConeGeometry(1.35, 5.4, 12, 1, true);
  const beamMat = new THREE.MeshBasicMaterial({ color: 0xbfd4ff, transparent: true, opacity: 0.13, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false, fog: false });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.position.set(0, 19.0, -11.5);
  scene.add(beam);

  // tower emblems on the landing walls (engraving planes)
  E.addSymbol({ tex: T.symSpiral, x: -2.72, y: 10.3, z: -11.5, ry: Math.PI / 2, size: 1.05, opacity: 0.85 });
  E.addSymbol({ tex: T.symKnot, x: 0, y: 12.72, z: -10.6, ry: 0, size: 1.0, opacity: 0.85 }).rotation.x = -Math.PI / 2;
  E.addSymbol({ tex: T.symCrown, x: 2.72, y: 14.3, z: -11.5, ry: -Math.PI / 2, size: 1.05, opacity: 0.85 });
}

// ============================================================================
// FLOOR 2 (bedrooms/wings) · FLOOR 3 (attic) partitions
// ============================================================================
function buildUpperFloors(E, M) {
  const INT = 0.35;
  const P = M.plaster, W = M.wallpaper;
  const F1 = FLOOR.F1, F2 = FLOOR.F2;

  // ---------- FLOOR 1 (y=4.2) ----------
  E.addWall({ x1: -6, z1: -15, x2: -6, z2: 15, y: F1, h: 4.2, t: INT, mat: W, openings: [
    { offset: 11.4, w: 1.0, h: 2.2, sill: 0 },    // landing ↔ service passage west door (z=-3.6)
    { offset: 15.0, w: 1.15, h: 2.35, sill: 0 },   // landing ↔ gallery (z=0)
    { offset: 28.9, w: 1.15, h: 2.35, sill: 0 },   // landing ↔ master (z=13.9, clear of stairwell)
  ]});
  E.addWall({ x1: 6, z1: -15, x2: 6, z2: 15, y: F1, h: 4.2, t: INT, mat: W, openings: [
    { offset: 9.4, w: 1.15, h: 2.35, sill: 0 },    // landing ↔ spirit archive (z=-5.6)
    { offset: 11.4, w: 1.0, h: 2.2, sill: 0 },     // landing ↔ service passage east door (z=-3.6)
    { offset: 15.0, w: 1.15, h: 2.35, sill: 0 },   // landing ↔ children's room (z=0)
    { offset: 28.9, w: 1.15, h: 2.35, sill: 0 },   // landing ↔ guest room (z=13.9, clear of stairwell)
  ]});
  // z = 4 divider (west): master | gallery
  E.addWall({ x1: -21, z1: 4, x2: -6, z2: 4, y: F1, h: 4.2, t: INT, mat: W, openings: [
    { offset: 7.4, w: 1.15, h: 2.35, sill: 0 },    // gallery ↔ master (x=-13)
  ]});
  // z = -7 divider (west): gallery | workshop+music
  E.addWall({ x1: -21, z1: -7, x2: -6, z2: -7, y: F1, h: 4.2, t: INT, mat: W, openings: [
    { offset: 3.9, w: 1.0, h: 2.2, sill: 0 },      // gallery ↔ doll workshop (x=-17)
    { offset: 11.4, w: 1.0, h: 2.2, sill: 0 },     // gallery ↔ music room (x=-9.5)
  ]});
  // workshop | music room divider
  E.addWall({ x1: -13, z1: -15, x2: -13, z2: -7, y: F1, h: 4.2, t: INT, mat: W, openings: [
    { offset: 3.4, w: 1.0, h: 2.2, sill: 0 },      // workshop ↔ music room (z=-11.6)
  ]});
  // z = 7 divider (east): guest | children's room
  E.addWall({ x1: 6, z1: 7, x2: 21, z2: 7, y: F1, h: 4.2, t: INT, mat: W, openings: [
    { offset: 6.4, w: 1.15, h: 2.35, sill: 0 },    // guest ↔ children's (x=13)
  ]});
  // z = -2 divider (east): children's room | spirit archive
  E.addWall({ x1: 6, z1: -2, x2: 21, z2: -2, y: F1, h: 4.2, t: INT, mat: W, openings: [
    { offset: 6.4, w: 1.15, h: 2.35, sill: 0 },    // children's ↔ archive (x=13)
  ]});
  // z = -8 divider (east): archive | séance + cold chamber
  E.addWall({ x1: 6, z1: -8, x2: 21, z2: -8, y: F1, h: 4.2, t: INT, mat: W, openings: [
    { offset: 2.95, w: 1.1, h: 2.3, sill: 0 },     // archive ↔ séance (x=9.4)
    { offset: 10.05, w: 1.1, h: 2.3, sill: 0 },    // archive ↔ cold chamber (x=16.5)
  ]});
  // séance | cold chamber divider
  E.addWall({ x1: 13, z1: -15, x2: 13, z2: -8, y: F1, h: 4.2, t: INT, mat: W, openings: [
    { offset: 2.6, w: 1.0, h: 2.2, sill: 0 },      // séance ↔ cold chamber (z=-12)
  ]});
  // service passage (PRD 7.7): enclosed band x -6..6 z -6..-2
  E.addWall({ x1: -6, z1: -6, x2: 6, z2: -6, y: F1, h: 4.2, t: INT, mat: P });
  E.addWall({ x1: -6, z1: -2, x2: 6, z2: -2, y: F1, h: 4.2, t: INT, mat: P });
  // tower mass rises through (x -3..3 z -15..-8)
  E.solidBox({ x: 0, y: F1 + 2.1, z: -11.5, w: 6, h: 4.2, d: 7, mat: M.stone, collider: true, castShadow: true });

  // ---------- FLOOR 2 = ATTIC (y=8.4) ----------
  E.addWall({ x1: -6, z1: -15, x2: -6, z2: 15, y: F2, h: 4.2, t: INT, mat: P, openings: [
    { offset: 3.5, w: 1.0, h: 2.2, sill: 0 },      // forbidden study ↔ antechamber (z=-11)
    { offset: 23.0, w: 1.15, h: 2.35, sill: 0 },   // archive ↔ landing (z=8)
  ]});
  E.addWall({ x1: 6, z1: -15, x2: 6, z2: 15, y: F2, h: 4.2, t: INT, mat: P, openings: [
    { offset: 3.5, w: 1.0, h: 2.2, sill: 0 },      // observation ↔ antechamber (z=-11)
    { offset: 16.0, w: 1.15, h: 2.35, sill: 0 },   // taxidermy ↔ landing (z≈1, clear of stairwell)
  ]});
  // z = 2 divider (attic west): archive | forbidden study
  E.addWall({ x1: -21, z1: 2, x2: -6, z2: 2, y: F2, h: 4.2, t: INT, mat: P, openings: [
    { offset: 7.4, w: 1.15, h: 2.35, sill: 0 },    // archive ↔ forbidden study (x=-13)
  ]});
  // z = 2 divider (attic east): taxidermy | observation
  E.addWall({ x1: 6, z1: 2, x2: 21, z2: 2, y: F2, h: 4.2, t: INT, mat: P, openings: [
    { offset: 6.4, w: 1.15, h: 2.35, sill: 0 },    // taxidermy ↔ observation (x=13)
  ]});
  // antechamber south wall (landing | antechamber) — door through to the tower lobby
  E.addWall({ x1: -6, z1: -2, x2: 6, z2: -2, y: F2, h: 4.2, t: INT, mat: P, openings: [
    { offset: 5.42, w: 1.15, h: 2.35, sill: 0 },   // landing ↔ tower antechamber (x=0)
  ]});
  // (tower interior at attic level is the open stair hall — no filler)

  // grand stair (ground → F1) along the hall's west wall
  E.addStairs({ x: -5.0, z: 13.3, dir: 'north', length: 11.2, width: 2.3, y0: FLOOR.G, y1: F1, mat: M.marble, steps: 22 });
  // upper stair (F1 → attic) along the landing's east wall
  E.addStairs({ x: 5.0, z: 13.3, dir: 'north', length: 11.2, width: 2.3, y0: F1, y1: F2, mat: M.marble, steps: 22 });
  // kitchen service stair down to basement (east wall of kitchen)
  E.addStairs({ x: 19.4, z: 3.35, dir: 'north', length: 9.35, width: 2.5, y0: FLOOR.G, y1: FLOOR.BASEMENT, mat: M.stone, steps: 18 });

  // stairwell guard rails on the upper storeys (with colliders)
  E.solidBox({ x: -3.74, y: F1 + 0.55, z: 7.7, w: 0.1, h: 1.1, d: 11.5, mat: M.wood, collider: true });
  E.solidBox({ x: 3.74, y: F2 + 0.55, z: 7.7, w: 0.1, h: 1.1, d: 11.5, mat: M.wood, collider: true });

  // ================= FLOOR 1 DOORS =================
  makeDoor(E, { x: -6, z: -5, y: F1, ry: Math.PI / 2, w: 1.15, h: 2.35, kind: 'wood', name: 'the Archive Door', mat: M.doorWood, swing: 1 });   // landing ↔ archive
  makeDoor(E, { x: -6, z: 0, y: F1, ry: Math.PI / 2, w: 1.15, h: 2.35, kind: 'wood', name: 'the Gallery Door', mat: M.doorWood, swing: -1 });   // landing ↔ gallery
  makeDoor(E, { x: -6, z: 13.9, y: F1, ry: Math.PI / 2, w: 1.15, h: 2.35, kind: 'wood', name: 'the Master Bedroom', mat: M.doorWood, swing: 1 }); // landing ↔ master
  makeDoor(E, { x: 6, z: -5.6, y: F1, ry: Math.PI / 2, w: 1.15, h: 2.35, kind: 'wood', name: 'the Archive Door', mat: M.doorWood, swing: -1 });    // landing ↔ archive E
  makeDoor(E, { x: 6, z: 0, y: F1, ry: Math.PI / 2, w: 1.15, h: 2.35, kind: 'wood', name: "the Children's Room", mat: M.doorWood, swing: 1 });  // landing ↔ children
  makeDoor(E, { x: 6, z: 13.9, y: F1, ry: Math.PI / 2, w: 1.15, h: 2.35, kind: 'wood', name: 'the Guest Room', mat: M.doorWood, swing: -1 });     // landing ↔ guest
  makeDoor(E, { x: -13, z: 4, y: F1, ry: 0, w: 1.15, h: 2.35, kind: 'wood', name: 'the Gallery Door', mat: M.doorWood, swing: 1 });            // gallery ↔ master
  makeDoor(E, { x: -17, z: -7, y: F1, ry: 0, w: 1.0, h: 2.2, kind: 'wood', name: 'the Workshop Door', mat: M.doorWood, swing: 1 });            // gallery ↔ workshop
  makeDoor(E, { x: -9.5, z: -7, y: F1, ry: 0, w: 1.0, h: 2.2, kind: 'wood', name: 'the Music Room', mat: M.doorWood, swing: -1 });             // gallery ↔ music
  makeDoor(E, { x: -13, z: -11.6, y: F1, ry: Math.PI / 2, w: 1.0, h: 2.2, kind: 'wood', name: 'the Workshop Door', mat: M.doorWood, swing: 1 });// workshop ↔ music
  makeDoor(E, { x: 13, z: 7, y: F1, ry: 0, w: 1.15, h: 2.35, kind: 'wood', name: "the Children's Room", mat: M.doorWood, swing: -1 });          // guest ↔ children
  makeDoor(E, { x: 13, z: -2, y: F1, ry: 0, w: 1.15, h: 2.35, kind: 'wood', name: 'the Archive Door', mat: M.doorWood, swing: 1 });            // children ↔ archive
  makeDoor(E, { x: 9.4, z: -8, y: F1, ry: 0, w: 1.1, h: 2.3, kind: 'wood', name: 'the Séance Door', mat: M.doorWood, swing: 1 });              // archive ↔ séance
  makeDoor(E, { x: 16.5, z: -8, y: F1, ry: 0, w: 1.1, h: 2.3, kind: 'wood', name: 'the Cold Chamber', mat: M.doorIron, swing: -1 });            // archive ↔ cold chamber
  makeDoor(E, { x: 13, z: -11.6, y: F1, ry: Math.PI / 2, w: 1.0, h: 2.2, kind: 'wood', name: 'the Séance Door', mat: M.doorWood, swing: 1 });   // séance ↔ cold chamber
  // service passage doors (enter from gallery & archive ends)
  makeDoor(E, { x: -6, z: -3.6, y: F1, ry: Math.PI / 2, w: 1.0, h: 2.2, kind: 'wood', name: 'the Service Passage', mat: M.doorWood, swing: 1 });
  makeDoor(E, { x: 6, z: -3.6, y: F1, ry: Math.PI / 2, w: 1.0, h: 2.2, kind: 'wood', name: 'the Service Passage', mat: M.doorWood, swing: -1 });
  // balcony door — locked from inside (front facade, F1)
  makeDoor(E, { x: 0, z: 15, y: F1, ry: 0, w: 1.2, h: 2.3, kind: 'locked', name: 'the Balcony Door', lockMsg: 'Painted shut on the inside.\nThe keyhole is full of dust and one dead fly.', mat: M.doorWood, swing: 1 });

  // ================= ATTIC DOORS =================
  makeDoor(E, { x: -6, z: -11, y: F2, ry: Math.PI / 2, w: 1.0, h: 2.2, kind: 'wood', name: 'the Forbidden Study', mat: M.doorWood, swing: 1 });
  makeDoor(E, { x: -6, z: 8, y: F2, ry: Math.PI / 2, w: 1.15, h: 2.35, kind: 'wood', name: 'the Family Archive', mat: M.doorWood, swing: -1 });
  makeDoor(E, { x: 6, z: -11, y: F2, ry: Math.PI / 2, w: 1.0, h: 2.2, kind: 'wood', name: 'the Observation Room', mat: M.doorWood, swing: -1 });
  makeDoor(E, { x: 6, z: 1.0, y: F2, ry: Math.PI / 2, w: 1.15, h: 2.35, kind: 'wood', name: 'the Display Room', mat: M.doorWood, swing: 1 });
  makeDoor(E, { x: 0, z: -2, y: F2, ry: 0, w: 1.15, h: 2.35, kind: 'wood', name: 'the Tower Antechamber', mat: M.doorWood, swing: 1 });
  makeDoor(E, { x: -13, z: 2, y: F2, ry: 0, w: 1.15, h: 2.35, kind: 'wood', name: 'the Archive Door', mat: M.doorWood, swing: 1 });
  makeDoor(E, { x: 13, z: 2, y: F2, ry: 0, w: 1.15, h: 2.35, kind: 'wood', name: 'the Observation Door', mat: M.doorWood, swing: -1 });
}

// ============================================================================
// BASEMENT (y=-3.6) — service level, crypt, tunnels, Null Chamber
// ============================================================================
function buildBasement(E, M) {
  const T = E.textures;
  const B = FLOOR.BASEMENT, H = 3.6, t = 0.42;
  // perimeter walls
  E.addWall({ x1: X0, z1: -15, x2: X1, z2: -15, y: B, h: H, t, mat: M.stone });
  E.addWall({ x1: X0, z1: 15, x2: X1, z2: 15, y: B, h: H, t, mat: M.stone });
  E.addWall({ x1: X0, z1: -15, x2: X0, z2: 15, y: B, h: H, t, mat: M.stone });
  E.addWall({ x1: X1, z1: -15, x2: X1, z2: 15, y: B, h: H, t, mat: M.stone });
  // central spine wall x=-7 (wine cellar | crypt vs boiler | hall)
  E.addWall({ x1: -7, z1: -15, x2: -7, z2: 15, y: B, h: H, t, mat: M.stone, openings: [
    { offset: 4.4, w: 1.25, h: 2.3, sill: 0 },     // wine ↔ boiler (z=-10)
    { offset: 24.6, w: 1.25, h: 2.3, sill: 0 },    // crypt ↔ central hall (z=9)
  ]});
  // east spine wall x=7
  E.addWall({ x1: 7, z1: -15, x2: 7, z2: 15, y: B, h: H, t, mat: M.stone, openings: [
    { offset: 4.4, w: 1.25, h: 2.3, sill: 0 },     // storage ↔ boiler (z=-10)
    { offset: 24.6, w: 1.25, h: 2.3, sill: 0 },    // tunnel room ↔ hall (z=9)
  ]});
  // boiler room | central hall (z=-6)
  E.addWall({ x1: -7, z1: -6, x2: 7, z2: -6, y: B, h: H, t, mat: M.stone, openings: [
    { offset: 5.76, w: 2.4, h: 2.6, sill: 0 },     // boiler arch ↔ hall
  ]});
  // wine | crypt divider (z=2)
  E.addWall({ x1: -21, z1: 2, x2: -7, z2: 2, y: B, h: H, t, mat: M.stone, openings: [
    { offset: 7.4, w: 1.15, h: 2.3, sill: 0 },     // wine ↔ crypt (x=-13)
  ]});
  // storage | tunnel room divider (z=2)
  E.addWall({ x1: 7, z1: 2, x2: 21, z2: 2, y: B, h: H, t, mat: M.stone, openings: [
    { offset: 5.4, w: 1.15, h: 2.3, sill: 0 },     // storage ↔ tunnel room (x=13)
  ]});
  // null chamber wall (z=6) with the sealed final door
  E.addWall({ x1: -7, z1: 6, x2: 7, z2: 6, y: B, h: H, t, mat: M.stone, openings: [
    { offset: 5.9, w: 2.2, h: 2.7, sill: 0 },      // sealed — opens with 3 Seals
  ]});
  // tower foundation mass below antechamber (unused void filler)
  E.solidBox({ x: 0, y: B + 1.8, z: -11.5, w: 6, h: 3.6, d: 7, mat: M.stone, collider: true });

  // basement doors
  makeDoor(E, { x: -7, z: -10, y: B, ry: Math.PI / 2, w: 1.25, h: 2.3, kind: 'wood', name: 'the Wine Cellar', mat: M.doorWood, swing: 1 });
  makeDoor(E, { x: -7, z: 9, y: B, ry: Math.PI / 2, w: 1.25, h: 2.3, kind: 'wood', name: 'the Crypt Door', mat: M.doorIron, swing: -1 });
  makeDoor(E, { x: 7, z: -10, y: B, ry: Math.PI / 2, w: 1.25, h: 2.3, kind: 'wood', name: 'the Storage Door', mat: M.doorWood, swing: -1 });
  makeDoor(E, { x: 7, z: 9, y: B, ry: Math.PI / 2, w: 1.25, h: 2.3, kind: 'wood', name: 'the Tunnel Door', mat: M.doorWood, swing: 1 });
  makeDoor(E, { x: -13, z: 2, y: B, ry: 0, w: 1.15, h: 2.3, kind: 'wood', name: 'the Crypt Door', mat: M.doorIron, swing: 1 });
  makeDoor(E, { x: 13, z: 2, y: B, ry: 0, w: 1.15, h: 2.3, kind: 'wood', name: 'the Tunnel Door', mat: M.doorWood, swing: -1 });
  makeDoor(E, { x: 0, z: -6, y: B, ry: 0, w: 2.4, h: 2.6, kind: 'wood', name: 'the Boiler Arch', mat: M.doorIron, double: true, swing: 1 });
  // THE sealed door — opens only with three Seals (PRD §12 type 10, reused for the Null Chamber)
  makeDoor(E, { x: 0, z: 6, y: B, ry: 0, w: 2.2, h: 2.7, kind: 'seal3', name: 'the Null Chamber Door', mat: M.doorIron, double: true, swing: 1, once: true });
}

// ============================================================================
// windows helper
// ============================================================================
function addWindowSet(E, M, list) {
  const T = E.textures;
  for (const w of list) {
    const width = w.w || 1.14, height = w.h || 1.5;
    // frame
    E.addWindowFrame({ x: w.x, y: w.y, z: w.z, ry: w.ry, w: width, h: height, mat: M.iron });
    // pane
    let tex = T.paneCold;
    if (w.glow === 'green') tex = T.paneGreen;
    else if (w.glow === 'greenDim') tex = T.paneGreen;
    else if (w.glow === 'orange' || w.glow === 'amberDim') tex = T.paneOrange;
    const col = w.glow === 'greenDim' ? 0x3f7a52 : w.glow === 'amberDim' ? 0x6e4416 : 0xffffff;
    const pane = E.addGlowPane({ tex, x: w.x, y: w.y, z: w.z, ry: w.ry, w: width - 0.08, h: height - 0.08, color: col });
    if (w.tag === 'maintenance') E.glowPanes.push({ mesh: pane, kind: 'maintenance' });
  }
}

// ---------- painted name board ----------
function makeNameBoard() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 84;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 512, 84);
  ctx.fillStyle = 'rgba(12,14,18,.85)';
  ctx.fillRect(0, 0, 512, 84);
  ctx.strokeStyle = '#7d6b3f'; ctx.lineWidth = 5; ctx.strokeRect(5, 5, 502, 74);
  ctx.fillStyle = '#cbbc8e';
  ctx.font = '600 34px Georgia, serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('V E L L A C O T T   M A N O R', 256, 44);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
