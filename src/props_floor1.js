// ============================================================
// PROPS — FLOOR 2 (y=4.2): landing, bedrooms, West Wing (Morvex),
//         East Wing (Vorak), service passage (PRD §7)
// ============================================================
import * as THREE from 'three';
import { FLOOR } from './engine.js';
import { audio } from './audio.js';
import { nearXZ, box, cyl, readable, portrait, candleGlow, cobweb, sealPickup, marionette } from './props_common.js';

export function buildFloor1Props(E, M) {
  const T = E.textures;
  const scene = E.scene;
  const Y = FLOOR.F1;

  const woodDark = new THREE.MeshStandardMaterial({ color: 0x2a1d12, roughness: 0.78 });
  const woodMid = new THREE.MeshStandardMaterial({ map: T.wood, roughness: 0.8, color: 0xa98a68 });
  const velvet = new THREE.MeshStandardMaterial({ color: 0x33202c, roughness: 1 });
  const linen = new THREE.MeshStandardMaterial({ color: 0xb8b2a2, roughness: 1 });
  const china = new THREE.MeshStandardMaterial({ color: 0xd8d2c4, roughness: 0.4 });
  const puppetWood = new THREE.MeshStandardMaterial({ color: 0x6b4e2e, roughness: 0.65 });
  const puppetCloth = new THREE.MeshStandardMaterial({ color: 0x4a2432, roughness: 1 });
  const frostMat = new THREE.MeshStandardMaterial({ color: 0xcfe4ea, transparent: true, opacity: 0.32, roughness: 0.15 });
  const puppetMats = { puppetWood, puppetCloth };

  // ============ LANDING ============
  // covered mirror — it is covered for a reason
  box(E, { x: 0.5, y: 1.65 + Y, z: 14.7, w: 1.15, h: 2.1, d: 0.22, mat: woodDark, collider: false });
  const drape = new THREE.Mesh(new THREE.ConeGeometry(0.78, 2.3, 8), new THREE.MeshStandardMaterial({ color: 0x1d1a22, roughness: 1 }));
  drape.position.set(0.5, Y + 1.62, 14.62); scene.add(drape);
  readable(E, { x: 0.5, z: 14.3, y: Y, r: 2.1, prompt: () => 'Dust cloth and a gilt frame. Beneath the cloth, the glass is silvered black —\nand the cloth breathes. Very slowly. In time with you.', onRead: () => E.hooks && E.hooks.onClue('blackMirror') });
  // small cabinet with a floor-plan fragment
  box(E, { x: 5.35, y: 0.6 + Y, z: 1.15, w: 0.85, h: 1.2, d: 0.6, mat: woodDark });
  readable(E, { x: 5.35, z: 1.15, y: Y, r: 1.8, prompt: () => 'Inside the cabinet, wrapped in oilcloth:\nthe floor plan of this very landing — the tower stairs are drawn longer than the tower.', onRead: () => E.hooks && E.hooks.onClue('planFragment') });

  // ============ MASTER BEDROOM ============
  // four-poster bed
  const bedX = -17.2, bedZ = 11.3;
  box(E, { x: bedX, y: 0.32 + Y, z: bedZ, w: 2.5, h: 0.42, d: 3.6, mat: woodDark, castShadow: true });
  E.colliders.push({ minX: bedX - 1.3, maxX: bedX + 1.3, minZ: bedZ - 1.9, maxZ: bedZ + 1.9, top: Y + 0.62 });
  box(E, { x: bedX, y: 0.56 + Y, z: bedZ, w: 2.25, h: 0.22, d: 3.3, mat: linen, collider: false });
  box(E, { x: bedX, y: 0.75 + Y, z: bedZ - 1.35, w: 2.0, h: 0.2, d: 0.55, mat: velvet, collider: false });
  for (const [px, pz] of [[-1.15, -1.7], [1.15, -1.7], [-1.15, 1.7], [1.15, 1.7]])
    cyl(E, { x: bedX + px, y: 1.35 + Y, z: bedZ + pz, rTop: 0.09, rBottom: 0.09, h: 2.1, mat: woodDark, seg: 8, collider: false });
  box(E, { x: bedX, y: 2.42 + Y, z: bedZ, w: 2.6, h: 0.14, d: 3.75, mat: velvet, collider: false, castShadow: true });
  // wardrobe — you may hide inside (view-only: it just creaks)
  box(E, { x: -20.0, y: 1.25 + Y, z: 6.6, w: 1.05, h: 2.5, d: 2.1, mat: woodMid, castShadow: true });
  readable(E, { x: -19.5, z: 6.6, y: Y, r: 2.0, prompt: () => 'The wardrobe door stands an inch ajar.\nInside: a hundred coats, all Buttoned, all facing the door.', onRead: () => E.hooks && E.hooks.onClue('wardrobe') });
  // dressing table + mirror
  box(E, { x: -9.0, y: 0.78 + Y, z: 14.35, w: 1.7, h: 0.08, d: 0.6, mat: woodDark, collider: false });
  box(E, { x: -9.0, y: 0.4 + Y, z: 14.4, w: 1.55, h: 0.75, d: 0.1, mat: woodDark, collider: false });
  const mirror = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 1.1), new THREE.MeshStandardMaterial({ color: 0x9aa4b4, roughness: 0.05, metalness: 1 }));
  mirror.position.set(-9.0, 1.62 + Y, 14.68); mirror.rotation.y = Math.PI; scene.add(mirror);
  // cold fireplace
  box(E, { x: -13.0, y: 0.85 + Y, z: 4.32, w: 1.9, h: 1.7, d: 0.32, mat: M.marble, collider: false });
  // bedside diary — the 1897 flight
  readable(E, { x: -15.5, z: 12.6, y: Y, r: 1.6, prompt: () => 'Her diary, final entry:\n"The dolls sang tonight. We left at dawn and did not stop until the sea.\nIf you are reading this, do not let the house learn your name."', onRead: () => E.hooks && E.hooks.onClue('diary') });
  // portrait with a hidden compartment
  portrait(E, { x: -9.0, y: 2.3 + Y, z: 4.73, ry: 0, size: 1.0 });
  readable(E, { x: -9.0, z: 5.2, y: Y, r: 1.8, prompt: () => 'The portrait swings on a hidden hinge. Behind it:\n"There is a third keeper, the one history will not name."', onRead: () => E.hooks && E.hooks.onClue('portraitCompartment') });

  // ============ GUEST BEDROOM (front-east) ============
  const gx = 15.5, gz = 11.2;
  box(E, { x: gx, y: 0.32 + Y, z: gz, w: 2.0, h: 0.42, d: 3.0, mat: woodDark, castShadow: true });
  E.colliders.push({ minX: gx - 1.05, maxX: gx + 1.05, minZ: gz - 1.6, maxZ: gz + 1.6, top: Y + 0.55 });
  box(E, { x: gx, y: 0.56 + Y, z: gz, w: 1.8, h: 0.2, d: 2.8, mat: linen, collider: false });
  box(E, { x: gx, y: 0.72 + Y, z: gz - 1.1, w: 1.6, h: 0.18, d: 0.5, mat: velvet, collider: false });
  // locked trunk
  box(E, { x: 19.6, y: 0.42 + Y, z: 13.6, w: 1.15, h: 0.72, d: 0.62, mat: woodMid });
  readable(E, { x: 19.4, z: 13.6, y: Y, r: 1.8, prompt: () => 'A steamer trunk, bound in iron. The lock plate is stamped with a top hat\nand the words THEATRE ROYAL. It will not open. It was never meant to.', onRead: () => E.hooks && E.hooks.onClue('lockedTrunk') });
  // broken music box on the dresser
  cyl(E, { x: 9.0, y: 0.92 + Y, z: 13.9, rTop: 0.16, rBottom: 0.16, h: 0.1, mat: new THREE.MeshStandardMaterial({ color: 0x5a4a28, roughness: 0.4, metalness: 0.7 }), seg: 10, collider: false });
  readable(E, { x: 9.0, z: 13.7, y: Y, r: 1.8, prompt: () => 'The music box springs loose the moment you touch it —\nthree perfect notes of a waltz, then the mechanism seizes.\n\nSomewhere else in the house, something answered.', onRead: () => { audio.musicBox(); E.hooks && E.hooks.onClue('musicBox'); } });

  // ============ CHILDREN'S ROOM ============
  const cx1 = 9.6, cx2 = 12.6, cz = 5.0;
  for (const bx of [cx1, cx2]) {
    box(E, { x: bx, y: 0.26 + Y, z: cz, w: 1.15, h: 0.34, d: 2.1, mat: woodMid, collider: true });
    box(E, { x: bx, y: 0.47 + Y, z: cz, w: 1.0, h: 0.16, d: 1.95, mat: new THREE.MeshStandardMaterial({ color: 0x86786a, roughness: 1 }), collider: false });
  }
  // toy chest + scattered toys
  box(E, { x: 17.6, y: 0.32 + Y, z: -0.6, w: 1.35, h: 0.55, d: 0.75, mat: woodDark });
  const toyBall = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 10), new THREE.MeshStandardMaterial({ color: 0x6a2a2a, roughness: 0.6 }));
  toyBall.position.set(16.6, Y + 0.17, 1.2); scene.add(toyBall);
  const toyHorse = box(E, { x: 8.2, y: 0.24 + Y, z: -0.9, w: 0.5, h: 0.32, d: 0.22, mat: woodMid, collider: false });
  toyHorse.rotation.y = 0.7;
  // drawings on the wall — three figures around a fourth, empty one
  const drawTex = makeChildDrawing();
  const drawing = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.85), new THREE.MeshStandardMaterial({ map: drawTex, roughness: 0.95 }));
  drawing.position.set(14.6, Y + 1.9, 6.77); drawing.rotation.y = Math.PI; scene.add(drawing);
  readable(E, { x: 14.6, z: 6.4, y: Y, r: 1.9, prompt: () => 'Crayon on salvaged wallpaper: three figures in tall hoods,\nholding hands around a fourth — drawn as an empty oval.\n\nUnderneath, in a child\'s hand: "the one with no face lives under the stairs."', onRead: () => E.hooks && E.hooks.onClue('childDrawing') });
  // the dollhouse — a perfect miniature of the mansion
  const dh = new THREE.Group();
  const dhBase = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.9, 1.0), woodDark); dhBase.position.y = 0.72; dh.add(dhBase);
  const dhRoof = new THREE.Mesh(new THREE.ConeGeometry(0.85, 0.55, 4), puppetCloth); dhRoof.position.y = 1.42; dhRoof.rotation.y = Math.PI / 4; dh.add(dhRoof);
  const dhTower = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.62, 0.34), woodDark); dhTower.position.set(0, 1.62, -0.1); dh.add(dhTower);
  const dhTowerRoof = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.42, 4), puppetCloth); dhTowerRoof.position.set(0, 2.1, -0.1); dhTowerRoof.rotation.y = Math.PI / 4; dh.add(dhTowerRoof);
  const dhWindow = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.12), new THREE.MeshBasicMaterial({ color: 0x59ff9c, fog: false }));
  dhWindow.position.set(0.35, 0.75, 0.51); dh.add(dhWindow);
  dh.position.set(8.4, Y + 0.28, 5.3);
  dh.rotation.y = -0.35;
  scene.add(dh);
  const dhTable = box(E, { x: 8.4, y: 0.15 + Y, z: 5.3, w: 1.7, h: 0.3, d: 1.2, mat: woodDark, collider: true });
  readable(E, { x: 8.4, z: 5.3, y: Y, r: 1.9, prompt: () => 'The dollhouse is exact. Every gable. Every stair. The little tower\ndoor is open — and the tiny bed in the tower room is warm.\n\nOne miniature chair has been placed facing the wall.', onRead: () => E.hooks && E.hooks.onClue('dollhouse') });
  // crawlspace hatch, dragged under a rug
  const rug = box(E, { x: 18.9, y: 0.035 + Y, z: 3.2, w: 2.3, h: 0.05, d: 1.5, mat: new THREE.MeshStandardMaterial({ color: 0x2c1a1a, roughness: 1 }), collider: false });
  rug.rotation.y = 0.22;
  readable(E, { x: 18.9, z: 3.2, y: Y, r: 1.7, prompt: () => 'The rug hides a crawlspace hatch into the west wing.\nIt has been nailed shut. The nails are new.', onRead: () => E.hooks && E.hooks.onClue('crawlspace') });

  // ============ WEST WING — MORVEX TERRITORY ============
  // --- Puppet Gallery ---
  const galleryY = Y;
  // six marionettes suspended mid-air
  const pupSpots = [
    [-17.5, -3.2, 0.4], [-15.2, -1.2, 2.1], [-12.8, -4.4, 1.2],
    [-10.4, -2.0, -0.8], [-8.3, -5.1, 2.8], [-14.2, -0.2, -1.9],
  ];
  for (const [px, pz, face] of pupSpots) {
    marionette(E, { x: px, z: pz, yTop: galleryY + 3.6, mats: puppetMats, facing: face, scale: 0.9 + (Math.sin(px * 7.1) * 0.5 + 0.5) * 0.35 });
  }
  readable(E, { x: -14.0, z: -2.5, y: Y, r: 2.6, prompt: () => 'Six marionettes hang at eye level —\ncut from nothing, strung with nothing,\nfacing nothing.\n\nTheir shadows are arranged differently from their bodies.', onRead: () => E.hooks && E.hooks.onClue('marionettes') });
  // puppet gallery workbench
  box(E, { x: -19.7, y: 0.82 + Y, z: 1.8, w: 1.3, h: 0.08, d: 3.2, mat: woodMid, collider: false });
  E.colliders.push({ minX: -20.4, maxX: -19.05, minZ: 0.2, maxZ: 3.4, top: Y + 0.9 });

  // --- Doll Workshop ---
  // worktable with doll parts
  box(E, { x: -17.4, y: 0.78 + Y, z: -10.6, w: 2.6, h: 0.09, d: 1.35, mat: woodMid, castShadow: true });
  E.colliders.push({ minX: -18.8, maxX: -16.0, minZ: -11.3, maxZ: -9.9, top: Y + 0.88 });
  for (const [dx, dz, r] of [[-0.8, 0.3, 0.09], [0.2, -0.35, 0.07], [0.75, 0.25, 0.08], [-0.15, 0.42, 0.05]]) {
    const part = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), puppetWood);
    part.position.set(-17.4 + dx, Y + 0.88, -10.6 + dz); scene.add(part);
  }
  // spare limbs in a crate
  box(E, { x: -14.6, y: 0.35 + Y, z: -13.2, w: 1.0, h: 0.65, d: 0.8, mat: woodDark, collider: true });
  // locked cabinet
  box(E, { x: -20.1, y: 1.15 + Y, z: -9.0, w: 0.75, h: 2.0, d: 1.35, mat: new THREE.MeshStandardMaterial({ color: 0x1f2228, roughness: 0.4, metalness: 0.75 }) });
  readable(E, { x: -19.6, z: -9.0, y: Y, r: 1.8, prompt: () => 'A flat-file cabinet, locked. Through the seam you can see:\nrows of glass eyes, sorted by colour. Blue. Brown. Grey. None of them blink.', onRead: () => E.hooks && E.hooks.onClue('eyeCabinet') });
  // strings sway — the SEAL waits on the far table
  const sealG = sealPickup(E, { x: -18.6, y: Y + 0.98, z: -13.4, tex: T.symKnot, colorName: 'knot' });
  E.addInteractable({
    object: sealG, radius: 2.0,
    prompt: () => 'THE MARIONETTE KNOT\nSecond Seal of the manor',
    enabled: () => nearXZ(E, -18.6, -13.4, 2.0) && Math.abs(E.camera.position.y - Y) < 2.6,
    onInteract: () => collectSeal(E, 'knot', sealG, 'THE MARIONETTE KNOT', 'Morvex — Keeper of the Workshop (West Wing)'),
  });

  // --- Music Room ---
  // upright piano
  box(E, { x: -8.3, y: 0.78 + Y, z: -13.6, w: 2.0, h: 1.35, d: 0.75, mat: woodDark, castShadow: true });
  E.colliders.push({ minX: -9.4, maxX: -7.2, minZ: -14.05, maxZ: -13.15, top: Y + 1.5 });
  const keysTex = makePianoKeys();
  const keys = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 0.22), new THREE.MeshBasicMaterial({ map: keysTex }));
  keys.position.set(-8.3, Y + 1.06, -13.21); scene.add(keys);
  box(E, { x: -8.3, y: 0.26 + Y, z: -12.15, w: 1.25, h: 0.1, d: 0.4, mat: woodMid, collider: false });
  for (const lx of [-8.75, -7.85]) box(E, { x: lx, y: 0.1 + Y, z: -12.15, w: 0.07, h: 0.34, d: 0.34, mat: woodMid, collider: false });
  readable(E, { x: -8.3, z: -12.6, y: Y, r: 2.0, prompt: () => 'The piano is in tune. That is impossible.\nThe keys depress under no weight, and play:\n\nthree notes — the music-box phrase, only slower, and sadder.', onRead: () => { audio.musicBox(); E.hooks && E.hooks.onClue('piano'); } });
  // music cylinders on a side table
  for (let i = 0; i < 4; i++) cyl(E, { x: -11.8, y: 0.78 + Y, z: -13.4 + i * 0.32, rTop: 0.055, rBottom: 0.055, h: 0.55, mat: china, seg: 8, collider: false }).rotation.z = Math.PI / 2;

  // ============ EAST WING — VORAK TERRITORY ============
  // --- Spirit Archive ---
  // shelves of jars along the east wall
  for (let i = 0; i < 3; i++) box(E, { x: 20.15, y: 1.05 + i * 0.95 + Y, z: -5.1, w: 0.45, h: 0.08, d: 4.6, mat: woodDark, collider: false });
  const jarGreen = new THREE.MeshStandardMaterial({ color: 0x2a4a38, roughness: 0.15, emissive: 0x1a5a34, emissiveIntensity: 0.9 });
  const jarGrey = new THREE.MeshStandardMaterial({ color: 0x3c4148, roughness: 0.3 });
  for (let i = 0; i < 12; i++) {
    const glowing = i === 2 || i === 9;
    cyl(E, { x: 20.1, y: 1.28 + Math.floor(i / 4) * 0.95 + Y, z: -7.0 + (i % 4) * 1.28, rTop: 0.12, rBottom: 0.12, h: 0.4, mat: glowing ? jarGreen : jarGrey, seg: 8, collider: false });
  }
  box(E, { x: 20.15, y: 1.5 + Y, z: -5.1, w: 0.5, h: 2.6, d: 4.7, mat: woodDark, collider: false });
  // glass specimen cases
  for (const [caseX, caseZ] of [[8.6, -6.8], [11.4, -6.8]]) {
    const glassCase = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.5, 0.8), new THREE.MeshStandardMaterial({ color: 0x9fc4cc, transparent: true, opacity: 0.28, roughness: 0.08, metalness: 0.3 }));
    glassCase.position.set(caseX, Y + 1.35, caseZ); scene.add(glassCase);
    box(E, { x: caseX, y: 0.62 + Y, z: caseZ, w: 1.25, h: 1.1, d: 0.9, mat: woodDark, collider: true });
    const specimen = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.7, 6), new THREE.MeshStandardMaterial({ color: 0x151312, roughness: 0.9 }));
    specimen.position.set(caseX, Y + 1.15, caseZ); scene.add(specimen);
  }
  // spectral spiral diagram, large, over the archive door lintel
  E.addSymbol({ tex: T.symSpiral, x: 13.0, y: Y + 2.9, z: -2.36, ry: Math.PI, size: 1.6, opacity: 0.55 });
  // the archivist's candle
  candleGlow(E, { x: 13.0, y: Y + 1.28, z: -4.6, scale: 0.5, color: 0x9fd8c8 });
  box(E, { x: 13.0, y: Y + 0.46, z: -4.6, w: 1.15, h: 0.82, d: 0.85, mat: woodDark });
  readable(E, { x: 13.0, z: -4.6, y: Y, r: 2.0, prompt: () => 'Journals bound in grey linen. Every entry is the same account,\ncopied out over and over by different hands across two centuries:\n\n"The guardians were protectors, not monsters. What slept under the tower, we did not free. We contained it."', onRead: () => E.hooks && E.hooks.onClue('archiveJournals') });

  // --- Séance Room ---
  const sx = 9.5, sz = -11.4;
  cyl(E, { x: sx, y: 0.74 + Y, z: sz, rTop: 1.35, rBottom: 1.15, h: 0.12, mat: woodDark, seg: 18 });
  E.colliders.push({ minX: sx - 1.3, maxX: sx + 1.3, minZ: sz - 1.3, maxZ: sz + 1.3, top: Y + 0.85 });
  cyl(E, { x: sx, y: 0.38 + Y, z: sz, rTop: 0.22, rBottom: 0.34, h: 0.7, mat: woodDark, seg: 10, collider: false });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    candleGlow(E, { x: sx + Math.cos(a) * 0.85, y: Y + 1.0, z: sz + Math.sin(a) * 0.85, scale: 0.36, color: 0x8fffb0 });
  }
  // covered mirrors — three of them
  for (const mx of [6.4, 9.4, 12.4]) {
    box(E, { x: mx, y: 1.6 + Y, z: -14.68, w: 1.0, h: 1.75, d: 0.15, mat: woodDark, collider: false });
    const sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 1.6), new THREE.MeshStandardMaterial({ color: 0x26262e, roughness: 1 }));
    sheet.position.set(mx, Y + 1.6, -14.58); scene.add(sheet);
  }
  // the floor pattern
  const floorSpiral = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), new THREE.MeshBasicMaterial({ map: T.symSpiral, transparent: true, opacity: 0.85, depthWrite: false, fog: false }));
  floorSpiral.rotation.x = -Math.PI / 2; floorSpiral.position.set(sx, Y + 0.05, sz); scene.add(floorSpiral);
  // the SEAL waits in the centre of the table
  const sealS = sealPickup(E, { x: sx, y: Y + 0.94, z: sz, tex: T.symSpiral, colorName: 'spiral' });
  E.addInteractable({
    object: sealS, radius: 2.0,
    prompt: () => 'THE SOUL SPIRAL\nFirst Seal of the manor',
    enabled: () => nearXZ(E, sx, sz, 2.0) && Math.abs(E.camera.position.y - Y) < 2.4,
    onInteract: () => collectSeal(E, 'spiral', sealS, 'THE SOUL SPIRAL', 'Vorak — Keeper of the Archive (East Wing)'),
  });

  // --- Cold Chamber ---
  // frost on every wall
  for (const [fx, fz, fry, fw] of [[13.4, -14.7, 0, 6.5], [20.4, -11.3, Math.PI / 2, 5.6], [13.4, -8.35, Math.PI, 6.5]]) {
    const frost = new THREE.Mesh(new THREE.PlaneGeometry(fw, 2.6), frostMat);
    frost.position.set(fx, Y + 1.3, fz); frost.rotation.y = fry; scene.add(frost);
  }
  // ice stalactites
  for (let i = 0; i < 8; i++) {
    const ice = new THREE.Mesh(new THREE.ConeGeometry(0.09 + (i % 3) * 0.05, 0.5 + (i % 4) * 0.3, 6), new THREE.MeshStandardMaterial({ color: 0xd8ecf2, transparent: true, opacity: 0.85, roughness: 0.15 }));
    ice.rotation.x = Math.PI;
    ice.position.set(13.8 + Math.sin(i * 12.9) * 2.9, Y + 3.6 - (0.5 + (i % 4) * 0.3) / 2, -11.5 + Math.cos(i * 7.7) * 2.6);
    scene.add(ice);
  }
  // the sealed cabinet — frost-grown shut
  box(E, { x: 17.2, y: 1.0 + Y, z: -8.5, w: 1.5, h: 1.9, d: 0.55, mat: M.iron, collider: true });
  readable(E, { x: 17.2, z: -8.3, y: Y, r: 1.9, prompt: () => 'Frost has grown over the cabinet lock like a second door.\nInside — you can see one shape, coiled, patient.\n\nYou decide, very sensibly, to leave it there.', onRead: () => E.hooks && E.hooks.onClue('frostCabinet') });

  // ============ SERVICE PASSAGE (PRD 7.7) ============
  // fallen shelf blocking the shortcut — squeeze gap on the south side
  box(E, { x: -1.2, y: 0.75 + Y, z: -4.0, w: 2.6, h: 1.5, d: 0.9, mat: woodDark, castShadow: true });
  box(E, { x: 0.6, y: 0.35 + Y, z: -4.15, w: 1.1, h: 0.6, d: 0.7, mat: woodMid, collider: true });
  E.colliders.push({ minX: -2.6, maxX: 0.1, minZ: -4.5, maxZ: -3.5, top: Y + 1.5 });
  cobweb(E, { x: -5.5, y: Y + 3.3, z: -3.0, ry: 0.6, size: 1.4 });
  cobweb(E, { x: 5.4, y: Y + 3.4, z: -5.0, ry: -0.8, size: 1.2 });
  // first scratch of the Unknown Mark — faint, almost dismissible
  E.addSymbol({ tex: T.symUnknown, x: 3.4, y: Y + 1.5, z: -5.79, ry: 0, size: 0.7, opacity: 0.38 });
  readable(E, { x: 3.4, z: -5.6, y: Y, r: 1.7, prompt: () => 'Scratched into the plaster by something with no fingernails:\nan incomplete circle with a missing centre.', onRead: () => E.hooks && E.hooks.onClue('unknownMark1') });
}

// ---------- piano keys ----------
function makePianoKeys() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 72;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#e8e4d8'; ctx.fillRect(0, 0, 512, 72);
  ctx.fillStyle = '#111';
  const whiteW = 512 / 24;
  const blackPattern = [0, 1, 3, 4, 5, 7, 8, 10, 12, 13, 15, 16, 17, 19, 20, 22];
  for (let i = 0; i < 24; i++) {
    ctx.fillRect(i * whiteW - 1, 0, 2, 72);
  }
  for (const i of blackPattern) {
    if (i >= 23) continue;
    ctx.fillRect((i + 1) * whiteW - whiteW * 0.31, 0, whiteW * 0.62, 44);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------- child's crayon drawing ----------
function makeChildDrawing() {
  const c = document.createElement('canvas');
  c.width = 228; c.height = 168;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#d8cfb4'; ctx.fillRect(0, 0, 228, 168);
  ctx.strokeStyle = '#2a2a33'; ctx.lineWidth = 3;
  // three hooded figures
  const figures = [[52, 96], [114, 82], [176, 96]];
  for (const [fx, fy] of figures) {
    ctx.beginPath(); ctx.moveTo(fx, fy - 52); ctx.lineTo(fx - 22, fy); ctx.lineTo(fx + 22, fy); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(fx, fy - 30, 9, 0, 7); ctx.stroke();
  }
  // fourth — the empty oval
  ctx.setLineDash([6, 5]);
  ctx.beginPath(); ctx.ellipse(114, 140, 16, 24, 0, 0, 7); ctx.stroke();
  ctx.setLineDash([]);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------- seal collection (shared) ----------
export function collectSeal(E, key, group, title, keeper) {
  if (E.flags['seal_' + key]) return;
  E.flags['seal_' + key] = true;
  E.flags.seals = (E.flags.seals || 0) + 1;
  // remove the pickup from the world
  E.scene.remove(group);
  audio.sealChime();
  // ignite the corresponding recess in the grand hall
  if (E.sealRecess && E.sealRecess[key]) {
    const m = E.sealRecess[key];
    m.material.emissive = new THREE.Color(key === 'spiral' ? 0x1d7a45 : key === 'knot' ? 0x7a5015 : 0x4a2a7a);
    m.material.emissiveIntensity = 1.4;
    m.material.color = new THREE.Color(0x111318);
  }
  if (E.hooks) {
    E.hooks.onSeal(key, title, keeper, E.flags.seals);
    E.hooks.onClue('seal_' + key);
  }
}
