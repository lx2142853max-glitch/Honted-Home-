// ============================================================
// PROPS — ATTIC (y=8.4) · TOWER (bell chamber y=12.6 · sanctum y=16.8)
//         Family Archive · Taxidermy · Observation · Forbidden Study
//         · Tower antechamber (PRD §8, §10)
// ============================================================
import * as THREE from 'three';
import { FLOOR } from './engine.js';
import { audio } from './audio.js';
import { nearXZ, box, cyl, readable, portrait, candleGlow, cobweb, sealPickup } from './props_common.js';
import { makeSlider } from './doors.js';
import { collectSeal } from './props_floor1.js';

export function buildAtticProps(E, M) {
  const T = E.textures;
  const scene = E.scene;
  const Y = FLOOR.F2;

  const woodDark = new THREE.MeshStandardMaterial({ color: 0x241a12, roughness: 0.8 });
  const woodMid = new THREE.MeshStandardMaterial({ map: T.wood, roughness: 0.82, color: 0x9a8264 });
  const brass = new THREE.MeshStandardMaterial({ color: 0x8a6f3a, roughness: 0.3, metalness: 0.9 });
  const waxRed = new THREE.MeshStandardMaterial({ color: 0x5a1414, roughness: 0.35 });
  const parchment = new THREE.MeshStandardMaterial({ color: 0xcfc2a0, roughness: 0.95 });

  // ============ ATTIC LANDING ============
  box(E, { x: -4.6, y: 0.42 + Y, z: 12.6, w: 0.95, h: 0.72, d: 0.72, mat: woodMid, collider: true });
  box(E, { x: -3.3, y: 0.32 + Y, z: 12.2, w: 0.72, h: 0.55, d: 0.6, mat: woodDark, collider: true });
  box(E, { x: 4.6, y: 0.5 + Y, z: 14.0, w: 1.3, h: 0.9, d: 0.62, mat: woodDark, collider: true });
  // low beams
  for (const bz of [3, 7, 11]) box(E, { x: 0, y: 3.55 + Y, z: bz, w: 12, h: 0.3, d: 0.34, mat: woodDark, collider: false });

  // ============ FAMILY ARCHIVE ============
  // desk + ledger stacks
  box(E, { x: -15.6, y: 0.74 + Y, z: 9.2, w: 2.5, h: 0.09, d: 1.15, mat: woodDark, castShadow: true });
  E.colliders.push({ minX: -16.9, maxX: -14.3, minZ: 8.6, maxZ: 9.8, top: Y + 0.85 });
  for (let i = 0; i < 5; i++) {
    box(E, { x: -16.4 + i * 0.42, y: 0.88 + Y + (i % 2) * 0.1, z: 9.0 + (i % 3) * 0.3, w: 0.34, h: 0.14 + (i % 2) * 0.1, d: 0.26, mat: i % 2 ? waxRed : woodDark, collider: false });
  }
  // the family tree chart
  const treeTex = makeFamilyTree();
  const tree = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 1.55), new THREE.MeshStandardMaterial({ map: treeTex, roughness: 0.92 }));
  tree.position.set(-13.2, Y + 2.3, 14.72); tree.rotation.y = Math.PI; scene.add(tree);
  readable(E, { x: -13.2, z: 14.3, y: Y, r: 2.0, prompt: () => 'The Vellacott line: protectors, all of them, for nine generations —\nthen the branch snaps at 1897: E., M. and G. — the three keepers.\nBeneath their names, a fourth space, scraped clean.', onRead: () => E.hooks && E.hooks.onClue('familyTree') });
  // coded page
  readable(E, { x: -15.6, z: 9.2, y: Y, r: 1.7, prompt: () => 'A coded page. You work it out letter by letter:\n\n"The seals are not keys. They are NAMES. Speak all three at the tower door\nand the house must answer. The fourth name, we never learned."', onRead: () => E.hooks && E.hooks.onClue('codedPage') });
  // shelf of sealed documents
  for (let i = 0; i < 3; i++) box(E, { x: -20.15, y: 1.0 + i * 1.05 + Y, z: 8.0, w: 0.5, h: 0.08, d: 4.4, mat: woodDark, collider: false });
  for (let i = 0; i < 6; i++) box(E, { x: -20.1, y: 1.22 + Math.floor(i / 2) * 1.05 + Y, z: 6.6 + (i % 2) * 2.6 + (i % 3) * 0.4, w: 0.34, h: 0.4, d: 0.26, mat: parchment, collider: false });
  candleGlow(E, { x: -15.6, y: Y + 1.06, z: 8.75, scale: 0.42 });

  // ============ TAXIDERMY / DISPLAY ROOM ============
  // three covered cases
  const caseGlass = new THREE.MeshStandardMaterial({ color: 0xa8c4cc, transparent: true, opacity: 0.25, roughness: 0.06, metalness: 0.35 });
  const beastM = new THREE.MeshStandardMaterial({ color: 0x191512, roughness: 0.85 });
  const caseSpots = [[9.2, 11.6], [13.4, 11.6], [17.6, 11.6]];
  for (let i = 0; i < caseSpots.length; i++) {
    const [dxx, dzz] = caseSpots[i];
    box(E, { x: dxx, y: 0.62 + Y, z: dzz, w: 1.35, h: 1.14, d: 1.0, mat: woodDark, collider: true });
    const gl = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.85, 0.85), caseGlass);
    gl.position.set(dxx, Y + 1.6, dzz); scene.add(gl);
    if (i < 2) {
      const beast = new THREE.Group();
      const body = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.75, 7), beastM);
      body.rotation.z = Math.PI / 2.4; body.position.y = 1.45; beast.add(body);
      const head = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.3, 6), beastM);
      head.position.set(0.34, 1.62, 0); head.rotation.z = -0.9; beast.add(head);
      beast.position.set(dxx, Y, dzz);
      scene.add(beast);
    } else {
      // the EMPTY case — fresh dust outline
      const outline = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.24, 14), new THREE.MeshBasicMaterial({ color: 0x6a6250, transparent: true, opacity: 0.75, depthWrite: false }));
      outline.rotation.x = -Math.PI / 2;
      outline.position.set(dxx, Y + 1.19, dzz);
      scene.add(outline);
      readable(E, { x: dxx, z: dzz, y: Y, r: 1.8, prompt: () => 'The third case is empty — but the dust inside holds a fresh outline,\nas if whatever it held stood up and left recently. The label beneath it\nreads only: "THE VISITOR. DO NOT FEED. DO NOT NAME."', onRead: () => E.hooks && E.hooks.onClue('emptyCase') });
    }
  }
  // trophies on the wall
  for (let i = 0; i < 4; i++) {
    const tx = 9.4 + i * 2.9;
    box(E, { x: tx, y: 2.5 + Y, z: 14.66, w: 0.62, h: 0.4, d: 0.22, mat: woodDark, collider: false });
    for (const s of [-1, 1]) {
      const antler = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.52, 5), new THREE.MeshStandardMaterial({ color: 0xcabb98, roughness: 0.7 }));
      antler.position.set(tx + s * 0.18, 2.82 + Y, 14.55); antler.rotation.z = s * 0.5; scene.add(antler);
    }
  }

  // ============ OBSERVATION ROOM ============
  // brass telescope — it will not turn toward the house
  const scope = new THREE.Group();
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.17, 1.7, 12), brass);
  tube.rotation.x = Math.PI / 3.1; tube.position.y = 1.55; scope.add(tube);
  const eye = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.24, 10), woodDark);
  eye.rotation.x = Math.PI / 3.1; eye.position.set(0, 1.13, 0.62); scope.add(eye);
  const tripodMat = woodDark;
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.35, 6), tripodMat);
    leg.position.set(Math.cos(a) * 0.4, 0.67, Math.sin(a) * 0.4);
    leg.rotation.z = Math.cos(a) * 0.38; leg.rotation.x = -Math.sin(a) * 0.38;
    scope.add(leg);
  }
  scope.position.set(12.4, Y, -11.6);
  scene.add(scope);
  E.colliders.push({ minX: 11.7, maxX: 13.1, minZ: -12.3, maxZ: -10.9, top: Y + 1.7 });
  readable(E, { x: 12.4, z: -11.2, y: Y, r: 2.1, prompt: () => 'The telescope is fixed on the northern woods —\nit does not turn toward the manor, and the mount is rusted solid.\n\nBeside it, a brass plate: "ALIGN — SPIRAL · KNOT · CROWN — AND THE OLD WAY OPENS."', onRead: () => E.hooks && E.hooks.onClue('telescope') });
  // star charts
  const chartTex = makeStarChart();
  const chart = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.35), new THREE.MeshStandardMaterial({ map: chartTex, roughness: 0.9 }));
  chart.position.set(17.6, Y + 2.3, -14.72); scene.add(chart);
  // gear table
  cyl(E, { x: 8.3, y: 0.72 + Y, z: -11.8, rTop: 0.55, rBottom: 0.42, h: 0.1, mat: brass, seg: 14, collider: false });
  cyl(E, { x: 8.3, y: 0.36 + Y, z: -11.8, rTop: 0.14, rBottom: 0.22, h: 0.68, mat: woodDark, seg: 10, collider: false });

  // ============ FORBIDDEN STUDY ============
  // desk with sealed, black-bound books
  box(E, { x: -13.3, y: 0.74 + Y, z: -10.2, w: 2.5, h: 0.1, d: 1.2, mat: woodDark, castShadow: true });
  E.colliders.push({ minX: -14.6, maxX: -12.0, minZ: -10.85, maxZ: -9.55, top: Y + 0.85 });
  const sealedBook = new THREE.MeshStandardMaterial({ color: 0x16161c, roughness: 0.32 });
  const sealedBook2 = new THREE.MeshStandardMaterial({ color: 0x241016, roughness: 0.32 });
  for (let i = 0; i < 6; i++) box(E, { x: -14.3 + i * 0.36, y: 0.86 + Y + (i % 3) * 0.09, z: -10.3 + (i % 2) * 0.4, w: 0.3, h: 0.1 + (i % 3) * 0.09, d: 0.24, mat: i % 2 ? sealedBook : sealedBook2, collider: false });
  // the Broken Crown waits on a lectern
  const lectern = box(E, { x: -10.4, y: 0.55 + Y, z: -12.9, w: 0.6, h: 1.1, d: 0.6, mat: woodDark, collider: true });
  lectern.rotation.y = 0.35;
  const sealC = sealPickup(E, { x: -10.4, y: Y + 1.24, z: -12.9, tex: T.symCrown, colorName: 'crown' });
  E.addInteractable({
    object: sealC, radius: 2.0,
    prompt: () => 'THE BROKEN CROWN\nThird Seal of the manor',
    enabled: () => nearXZ(E, -10.4, -12.9, 2.0) && Math.abs(E.camera.position.y - Y) < 2.4,
    onInteract: () => collectSeal(E, 'crown', sealC, 'THE BROKEN CROWN', 'Grimthor — Keeper of the Tower (Centre)'),
  });
  // the wall of symbols — spiral, knot, crown, crest · and a space left for a fifth
  const wallSymbols = [
    [T.symSpiral, -16.8, 2.45, 0.75], [T.symKnot, -14.6, 2.45, 0.75], [T.symCrown, -12.4, 2.45, 0.75], [T.symCrest, -10.2, 2.45, 0.75],
  ];
  for (const [tex, wx, wy, ws] of wallSymbols)
    E.addSymbol({ tex, x: wx, y: Y + wy, z: -14.6, ry: 0, size: ws, opacity: 0.9 });
  const emptyFrame = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.36, 4), new THREE.MeshBasicMaterial({ color: 0x554e42, transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
  emptyFrame.position.set(-8.0, Y + 2.45, -14.6); emptyFrame.rotation.z = Math.PI / 4; scene.add(emptyFrame);
  readable(E, { x: -12.4, z: -14.2, y: Y, r: 2.1, prompt: () => 'Four emblems in a row — and a fifth frame, empty,\ncut into the stone itself. Beneath the empty frame,\nin letters too small to have been meant for you:\n\n"THE FIFTH IS OURS TO WEAR."', onRead: () => E.hooks && E.hooks.onClue('symbolWall') });
  // FALSE BOOKSHELF — hides the Guardian Pendant
  makeSlider(E, {
    x: -19.6, y: 0.9 + Y, z: -12.6, w: 1.6, h: 2.8, t: 0.62,
    mat: woodDark, axis: 'z', slideTo: 1.75,
    name: 'A shelf set a finger too proud of the wall',
    reveals: 'The shelf has swung aside.\nSomething gold waits in the dark.',
  });
  const pendant = new THREE.Group();
  const pChain = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.022, 6, 16), brass); pendant.add(pChain);
  const pDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 16), new THREE.MeshStandardMaterial({ color: 0xa8842f, roughness: 0.25, metalness: 1, emissive: 0x684f10, emissiveIntensity: 0.75 }));
  pDisc.rotation.x = Math.PI / 2; pDisc.position.y = -0.28; pendant.add(pDisc);
  pendant.position.set(-19.6, Y + 1.55, -12.6);
  scene.add(pendant);
  E.tick.push((dt, t) => { pendant.rotation.y = t * 0.9; });
  E.addInteractable({
    object: pendant, radius: 1.9,
    prompt: () => 'The Guardian Pendant\nIt is warm. It has been waiting.',
    enabled: () => nearXZ(E, -19.6, -12.6, 1.9) && Math.abs(E.camera.position.y - Y) < 2.4,
    onInteract: () => {
      if (E.flags.pendant) return;
      E.flags.pendant = true;
      scene.remove(pendant);
      audio.sealChime();
      if (E.hooks) { E.hooks.onPendant(); E.hooks.onClue('pendant'); }
    },
  });
  candleGlow(E, { x: -13.3, y: Y + 1.02, z: -9.75, scale: 0.38 });

  // ============ TOWER ANTECHAMBER ============
  box(E, { x: -4.6, y: 0.4 + Y, z: -4.2, w: 1.0, h: 0.75, d: 0.65, mat: woodDark, collider: true });
  box(E, { x: 4.5, y: 0.36 + Y, z: -4.6, w: 0.85, h: 0.68, d: 0.6, mat: woodMid, collider: true });
  // coil of rope
  const rope = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.14, 7, 16), new THREE.MeshStandardMaterial({ color: 0x6a5a3a, roughness: 1 }));
  rope.rotation.x = Math.PI / 2; rope.position.set(-4.55, Y + 0.82, -4.2); scene.add(rope);
  cobweb(E, { x: 2.2, y: Y + 3.5, z: -7.6, ry: 0.3, size: 1.1 });

  // ============ BELL CHAMBER (y=12.6) ============
  const BY = 12.6;
  // support beam
  box(E, { x: 0, y: 16.15, z: -11.5, w: 6.0, h: 0.34, d: 0.4, mat: woodDark, collider: false, castShadow: true });
  // the great cracked bell
  const bellPts = [];
  const profile = [[0.02, 0], [0.52, 0.0], [0.62, 0.18], [0.55, 0.62], [0.38, 1.08], [0.2, 1.38], [0.09, 1.52]];
  for (const [px, py] of profile) bellPts.push(new THREE.Vector2(px, py));
  const bell = new THREE.Mesh(new THREE.LatheGeometry(bellPts, 18), new THREE.MeshStandardMaterial({ color: 0x4a3f22, roughness: 0.4, metalness: 0.85 }));
  bell.position.set(0, 14.6, -11.5);
  bell.castShadow = true;
  scene.add(bell);
  // crack
  const crack = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 1.3), new THREE.MeshBasicMaterial({ color: 0x050505 }));
  crack.position.set(0.4, 15.25, -10.98); crack.rotation.y = 0.35; crack.rotation.z = 0.18; scene.add(crack);
  // the cut rope — hangs limp
  cyl(E, { x: 0, y: 13.6, z: -11.5, rTop: 0.035, rBottom: 0.035, h: 2.1, mat: new THREE.MeshStandardMaterial({ color: 0x6a5a3a, roughness: 1 }), seg: 6, collider: false });
  readable(E, { x: 0, z: -11.5, y: BY, r: 1.8, prompt: () => 'The bell rope is cut clean through. The bell has not sounded since 1897.\nThe fibres are fresh at the cut. Someone wanted the bell silent — and someone else wants it rung.', onRead: () => E.hooks && E.hooks.onClue('bellRope') });
  // the rotating alignment mechanism
  const mech = new THREE.Group();
  const mRing = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.09, 8, 22), brass); mRing.rotation.x = Math.PI / 2; mech.add(mRing);
  for (let i = 0; i < 3; i++) {
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.07, 0.09), brass);
    spoke.rotation.y = (i / 3) * Math.PI;
    mech.add(spoke);
  }
  mech.position.set(0, BY + 0.06, -9.6);
  scene.add(mech);
  E.tick.push((dt) => { mech.rotation.y += dt * 0.12; });

  // ============ SANCTUM (y=16.8) ============
  const SY = 16.8;
  // circular stone table
  cyl(E, { x: 0, y: SY + 0.5, z: -11.5, rTop: 1.08, rBottom: 0.85, h: 1.0, mat: M.marble, seg: 18, collider: true, top: SY + 1.0 });
  // three Seal holders around it
  const holderMat = new THREE.MeshStandardMaterial({ color: 0x2c2c34, roughness: 0.4, metalness: 0.85 });
  const holderGlow = {
    spiral: new THREE.MeshBasicMaterial({ color: 0x59ff9c, fog: false }),
    knot: new THREE.MeshBasicMaterial({ color: 0xffb45e, fog: false }),
    crown: new THREE.MeshBasicMaterial({ color: 0xc9a2ff, fog: false }),
  };
  E.sealHolders = {};
  const holderPos = [[Math.PI * 0.5, 1.78], [Math.PI * 1.17, 1.78], [Math.PI * 1.83, 1.78]];
  const holderKeys = ['spiral', 'knot', 'crown'];
  for (let i = 0; i < 3; i++) {
    const [ang, rad] = holderPos[i];
    const hx = Math.cos(ang) * rad, hz = -11.5 + Math.sin(ang) * rad;
    cyl(E, { x: hx, y: SY + 0.42, z: hz, rTop: 0.26, rBottom: 0.34, h: 0.84, mat: holderMat, seg: 14, collider: true, top: SY + 0.85 });
    const cap = new THREE.Mesh(new THREE.CircleGeometry(0.19, 14), new THREE.MeshBasicMaterial({ color: 0x0a0a0e }));
    cap.rotation.x = -Math.PI / 2; cap.position.set(hx, SY + 0.845, hz); scene.add(cap);
    E.sealHolders[holderKeys[i]] = cap;
  }
  // inscriptions under each holder (faint until filled)
  E.addSymbol({ tex: T.symSpiral, x: Math.cos(Math.PI * 0.5) * 1.78, y: SY + 0.06, z: -11.5 + Math.sin(Math.PI * 0.5) * 1.78, ry: 0, size: 0.34, opacity: 0.5 }).rotation.x = -Math.PI / 2;
  // Unknown Mark — hidden until the Seals are placed
  const unknownWall = E.addSymbol({ tex: T.symUnknown, x: 0, y: SY + 2.35, z: -14.63, ry: 0, size: 1.9, opacity: 0 });
  E.unknownWall = unknownWall;
  readable(E, { x: 0, z: -11.5, y: SY, r: 2.6, prompt: () => {
    if (E.flags.sealsPlaced) return 'The three Seals turn slowly in their sockets.\nBelow, something ancient has begun to breathe.';
    if ((E.flags.seals || 0) >= 3) return 'Place the Three Seals upon the table';
    return `The circular table waits. Three empty sockets.\n${E.flags.seals || 0} of 3 Seals.`;
  }, onRead: () => {
    if (E.flags.sealsPlaced) return;
    if ((E.flags.seals || 0) < 3) { audio.rumble(); return; }
    // PLACE THE SEALS
    E.flags.sealsPlaced = true;
    for (const k of holderKeys) E.sealHolders[k].material = holderGlow[k];
    audio.bellToll(196, 0.85);
    setTimeout(() => audio.sealChime(), 900);
    if (E.hooks) E.hooks.onSealsPlaced();
  } });
}

// ---------- family tree chart ----------
function makeFamilyTree() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 320;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#d5c8a2'; ctx.fillRect(0, 0, 512, 320);
  ctx.strokeStyle = '#5a4a28'; ctx.lineWidth = 3; ctx.strokeRect(5, 5, 502, 310);
  ctx.fillStyle = '#3a3122'; ctx.font = 'bold 19px Georgia';
  ctx.fillText('THE VELLACOTT LINE', 24, 34);
  const node = (x, y, label, scraped = false) => {
    ctx.beginPath(); ctx.ellipse(x, y, 34, 15, 0, 0, 7); ctx.stroke();
    if (scraped) {
      ctx.save(); ctx.strokeStyle = '#3a3122'; ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(x - 26 + Math.random() * 10 + i * 6, y - 10); ctx.lineTo(x - 30 + Math.random() * 10 + i * 6, y + 10); ctx.stroke(); }
      ctx.restore();
    } else { ctx.font = '11px Georgia'; ctx.fillText(label, x - 30, y + 4); }
  };
  node(256, 66, 'OBADIAH V.');
  node(150, 128, 'ELIAS V.'); node(360, 128, 'MARA V.');
  node(96, 192, 'E. V.'); node(256, 192, 'M. V.'); node(416, 192, 'G. V.');
  ctx.setLineDash([4, 4]);
  node(256, 264, '', true);
  // connecting lines
  ctx.beginPath(); ctx.moveTo(256, 82); ctx.lineTo(150, 112); ctx.moveTo(256, 82); ctx.lineTo(360, 112);
  ctx.moveTo(150, 144); ctx.lineTo(96, 176); ctx.moveTo(150, 144); ctx.lineTo(256, 176); ctx.moveTo(360, 144); ctx.lineTo(416, 176);
  ctx.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------- star chart ----------
function makeStarChart() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 360;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#10131f'; ctx.fillRect(0, 0, 512, 360);
  ctx.strokeStyle = '#3a4666'; ctx.lineWidth = 2;
  // rings
  for (const r of [40, 76, 112, 148]) { ctx.beginPath(); ctx.arc(256, 180, r, 0, 7); ctx.stroke(); }
  // a faceless figure constellation
  const pts = [[256, 44], [210, 120], [180, 210], [230, 290], [285, 290], [335, 210], [300, 120]];
  ctx.strokeStyle = '#8fa8d8'; ctx.lineWidth = 2.4;
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath(); ctx.stroke();
  const st = { s: 3 };
  const rnd = () => { const x = Math.sin(st.s++) * 10000; return x - Math.floor(x); };
  for (let i = 0; i < 130; i++) {
    ctx.fillStyle = `rgba(220,230,255,${0.3 + rnd() * 0.7})`;
    ctx.fillRect(rnd() * 512, rnd() * 360, rnd() * 2 + 0.6, rnd() * 2 + 0.6);
  }
  ctx.fillStyle = '#8fa8d8'; ctx.font = '13px Georgia';
  ctx.fillText('THE SLEEPER BELOW · 17 STARS · DO NOT WAKE', 88, 340);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
