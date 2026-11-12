// ============================================================
// PROPS — GROUND FLOOR (grand hall, study, library, dining,
//         kitchen, conservatory, corridors)
// ============================================================
import * as THREE from 'three';
import { FLOOR } from './engine.js';
import { makeSlider } from './doors.js';
import { audio } from './audio.js';
import { nearXZ, box, cyl, readable, portrait, candleGlow, cobweb } from './props_common.js';

export function buildGroundFloorProps(E, M) {
  const T = E.textures;
  const scene = E.scene;
  const G = FLOOR.G;

  const woodDark = new THREE.MeshStandardMaterial({ color: 0x2a1d12, roughness: 0.78 });
  const woodMid = new THREE.MeshStandardMaterial({ map: T.wood, roughness: 0.8, color: 0xa98a68 });
  const brass = new THREE.MeshStandardMaterial({ color: 0x8a6f3a, roughness: 0.32, metalness: 0.9 });
  const velvet = new THREE.MeshStandardMaterial({ color: 0x402028, roughness: 1 });
  const china = new THREE.MeshStandardMaterial({ color: 0xdad5c8, roughness: 0.35 });
  const paper = new THREE.MeshStandardMaterial({ color: 0xcfc4a4, roughness: 0.9 });

  // ============ GRAND HALL ============
  // checkerboard overlay
  const checker = new THREE.Mesh(new THREE.PlaneGeometry(11.2, 16.6), new THREE.MeshStandardMaterial({ map: T.checker, roughness: 0.4 }));
  checker.rotation.x = -Math.PI / 2; checker.position.set(0, 0.02, 6.3); checker.receiveShadow = true; scene.add(checker);
  // carpet runner from the door to the stairs
  const runner = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 13.6), new THREE.MeshStandardMaterial({ map: T.carpet, roughness: 1 }));
  runner.rotation.x = -Math.PI / 2; runner.position.set(0, 0.035, 7.6); runner.receiveShadow = true; scene.add(runner);

  // three scratched portraits (the Vellacott family)
  portrait(E, { x: -5.81, y: 2.35, z: 11.0, ry: Math.PI / 2, size: 1.05 });
  portrait(E, { x: 5.81, y: 2.35, z: 2.4, ry: -Math.PI / 2, size: 1.05 });
  portrait(E, { x: 0, y: 3.15, z: -1.79, ry: 0, size: 0.8 });

  // stopped grandfather clock — east wall
  box(E, { x: 5.35, y: 1.15, z: 6.0, w: 0.45, h: 2.3, d: 0.78, mat: woodDark });
  const clockFace = cyl(E, { x: 5.11, y: 1.72, z: 6.0, rTop: 0.2, rBottom: 0.2, h: 0.06, mat: brass, seg: 16, collider: false });
  clockFace.rotation.z = Math.PI / 2;
  readable(E, { x: 5.3, z: 6.0, r: 2.2, prompt: () => 'The clock is stopped at 3:07.\nThe pendulum is frozen mid-swing.', onRead: () => { E.flags.clockRead = true; E.hooks && E.hooks.onClue('clockRead'); } });

  // great wall emblem: House Crest + three seal recesses (they ignite as seals are found)
  E.addSymbol({ tex: T.symCrest, x: 0, y: 2.6, z: -1.79, ry: 0, size: 1.5, opacity: 0.92 });
  const recessGeo = new THREE.CircleGeometry(0.19, 20);
  const mkRecess = (x, tex, key) => {
    const m = new THREE.Mesh(recessGeo, new THREE.MeshStandardMaterial({ color: 0x0c0e12, roughness: 0.6, emissive: 0x000000 }));
    m.position.set(x, 1.35, -1.79);
    scene.add(m);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.03, 6, 20), brass);
    ring.position.set(x, 1.35, -1.78);
    scene.add(ring);
    E.sealRecess[key] = m;
  };
  mkRecess(-0.85, T.symSpiral, 'spiral');
  mkRecess(0, T.symKnot, 'knot');
  mkRecess(0.85, T.symCrown, 'crown');

  // chandelier (dark until the boiler is restored)
  const chand = new THREE.Group();
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.15, 6), brass); rod.position.y = 0.58; chand.add(rod);
  const ringM = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.07, 8, 18), brass); ringM.rotation.x = Math.PI / 2; chand.add(ringM);
  const flameMat = new THREE.MeshBasicMaterial({ color: 0x3a3428, fog: false });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.34, 6), china);
    candle.position.set(Math.cos(a) * 0.72, 0.16, Math.sin(a) * 0.72); chand.add(candle);
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.13, 6), flameMat);
    flame.position.set(Math.cos(a) * 0.72, 0.4, Math.sin(a) * 0.72); chand.add(flame);
  }
  chand.position.set(0, 3.6, 6.3);
  scene.add(chand);
  const chandelierLight = E.addPointLight({ x: 0, y: 3.15, z: 6.3, color: 0xffc37a, intensity: 0, distance: 15, decay: 2 });
  E.powerRefs.chandelierLight = chandelierLight;
  E.powerRefs.chandelierFlames = flameMat;

  // settee — east wall
  box(E, { x: 4.6, y: 0.35, z: 7.5, w: 1.9, h: 0.7, d: 0.72, mat: velvet, castShadow: true });
  box(E, { x: 4.88, y: 0.78, z: 7.5, w: 0.18, h: 0.55, d: 1.9, mat: velvet });

  // ============ STUDY ============
  const sy = G;
  // desk + chair
  box(E, { x: -17.2, y: 0.74, z: 11.6, w: 2.3, h: 0.09, d: 1.15, mat: woodDark, castShadow: true });
  for (const [lx, lz] of [[-18.15, 11.15], [-16.25, 11.15], [-18.15, 12.05], [-16.25, 12.05]])
    box(E, { x: lx, y: 0.36, z: lz, w: 0.09, h: 0.72, d: 0.09, mat: woodDark, collider: false });
  box(E, { x: -17.2, y: 0, z: 0, w: 0, h: 0, d: 0, mat: woodDark, collider: false }); // no-op keep pattern
  // desk collider
  E.colliders.push({ minX: -18.4, maxX: -16.0, minZ: 11.0, maxZ: 12.2, top: 0.85 });
  box(E, { x: -17.2, y: 0.32, z: 13.2, w: 0.55, h: 0.62, d: 0.55, mat: woodDark });
  // papers + inkwell on the desk
  const paperMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.34), paper);
  paperMesh.rotation.x = -Math.PI / 2; paperMesh.position.set(-17.0, 0.795, 11.55); paperMesh.rotation.z = 0.3; scene.add(paperMesh);
  cyl(E, { x: -17.7, y: 0.84, z: 11.4, rTop: 0.05, rBottom: 0.06, h: 0.09, mat: new THREE.MeshStandardMaterial({ color: 0x14171f, roughness: 0.3 }), collider: false });
  candleGlow(E, { x: -16.6, y: 1.02, z: 11.35, scale: 0.4 });
  // the torn letter (Clue 1 fragment)
  readable(E, { x: -17.2, z: 11.6, r: 1.9, prompt: () => 'A torn letter, ink brown with age:\n"Three keepers. Three seals. One door beneath the tower."', onRead: () => E.hooks && E.hooks.onClue('letter') });
  // bookshelf wall
  for (let i = 0; i < 4; i++) box(E, { x: -20.15, y: 1.5, z: 6.4 + i * 1.15, w: 0.55, h: 3.0, d: 1.05, mat: woodDark, castShadow: true });
  // safe on the shelf line
  box(E, { x: -20.0, y: 0.55, z: 11.0, w: 0.72, h: 0.72, d: 0.55, mat: new THREE.MeshStandardMaterial({ color: 0x1f2228, roughness: 0.35, metalness: 0.8 }) });
  readable(E, { x: -19.7, z: 11.0, r: 1.9, prompt: () => 'A small safe. The dial sticks on a single number.\nThe graveyard knows it. (Sealed in this build — view only)', onRead: () => E.hooks && E.hooks.onClue('safe') });
  // wall map
  const mapTex = makeMapTexture();
  const map = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.1), new THREE.MeshStandardMaterial({ map: mapTex, roughness: 0.9 }));
  map.position.set(-13.0, 2.35, 14.73); map.rotation.y = Math.PI; scene.add(map);
  // fireplace (cold, soot-black)
  box(E, { x: -17.5, y: 0.85, z: 4.28, w: 1.9, h: 1.7, d: 0.35, mat: M.marble });
  box(E, { x: -17.5, y: 0.42, z: 4.42, w: 1.2, h: 0.9, d: 0.3, mat: new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 1 }), collider: false });
  readable(E, { x: -17.5, z: 4.6, r: 1.9, prompt: () => 'The fireplace is cold. Something was burned here\ndeliberately — and recently. The soot flakes like scales.', onRead: () => E.hooks && E.hooks.onClue('fireplace') });
  // partial mansion plan in the drawer
  readable(E, { x: -16.6, z: 12.2, r: 1.6, prompt: () => 'The drawer sticks, then gives. Inside: half a floor plan\nof the manor, the tower chamber scratched out in charcoal.', onRead: () => E.hooks && E.hooks.onClue('plan') });

  // ============ LIBRARY ============
  // two-tier bookshelves on the west wall
  for (let i = 0; i < 3; i++) box(E, { x: -20.2, y: 1.9, z: -5.2 + i * 1.7, w: 0.6, h: 3.8, d: 1.6, mat: woodDark, castShadow: true });
  // shelves along the north side
  for (let i = 0; i < 2; i++) box(E, { x: -11.5 - i * 1.8, y: 1.9, z: 3.72, w: 1.7, h: 3.8, d: 0.55, mat: woodDark, castShadow: true });
  // rolling ladder, eternally mid-roll
  const ladder = box(E, { x: -19.4, y: 1.6, z: -3.4, w: 0.42, h: 3.3, d: 0.12, mat: woodMid, collider: true });
  ladder.rotation.z = 0.24;
  // fireplace with bricked false back
  box(E, { x: -13.0, y: 0.95, z: -6.75, w: 2.1, h: 1.9, d: 0.35, mat: M.marble });
  box(E, { x: -13.0, y: 0.5, z: -6.6, w: 1.35, h: 1.0, d: 0.28, mat: new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 1 }), collider: false });
  readable(E, { x: -13.0, z: -6.2, r: 1.9, prompt: () => 'Behind the grate, the flue is bricked over.\nFresh mortar. Someone sealed the chimney from the inside — or sealed something INTO it.', onRead: () => E.hooks && E.hooks.onClue('brickedFlue') });
  // reading chair + candle
  box(E, { x: -9.2, y: 0.4, z: -4.6, w: 1.0, h: 0.8, d: 1.0, mat: velvet });
  box(E, { x: -9.2, y: 1.05, z: -5.05, w: 1.0, h: 0.9, d: 0.22, mat: velvet });
  candleGlow(E, { x: -8.2, y: 0.95, z: -4.4, scale: 0.42 });
  // SLIDING SHELF — reveals the guardian journal niche
  makeSlider(E, {
    x: -20.15, y: 0.9, z: 1.15, w: 1.5, h: 2.7, t: 0.65,
    mat: woodDark, axis: 'z', slideTo: 1.7,
    name: 'A shelf that sits a finger too proud of the wall',
    reveals: 'The shelf has slid aside.\nA journal lies in the dark behind it.',
  });
  readable(E, { x: -19.8, z: 1.1, r: 1.8, prompt: () => 'The Guardian Journal — last entry, 1897:\n"We were not jailers. We were the lock. God forgive us, we are still holding."', onRead: () => E.hooks && E.hooks.onClue('guardianJournal') });
  // narrow concealed door to the east wing (decorative — sealed)
  box(E, { x: -6.08, y: 1.15, z: -4.0, w: 0.18, h: 2.3, d: 1.0, mat: woodDark, collider: false });
  readable(E, { x: -6.3, z: -4.0, r: 1.9, prompt: () => 'A narrow door bound in the same iron as the tower.\nThe spiral is carved above it. It does not open. Not for you.', onRead: () => E.hooks && E.hooks.onClue('narrowDoor') });
  cobweb(E, { x: -6.2, y: 3.4, z: -6.4, ry: Math.PI / 4, size: 1.3 });

  // ============ DINING ROOM ============
  // long table, thirteen chairs
  box(E, { x: 13.3, y: 0.74, z: 9.2, w: 7.2, h: 0.1, d: 1.7, mat: woodDark, castShadow: true });
  E.colliders.push({ minX: 9.7, maxX: 16.9, minZ: 8.35, maxZ: 10.05, top: 0.84 });
  for (const lx of [10.3, 16.3]) for (const lz of [8.6, 9.8]) box(E, { x: lx, y: 0.36, z: lz, w: 0.12, h: 0.72, d: 0.12, mat: woodDark, collider: false });
  let chairN = 0;
  for (let i = 0; i < 6; i++) {
    const cx = 10.2 + i * 1.25;
    for (const side of [-1, 1]) {
      chairN++;
      const cz = 9.2 + side * 1.35;
      const toppled = chairN === 13 - 6; // one chair knocked over, at the head
      const ch = box(E, { x: i === 5 && side === 1 ? 17.35 : cx, y: toppled ? 0.28 : 0.3, z: toppled ? 7.6 : cz, w: 0.42, h: 0.58, d: 0.42, mat: woodMid, collider: false });
      if (toppled) ch.rotation.z = 1.35;
    }
  }
  // thirteen place settings — one abandoned mid-meal
  for (let i = 0; i < 6; i++) {
    const cx = 10.2 + i * 1.25;
    for (const side of [-1, 1]) cyl(E, { x: cx, y: 0.83, z: 9.2 + side * 0.55, rTop: 0.16, rBottom: 0.13, h: 0.045, mat: china, seg: 12, collider: false });
  }
  cyl(E, { x: 16.9, y: 0.83, z: 9.2, rTop: 0.16, rBottom: 0.13, h: 0.045, mat: china, seg: 12, collider: false });
  // the abandoned seventh setting at the head — something small & silver
  readable(E, { x: 16.6, z: 7.9, r: 1.7, prompt: () => 'The thirteenth setting. The chair is thrown back.\nFolded into the napkin: a key stamped with the Marionette Knot.', onRead: () => E.hooks && E.hooks.onClue('silverKey') });
  // broken serving trolley
  const trolley = box(E, { x: 18.7, y: 0.42, z: 5.6, w: 1.15, h: 0.84, d: 0.62, mat: woodMid, castShadow: true });
  trolley.rotation.z = 0.42;
  // sideboard + former residents
  box(E, { x: 13.3, y: 0.6, z: 14.35, w: 2.6, h: 1.2, d: 0.5, mat: woodDark });
  portrait(E, { x: 9.5, y: 2.45, z: 14.73, ry: Math.PI, size: 1.1 });
  portrait(E, { x: 17.1, y: 2.45, z: 14.73, ry: Math.PI, size: 1.1 });
  // dumbwaiter shaft (dining ↔ kitchen)
  box(E, { x: 20.42, y: 1.5, z: 11.8, w: 0.32, h: 1.6, d: 1.05, mat: woodDark, collider: false });
  readable(E, { x: 19.9, z: 11.8, r: 1.9, prompt: () => 'The dumbwaiter shaft. A rope of knotted linen descends into the dark —\ntoward the kitchen. It is warm down there. It should not be warm.', onRead: () => E.hooks && E.hooks.onClue('dumbwaiter') });

  // ============ KITCHEN ============
  // great stove + flue
  box(E, { x: 16.9, y: 0.75, z: -6.1, w: 1.9, h: 1.5, d: 1.15, mat: new THREE.MeshStandardMaterial({ color: 0x17181c, roughness: 0.5, metalness: 0.6 }), castShadow: true });
  E.colliders.push({ minX: 15.9, maxX: 17.9, minZ: -6.75, maxZ: -5.4, top: 1.55 });
  cyl(E, { x: 16.9, y: 2.35, z: -6.3, rTop: 0.24, rBottom: 0.24, h: 1.7, mat: M.iron || M.stone, seg: 10, collider: false });
  for (const bx of [-0.55, 0.55]) for (const bz of [-0.3, 0.3]) cyl(E, { x: 16.9 + bx, y: 1.56, z: -6.1 + bz, rTop: 0.16, rBottom: 0.16, h: 0.05, mat: new THREE.MeshStandardMaterial({ color: 0x07080a, roughness: 0.9 }), collider: false });
  // sink + counter along the north wall
  box(E, { x: 9.0, y: 0.45, z: -6.55, w: 3.4, h: 0.9, d: 0.85, mat: new THREE.MeshStandardMaterial({ color: 0x3c4148, roughness: 0.4, metalness: 0.5 }) });
  // prep table
  box(E, { x: 13.0, y: 0.82, z: -1.6, w: 2.6, h: 0.08, d: 1.25, mat: woodMid, castShadow: true });
  E.colliders.push({ minX: 11.7, maxX: 14.3, minZ: -2.25, maxZ: -0.95, top: 0.9 });
  for (const [lx, lz] of [[11.9, -2.1], [14.1, -2.1], [11.9, -1.1], [14.1, -1.1]]) box(E, { x: lx, y: 0.4, z: lz, w: 0.09, h: 0.78, d: 0.09, mat: woodDark, collider: false });
  // pantry shelves + jars (south kitchen wall, well clear of the stair mouth and the dining door)
  for (let i = 0; i < 3; i++) box(E, { x: 10.0, y: 1.1 + i * 0.9, z: 3.58, w: 3.5, h: 0.08, d: 0.5, mat: woodDark, collider: false });
  const jarMat = new THREE.MeshStandardMaterial({ color: 0x5a6a52, roughness: 0.25, metalness: 0.1 });
  for (let i = 0; i < 9; i++) cyl(E, { x: 8.6 + (i % 3) * 1.5, y: 1.32 + Math.floor(i / 3) * 0.9, z: 3.55, rTop: 0.13, rBottom: 0.13, h: 0.34, mat: jarMat, seg: 8, collider: false });
  box(E, { x: 10.0, y: 1.05, z: 3.72, w: 3.6, h: 2.2, d: 0.18, mat: woodDark, collider: false }); // back panel
  // loose floorboard with the note
  const board = box(E, { x: 16.1, y: 0.045, z: 0.9, w: 1.05, h: 0.09, d: 0.42, mat: woodMid, collider: false });
  board.rotation.y = 0.09;
  readable(E, { x: 16.1, z: 0.9, r: 1.7, prompt: () => 'The floorboard rocks underfoot. Beneath it, folded small:\n"If the house asks your name, do not give it. — M."', onRead: () => E.hooks && E.hooks.onClue('floorboardNote') });
  // cold fireplace
  box(E, { x: 17.4, y: 0.8, z: 3.75, w: 1.8, h: 1.6, d: 0.3, mat: M.marble, collider: false });

  // ============ CONSERVATORY ============
  // cracked fountain with the circular symbol
  cyl(E, { x: -2.6, y: 0.42, z: -5.0, rTop: 1.28, rBottom: 1.42, h: 0.84, mat: M.marble, seg: 16 });
  cyl(E, { x: -2.6, y: 1.12, z: -5.0, rTop: 0.16, rBottom: 0.24, h: 0.72, mat: M.marble, seg: 10, collider: false });
  const symFloor = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshBasicMaterial({ map: T.symSpiral, transparent: true, opacity: 0.8, depthWrite: false, fog: false }));
  symFloor.rotation.x = -Math.PI / 2; symFloor.position.set(-2.6, 0.87, -5.0); scene.add(symFloor);
  readable(E, { x: -2.6, z: -5.0, r: 2.0, prompt: () => 'The fountain cracked clean in half,\nas if something inside it grew.', onRead: () => E.hooks && E.hooks.onClue('fountain') });
  // dead plant ranks
  const potMat = new THREE.MeshStandardMaterial({ color: 0x59392a, roughness: 0.9 });
  const deadLeaf = new THREE.MeshStandardMaterial({ color: 0x2c2416, roughness: 1, flatShading: true });
  for (let i = 0; i < 7; i++) {
    const px = 1.2 + (i % 4) * 1.35, pz = -6.6 + Math.floor(i / 4) * 4.6;
    cyl(E, { x: px, y: 0.24, z: pz, rTop: 0.3, rBottom: 0.2, h: 0.48, mat: potMat, seg: 8, collider: false });
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.24 + (i % 3) * 0.09, 1.0 + (i % 4) * 0.4, 6), deadLeaf);
    spike.position.set(px, 0.9 + (i % 4) * 0.2, pz); spike.rotation.z = (i % 2 ? -1 : 1) * 0.18; scene.add(spike);
  }
  // glass-roof illusion: pale skylight panel + mullions on the ceiling
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(10.4, 4.6), new THREE.MeshBasicMaterial({ color: 0x33414e, fog: false }));
  sky.rotation.x = Math.PI / 2; sky.position.set(0, 3.99, -5); scene.add(sky);
  for (const mx of [-2.6, 0, 2.6]) box(E, { x: mx, y: 3.94, z: -5, w: 0.14, h: 0.1, d: 4.6, mat: M.iron, collider: false });
  // bricked-up arch on the tower face (behind the fountain)
  const arch = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.3), new THREE.MeshStandardMaterial({ color: 0x1c1a17, roughness: 1 }));
  arch.position.set(0, 1.65, -7.93); scene.add(arch);
  readable(E, { x: 0, z: -7.6, r: 2.0, prompt: () => 'A bricked arch into the tower foundations.\nThe mortar is old — older than the manor. Something was sealed IN here.', onRead: () => E.hooks && E.hooks.onClue('brickedArch') });

  // ============ WEST CORRIDOR — photographs & footprints ============
  for (let i = 0; i < 5; i++) portrait(E, { x: -13.5 + i * 2.1, y: 2.2, z: -14.28, ry: 0, size: 0.62 });
  // doll-sized footprints in the dust, leading to the Spiral Door
  const fpMat = new THREE.MeshBasicMaterial({ color: 0x0e0c09, transparent: true, opacity: 0.8, depthWrite: false });
  for (let i = 0; i < 12; i++) {
    const fp = new THREE.Mesh(new THREE.CircleGeometry(0.055, 6), fpMat);
    fp.rotation.x = -Math.PI / 2;
    fp.scale.set(1, 1.6, 1);
    fp.position.set(-12.3 + i * 1.02 + Math.sin(i * 2.2) * 0.28, 0.045, -10.6 + Math.sin(i * 1.3) * 0.5);
    scene.add(fp);
  }

  // ============ EAST CORRIDOR — cold & whispering ============
  for (let i = 0; i < 3; i++) {
    const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.65), new THREE.MeshBasicMaterial({ map: T.symSpiral, transparent: true, opacity: 0.5, depthWrite: false, fog: false }));
    sc.position.set(12.0 + i * 3.1, 1.7 + (i % 2) * 0.5, -14.29);
    scene.add(sc);
  }
  cobweb(E, { x: 7.2, y: 3.5, z: -14.3, ry: 0, size: 1.5 });
  cobweb(E, { x: 19.8, y: 3.4, z: -7.4, ry: Math.PI / 2.3, size: 1.3 });
  // cold draught from the maintenance side
  readable(E, { x: 6.4, z: -12.0, r: 2.0, prompt: () => 'Air moves here — cold, steady, patient.\nIt leaks from beneath the maintenance door like breath.', onRead: () => E.hooks && E.hooks.onClue('coldBreath') });
}

// ---------- painted estate map ----------
function makeMapTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 320;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#d8cba6'; ctx.fillRect(0, 0, 512, 320);
  ctx.strokeStyle = '#6e5a34'; ctx.lineWidth = 4; ctx.strokeRect(6, 6, 500, 308);
  ctx.fillStyle = '#3a3122';
  ctx.font = 'bold 22px Georgia';
  ctx.fillText('VELLACOTT ESTATE · 1711', 26, 42);
  // house block
  ctx.strokeRect(190, 120, 140, 84);
  ctx.fillText('MANOR', 238, 170);
  // tower
  ctx.beginPath(); ctx.arc(262, 158, 14, 0, 7); ctx.stroke();
  // path
  ctx.beginPath(); ctx.moveTo(258, 204); ctx.lineTo(258, 292); ctx.stroke();
  // graveyard
  ctx.strokeRect(392, 210, 88, 70);
  ctx.fillText('GRAVES', 402, 250);
  // rear garden / chapel
  ctx.strokeRect(200, 30, 120, 60);
  ctx.fillText('CHAPEL', 226, 66);
  // erased path — scratched out
  ctx.save();
  ctx.strokeStyle = '#3a3122'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(258, 204); ctx.lineTo(120, 290); ctx.stroke();
  for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(120 + i * 6, 258 + i * 4); ctx.lineTo(150 + i * 6, 236 + i * 4); ctx.stroke(); }
  ctx.restore();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
