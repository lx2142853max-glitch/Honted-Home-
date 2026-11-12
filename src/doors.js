// ============================================================
// DOORS — hinged panels, locks, sliders (PRD §12 door types)
// ============================================================
import * as THREE from 'three';
import { audio } from './audio.js';

// Door types (PRD §12):
//  'wood'    → opens normally (may creak)
//  'iron'    → mechanical, heavy sound
//  'glass'   → conservatory rear door etc.
//  'seal3'   → requires all three Boss Seals (tower / null chamber)
//  'power'   → requires boiler power restored
//  'spiral'  → Symbol-locked: sealed forever (green room) — flavor
//  'locked'  → named key / swollen / padlock — never opens, flavor text
export function makeDoor(E, {
  x, z, y = 0, ry = 0,           // ry=0 wall along X (faces ±z) · ry=PI/2 wall along Z
  w = 1.15, h = 2.35, t = 0.09,
  kind = 'wood',
  name = 'door',
  lockMsg = 'Locked.',
  mat,
  swing = 1,                     // +1 / -1 swing direction
  double = false,
  colliderTop,
  once = false,                  // finale doors: after opening, door is no longer interactive (stays open)
} = {}) {
  const pivot = new THREE.Group();
  pivot.position.set(x, y, z);
  pivot.rotation.y = ry;

  const panels = [];
  const mkPanel = (pw, ox) => {
    const p = new THREE.Group();
    p.position.set(ox, 0, 0);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(pw, h, t), mat);
    panel.position.set(swing * pw / 2, h / 2, 0);
    panel.castShadow = true;
    p.add(panel);
    // handle
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), new THREE.MeshStandardMaterial({ color: 0x8a6f3a, roughness: 0.35, metalness: 0.85 }));
    knob.position.set(swing * (pw - 0.16), h * 0.47, 0.085);
    p.add(knob);
    pivot.add(p);
    panels.push(p);
    return p;
  };

  if (double) { mkPanel(w / 2, -w / 2); const q = mkPanel(w / 2, w / 2); q.userData.mirror = true; }
  else mkPanel(w, -w / 2);

  E.scene.add(pivot);

  // closed-state collider (axis aligned)
  const alongX = (ry % Math.PI) < 0.01;
  const col = {
    minX: alongX ? x - w / 2 : x - 0.14,
    maxX: alongX ? x + w / 2 : x + 0.14,
    minZ: alongX ? z - 0.14 : z - w / 2,
    maxZ: alongX ? z + 0.14 : z + w / 2,
    top: y + (colliderTop || h),
    bottom: y,
    enabled: true,
  };
  E.colliders.push(col);

  const door = {
    open: false,
    angle: 0,
    target: 0,
    col,
    pivot,
    panels,
    kind,
    name,
    once,
  };

  const tryToggle = () => {
    if (!door.open) {
      // attempt unlock
      if (kind === 'seal3') {
        if ((E.flags.seals || 0) >= 3) { E.flags.towerDoorOpen = true; audio.metalClick(); audio.bellToll(147, 0.4); }
        else { audio.rumble(); flashPrompt(E, `The iron door does not yield.\n${E.flags.seals || 0} / 3 Seals. The recesses are empty.`); return; }
      } else if (kind === 'power') {
        if (E.flags.powerRestored) { audio.metalClick(); }
        else { audio.rumble(); flashPrompt(E, 'A mechanical lock. No current runs to it.\nThe boiler must be restored first.'); return; }
      } else if (kind === 'spiral') {
        audio.rumble();
        flashPrompt(E, 'Carved around the lock: the Soul Spiral.\nThe door has never opened. The hinges are fused with old paint — and old fingerprints.');
        return;
      } else if (kind === 'locked') {
        audio.rumble();
        flashPrompt(E, lockMsg);
        return;
      }
      door.open = true;
      door.target = swing * 1.92;
      col.enabled = false;
      audio.doorOpen(kind === 'iron');
    } else {
      door.open = false;
      door.target = 0;
      col.enabled = true;
      audio.doorClose();
    }
  };

  E.addInteractable({
    object: pivot,
    radius: Math.max(2.0, w * 1.15),
    prompt: () => {
      if (kind === 'seal3' && (E.flags.seals || 0) < 3) return 'Tower Iron Door — sealed\nThree recesses gape empty';
      if (kind === 'power' && !E.flags.powerRestored) return 'Sealed Service Door\nNo power — the lock is dead';
      if (kind === 'spiral') return 'Symbol-locked Door';
      if (kind === 'locked') return name;
      return door.open ? `Close ${name}` : `Open ${name}`;
    },
    enabled: () => {
      if (once && door.open) return false; // one-way: the finale door stays open and stops competing for the interact prompt
      const p = E.camera.position;
      const dx = p.x - x, dz = p.z - z;
      const dy = Math.abs(p.y - (y + 1.62));
      return dx * dx + dz * dz < 2.6 * 2.6 && dy < 1.6;
    },
    onInteract: tryToggle,
  });

  // smooth swing
  E.tick.push((dt) => {
    if (Math.abs(door.angle - door.target) > 0.001) {
      door.angle += (door.target - door.angle) * Math.min(1, dt * 3.4);
      for (const p of panels) {
        p.rotation.y = p.userData.mirror ? -door.angle : door.angle;
      }
    }
  });

  return door;
}

// sliding secret panel (bookshelves, wall panels)
export function makeSlider(E, {
  x, y, z, w = 1.35, h = 2.6, t = 0.22,
  mat, slideTo = 1.6, axis = 'x',
  name = 'panel',
  reveals = '',
} = {}) {
  const panel = new THREE.Mesh(new THREE.BoxGeometry(axis === 'x' ? w : t, h, axis === 'x' ? t : w), mat);
  panel.position.set(x, y + h / 2, z);
  panel.castShadow = true;
  E.scene.add(panel);
  const col = {
    minX: x - (axis === 'x' ? w / 2 : t / 2) - 0.02, maxX: x + (axis === 'x' ? w / 2 : t / 2) + 0.02,
    minZ: z - (axis === 'x' ? t / 2 : w / 2) - 0.02, maxZ: z + (axis === 'x' ? t / 2 : w / 2) + 0.02,
    top: y + h, enabled: true,
  };
  E.colliders.push(col);
  let open = false;
  let progress = 0, target = 0;
  E.addInteractable({
    object: panel,
    radius: 2.2,
    prompt: () => open ? reveals || 'The way stands open' : name,
    enabled: () => {
      const p = E.camera.position;
      const dx = p.x - panel.position.x, dz = p.z - panel.position.z;
      return dx * dx + dz * dz < 2.3 * 2.3 && Math.abs(p.y - (y + 1.62)) < 1.6;
    },
    onInteract: () => {
      open = !open;
      target = open ? 1 : 0;
      if (open) audio.metalClick();
    },
  });
  E.tick.push((dt) => {
    if (Math.abs(progress - target) < 0.001) return;
    progress += (target - progress) * Math.min(1, dt * 2.6);
    const off = progress * slideTo;
    if (axis === 'x') panel.position.x = x + off; else panel.position.z = z + off;
    col.enabled = progress < 0.7;
    if (axis === 'x') { col.minX = panel.position.x - w / 2; col.maxX = panel.position.x + w / 2; }
    else { col.minZ = panel.position.z - w / 2; col.maxZ = panel.position.z + w / 2; }
  });
  return panel;
}

// brief flash of text on the prompt element (reuse HUD prompt)
export function flashPrompt(E, text) {
  if (E.onFlashPrompt) E.onFlashPrompt(text);
}
