// ============================================================
// TEXTURES — 100% procedural (canvas). No external assets.
// ============================================================
import * as THREE from 'three';

function makeTex(size, draw, { repeat = [1, 1], srgb = true, aniso = 4 } = {}) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  draw(ctx, size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = aniso;
  return t;
}

// ---------- base noise helpers ----------
function rand(seedRef) { const x = Math.sin(seedRef.s++) * 10000; return x - Math.floor(x); }
function noiseFill(ctx, s, base, amp, seed = 1) {
  const st = { s: seed };
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, s, s);
  for (let i = 0; i < s * s * 0.16; i++) {
    const v = (rand(st) - 0.5) * amp;
    ctx.fillStyle = v > 0 ? `rgba(255,255,255,${v / 255})` : `rgba(0,0,0,${-v / 255})`;
    ctx.fillRect(rand(st) * s, rand(st) * s, 1 + rand(st) * 2, 1 + rand(st) * 2);
  }
}

export function buildTextures() {
  const T = {};

  // ---------- exterior walls: weathered stone block ----------
  T.stone = makeTex(512, (ctx, s) => {
    noiseFill(ctx, s, '#5d5f5c', 46, 11);
    ctx.strokeStyle = 'rgba(20,22,20,.65)';
    ctx.lineWidth = 3;
    const rows = 6, bh = s / rows;
    for (let r = 0; r <= rows; r++) { ctx.beginPath(); ctx.moveTo(0, r * bh); ctx.lineTo(s, r * bh); ctx.stroke(); }
    const st = { s: 7 };
    for (let r = 0; r < rows; r++) {
      const off = r % 2 ? s / 8 : 0;
      for (let c = 0; c < 5; c++) {
        const x = (c * s / 4 + off) % s;
        ctx.beginPath(); ctx.moveTo(x, r * bh); ctx.lineTo(x, (r + 1) * bh); ctx.stroke();
        // block tonal variation
        ctx.fillStyle = `rgba(${140 + rand(st) * 60 | 0},${140 + rand(st) * 55 | 0},${130 + rand(st) * 50 | 0},0.16)`;
        ctx.fillRect(x + 2, r * bh + 2, s / 4 - 4, bh - 4);
      }
    }
    // moss streaks
    for (let i = 0; i < 26; i++) {
      ctx.fillStyle = `rgba(46,64,38,${0.12 + st.s % 10 / 40})`;
      const x = rand(st) * s; ctx.fillRect(x, rand(st) * s * 0.4, 3 + rand(st) * 6, 40 + rand(st) * 120);
    }
  }, { repeat: [2, 1.4] });

  // ---------- brick (chimneys / foundation) ----------
  T.brick = makeTex(256, (ctx, s) => {
    noiseFill(ctx, s, '#4a3430', 34, 21);
    ctx.strokeStyle = 'rgba(16,12,10,.7)'; ctx.lineWidth = 2;
    const rows = 8, bh = s / rows;
    for (let r = 0; r <= rows; r++) { ctx.beginPath(); ctx.moveTo(0, r * bh); ctx.lineTo(s, r * bh); ctx.stroke(); }
    for (let r = 0; r < rows; r++) {
      const off = r % 2 ? s / 10 : 0;
      for (let c = 0; c < 6; c++) { const x = (c * s / 5 + off) % s; ctx.beginPath(); ctx.moveTo(x, r * bh); ctx.lineTo(x, (r + 1) * bh); ctx.stroke(); }
    }
  }, { repeat: [1.6, 1.6] });

  // ---------- roof slates ----------
  T.roof = makeTex(512, (ctx, s) => {
    noiseFill(ctx, s, '#232a35', 30, 31);
    const rows = 10, st = { s: 5 };
    for (let r = 0; r < rows; r++) {
      const y = r * (s / rows);
      ctx.fillStyle = `rgba(${30 + rand(st) * 30 | 0},${38 + rand(st) * 32 | 0},${52 + rand(st) * 34 | 0},.75)`;
      ctx.fillRect(0, y, s, s / rows - 2);
      ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(0, y + s / rows - 2, s, 2);
      for (let c = 0; c < 8; c++) { const x = (c * s / 8 + (r % 2 ? s / 16 : 0)) % s; ctx.fillRect(x, y, 2, s / rows - 2); }
    }
  }, { repeat: [3, 2] });

  // ---------- wood planks (floors & panelling) ----------
  T.wood = makeTex(512, (ctx, s) => {
    noiseFill(ctx, s, '#33241a', 26, 41);
    const planks = 6, st = { s: 9 };
    for (let p = 0; p < planks; p++) {
      const y = p * (s / planks);
      ctx.fillStyle = `rgba(${66 + rand(st) * 34 | 0},${45 + rand(st) * 24 | 0},${26 + rand(st) * 16 | 0},.6)`;
      ctx.fillRect(0, y, s, s / planks - 2);
      ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, y + s / planks - 2, s, 2);
      // grain
      ctx.strokeStyle = 'rgba(20,12,6,.35)'; ctx.lineWidth = 1;
      for (let g = 0; g < 5; g++) { ctx.beginPath(); const gy = y + 6 + rand(st) * (s / planks - 12); ctx.moveTo(0, gy); for (let x = 0; x <= s; x += 32) ctx.lineTo(x, gy + Math.sin(x * 0.03 + rand(st) * 6) * 3); ctx.stroke(); }
    }
  }, { repeat: [3, 3] });

  // ---------- dark wallpaper ----------
  T.wallpaper = makeTex(512, (ctx, s) => {
    noiseFill(ctx, s, '#2e2b33', 20, 51);
    const st = { s: 13 };
    for (let x = 0; x < s; x += 64) {
      ctx.fillStyle = 'rgba(120,110,132,.16)'; ctx.fillRect(x, 0, 26, s);
      // damask diamond
      ctx.save(); ctx.translate(x + 13, (x / 64 % 2 ? 40 : 120));
      for (let ry = 0; ry < 4; ry++) {
        ctx.translate(0, 150);
        ctx.fillStyle = 'rgba(150,140,170,.14)';
        ctx.beginPath(); ctx.moveTo(0, -16); ctx.quadraticCurveTo(14, 0, 0, 16); ctx.quadraticCurveTo(-14, 0, 0, -16); ctx.fill();
      }
      ctx.restore();
    }
    // water damage
    for (let i = 0; i < 9; i++) { ctx.fillStyle = 'rgba(18,20,16,.35)'; ctx.beginPath(); ctx.ellipse(rand(st) * s, s * .8 + rand(st) * 40, 20 + rand(st) * 40, 60 + rand(st) * 80, 0, 0, 7); ctx.fill(); }
  }, { repeat: [2, 1.6] });

  // ---------- grand hall checker floor ----------
  T.checker = makeTex(512, (ctx, s) => {
    const n = 4, cell = s / n;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      ctx.fillStyle = (x + y) % 2 ? '#141416' : '#cfc8b8';
      ctx.fillRect(x * cell, y * cell, cell, cell);
      ctx.fillStyle = 'rgba(60,52,40,.25)'; ctx.fillRect(x * cell, y * cell, cell, cell);
    }
    const st = { s: 17 };
    for (let i = 0; i < 240; i++) { ctx.fillStyle = `rgba(0,0,0,${rand(st) * .3})`; ctx.fillRect(rand(st) * s, rand(st) * s, 2, 2); }
  }, { repeat: [4, 4] });

  // ---------- carpet runner ----------
  T.carpet = makeTex(256, (ctx, s) => {
    noiseFill(ctx, s, '#40161a', 22, 61);
    ctx.strokeStyle = '#7d5b2e'; ctx.lineWidth = 6; ctx.strokeRect(14, 0, s - 28, s);
    ctx.strokeStyle = 'rgba(125,91,46,.5)'; ctx.lineWidth = 2; ctx.strokeRect(30, 0, s - 60, s);
  }, { repeat: [1, 6] });

  // ---------- ground: dirt & dead grass ----------
  T.ground = makeTex(512, (ctx, s) => {
    noiseFill(ctx, s, '#1f2418', 38, 71);
    const st = { s: 3 };
    for (let i = 0; i < 900; i++) {
      ctx.strokeStyle = `rgba(${52 + rand(st) * 30 | 0},${54 + rand(st) * 26 | 0},${30 + rand(st) * 18 | 0},.6)`;
      ctx.lineWidth = 1; const x = rand(st) * s, y = rand(st) * s;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (rand(st) - .5) * 4, y - 4 - rand(st) * 6); ctx.stroke();
    }
  }, { repeat: [24, 22] });

  // ---------- gravel path ----------
  T.gravel = makeTex(256, (ctx, s) => {
    noiseFill(ctx, s, '#3c3a36', 40, 81);
    const st = { s: 19 };
    for (let i = 0; i < 520; i++) {
      const g = 90 + rand(st) * 110 | 0;
      ctx.fillStyle = `rgb(${g},${g},${g - 8})`;
      ctx.beginPath(); ctx.ellipse(rand(st) * s, rand(st) * s, 2 + rand(st) * 3.4, 1.6 + rand(st) * 2.4, rand(st) * 3, 0, 7); ctx.fill();
    }
  }, { repeat: [2, 10] });

  // ---------- crypt marble ----------
  T.marble = makeTex(512, (ctx, s) => {
    noiseFill(ctx, s, '#8f8d88', 18, 91);
    ctx.strokeStyle = 'rgba(60,60,62,.4)'; ctx.lineWidth = 1.4;
    const st = { s: 23 };
    for (let i = 0; i < 15; i++) {
      ctx.beginPath(); let x = rand(st) * s, y = 0; ctx.moveTo(x, y);
      while (y < s) { y += 18 + rand(st) * 26; x += (rand(st) - .5) * 60; ctx.lineTo(x, y); }
      ctx.stroke();
    }
  }, { repeat: [2, 2] });

  // ---------- iron (gate / fence, as color map) ----------
  T.iron = makeTex(128, (ctx, s) => {
    noiseFill(ctx, s, '#14161a', 14, 101);
    const st = { s: 29 };
    for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(94,62,32,${rand(st) * .5})`; ctx.fillRect(rand(st) * s, rand(st) * s, 2 + rand(st) * 3, 2 + rand(st) * 3); }
  });

  // ---------- portrait (scratched faces) ----------
  T.portrait = makeTex(256, (ctx, s) => {
    const g = ctx.createLinearGradient(0, 0, 0, s);
    g.addColorStop(0, '#241a12'); g.addColorStop(.5, '#3a2c1e'); g.addColorStop(1, '#1c140d');
    ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
    // frame
    ctx.strokeStyle = '#6e5326'; ctx.lineWidth = 14; ctx.strokeRect(4, 4, s - 8, s - 8);
    // figure silhouette
    ctx.fillStyle = '#151017';
    ctx.beginPath(); ctx.ellipse(s / 2, s * .38, 30, 40, 0, 0, 7); ctx.fill();       // head
    ctx.beginPath(); ctx.moveTo(s * .18, s); ctx.quadraticCurveTo(s / 2, s * .44, s * .82, s); ctx.fill(); // shoulders
    // scratched-out face
    ctx.strokeStyle = 'rgba(200,190,170,.55)'; ctx.lineWidth = 2;
    const st = { s: 37 };
    for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.moveTo(s / 2 - 26 + rand(st) * 52, s * .24 + rand(st) * 40); ctx.lineTo(s / 2 - 26 + rand(st) * 52, s * .24 + rand(st) * 40); ctx.stroke(); }
  });

  // ---------- moon (sprite) ----------
  T.moon = makeTex(256, (ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 10, s / 2, s / 2, s / 2);
    g.addColorStop(0, '#ffffff'); g.addColorStop(.72, '#dfe6ef'); g.addColorStop(.9, 'rgba(190,205,225,.55)'); g.addColorStop(1, 'rgba(190,205,225,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
    const st = { s: 43 };
    for (let i = 0; i < 26; i++) { ctx.fillStyle = `rgba(160,168,180,${.3 + rand(st) * .35})`; ctx.beginPath(); ctx.ellipse(s * .3 + rand(st) * s * .4, s * .3 + rand(st) * s * .4, 2 + rand(st) * 8, 2 + rand(st) * 7, 0, 0, 7); ctx.fill(); }
  });

  // ================= HAUNTED SYMBOL SYSTEM =================
  const symbol = (drawFn, glow) => makeTex(256, (ctx, s) => {
    ctx.clearRect(0, 0, s, s);
    ctx.strokeStyle = glow; ctx.fillStyle = glow;
    ctx.shadowColor = glow; ctx.shadowBlur = 18;
    ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    drawFn(ctx, s);
  }, { srgb: true });

  // A — Soul Spiral: three curved lines around a central dot
  T.symSpiral = symbol((ctx, s) => {
    ctx.beginPath(); ctx.arc(s / 2, s / 2, 16, 0, 7); ctx.fill();
    for (const [r, a0, a1] of [[52, -Math.PI * .35, Math.PI * .75], [82, Math.PI * .55, Math.PI * 1.6], [112, Math.PI * 1.15, Math.PI * 2.35]]) {
      ctx.beginPath(); ctx.arc(s / 2, s / 2, r, a0, a1); ctx.stroke();
    }
  }, '#59ff9c');

  // B — Marionette Knot: small diamond with four thread-like arms
  T.symKnot = symbol((ctx, s) => {
    ctx.save(); ctx.translate(s / 2, s / 2); ctx.rotate(Math.PI / 4);
    ctx.strokeRect(-34, -34, 68, 68);
    ctx.beginPath(); ctx.arc(0, 0, 9, 0, 7); ctx.fill(); ctx.restore();
    ctx.lineWidth = 8;
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
      ctx.beginPath(); ctx.moveTo(s / 2 + dx * 52, s / 2 + dy * 52); ctx.lineTo(s / 2 + dx * 112, s / 2 + dy * 112); ctx.stroke();
      ctx.beginPath(); ctx.arc(s / 2 + dx * 118, s / 2 + dy * 118, 5, 0, 7); ctx.fill();
    }
  }, '#ffb45e');

  // C — Broken Crown: three upward points with a gap in the centre
  T.symCrown = symbol((ctx, s) => {
    ctx.beginPath();
    ctx.moveTo(38, 150); ctx.lineTo(38, 74); ctx.lineTo(78, 118); ctx.lineTo(100, 46); ctx.lineTo(112, 128);
    ctx.lineTo(148, 128); ctx.lineTo(164, 46); ctx.lineTo(186, 118); ctx.lineTo(220, 74); ctx.lineTo(220, 150); ctx.closePath();
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(38, 190); ctx.lineTo(220, 190); ctx.stroke();
  }, '#c9a2ff');

  // D — House Crest: tower inside a circle with three outer marks
  T.symCrest = symbol((ctx, s) => {
    ctx.beginPath(); ctx.arc(s / 2, s / 2, 96, 0, 7); ctx.stroke();
    ctx.strokeRect(s / 2 - 22, s / 2 - 8, 44, 62);           // tower body
    ctx.beginPath(); ctx.moveTo(s / 2 - 30, s / 2 - 8); ctx.lineTo(s / 2, s / 2 - 52); ctx.lineTo(s / 2 + 30, s / 2 - 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s / 2, s / 2 + 54); ctx.lineTo(s / 2, s / 2 + 30); ctx.stroke(); // door slit
    for (const a of [-Math.PI / 2, Math.PI * .22, Math.PI * .78]) {
      const x = s / 2 + Math.cos(a + Math.PI / 2) * 96, y = s / 2 + Math.sin(a + Math.PI / 2) * 96;
      ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.stroke();
    }
  }, '#e6e0cd');

  // E — The Unknown Mark: incomplete circle, missing centre
  T.symUnknown = symbol((ctx, s) => {
    ctx.beginPath(); ctx.arc(s / 2, s / 2, 88, Math.PI * .32, Math.PI * 1.68); ctx.stroke();
    ctx.beginPath(); ctx.arc(s / 2, s / 2, 26, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s / 2, s / 2 - 40); ctx.lineTo(s / 2, s / 2 - 66); ctx.stroke();
  }, '#8effff');

  // ---------- window glows ----------
  const pane = (inner, outer) => makeTex(128, (ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 8, s / 2, s / 2, s / 1.6);
    g.addColorStop(0, inner); g.addColorStop(1, outer);
    ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = 'rgba(10,10,10,.9)'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(s / 2, 0); ctx.lineTo(s / 2, s); ctx.moveTo(0, s / 2); ctx.lineTo(s, s / 2); ctx.stroke();
  });
  T.paneGreen = pane('#b6ffd0', '#12944e');
  T.paneOrange = pane('#ffd9a0', '#c26419');
  T.paneCold = pane('#3a4660', '#0b0f1c');

  return T;
}
