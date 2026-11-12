// ============================================================
// PLAYER — first-person controller: WASD + mouse, touch joystick,
// circle-vs-AABB collision, stair step-up, head bob, footsteps
// ============================================================
import { audio } from './audio.js';

export function createPlayer(E) {
  const camera = E.camera;
  const player = {
    yaw: 0,                 // face the mansion (we start south of it, facing north / -z)
    pitch: 0,
    feetY: 0,
    eyeHeight: 1.62,
    crouch: false,
    enabled: false,
    keys: new Set(),
    bobPhase: 0,
    bobAmp: 0,
    stepAcc: 0,
    velX: 0, velZ: 0,
    height() { return this.crouch ? 1.05 : 1.62; },
  };
  camera.rotation.order = 'YXZ';
  camera.position.set(0, player.eyeHeight, 62);

  const KEYMAP = { KeyW: 'f', ArrowUp: 'f', KeyS: 'b', ArrowDown: 'b', KeyA: 'l', ArrowLeft: 'l', KeyD: 'r', ArrowRight: 'r', ShiftLeft: 'run', ShiftRight: 'run' };

  window.addEventListener('keydown', (e) => {
    if (!player.enabled) return;
    const k = KEYMAP[e.code];
    if (k) { player.keys.add(k); e.preventDefault(); }
    if (e.code === 'KeyC') player.crouch = !player.crouch;
  });
  window.addEventListener('keyup', (e) => {
    const k = KEYMAP[e.code];
    if (k) player.keys.delete(k);
  });

  // ---------- mouse look (pointer lock) ----------
  let mouseDown = false;
  window.addEventListener('mousedown', () => { mouseDown = true; });
  window.addEventListener('mouseup', () => { mouseDown = false; });
  document.addEventListener('mousemove', (e) => {
    const locked = document.pointerLockElement === E.canvas;
    if (!locked || !player.enabled) return;
    player.yaw -= e.movementX * 0.0023;
    player.pitch -= e.movementY * 0.0023;
    player.pitch = Math.max(-1.45, Math.min(1.45, player.pitch));
  });

  // ---------- touch controls ----------
  const joy = { active: false, id: -1, ox: 0, oy: 0, dx: 0, dy: 0 };
  const look = { active: false, id: -1, lx: 0, ly: 0 };
  const joyZone = document.getElementById('joy-zone');
  const joyBase = document.getElementById('joy-base');
  const joyKnob = document.getElementById('joy-knob');

  if (joyZone) {
    joyZone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        if (joy.active) continue;
        joy.active = true; joy.id = t.identifier;
        joy.ox = t.clientX; joy.oy = t.clientY; joy.dx = 0; joy.dy = 0;
        joyBase.style.display = 'block';
        joyBase.style.left = (t.clientX - 56) + 'px';
        joyBase.style.top = (t.clientY - 56) + 'px';
        joyKnob.style.left = '30px'; joyKnob.style.top = '30px';
      }
    }, { passive: false });
    joyZone.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        if (t.identifier !== joy.id) continue;
        let dx = t.clientX - joy.ox, dy = t.clientY - joy.oy;
        const len = Math.hypot(dx, dy);
        if (len > 46) { dx = dx / len * 46; dy = dy / len * 46; }
        joy.dx = dx / 46; joy.dy = dy / 46;
        joyKnob.style.left = (30 + dx) + 'px';
        joyKnob.style.top = (30 + dy) + 'px';
      }
    }, { passive: false });
    const endJoy = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === joy.id) {
          joy.active = false; joy.dx = 0; joy.dy = 0;
          joyBase.style.display = 'none';
        }
      }
    };
    joyZone.addEventListener('touchend', endJoy);
    joyZone.addEventListener('touchcancel', endJoy);
  }
  // look drag on the right half of the screen
  window.addEventListener('touchstart', (e) => {
    if (!player.enabled) return;
    for (const t of e.changedTouches) {
      const tag = (t.target && t.target.id) || '';
      if (tag === 'btn-interact' || tag === 'btn-journal' || tag === 'mute-btn') continue;
      if (t.clientX < window.innerWidth * 0.45) continue;
      if (look.active) continue;
      look.active = true; look.id = t.identifier;
      look.lx = t.clientX; look.ly = t.clientY;
    }
  }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (!player.enabled) return;
    for (const t of e.changedTouches) {
      if (t.identifier !== look.id) continue;
      const dx = t.clientX - look.lx, dy = t.clientY - look.ly;
      look.lx = t.clientX; look.ly = t.clientY;
      player.yaw -= dx * 0.0042;
      player.pitch -= dy * 0.0042;
      player.pitch = Math.max(-1.45, Math.min(1.45, player.pitch));
    }
  }, { passive: true });
  const endLook = (e) => { for (const t of e.changedTouches) if (t.identifier === look.id) look.active = false; };
  window.addEventListener('touchend', endLook);
  window.addEventListener('touchcancel', endLook);

  // ---------- collision ----------
  const RADIUS = 0.34;
  const collidesAt = (x, z, feetY) => {
    const bodyBottom = feetY + 0.02;
    const bodyTop = feetY + player.height();
    for (const c of E.colliders) {
      if (c.enabled === false) continue;
      if (c.top <= feetY + 0.38) continue;          // step-up ledge → treated as floor
      if (c.minZ > z + RADIUS || c.maxZ < z - RADIUS) continue;
      if (c.minX > x + RADIUS || c.maxX < x - RADIUS) continue;
      // vertical range overlaps? (collider assumed to span from 0 up to its top; basements handled since tops are absolute)
      const cBottom = c.bottom !== undefined ? c.bottom : -Infinity;
      if (c.top <= bodyBottom) continue;
      if (cBottom >= bodyTop) continue;
      return true;
    }
    return false;
  };

  // ---------- update ----------
  player.update = function (dt) {
    if (!player.enabled) return;

    // input direction (camera-relative, on XZ)
    let ix = 0, iz = 0;
    if (player.keys.has('f')) iz -= 1;
    if (player.keys.has('b')) iz += 1;
    if (player.keys.has('l')) ix -= 1;
    if (player.keys.has('r')) ix += 1;
    if (joy.active) { ix += joy.dx; iz += joy.dy; }
    const il = Math.hypot(ix, iz);
    if (il > 1) { ix /= il; iz /= il; }

    const run = player.keys.has('run') && !player.crouch;
    const speed = player.crouch ? 1.6 : run ? 5.3 : 3.1;

    const sin = Math.sin(player.yaw), cos = Math.cos(player.yaw);
    const moveX = (ix * cos - iz * sin) * speed * dt;
    const moveZ = (ix * sin + iz * cos) * speed * dt;

    const p = camera.position;
    let nx = p.x + moveX;
    if (collidesAt(nx, p.z, player.feetY)) nx = p.x;
    let nz = p.z + moveZ;
    if (collidesAt(nx, nz, player.feetY)) nz = p.z;

    // vertical: snap toward floor (with smooth stair descent)
    const floorY = E.floorHeightAt(nx, nz, player.feetY + 0.05);
    if (floorY > player.feetY) player.feetY = Math.min(floorY, player.feetY + 3.6 * dt + 0.02); // step-up smoothing
    else if (floorY < player.feetY) player.feetY = Math.max(floorY, player.feetY - 6.5 * dt);

    const moving = il > 0.08;
    // head bob
    const targetAmp = moving ? (run ? 0.075 : player.crouch ? 0.02 : 0.045) : 0;
    player.bobAmp += (targetAmp - player.bobAmp) * Math.min(1, dt * 8);
    if (moving) player.bobPhase += dt * (run ? 11.5 : player.crouch ? 5.2 : 7.6);
    const bob = Math.sin(player.bobPhase) * player.bobAmp;

    // footsteps
    if (moving) {
      player.stepAcc += Math.hypot(moveX, moveZ);
      const stride = run ? 2.4 : player.crouch ? 3.1 : 1.9;
      if (player.stepAcc >= stride) {
        player.stepAcc = 0;
        const insideHouse = Math.abs(nx) < 21 && Math.abs(nz) < 15;
        const surface = player.feetY < -0.5 ? 'marble' : insideHouse ? (Math.abs(nx) < 6 && nz > -2 && nz < 15 ? 'marble' : 'wood') : 'gravel';
        audio.footstep(surface, player.crouch ? 0.1 : run ? 0.4 : 0.24);
      }
    }

    const eye = player.feetY + (player.crouch ? 1.05 : 1.62) + bob;
    camera.position.set(nx, eye, nz);
    camera.rotation.y = player.yaw;
    camera.rotation.x = player.pitch;
  };

  return player;
}
