// ============================================================
// THE CURSED MANSION — Honted Home · Chapter One: Three Seals
// main.js — boot, UI flow, interaction loop, objectives, journal
// ============================================================
import * as THREE from 'three';
import { initEngine, FLOOR } from './engine.js';
import { buildGrounds } from './grounds.js';
import { buildMansion } from './mansion.js';
import { buildProps, checkRegions } from './props.js';
import { createPlayer } from './player.js';
import { audio } from './audio.js';

const canvas = document.getElementById('game-canvas');
const E = initEngine(canvas);
// debug/support handle (used by automated smoke tests; harmless in production)
window.__honted = { E };

// ================= BUILD THE WORLD =================
buildGrounds(E);
const MATS = buildMansion(E);
buildProps(E, MATS);
const player = createPlayer(E);
window.__honted.player = player;

// ================= CLUE LIBRARY =================
const CLUES = {
  crestRead: ['D — House Crest', 'A tower inside a circle, with three outer marks. Set into the front gate — and stamped into every key, seal and order of the manor.'],
  mausoleumRead: ['The New Stone', 'One fresh grave among the old. The name has been chiselled off — recently, and carefully.'],
  letter: ['Clue 2 · A Torn Letter', '“Three keepers. Three seals. One door beneath the tower.”'],
  safe: ['The Small Safe', 'Bills long unpaid, and one wedding ring. “M — until the house lets go.”'],
  fireplace: ['The Cold Fireplace', 'Something was burned here deliberately — and recently. The soot flakes like scales.'],
  plan: ['Half a Floor Plan', 'The tower chamber is scratched out in charcoal so hard the paper tore.'],
  planFragment: ['A Floor-Plan Fragment', 'The tower stairs drawn on the landing plan are longer than the tower.'],
  guardianJournal: ['The Guardian Journal · 1897', '“We were not jailers. We were the lock. God forgive us, we are still holding.”'],
  narrowDoor: ['The Narrow Door', 'Iron-bound, spiral-carved, immovable. The house keeps some doors shut for its own reasons.'],
  dumbwaiter: ['The Dumbwaiter', 'Warm air rises from the kitchen shaft. The kitchen has been cold for a hundred years.'],
  floorboardNote: ['Beneath the Floorboard', '“If the house asks your name, do not give it. — M.”'],
  fountain: ['The Cracked Fountain', 'The basin split clean in half, as if something inside it grew.'],
  brickedArch: ['The Bricked Arch', 'A sealed arch into the tower foundations. The mortar predates the manor.'],
  brickedFlue: ['The Bricked Flue', 'The library chimney was sealed from the inside. Something was sealed IN with the smoke.'],
  silverKey: ['The Knotted Key', 'A key stamped with the Marionette Knot, folded inside a napkin at the thirteenth setting.'],
  childDrawing: ['Clue 3 · The Empty Oval', 'Three hooded figures around a fourth drawn as an empty oval. “The one with no face lives under the stairs.”'],
  dollhouse: ['The Dollhouse', 'A perfect miniature of the manor. The tower chair faces the wall. The tower bed is warm.'],
  crawlspace: ['The Crawlspace', 'Nailed shut from this side. Whatever used it was not escaping — it was being kept in.'],
  marionettes: ['The Gallery', 'Cut from nothing, strung with nothing. Their shadows fall differently than their bodies hang.'],
  eyeCabinet: ['Rows of Eyes', 'Glass eyes sorted by colour behind the flat-file lock. Blue. Brown. Grey.'],
  piano: ['The Playerless Piano', 'It plays the music-box phrase, slower, and sadder. Somewhere in the house, something answers in the dark.'],
  musicBox: ['The Music Box', 'Three notes of a waltz. Somewhere else, the melody repeats — only slower.'],
  archiveJournals: ['Clue 4 · The Archive', '“The guardians were once protectors, not monsters. What sleeps below, we asked to wait. It is still waiting.”'],
  frostCabinet: ['The Frost-Grown Cabinet', 'Frost over the lock like a second door. One coiled shape inside. You leave it.'],
  unknownMark1: ['An Incomplete Circle', 'Scratched into plaster by something without fingernails. A circle with a missing centre.'],
  diary: ['Her Diary · 1897', '“The dolls sang tonight. We left at dawn and did not stop until the sea. Do not let the house learn your name.”'],
  wardrobe: ['The Wardrobe', 'A hundred coats, all buttoned, all facing the door.'],
  portraitCompartment: ['The Third Keeper', '“There is a third keeper, the one history will not name.”'],
  blackMirror: ['The Covered Mirror', 'Silvered black. The cloth over it breathes in time with you.'],
  bellRope: ['The Cut Rope', 'Fresh fibres at the cut. Someone wanted the bell silent — someone else wants it rung.'],
  familyTree: ['The Vellacott Line', 'Nine generations of keepers. The branch snaps at 1897 — E., M. and G. Beneath: a fourth name, scraped clean.'],
  codedPage: ['Clue 6 · The Coded Page', '“The seals are not keys. They are names. The fourth name, we never learned.”'],
  emptyCase: ['The Empty Case', 'A fresh dust outline. The label reads: “THE VISITOR. DO NOT FEED. DO NOT NAME.”'],
  telescope: ['The Fixed Telescope', 'It will not turn toward the manor, and the mount is rusted solid. “ALIGN — SPIRAL · KNOT · CROWN.”'],
  symbolWall: ['The Fifth Frame', 'Spiral. Knot. Crown. Crest. And one frame cut into bare stone, waiting. Beneath it: “THE FIFTH IS OURS TO WEAR.”'],
  pendant: ['The Guardian Pendant', 'Gold, warm, and waiting. The fourth recess, the fourth pedestal — it answers to this.'],
  gateCrest: ['The Gate Crest, Recast', 'The fresh recess in the original casting. Someone fitted three round objects into it — recently.'],
  tunnelMap: ['The Underworks · 1711', 'Five tunnel arms. Four inked. One blacked out and scratched through — directly beneath the tower.'],
  boilerGauges: ['3 · 1 · 4', '“THE MANOR DRINKS AT 3-1-4.” The pipes tick like a clock learning to walk.'],
  cage: ['The Cage', 'Two centuries of rust around a brand-new lock. One chair inside, facing the wall.'],
  vintage: ['The 1897 Vintage', '“The last vintage. Never opened. Not for weddings. Not for wakes. Not for HER.”'],
  guardianRecord: ['Clue 7 · The Crypt Tablet', '“The three Seals are parts of one larger lock. We were protectors before we were keepers.”'],
  plaque: ['The Tunnel Plaque', '“WEST — CRYPT · EAST — WORKS · BELOW — THE SILENCE. NO MAN SHALL BE SENT BELOW.”'],
  clockRead: ['3:07', 'The manor stopped keeping public time at 3:07. Every clock you find agrees.'],
  shedMsg: ['The Garden Shed', 'Padlocked green with age. Maintenance tools for a house that no longer has anyone to maintain it.'],
  hatchMsg: ['The Rusted Hatch', 'Fused shut. Whatever it opened onto, the house does not want you walking to it.'],
  nicheRead: ['The Chapel Niche', '“Three keepers. Three seals. One door beneath the tower.” Carved by a stranger hand than the rest.'],
  cabinetMsg: ['The Greenhouse Cabinet', 'Locked. Glass glints inside — one small, cold eye of a thing.'],
  coldBreath: ['The Cold Draught', 'Air leaks from beneath the maintenance door — cold, steady, patient.'],
  seal_spiral: ['SEAL I · Soul Spiral', 'Vorak’s seal. Three curved lines around a central dot. It is cold. It remembers being carried before.'],
  seal_knot: ['SEAL II · Marionette Knot', 'Morvex’s seal. A diamond with four thread-like arms. It grows heavier near strings.'],
  seal_crown: ['SEAL III · Broken Crown', 'Grimthor’s seal. Three upward points with a gap in the centre. It hums when thunder rolls.'],
  lockedTrunk: ['The Steamer Trunk', 'Theatre Royal. The lock is stamped for a stage door that burned in 1904. It will not open. It was never meant to.'],
  noPendant: ['The Fourth Pedestal', 'A circular recess the exact size of a pendant. You do not have it — not yet.'],
  brickedCellar: ['The Cellar', 'Nothing down here was meant to be found by the living.'],
};
const discoveredClues = new Set(['crestRead']);   // the gate clue finds you first

// ================= HOOKS (world → UI) =================
const sealToast = (title, sub) => showBanner(title, sub);
E.hooks = {
  onClue(id) {
    discoveredClues.add(id);
    const el = document.getElementById('journal-clues');
    if (el && !journalEl.classList.contains('hidden')) renderClues();
  },
  onSeal(key, title, keeper, count) {
    const slot = document.getElementById('seal-' + key);
    if (slot) slot.classList.add('got');
    sealToast(title, keeper + ' — ' + count + ' of 3 recovered');
    setObjectiveForProgress();
  },
  onPendant() {
    showBanner('THE GUARDIAN PENDANT', 'The fourth recess waits beneath the tower');
    setObjectiveForProgress();
  },
  onPower() {
    showBanner('THE MANOR WAKES', 'Somewhere above, a chandelier flares alight');
  },
  onSealsPlaced() {
    showBanner('THE THREE SEALS TURN', 'Below the Grand Hall, something ancient has begun to breathe');
    // fade the Unknown Mark into view over the sanctum wall
    let op = 0;
    const fade = () => { op += 0.008; if (E.unknownWall) E.unknownWall.material.opacity = Math.min(0.92, op); if (op < 0.92) requestAnimationFrame(fade); };
    fade();
    setObjectiveForProgress();
  },
  onEnding() {
    setTimeout(() => showEnding(), 1400);
  },
  onRegion(id, name, sub, sfx) {
    if (sfx === 'whisper') audio.whisper();
    else if (sfx === 'musicBox') audio.musicBox();
    showBanner(name.toUpperCase(), sub);
    if (id === 'grandHall') setObjectiveForProgress();
  },
};

function setObjectiveForProgress() {
  const f = E.flags;
  let text;
  if (!f.regionsFired || !f.regionsFired.has('grandHall')) {
    text = 'Enter the manor. The door is unlocked. Probably.';
  } else if (!f.seal_spiral) {
    text = 'Recover the Soul Spiral — the Séance Room, East Wing (Floor 2).';
  } else if (!f.seal_knot) {
    text = 'Recover the Marionette Knot — the Doll Workshop, West Wing (Floor 2).';
  } else if (!f.seal_crown) {
    text = 'Recover the Broken Crown — the Forbidden Study, Attic.';
  } else if (!f.sealsPlaced) {
    text = 'Bring the Seals to the Tower Sanctum — the iron door, attic rear.';
  } else if (!f.pendant) {
    text = 'Find the Guardian Pendant — the Forbidden Study, Attic.';
  } else if (!f.ending) {
    text = 'Descend to the Null Chamber — beneath the Grand Hall, past the sealed door.';
  } else {
    text = 'Chapter One — complete. The house is listening.';
  }
  document.getElementById('objective-text').textContent = text;
}

// ================= HUD primitives =================
const hud = document.getElementById('hud');
const promptEl = document.getElementById('prompt');
const crosshair = document.getElementById('crosshair');
const regionToast = document.getElementById('region-toast');
const regionName = document.getElementById('region-name');
const regionSub = document.getElementById('region-sub');
const lightningFlash = document.getElementById('lightning-flash');
const bannerQueue = [];
let bannerBusyUntil = 0;

function showBanner(title, sub) {
  bannerQueue.push([title, sub]);
}
function pumpBanners(now) {
  if (bannerBusyUntil > now || bannerQueue.length === 0) return;
  const [title, sub] = bannerQueue.shift();
  regionName.textContent = title;
  regionSub.textContent = sub || '';
  regionToast.classList.add('show');
  bannerBusyUntil = now + 4200;
  setTimeout(() => regionToast.classList.remove('show'), 3600);
}

// ================= interaction =================
const _v = new THREE.Vector3();
const _fwd = new THREE.Vector3();
const _to = new THREE.Vector3();
let currentTarget = null;

function pickInteractable() {
  const cam = E.camera;
  cam.getWorldDirection(_fwd);
  _fwd.y = 0;
  if (_fwd.lengthSq() < 1e-6) return null;
  _fwd.normalize();
  let best = null, bestScore = Infinity;
  for (const it of E.interactables) {
    if (it.enabled && !it.enabled()) continue;
    let score = 0;
    if (it.object) {
      it.object.getWorldPosition(_v);
      // horizontal distance + facing dot (door pivots sit at floor level — compare directions on the ground plane)
      _to.set(_v.x - cam.position.x, 0, _v.z - cam.position.z);
      const d = _to.length();
      if (d > (it.radius || 2.4) + 0.6) continue;
      _to.normalize();
      const dot = _to.dot(_fwd);
      if (dot < 0.4) continue;
      score = d - dot * 0.5;
    } else {
      score = 2.0; // location-based readable: OBJECT interactables (doors, pickups) always win within reach
    }
    if (score < bestScore) { bestScore = score; best = it; }
  }
  return best;
}

function tryInteract() {
  if (currentTarget && currentTarget.onInteract) currentTarget.onInteract();
}

// ================= JOURNAL =================
const journalEl = document.getElementById('journal');
const helpEl = document.getElementById('help');
const endingEl = document.getElementById('ending');
let journalOpen = false, helpOpen = false;

function renderClues() {
  const el = document.getElementById('journal-clues');
  const ids = [...discoveredClues].filter(id => CLUES[id]);
  el.innerHTML = ids.map(id => {
    const [t, body] = CLUES[id];
    return `<div class="clue"><b>${t}</b><br/>${body}</div>`;
  }).join('') || '<p style="font-style:italic">Nothing yet. The house prefers you ignorant.</p>';
  el.innerHTML += `<p style="margin-top:10px;font-size:11px;color:#5a4a28;letter-spacing:.1em">FRAGMENTS RECOVERED: ${ids.length} / ${Object.keys(CLUES).length}</p>`;
}
function openJournal() {
  journalOpen = true;
  renderClues();
  journalEl.classList.remove('hidden');
  audio.journal();
  if (document.pointerLockElement) document.exitPointerLock();
}
function closeJournal() { journalOpen = false; journalEl.classList.add('hidden'); audio.ui(); }

// ================= ENDING =================
function showEnding() {
  endingEl.classList.remove('hidden');
  if (document.pointerLockElement) document.exitPointerLock();
}

// ================= MENU / BOOT FLOW =================
const menuEl = document.getElementById('menu');
const pausedEl = document.getElementById('paused');
const muteBtn = document.getElementById('mute-btn');
const touchUI = document.getElementById('touch-ui');
const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
let gameStarted = false;

document.getElementById('btn-start').addEventListener('click', () => {
  audio.init();
  audio.ui();
  gameStarted = true;
  menuEl.style.opacity = '0';
  menuEl.style.pointerEvents = 'none';
  setTimeout(() => menuEl.classList.add('hidden'), 900);
  hud.classList.remove('hidden');
  muteBtn.classList.remove('hidden');
  if (isTouch) touchUI.classList.remove('hidden');
  player.enabled = true;
  setObjectiveForProgress();
  showBanner('HONTED HOME', 'The Vellacott Estate · est. 1711');
  if (!isTouch) canvas.requestPointerLock();
});
document.getElementById('btn-help').addEventListener('click', () => { audio.init(); audio.ui(); helpEl.classList.remove('hidden'); });
document.getElementById('btn-menujournal').addEventListener('click', () => { audio.init(); journalOpen = true; renderClues(); journalEl.classList.remove('hidden'); });
document.getElementById('btn-close-help').addEventListener('click', () => { helpEl.classList.add('hidden'); audio.ui(); });
document.getElementById('btn-close-journal').addEventListener('click', () => { journalOpen = false; journalEl.classList.add('hidden'); audio.ui(); });
document.getElementById('btn-keep-exploring').addEventListener('click', () => { endingEl.classList.add('hidden'); audio.ui(); });
document.getElementById('btn-restart').addEventListener('click', () => window.location.reload());

pausedEl.addEventListener('click', () => { if (!isTouch) canvas.requestPointerLock(); });
muteBtn.addEventListener('click', () => {
  const next = !audio.muted;
  audio.setMuted(next);
  muteBtn.textContent = next ? '✕' : '♪';
});

document.addEventListener('pointerlockchange', () => {
  const locked = document.pointerLockElement === canvas;
  if (locked) {
    pausedEl.classList.add('hidden');
  } else if (gameStarted && !journalOpen && !helpOpen && endingEl.classList.contains('hidden') && !isTouch) {
    pausedEl.classList.remove('hidden');
  }
});

canvas.addEventListener('mousedown', () => {
  if (!gameStarted) return;
  if (document.pointerLockElement === canvas) {
    tryInteract();
  } else if (!isTouch && journalEl.classList.contains('hidden') && helpEl.classList.contains('hidden') && endingEl.classList.contains('hidden')) {
    canvas.requestPointerLock();
  }
});
canvas.addEventListener('contextmenu', e => e.preventDefault());

window.addEventListener('keydown', (e) => {
  if (!gameStarted) return;
  if (e.code === 'KeyJ') {
    if (journalEl.classList.contains('hidden')) openJournal(); else closeJournal();
  } else if (e.code === 'KeyE') {
    if (journalOpen || helpOpen) return;
    tryInteract();
  } else if (e.code === 'Escape') {
    if (!helpEl.classList.contains('hidden')) helpEl.classList.add('hidden');
  }
});
document.getElementById('btn-interact')?.addEventListener('touchstart', (e) => { e.preventDefault(); if (!journalOpen) tryInteract(); }, { passive: false });
document.getElementById('btn-interact')?.addEventListener('click', (e) => { e.preventDefault(); if (!journalOpen) tryInteract(); });
document.getElementById('btn-journal')?.addEventListener('touchstart', (e) => { e.preventDefault(); journalOpen ? closeJournal() : openJournal(); }, { passive: false });
document.getElementById('btn-journal')?.addEventListener('click', (e) => { e.preventDefault(); journalOpen ? closeJournal() : openJournal(); });

// flash helper used by doors (locked feedback)
E.onFlashPrompt = (text) => {
  promptEl.innerHTML = '<b>!</b>' + escapeHtml(text).replace(/\n/g, '<br/>');
  promptEl.classList.add('show');
  setTimeout(() => { if (currentTarget) return; promptEl.classList.remove('show'); }, 2600);
};
function escapeHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// ================= MAIN LOOP =================
const clock = new THREE.Clock();
let prevFlash = 0;
let elapsed = 0;

function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, clock.getDelta());
  elapsed += dt;

  E.update(dt, elapsed, E.camera.position);
  player.update(dt);
  audio.update(dt);

  // thunder follows the flash
  if (E.lightning.flash > 0.92 && prevFlash <= 0.92) audio.thunder();
  prevFlash = E.lightning.flash;
  lightningFlash.style.opacity = String(Math.pow(E.lightning.flash, 2.6) * 0.55);

  // regions + interaction prompt
  if (gameStarted) {
    checkRegions(E);
    pumpBanners(elapsed * 1000);
    currentTarget = pickInteractable();
    if (currentTarget && !journalOpen && !helpOpen) {
      crosshair.classList.add('active');
      const txt = currentTarget.prompt();
      promptEl.innerHTML = '<b>E</b>' + escapeHtml(txt).replace(/\n/g, '<br/>');
      promptEl.classList.add('show');
    } else {
      crosshair.classList.remove('active');
      promptEl.classList.remove('show');
    }
  }

  E.renderer.render(E.scene, E.camera);
}
setObjectiveForProgress();
frame();
