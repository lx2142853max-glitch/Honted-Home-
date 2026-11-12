// ============================================================
// GROUNDS — the estate outside the mansion (PRD §4)
// Estate footprint ≈ 150 m × 130 m, boundary: forest + fence + fog.
// ============================================================
import * as THREE from 'three';

export function buildGrounds(E) {
  const T = E.textures;
  const scene = E.scene;

  const rockMat = new THREE.MeshStandardMaterial({ color: 0x3c403e, roughness: 1, flatShading: true });
  const darkRockMat = new THREE.MeshStandardMaterial({ color: 0x2b2f2d, roughness: 1, flatShading: true });
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x241b14, roughness: 0.95 });
  const barkMat = new THREE.MeshStandardMaterial({ color: 0x2e2620, roughness: 1 });
  const pineMat = new THREE.MeshStandardMaterial({ color: 0x131d16, roughness: 1, flatShading: true });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x1b1e24, roughness: 0.55, metalness: 0.75 });
  const hedgeMat = new THREE.MeshStandardMaterial({ color: 0x121a10, roughness: 1 });
  const deadBushMat = new THREE.MeshStandardMaterial({ color: 0x33291f, roughness: 1, flatShading: true });

  // ---------- ground plane ----------
  const groundMat = new THREE.MeshStandardMaterial({ map: T.ground, roughness: 1, color: 0xbfc4b8 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(340, 320), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  ground.receiveShadow = true;
  scene.add(ground);

  // ---------- rocky mound under mansion ----------
  const mound = new THREE.Mesh(new THREE.CylinderGeometry(34, 44, 2.6, 28, 1), rockMat);
  mound.position.set(0, -1.35, 0);
  mound.receiveShadow = true;
  scene.add(mound);
  // scattered boulders ringing the foundation
  const boulderGeo = new THREE.DodecahedronGeometry(1, 0);
  const boulderSpots = [];
  for (let i = 0; i < 46; i++) {
    const a = (i / 46) * Math.PI * 2 + Math.sin(i * 7.3) * 0.1;
    const r = 23.5 + (Math.sin(i * 13.7) * 0.5 + 0.5) * 7;
    const x = Math.cos(a) * r, z = Math.sin(a) * r * 0.78;
    if (z > 14 && Math.abs(x) < 5) continue; // keep the entrance open
    boulderSpots.push([x, z, 0.8 + (Math.sin(i * 3.1) * 0.5 + 0.5) * 1.9]);
  }
  for (const [x, z, s] of boulderSpots) {
    const b = new THREE.Mesh(boulderGeo, iRock(E, Math.random() < 0.5 ? rockMat : darkRockMat));
    b.position.set(x, s * 0.28 - 0.4, z);
    b.scale.set(s, s * 0.75, s);
    b.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    b.castShadow = true; b.receiveShadow = true;
    scene.add(b);
  }

  // ---------- long gravel approach (gate → porch) ----------
  const pathMat = new THREE.MeshStandardMaterial({ map: T.gravel, roughness: 1, color: 0xd8d4c8 });
  const path = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 36.5), pathMat);
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, 0.03, 37.3);
  path.receiveShadow = true;
  scene.add(path);
  // outer trail (south of gate, fading into the forest)
  const trail = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 26), new THREE.MeshStandardMaterial({ map: T.gravel, roughness: 1, color: 0x8a857a }));
  trail.rotation.x = -Math.PI / 2;
  trail.position.set(0.6, 0.02, 66);
  scene.add(trail);
  // edge stones along the path
  for (let z = 20; z <= 54; z += 1.7) {
    for (const side of [-2.5, 2.5]) {
      const s = 0.3 + Math.abs(Math.sin(z * 12.3 * side)) * 0.28;
      const st = new THREE.Mesh(boulderGeo, darkRockMat);
      st.scale.set(s, s * 0.7, s);
      st.position.set(side + Math.sin(z * 3.3) * 0.15, s * 0.22, z + Math.cos(z * 2.1) * 0.4);
      scene.add(st);
    }
  }

  // ---------- FRONT IRON GATE (§4.2) ----------
  buildFrontGate(E, ironMat, rockMat);

  // ---------- perimeter fence + boundary colliders ----------
  buildFence(E, ironMat, -70, 55, 70, 55, [-2.7, 2.7]);         // front (gap at gate)
  buildFence(E, ironMat, -70, 30, -70, 55, []);                  // west stub
  buildFence(E, ironMat, 70, 30, 70, 55, []);                    // east stub
  E.solidBox({ x: 0, y: 2, z: 74, w: 150, h: 9, d: 1, mat: rockMat, collider: true, castShadow: false }); // south barrier (fog hides it)
  E.solidBox({ x: -74, y: 2, z: 0, w: 1, h: 9, d: 150, mat: rockMat, collider: true, castShadow: false });
  E.solidBox({ x: 74, y: 2, z: 0, w: 1, h: 9, d: 150, mat: rockMat, collider: true, castShadow: false });
  E.solidBox({ x: 0, y: 2, z: -64, w: 150, h: 9, d: 1, mat: rockMat, collider: true, castShadow: false });

  // ---------- FRONT GARDEN (§4.4) ----------
  // dead rose beds flanking the path
  const roseMat = new THREE.MeshStandardMaterial({ color: 0x241d16, roughness: 1 });
  for (const side of [-4.6, 4.6]) {
    for (const z of [28, 34, 40, 46]) {
      const bed = E.solidBox({ x: side * 1.6, y: 0.16, z, w: 1.7, h: 0.34, d: 3.4, mat: roseMat, collider: false });
      bed.receiveShadow = true;
      for (let i = 0; i < 7; i++) {
        const thorn = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.6 + Math.sin(i * z) * 0.2, 5), deadBushMat);
        thorn.position.set(side * 1.6 + Math.sin(i * 2.7 + z) * 0.65, 0.55, z + (i - 3) * 0.48);
        scene.add(thorn);
      }
    }
  }
  // dry fountain (§4.4)
  const fountainG = new THREE.Group();
  const basin = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.6, 1.0, 18, 1, true), rockMat);
  basin.position.y = 0.5; fountainG.add(basin);
  const basinRing = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.22, 8, 18), rockMat);
  basinRing.rotation.x = Math.PI / 2; basinRing.position.y = 1.0; fountainG.add(basinRing);
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.6, 1.9, 12), rockMat);
  pillar.position.y = 1.7; fountainG.add(pillar);
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 0.7, 0.4, 14), rockMat);
  bowl.position.y = 2.7; fountainG.add(bowl);
  fountainG.position.set(13, 0, 33.5);
  fountainG.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  scene.add(fountainG);
  E.colliders.push({ minX: 10.6, maxX: 15.4, minZ: 31.1, maxZ: 35.9, top: 2.4 });

  // circular three-part flowerbed matching the gate crest (§4.4)
  const flowerTex = makeCrestFlowerTex();
  const flower = new THREE.Mesh(new THREE.CircleGeometry(3.1, 28), new THREE.MeshBasicMaterial({ map: flowerTex, transparent: true, depthWrite: false }));
  flower.rotation.x = -Math.PI / 2; flower.position.set(-12, 0.04, 38);
  scene.add(flower);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.16, 6, 28), rockMat);
  ring.rotation.x = Math.PI / 2; ring.position.set(-12, 0.1, 38);
  scene.add(ring);
  E.colliders.push({ minX: -15.3, maxX: -8.7, minZ: 34.7, maxZ: 41.3, top: 0.35 });

  // toppled angel statue
  const angel = new THREE.Group();
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.62, 2.4, 8), new THREE.MeshStandardMaterial({ color: 0x9aa0a4, roughness: 0.8 }));
  body.rotation.z = Math.PI / 2.25; body.position.y = 0.55; angel.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 8), body.material);
  head.position.set(1.16, 0.95, 0.1); angel.add(head);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.15, 0.75), body.material);
  wing.position.set(-0.5, 1.0, -0.45); wing.rotation.z = 0.5; angel.add(wing);
  angel.position.set(8.2, 0, 26.5); angel.rotation.y = 0.8;
  scene.add(angel);
  E.colliders.push({ minX: 6.9, maxX: 9.7, minZ: 25.2, maxZ: 27.8, top: 1.3 });

  // birdbath
  const bath = new THREE.Group();
  const bstem = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.3, 1.15, 10), rockMat); bstem.position.y = 0.57; bath.add(bstem);
  const bbowl = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.5, 0.28, 12), rockMat); bbowl.position.y = 1.25; bath.add(bbowl);
  bath.position.set(-6.5, 0, 28.5); scene.add(bath);
  E.colliders.push({ minX: -7.3, maxX: -5.7, minZ: 27.7, maxZ: 29.3, top: 1.4 });

  // locked garden shed (§4.4)
  const shedMat = new THREE.MeshStandardMaterial({ map: T.wood, roughness: 0.9, color: 0x8f8272 });
  E.solidBox({ x: -17, y: 1.15, z: 23.5, w: 3.2, h: 2.3, d: 2.5, mat: shedMat, collider: true, castShadow: true });
  E.addGableRoof({ cx: -17, z1: 22.1, z2: 24.9, baseY: 2.3, apexY: 3.5, halfWidth: 1.9, mat: new THREE.MeshStandardMaterial({ map: T.roof, roughness: 0.9 }) });
  E.addInteractable({
    object: null, radius: 2.6,
    prompt: () => 'Locked. The padlock is green with age.',
    enabled: () => nearXZ(E, -17, 23.5, 2.6),
    onInteract: () => { E.flags.shedMsg = true; },
  });

  // ---------- GRAVEYARD (§4.5) ----------
  buildGraveyard(E, ironMat, rockMat);

  // ---------- SIDE COURTYARD (§4.6) ----------
  const barrelMat = new THREE.MeshStandardMaterial({ map: T.wood, roughness: 0.85, color: 0x6f5a3c });
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.62, 1.15, 12), barrelMat);
  barrel.position.set(-23.5, 0.58, 8.5); scene.add(barrel);
  E.colliders.push({ minX: -24.2, maxX: -22.8, minZ: 7.8, maxZ: 9.2, top: 1.2 });
  // broken cart
  const cart = new THREE.Group();
  const cartBed = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.28, 1.15), barrelMat); cartBed.position.y = 0.62; cart.add(cartBed);
  const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.1, 12);
  for (const wx of [-0.75, 0.75]) {
    const w = new THREE.Mesh(wheelGeo, trunkMat); w.rotation.z = Math.PI / 2; w.position.set(wx, 0.42, 0.66); cart.add(w);
  }
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.8, 6), trunkMat);
  shaft.rotation.z = Math.PI / 2.6; shaft.position.set(1.5, 0.45, 0); cart.add(shaft);
  cart.position.set(-25.5, 0, 12.5); cart.rotation.y = 0.6; scene.add(cart);
  E.colliders.push({ minX: -26.7, maxX: -24.2, minZ: 11.4, maxZ: 13.7, top: 1.1 });
  // stacked firewood
  for (let i = 0; i < 9; i++) {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 2.2, 8), barkMat);
    log.rotation.z = Math.PI / 2;
    log.position.set(-24.8 + (i % 3) * 0.4, 0.18 + Math.floor(i / 3) * 0.34, 4.6);
    scene.add(log);
  }
  E.colliders.push({ minX: -26, maxX: -23.6, minZ: 4.0, maxZ: 5.2, top: 1.1 });
  // small statue marking the servants' passage
  const servantStatue = new THREE.Group();
  const sBase = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.35, 0.8), rockMat); sBase.position.y = 0.17; servantStatue.add(sBase);
  const sBody = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.32, 1.5, 8), rockMat); sBody.position.y = 1.1; servantStatue.add(sBody);
  const sHead = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), rockMat); sHead.position.y = 1.98; servantStatue.add(sHead);
  servantStatue.position.set(-22.6, 0, 15.2); scene.add(servantStatue);
  E.colliders.push({ minX: -23.1, maxX: -22.1, minZ: 14.7, maxZ: 15.7, top: 2.2 });

  // ---------- REAR GARDEN (§4.7) ----------
  // ruined gazebo
  const gazeboG = new THREE.Group();
  const gMat = rockMat;
  for (const [gx, gz] of [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]]) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 2.7, 8), gMat);
    col.position.set(gx, 1.35, gz); gazeboG.add(col);
  }
  const gRoof = new THREE.Mesh(new THREE.ConeGeometry(2.6, 1.5, 8, 1, true), new THREE.MeshStandardMaterial({ map: T.roof, roughness: 1, side: THREE.DoubleSide }));
  gRoof.position.y = 3.3; gRoof.rotation.y = 0.4; gRoof.rotation.z = 0.09; gazeboG.add(gRoof);
  gazeboG.position.set(-13, 0, -36); scene.add(gazeboG);
  E.colliders.push({ minX: -15.2, maxX: -10.8, minZ: -38.2, maxZ: -33.8, top: 4.1 });

  // stone sundial with symbols
  const dial = new THREE.Group();
  const dBase = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.72, 1.25, 10), rockMat); dBase.position.y = 0.62; dial.add(dBase);
  const dTop = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.14, 14), rockMat); dTop.position.y = 1.3; dial.add(dTop);
  const gnomon = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.5, 5), ironMat); gnomon.position.y = 1.6; dial.add(gnomon);
  dial.position.set(4, 0, -33.5); scene.add(dial);
  // tiny symbols scratched into the dial face
  E.addSymbol({ tex: T.symSpiral, x: 4, y: 1.39, z: -33.2, ry: 0, size: 0.28 }).rotation.x = -Math.PI / 2;
  E.colliders.push({ minX: 3.3, maxX: 4.7, minZ: -34.2, maxZ: -32.8, top: 1.9 });

  // dead fountain, rear
  const rearF = new THREE.Group();
  const rb = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.9, 0.85, 14), rockMat); rb.position.y = 0.42; rearF.add(rb);
  const rp1 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 1.3, 10), rockMat); rp1.position.y = 1.3; rearF.add(rp1);
  rearF.position.set(15, 0, -29.5); scene.add(rearF);
  E.colliders.push({ minX: 13.2, maxX: 16.8, minZ: -31.3, maxZ: -27.7, top: 2.0 });

  // tangled hedge maze (simple looping layout)
  const hedgeBoxes = [
    [-16, -27, 8, 1.1], [-9, -30.5, 1.1, 6], [-16, -34, 8, 1.1],
    [10, -38.5, 9, 1.1], [15, -42, 1.1, 6.5], [6, -45.5, 10, 1.1], [0, -41, 1.1, 9],
  ];
  for (const [hx, hz, hw, hd] of hedgeBoxes) {
    E.solidBox({ x: hx, y: 0.85, z: hz, w: hw, h: 1.7, d: hd, mat: hedgeMat, collider: true, castShadow: true });
  }

  // hidden hatch beneath ivy (visual, interactable flavor)
  const hatch = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 1.0), new THREE.MeshStandardMaterial({ color: 0x1a2414, roughness: 1 }));
  hatch.rotation.x = -Math.PI / 2; hatch.rotation.z = 0.3; hatch.position.set(-2.5, 0.045, -44.5);
  scene.add(hatch);
  E.addInteractable({
    object: hatch, radius: 2.2,
    prompt: () => 'A hatch under the ivy. The iron ring is fused with rust.',
    enabled: () => nearXZ(E, -2.5, -44.5, 2.2),
    onInteract: () => { E.flags.hatchMsg = true; },
  });

  // ---------- GREENHOUSE (§4.8) ----------
  buildGreenhouse(E);

  // ---------- RUINED CHAPEL (§4.9) ----------
  buildChapel(E);

  // ---------- forest ring (boundary) ----------
  buildForest(E, trunkMat, barkMat, pineMat, rockMat);

  // ---------- ground fog banks ----------
  const fogTex = makeFogSpriteTex();
  const fogMat = new THREE.SpriteMaterial({ map: fogTex, transparent: true, opacity: 0.34, depthWrite: false, color: 0xa9bcd8 });
  const fogSpots = [[40, 38, 26], [-32, 45, 22], [18, -42, 26], [-24, -40, 20], [48, 46, 18], [0, 64, 30], [-14, 24, 14]];
  for (const [fx, fz, fs] of fogSpots) {
    const sp = new THREE.Sprite(fogMat);
    sp.position.set(fx, 1.6, fz);
    sp.scale.set(fs, fs * 0.5, 1);
    scene.add(sp);
  }
}

// ================= pieces =================

function nearXZ(E, x, z, r) {
  const p = E.camera.position;
  const dx = p.x - x, dz = p.z - z;
  return dx * dx + dz * dz <= r * r;
}

function iRock(E, mat) { return mat; }

function buildFrontGate(E, ironMat, stoneMat) {
  const scene = E.scene;
  const T = E.textures;
  const gateZ = 55;
  // stone pillars + lanterns
  for (const side of [-3.1, 3.1]) {
    E.solidBox({ x: side, y: 1.7, z: gateZ, w: 1.15, h: 3.4, d: 1.15, mat: stoneMat, collider: true, castShadow: true });
    E.solidBox({ x: side, y: 3.55, z: gateZ, w: 1.5, h: 0.32, d: 1.5, mat: stoneMat, collider: false });
    const lantern = E.addPointLight({ x: side, y: 4.1, z: gateZ, color: 0xffa050, intensity: 9, distance: 9, decay: 2 });
    E.tick.push((dt, t) => { lantern.intensity = 8 + Math.sin(t * 9 + side) * 1.6 + Math.sin(t * 23.7 + side * 3) * 0.9; });
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffc06a, fog: false }));
    lamp.position.set(side, 4.12, gateZ); scene.add(lamp);
    E.solidBox({ x: side, y: 4.35, z: gateZ, w: 0.42, h: 0.16, d: 0.42, mat: ironMat, collider: false });
  }
  // two wrought-iron leaves, permanently ajar
  const leafGeoW = 2.35;
  const makeLeaf = (side) => {
    const leaf = new THREE.Group();
    const frame = new THREE.Mesh(new THREE.BoxGeometry(leafGeoW, 0.14, 0.09), ironMat);
    frame.position.set(side * leafGeoW / 2, 1.0, 0); leaf.add(frame);
    const top = frame.clone(); top.position.y = 2.45; leaf.add(top);
    const mid = frame.clone(); mid.position.y = 1.72; leaf.add(mid);
    for (let i = 0; i <= 6; i++) {
      const x = side * (i * leafGeoW / 6);
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.5, 6), ironMat);
      bar.position.set(x, 1.35, 0); leaf.add(bar);
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.42, 6), ironMat);
      spike.position.set(x, 2.8, 0); leaf.add(spike);
    }
    leaf.position.set(side * 2.6, 0, gateZ);
    leaf.rotation.y = side * -0.42; // ajar inward
    scene.add(leaf);
  };
  makeLeaf(-1); makeLeaf(1);
  // rusted chain + heavy mechanical lock (visual)
  const chain = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.055, 6, 14, Math.PI * 1.2), new THREE.MeshStandardMaterial({ color: 0x4d3b22, roughness: 0.9, metalness: 0.4 }));
  chain.position.set(0, 1.45, gateZ); chain.rotation.z = Math.PI * 0.9;
  scene.add(chain);
  // central circular crest — House Crest with three empty recesses
  const crest = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.13, 8, 26), ironMat);
  crest.add(disc);
  const discInner = new THREE.Mesh(new THREE.CircleGeometry(0.92, 26), new THREE.MeshStandardMaterial({ color: 0x14171d, roughness: 0.6, metalness: 0.6 }));
  discInner.position.z = -0.02; crest.add(discInner);
  crest.position.set(0, 3.15, gateZ);
  scene.add(crest);
  E.addSymbol({ tex: T.symCrest, x: 0, y: 3.15, z: gateZ + 0.06, ry: 0, size: 1.75 });
  E.addInteractable({
    object: crest, radius: 3.4,
    prompt: () => E.flags.seals >= 3
      ? 'The House Crest is warm to the touch.\nThree recesses, filled at last.'
      : `The House Crest. Three recesses gape empty.\n${E.flags.seals || 0} of 3 Seals recovered.`,
    enabled: () => nearXZ(E, 0, gateZ, 3.4),
    onInteract: () => { E.flags.crestRead = true; E.tick.push(() => {}); },
  });
  // keeper's box beside the gate
  E.solidBox({ x: 6.1, y: 0.95, z: 54.2, w: 1.35, h: 1.9, d: 1.15, mat: new THREE.MeshStandardMaterial({ map: T.wood, roughness: 0.95, color: 0x74604a }), collider: true, castShadow: true });
}

function buildFence(E, ironMat, x1, z1, x2, z2, gapCenters) {
  const scene = E.scene;
  const len = Math.hypot(x2 - x1, z2 - z1);
  const dirX = (x2 - x1) / len, dirZ = (z2 - z1) / len;
  const isFront = Math.abs(z2 - z1) < 0.01;
  const posts = Math.floor(len / 2.1);
  const rail = (y) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(isFront ? len : 0.09, 0.09, isFront ? 0.09 : len), ironMat);
    m.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
    scene.add(m);
  };
  rail(0.72); rail(1.42);
  for (let i = 0; i <= posts; i++) {
    const t = i / posts, px = x1 + (x2 - x1) * t, pz = z1 + (z2 - z1) * t;
    if (isFront && gapCenters.some(g => Math.abs(px - g) < 3.0)) continue;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 1.7, 6), ironMat);
    post.position.set(px, 0.85, pz); scene.add(post);
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.28, 6), ironMat);
    spike.position.set(px, 1.82, pz); scene.add(spike);
  }
  // collider (with gate gap on the front line)
  if (isFront && gapCenters.length) {
    const g0 = Math.min(...gapCenters) - 3.0, g1 = Math.max(...gapCenters) + 3.0;
    E.colliders.push({ minX: x1, maxX: g0, minZ: z1 - 0.25, maxZ: z1 + 0.25, top: 1.8 });
    E.colliders.push({ minX: g1, maxX: x2, minZ: z1 - 0.25, maxZ: z1 + 0.25, top: 1.8 });
  } else {
    E.colliders.push({
      minX: Math.min(x1, x2) - 0.22, maxX: Math.max(x1, x2) + 0.22,
      minZ: Math.min(z1, z2) - 0.22, maxZ: Math.max(z1, z2) + 0.22, top: 1.8,
    });
  }
}

function buildGraveyard(E, ironMat, stoneMat) {
  const scene = E.scene;
  const T = E.textures;
  const gx = 44, gz = 37, gw = 30, gd = 24;
  // low iron fence with a west-side gap
  const railMat = ironMat;
  const mkRail = (x, z, w, d) => E.solidBox({ x, y: 0.5, z, w, h: 1.0, d, mat: railMat, collider: true });
  mkRail(gx, gz - gd / 2, gw, 0.18);
  mkRail(gx, gz + gd / 2, gw, 0.18);
  mkRail(gx + gw / 2, gz, 0.18, gd);
  mkRail(gx - gw / 2, gz - gd / 4 - 1.5, 0.18, gd / 2 - 3);
  mkRail(gx - gw / 2, gz + gd / 4 + 1.5, 0.18, gd / 2 - 3);

  // gravestones — instanced with per-stone tilt
  const stoneGeo = new THREE.BoxGeometry(0.9, 1.35, 0.22);
  const stoneMatV = new THREE.MeshStandardMaterial({ color: 0x84888c, roughness: 0.95 });
  const newerMatV = new THREE.MeshStandardMaterial({ color: 0xa9adae, roughness: 0.9 });
  const count = 26;
  const inst = new THREE.InstancedMesh(stoneGeo, stoneMatV, count);
  const dummy = new THREE.Object3D();
  const st = { s: 5 };
  const rnd = () => { const x = Math.sin(st.s++) * 10000; return x - Math.floor(x); };
  for (let i = 0; i < count; i++) {
    const x = gx - gw / 2 + 2.5 + rnd() * (gw - 5);
    const z = gz - gd / 2 + 2 + rnd() * (gd - 4);
    if (Math.hypot(x - 46, z - 41.5) < 3.4) { dummy.position.set(x, -10, z); } // keep mausoleum clear
    else dummy.position.set(x, 0.55 + rnd() * 0.15, z);
    dummy.rotation.set((rnd() - 0.5) * 0.24, rnd() * Math.PI * 2, (rnd() - 0.5) * 0.3);
    dummy.updateMatrix();
    inst.setMatrixAt(i, dummy.matrix);
    E.colliders.push({ minX: x - 0.5, maxX: x + 0.5, minZ: z - 0.5, maxZ: z + 0.5, top: 1.35 });
  }
  inst.castShadow = true; inst.receiveShadow = true;
  scene.add(inst);
  // one newer stone among the old
  const newer = new THREE.Mesh(stoneGeo, newerMatV);
  newer.position.set(gx - 3, 0.72, gz + 2.5); newer.rotation.x = -0.08;
  scene.add(newer);
  // crosses
  const crossMat = new THREE.MeshStandardMaterial({ color: 0x6f7377, roughness: 0.95 });
  for (const [cx, cz] of [[gx + 4, gz - 4], [gx - 6, gz - 6], [gx + 8, gz + 4]]) {
    const v = E.solidBox({ x: cx, y: 0.95, z: cz, w: 0.24, h: 1.9, d: 0.2, mat: crossMat, collider: false });
    E.solidBox({ x: cx, y: 1.28, z: cz, w: 1.0, h: 0.22, d: 0.18, mat: crossMat, collider: false });
    v.rotation.z = (cx * 13 % 7) * 0.02;
    E.colliders.push({ minX: cx - 0.5, maxX: cx + 0.5, minZ: cz - 0.5, maxZ: cz + 0.5, top: 1.9 });
  }

  // family mausoleum (§4.5)
  const mauG = new THREE.Group();
  const mBase = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.5, 5.2), stoneMat); mBase.position.y = 0.25; mauG.add(mBase);
  const mBody = new THREE.Mesh(new THREE.BoxGeometry(4.0, 2.6, 4.7), stoneMat); mBody.position.y = 1.8; mauG.add(mBody);
  const mRoof = new THREE.Mesh(new THREE.ConeGeometry(3.1, 1.6, 4), stoneMat); mRoof.position.y = 3.9; mRoof.rotation.y = Math.PI / 4; mauG.add(mRoof);
  mBody.castShadow = true;
  mauG.position.set(gx + 2, 0, gz + 5.5);
  scene.add(mauG);
  E.colliders.push({ minX: gx - 0.4, maxX: gx + 4.4, minZ: gz + 3.0, maxZ: gz + 8.2, top: 5.0 });
  E.addInteractable({
    object: mBody, radius: 3.2,
    prompt: () => 'Black VELLACOTT · 1831 — 1897\n\n"The guardian stands at the garden gate."',
    enabled: () => nearXZ(E, gx + 2, gz + 5.5, 3.2),
    onInteract: () => { E.flags.mausoleumRead = true; },
  });
  // one fresh grave with a wilting wreath
  const wreath = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.09, 6, 14), new THREE.MeshStandardMaterial({ color: 0x3d2a2a, roughness: 1 }));
  wreath.position.set(gx - 3, 0.08, gz + 2.5); wreath.rotation.x = Math.PI / 2.3;
  scene.add(wreath);
}

function buildGreenhouse(E) {
  const scene = E.scene;
  const T = E.textures;
  const gx = -24, gz = -38;
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x2c332e, roughness: 0.6, metalness: 0.5 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x9fd8cf, transparent: true, opacity: 0.22, roughness: 0.08, metalness: 0.2, side: THREE.DoubleSide, depthWrite: false });
  const gw = 6.4, gd = 4.6, gh = 2.6;
  // floor + frame posts
  E.solidBox({ x: gx, y: 0.18, z: gz, w: gw, h: 0.36, d: gd, mat: new THREE.MeshStandardMaterial({ map: T.stone, roughness: 1 }), collider: false });
  for (const [px, pz] of [[-gw / 2, -gd / 2], [gw / 2, -gd / 2], [-gw / 2, gd / 2], [gw / 2, gd / 2], [0, -gd / 2], [0, gd / 2]]) {
    E.solidBox({ x: gx + px, y: gh / 2 + 0.3, z: gz + pz, w: 0.16, h: gh, d: 0.16, mat: frameMat, collider: false });
  }
  // glass walls
  const wallN = new THREE.Mesh(new THREE.PlaneGeometry(gw, gh), glassMat); wallN.position.set(gx, gh / 2 + 0.3, gz - gd / 2); scene.add(wallN);
  const wallS = wallN.clone(); wallS.position.z = gz + gd / 2; scene.add(wallS);
  const wallE = new THREE.Mesh(new THREE.PlaneGeometry(gd, gh), glassMat); wallE.position.set(gx + gw / 2, gh / 2 + 0.3, gz); wallE.rotation.y = Math.PI / 2; scene.add(wallE);
  const wallW = wallE.clone(); wallW.position.x = gx - gw / 2; scene.add(wallW);
  // broken glass roof — two slabs, one sagging, one gone
  const roofA = new THREE.Mesh(new THREE.PlaneGeometry(gw, gd / 2 - 0.3), glassMat);
  roofA.rotation.x = -Math.PI / 2 + 0.16; roofA.position.set(gx, gh + 0.55, gz - gd / 4); scene.add(roofA);
  const roofB = new THREE.Mesh(new THREE.PlaneGeometry(gw * 0.62, gd / 2 - 0.3), glassMat);
  roofB.rotation.x = -Math.PI / 2 - 0.34; roofB.position.set(gx - 1.1, gh + 0.28, gz + gd / 4 + 0.25); scene.add(roofB);
  for (const r of [roofA, roofB, wallN, wallS, wallE, wallW]) r.renderOrder = 2;
  // empty plant pots + rusted irrigation pipe
  const potMat = new THREE.MeshStandardMaterial({ color: 0x59392a, roughness: 0.9 });
  for (let i = 0; i < 8; i++) {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.15, 0.34, 8), potMat);
    pot.position.set(gx - 2.2 + (i % 4) * 1.45, 0.52, gz - 1 + Math.floor(i / 4) * 2.1);
    scene.add(pot);
  }
  E.solidBox({ x: gx, y: 0.32, z: gz + 1.4, w: 5.2, h: 0.16, d: 0.3, mat: new THREE.MeshStandardMaterial({ color: 0x4a2f1c, roughness: 1 }), collider: false });
  // boundary collider so player cannot clip through glass
  E.solidBox({ x: gx, y: gh / 2, z: gz - gd / 2, w: gw, h: gh, d: 0.14, mat: frameMat, collider: true, castShadow: false });
  E.solidBox({ x: gx, y: gh / 2, z: gz + gd / 2, w: gw, h: gh, d: 0.14, mat: frameMat, collider: true, castShadow: false });
  E.solidBox({ x: gx + gw / 2, y: gh / 2, z: gz, w: 0.14, h: gh, d: gd, mat: frameMat, collider: true, castShadow: false });
  E.solidBox({ x: gx - gw / 2, y: gh / 2, z: gz, w: 0.14, h: gh, d: gd, mat: frameMat, collider: true, castShadow: false });
  // locked cabinet with the rare object
  E.solidBox({ x: gx + 2.3, y: 0.8, z: gz - 1.6, w: 0.9, h: 1.3, d: 0.5, mat: frameMat, collider: true });
  E.addInteractable({
    object: null, radius: 2.3,
    prompt: () => 'A rusted cabinet, still locked.\nSomething glass glints inside.',
    enabled: () => nearXZ(E, gx + 2.3, gz - 1.6, 2.3),
    onInteract: () => { E.flags.cabinetMsg = true; },
  });
}

function buildChapel(E) {
  const scene = E.scene;
  const T = E.textures;
  const cx = 20, cz = -42;
  const stone = new THREE.MeshStandardMaterial({ map: T.stone, roughness: 1, color: 0xb9bdb4 });
  // four broken wall fragments (roofless)
  E.solidBox({ x: cx - 2.6, y: 1.35, z: cz, w: 0.5, h: 2.7, d: 5.4, mat: stone, collider: true, castShadow: true });
  E.solidBox({ x: cx + 2.6, y: 1.0, z: cz - 0.6, w: 0.5, h: 2.0, d: 4.0, mat: stone, collider: true, castShadow: true });
  E.solidBox({ x: cx, y: 0.9, z: cz - 2.7, w: 5.6, h: 1.8, d: 0.5, mat: stone, collider: true, castShadow: true });
  // cracked altar
  E.solidBox({ x: cx, y: 0.55, z: cz - 2.1, w: 2.3, h: 1.1, d: 0.85, mat: stone, collider: true });
  // empty candle holders on the altar
  const holderMat = new THREE.MeshStandardMaterial({ color: 0x5c5230, roughness: 0.4, metalness: 0.8 });
  for (const dx of [-0.7, 0, 0.7]) {
    const h = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 0.3, 8), holderMat);
    h.position.set(cx + dx, 1.24, cz - 2.1); scene.add(h);
  }
  // bell frame with a silent bell
  const postL = E.solidBox({ x: cx - 1.15, y: 1.9, z: cz + 2.6, w: 0.3, h: 3.8, d: 0.3, mat: stone, collider: false });
  const postR = E.solidBox({ x: cx + 1.15, y: 1.9, z: cz + 2.6, w: 0.3, h: 3.8, d: 0.3, mat: stone, collider: false });
  E.solidBox({ x: cx, y: 3.75, z: cz + 2.6, w: 3.4, h: 0.28, d: 0.34, mat: stone, collider: false });
  const bell = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.75, 10, 1, true), holderMat);
  bell.position.set(cx, 3.25, cz + 2.6);
  scene.add(bell);
  E.colliders.push({ minX: cx - 1.6, maxX: cx + 1.6, minZ: cz + 2.2, maxZ: cz + 3.0, top: 3.9 });
  // three floor tiles with the three boss symbols (§4.9)
  E.addSymbol({ tex: T.symSpiral, x: cx - 1.5, y: 0.06, z: cz + 0.6, ry: 0, size: 0.85 }).rotation.x = -Math.PI / 2;
  E.addSymbol({ tex: T.symKnot, x: cx, y: 0.06, z: cz + 0.6, ry: 0, size: 0.85 }).rotation.x = -Math.PI / 2;
  E.addSymbol({ tex: T.symCrown, x: cx + 1.5, y: 0.06, z: cz + 0.6, ry: 0, size: 0.85 }).rotation.x = -Math.PI / 2;
  // concealed wall niche
  E.addInteractable({
    object: null, radius: 2.6,
    prompt: () => 'A niche behind the altar stone.\n"Three keepers. Three seals. One door beneath the tower."',
    enabled: () => nearXZ(E, cx, cz - 2.1, 2.6),
    onInteract: () => { E.flags.nicheRead = true; },
  });
}

function buildForest(E, trunkMat, barkMat, pineMat, rockMat) {
  const scene = E.scene;
  const st = { s: 99 };
  const rnd = () => { const x = Math.sin(st.s++) * 10000; return x - Math.floor(x); };

  // --- dead trees: instanced trunk + branches ---
  const trunkGeo = new THREE.CylinderGeometry(0.22, 0.42, 4.6, 7);
  trunkGeo.translate(0, 2.3, 0);
  const branchGeo = new THREE.CylinderGeometry(0.05, 0.12, 2.4, 5);
  branchGeo.translate(0, 1.2, 0);
  const DEAD = 120;
  const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, DEAD);
  const branches = new THREE.InstancedMesh(branchGeo, barkMat, DEAD * 3);
  const dummy = new THREE.Object3D();
  let bi = 0;
  const innerTrees = [];
  for (let i = 0; i < DEAD; i++) {
    // boundary ring, denser on the south trail edges
    const a = rnd() * Math.PI * 2;
    const r = 58 + rnd() * 78;
    let x = Math.cos(a) * r, z = Math.sin(a) * r * 0.92;
    if (z > 52 && Math.abs(x) < 7) x += x >= 0 ? 9 : -9; // keep trail corridor readable
    const s = 0.75 + rnd() * 1.15;
    dummy.position.set(x, -0.15, z);
    dummy.scale.setScalar(s);
    dummy.rotation.set((rnd() - 0.5) * 0.16, rnd() * Math.PI * 2, (rnd() - 0.5) * 0.16);
    dummy.updateMatrix();
    trunks.setMatrixAt(i, dummy.matrix);
    for (let b = 0; b < 3; b++) {
      dummy.position.set(x, (1.6 + rnd() * 2.4) * s, z);
      dummy.scale.setScalar(s * (0.6 + rnd() * 0.6));
      dummy.rotation.set((rnd() - 0.5) * 1.7, rnd() * Math.PI * 2, 0.55 + rnd() * 0.9);
      dummy.updateMatrix();
      branches.setMatrixAt(bi++, dummy.matrix);
    }
    innerTrees.push([x, z]);
  }
  trunks.castShadow = true;
  scene.add(trunks); scene.add(branches);

  // --- dark pines behind the mansion ---
  const pineGeo = new THREE.ConeGeometry(1.75, 5.6, 7);
  pineGeo.translate(0, 4.1, 0);
  const pineBase = new THREE.CylinderGeometry(0.24, 0.3, 1.6, 6);
  pineBase.translate(0, 0.8, 0);
  const PINES = 90;
  const pines = new THREE.InstancedMesh(pineGeo, pineMat, PINES);
  const pineBases = new THREE.InstancedMesh(pineBase, trunkMat, PINES);
  for (let i = 0; i < PINES; i++) {
    const a = Math.PI * (0.55 + rnd() * 0.9) + Math.PI; // northern half
    const r = 42 + rnd() * 62;
    const x = Math.cos(a) * r, z = -Math.abs(Math.sin(a) * r * 0.8) - 16;
    const s = 0.8 + rnd() * 1.3;
    dummy.position.set(x, 0, z);
    dummy.scale.setScalar(s);
    dummy.rotation.set(0, rnd() * Math.PI * 2, 0);
    dummy.updateMatrix();
    pines.setMatrixAt(i, dummy.matrix);
    pineBases.setMatrixAt(i, dummy.matrix);
  }
  pines.castShadow = true;
  scene.add(pines); scene.add(pineBases);

  // --- fallen logs & roots ---
  for (let i = 0; i < 22; i++) {
    const a = rnd() * Math.PI * 2, r = 34 + rnd() * 55;
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.24 + rnd() * 0.22, 0.3 + rnd() * 0.22, 2.2 + rnd() * 2.6, 7), barkMat);
    log.rotation.z = Math.PI / 2; log.rotation.y = rnd() * Math.PI;
    log.position.set(Math.cos(a) * r, 0.3, Math.sin(a) * r * 0.9);
    scene.add(log);
  }

  // --- scattered boundary boulders ---
  const boulderGeo = new THREE.DodecahedronGeometry(1, 0);
  for (let i = 0; i < 30; i++) {
    const a = rnd() * Math.PI * 2, r = 30 + rnd() * 62;
    const s = 0.6 + rnd() * 2.2;
    const b = new THREE.Mesh(boulderGeo, rockMat);
    b.position.set(Math.cos(a) * r, s * 0.22, Math.sin(a) * r * 0.88);
    b.scale.setScalar(s);
    b.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
    scene.add(b);
  }

  // --- collapsed estate wall fragments ---
  const wallMat = new THREE.MeshStandardMaterial({ map: E.textures.stone, roughness: 1 });
  for (const [wx, wz, wl, wr] of [[-52, 28, 9, 0.28], [54, 18, 7, -0.2], [-46, -30, 8, 0.15]]) {
    const frag = E.solidBox({ x: wx, y: 0.85, z: wz, w: wl, h: 1.7, d: 0.7, mat: wallMat, collider: true, castShadow: true });
    frag.rotation.y = wr;
  }

  // --- broken signpost with the mansion emblem ---
  const sign = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 2.5, 6), trunkMat); post.position.y = 1.25; sign.add(post);
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.62, 0.07), barkMat); board.position.set(0.1, 2.05, 0); board.rotation.z = -0.18; sign.add(board);
  sign.position.set(4.4, 0, 62); sign.rotation.y = -0.35;
  scene.add(sign);
  E.addSymbol({ tex: E.textures.symCrest, x: 4.4, y: 2.05, z: 61.97, ry: -0.35, size: 0.5 });
  E.colliders.push({ minX: 4.0, maxX: 4.8, minZ: 61.6, maxZ: 62.4, top: 2.6 });
}

// ---------- crest flowerbed texture ----------
function makeCrestFlowerTex() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 256, 256);
  const cx = 128, cy = 128;
  const cols = ['rgba(89,255,156,.75)', 'rgba(255,180,94,.75)', 'rgba(201,162,255,.75)'];
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, 108, (i * 2 * Math.PI) / 3 - Math.PI / 2 + 0.12, ((i + 1) * 2 * Math.PI) / 3 - Math.PI / 2 - 0.12);
    ctx.closePath();
    ctx.fillStyle = cols[i];
    ctx.fill();
  }
  ctx.beginPath(); ctx.arc(cx, cy, 26, 0, 7);
  ctx.fillStyle = 'rgba(20,24,32,.9)'; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(230,224,205,.8)'; ctx.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeFogSpriteTex() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(128, 64, 4, 128, 64, 120);
  g.addColorStop(0, 'rgba(255,255,255,.85)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.save(); ctx.scale(1, 0.5); ctx.translate(0, 64); ctx.fillRect(0, 0, 256, 256); ctx.restore();
  const t = new THREE.CanvasTexture(c);
  return t;
}
