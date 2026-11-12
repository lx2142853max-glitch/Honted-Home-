// Headless runtime smoke test (jsdom + fake WebGL2/Canvas2D).
// Boots the REAL built bundle (dist/index.html) and exercises:
//   page load → menu → Start click → game loop frames → WASD + Journal keys.
import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync } from 'node:fs';

let html = readFileSync(new URL('./dist/index.html', import.meta.url), 'utf8');
// jsdom cannot execute <script type="module"> — the bundle contains no import/export,
// so run it as a classic script MOVED to the end of <body> (module scripts are deferred; head scripts are not)
const OPEN = '<script type="module" crossorigin>';
const s = html.indexOf(OPEN) + OPEN.length;
const e = html.indexOf('</script>', s);
const bundle = html.slice(s, e);
console.log('bundle bytes:', bundle.length);
html = html.slice(0, s - OPEN.length) + html.slice(e + '</script>'.length);
html = html.replace('</body>', () => '<script>' + bundle + '</script></body>');

const errors = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on('jsdomError', (e) => {
  const d = e && e.detail;
  try { console.log('RAW jsdomError:', 'type=', e.type, 'ctor=', d && d.constructor && d.constructor.name, 'val=', String(d).slice(0, 300), d && d.stack ? '\n' + String(d.stack).split('\n').slice(0,6).join('\n') : ''); } catch (_) { console.log('RAW unstringifiable jsdomError', _); }
  const msg = (d && (d.stack || d.message)) || (e && e.message) || String(e);
  errors.push('[jsdomError] ' + String(msg));
});
virtualConsole.on('error', (m) => errors.push('[console.error] ' + m));
virtualConsole.on('warn', () => {});
virtualConsole.on('log', () => {});

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  url: 'http://127.0.0.1:8901/index.html',
  virtualConsole,
  beforeParse(window) {
    // ---- WebGL2 stub ----
    window.WebGL2RenderingContext = class WebGL2RenderingContext {};
    const constCache = new Map();
    const getConst = (name) => {
      if (!constCache.has(name)) constCache.set(name, 1000 + constCache.size);
      return constCache.get(name);
    };
    const SPECIAL = (canvas) => ({
      canvas,
      drawingBufferWidth: 1280,
      drawingBufferHeight: 720,
      isContextLost: () => false,
      getContextAttributes: () => ({ alpha: true, depth: true, stencil: true, antialias: false, premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: 'default', failIfMajorPerformanceCaveat: false }),
      getParameter: () => 4096,
      getShaderPrecisionFormat: () => ({ precision: 23, rangeMin: 127, rangeMax: 127 }),
      getString: () => 'fake-webgl2',
      getExtension: () => null,
      getSupportedExtensions: () => [],
      getProgramParameter: (p, pname) => (pname === getConst('ACTIVE_UNIFORMS') || pname === getConst('ACTIVE_ATTRIBUTES') || pname === getConst('ACTIVE_TRANSFORM_FEEDBACK_VARYINGS')) ? 0 : true,
      getShaderParameter: () => true,
      getProgramInfoLog: () => '',
      getShaderInfoLog: () => '',
      getUniformLocation: () => ({}),
      getAttribLocation: () => 0,
      checkFramebufferStatus: () => 0x8CD5,
      createBuffer: () => ({}), createTexture: () => ({}), createFramebuffer: () => ({}),
      createRenderbuffer: () => ({}), createProgram: () => ({}), createShader: () => ({}),
      createVertexArray: () => ({}), createTransformFeedback: () => ({}),
      getTransformFeedbackParameter: () => null,
    });
    function makeFakeGL(canvas) {
      const sp = SPECIAL(canvas);
      sp.getParameter = (p) => {
        if (p === getConst('VERSION')) return 'WebGL 2.0 (fake)';
        if (p === getConst('SCISSOR_BOX') || p === getConst('VIEWPORT')) return [0, 0, 1280, 720];
        if (p === getConst('ALIASED_LINE_WIDTH_RANGE') || p === getConst('ALIASED_POINT_SIZE_RANGE')) return [1, 8191];
        if (p === getConst('UNIFORM_BUFFER_OFFSET_ALIGNMENT')) return 256;
        return 4096;
      };
      const target = {};
      return new Proxy(target, {
        get(t, prop) {
          if (typeof prop === 'symbol') return undefined;
          if (prop === 'constructor') return window.WebGL2RenderingContext;
          if (prop in sp) return sp[prop];
          if (/^[A-Z0-9_]+$/.test(prop)) {
            if (!constCache.has(prop)) constCache.set(prop, 1000 + constCache.size);
            return constCache.get(prop);
          }
          if (!constCache.has(prop)) constCache.set(prop, (...a) => undefined);
          return constCache.get(prop);
        },
        set() { return true; },
      });
    }
    // ---- Canvas2D stub ----
    const grad = { addColorStop() {} };
    function makeFake2D(canvas) {
      const base = {
        canvas,
        measureText: () => ({ width: 10 }),
        createLinearGradient: () => grad,
        createRadialGradient: () => grad,
        createConicGradient: () => grad,
        createPattern: () => ({}),
        getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(Math.max(4, w * h * 4)), width: w, height: h }),
        putImageData: () => {},
      };
      return new Proxy(base, {
        get(t, prop) {
          if (prop in t) return t[prop];
          if (typeof prop === 'symbol') return undefined;
          t[prop] = (...a) => undefined;
          return t[prop];
        },
        set(t, prop, v) { t[prop] = v; return true; },
      });
    }
    window.HTMLCanvasElement.prototype.getContext = function (kind, attrs) {
      const k = String(kind);
      if (k.startsWith('webgl')) return makeFakeGL(this);
      if (k === '2d') return makeFake2D(this);
      return null;
    };
    window.__errStack = null;
    window.addEventListener('error', (e) => {
      if (!window.__errStack) window.__errStack = (e.error && e.error.stack) || (e.message + ' @' + e.filename + ':' + e.lineno + ':' + e.colno);
    }, true);
    window.HTMLCanvasElement.prototype.requestPointerLock = function () {};
    window.document.exitPointerLock = function () {};
    try { Object.defineProperty(window.navigator, 'maxTouchPoints', { value: 0 }); } catch (e) {}
  },
});

const { window } = dom;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// capture uncaught exceptions inside the page
window.addEventListener('error', (e) => { errors.push('[window.error] ' + (e.error && e.error.stack ? e.error.stack : (e.message + ' @ ' + e.filename + ':' + e.lineno))); });
window.addEventListener('unhandledrejection', (e) => { errors.push('[unhandledrejection] ' + String(e.reason && (e.reason.stack || e.reason)).split('\n').slice(0, 3).join(' | ')); });

await sleep(1200);

const hud = window.document.getElementById('hud');
const startBtn = window.document.getElementById('btn-start');
console.log('menu visible:', !window.document.getElementById('menu').classList.contains('hidden'));

// click Start
startBtn.click();
await sleep(1200);
console.log('hud shown after start:', hud && !hud.classList.contains('hidden'));
console.log('objective text:', JSON.stringify(window.document.getElementById('objective-text').textContent));

const getPos = () => { const p = window.__honted && window.__honted.E.camera.position; return p ? { x: +p.x.toFixed(2), y: +p.y.toFixed(2), z: +p.z.toFixed(2) } : null; };
console.log('pos at start:', JSON.stringify(getPos()));
// hold W for 1.5 s
window.dispatchEvent(new window.KeyboardEvent('keydown', { code: 'KeyW' }));
await sleep(1500);
window.dispatchEvent(new window.KeyboardEvent('keyup', { code: 'KeyW' }));
console.log('pos after first walk:', JSON.stringify(getPos()));
// toggle journal
window.dispatchEvent(new window.KeyboardEvent('keydown', { code: 'KeyJ' }));
await sleep(150);
console.log('journal opened:', !window.document.getElementById('journal').classList.contains('hidden'));
window.dispatchEvent(new window.KeyboardEvent('keydown', { code: 'KeyJ' }));
await sleep(150);
console.log('journal closed:', window.document.getElementById('journal').classList.contains('hidden'));

// region banner did fire?
const regionName = window.document.getElementById('region-name').textContent;
console.log('last region/banner:', JSON.stringify(regionName));

// ---- walk toward the mansion (W = north, -z) ----
const promptEl = window.document.getElementById('prompt');
window.dispatchEvent(new window.KeyboardEvent('keydown', { code: 'KeyW' }));
console.log('keys after dispatch:', JSON.stringify([...(window.__honted.player.keys || [])]));
const cols = window.__honted.E.colliders.filter(c => c.minX < 1 && c.maxX > -1 && c.minZ < 63.2 && c.maxZ > 61.5);
console.log('colliders near spawn:', JSON.stringify(cols.map(c => ({ minX: c.minX, maxX: c.maxX, minZ: +c.minZ.toFixed(2), maxZ: +c.maxZ.toFixed(2), top: c.top, bottom: c.bottom, enabled: c.enabled })), null, 1));
console.log('player enabled:', window.__honted.player.enabled);
for (let i = 0; i < 10; i++) {
  await sleep(900);
  console.log('t+' + ((i + 1) * 0.9).toFixed(1) + 's prompt:', JSON.stringify((promptEl.textContent || '').slice(0, 90)), '| banner:', JSON.stringify(window.document.getElementById('region-name').textContent));
}
window.dispatchEvent(new window.KeyboardEvent('keyup', { code: 'KeyW' }));
await sleep(200);
window.dispatchEvent(new window.KeyboardEvent('keydown', { code: 'KeyE' }));
await sleep(200);
window.dispatchEvent(new window.KeyboardEvent('keydown', { code: 'KeyJ' }));
await sleep(150);
const cluesHtml = window.document.getElementById('journal-clues').innerHTML;
console.log('journal clue fragments:', (cluesHtml.match(/<div class="clue">/g) || []).length, '| contains crestRead:', cluesHtml.includes('House Crest'));
window.dispatchEvent(new window.KeyboardEvent('keydown', { code: 'KeyJ' }));

console.log('PAGE ERROR STACK:\n', window.__errStack || ' none');
// ---- E2E: doors, seal gating, placement, ending ----
const E2 = window.__honted.E, P2 = window.__honted.player;
const teleport = (x, z, feetY) => { E2.camera.position.set(x, feetY + 1.62, z); P2.feetY = feetY; P2.yaw = 0; P2.pitch = 0; };
const holdW = async (ms) => { window.dispatchEvent(new window.KeyboardEvent('keydown', { code: 'KeyW' })); await sleep(ms); window.dispatchEvent(new window.KeyboardEvent('keyup', { code: 'KeyW' })); };
const key = (code) => { window.dispatchEvent(new window.KeyboardEvent('keydown', { code })); };

teleport(0, 16.1, 0);
await sleep(200);
await holdW(2500);
console.log('E2E great doors: blocked at z =', E2.camera.position.z.toFixed(2), '(expect > 15 and < 16.5)');
console.log('prompt before E:', JSON.stringify(promptEl.textContent.slice(0, 90)));
const doorCol = E2.colliders.find(c => Math.abs(c.minZ - 14.86) < 0.05 && Math.abs(c.maxZ - 15.14) < 0.05 && c.minX < 0);
console.log('great doors collider enabled before E:', doorCol && doorCol.enabled);
key('KeyE');
await sleep(250);
console.log('great doors collider enabled after E:', doorCol && doorCol.enabled);
await holdW(3500);
console.log('E2E great doors: after open, z =', E2.camera.position.z.toFixed(2), '(expect < 15)');

teleport(0, -7.3, 8.4);
await sleep(200);
console.log('E2E tower door prompt (0 seals):', JSON.stringify(promptEl.textContent.slice(0, 90)));
key('KeyE');
await sleep(150);
console.log('E2E tower door holds shut: z =', E2.camera.position.z.toFixed(2), '(expect ≈ -6.5)');
E2.flags.seals = 3;
key('KeyE');
await sleep(250);
const towerCol = E2.colliders.find(c => Math.abs(c.minZ - (-8.14)) < 0.05);
console.log('E2E tower door collider enabled after E with 3 seals:', towerCol && towerCol.enabled);
await holdW(3000);
console.log('E2E tower door opens with 3 seals: z =', E2.camera.position.z.toFixed(2), '(expect < -8.1)');

teleport(0, -11.5, 16.8);
await sleep(200);
console.log('E2E sanctum prompt:', JSON.stringify(promptEl.textContent.slice(0, 90)));
key('KeyE');
await sleep(200);
console.log('E2E sealsPlaced after placement interact:', window.__honted.E.flags.sealsPlaced === true);

teleport(0, 7.6, -3.6);
await sleep(300);
E2.flags.pendant = true;
const enabledNow = E2.interactables.filter(it => !it.enabled || it.enabled()).map(it => (it.object ? 'obj:' : 'loc:') + it.prompt().slice(0, 44).replace(/\n/g, ' '));
console.log('E2E enabled interactables at null chamber:', JSON.stringify(enabledNow));
console.log('E2E prompt now:', JSON.stringify(promptEl.textContent.slice(0, 80)));
key('KeyE'); // 1st E: open the Null Chamber door
await sleep(200);
console.log('E2E prompt after door E:', JSON.stringify(promptEl.textContent.slice(0, 80)));
key('KeyE'); // 2nd E: place the pendant
await sleep(200);
console.log('E2E flags after pendant E:', JSON.stringify({ pendant: E2.flags.pendant, ending: E2.flags.ending }));
await sleep(1600);
console.log('E2E ending fired:', window.__honted.E.flags.ending === true, '| ending overlay visible:', !window.document.getElementById('ending').classList.contains('hidden'));

// ---- scene diagnostics ----
const E = window.__honted.E;
let meshes = 0, nanMatrices = 0, nanPositions = 0, minY = 1e9, maxY = -1e9;
E.scene.traverse((o) => {
  if (o.isMesh || o.isPoints || o.isSprite) {
    meshes++;
    o.updateWorldMatrix(true, false);
    const m = o.matrixWorld.elements;
    for (let i = 0; i < 16; i++) if (!Number.isFinite(m[i])) nanMatrices++;
    const p = o.getWorldPosition ? o.getWorldPosition(new window.__honted.E.camera.position.constructor()) : null;
    if (p) { for (const k of ['x', 'y', 'z']) if (!Number.isFinite(p[k])) nanPositions++; minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); }
  }
});
console.log('meshes/points/sprites:', meshes, '| NaN matrices:', nanMatrices, '| NaN positions:', nanPositions, '| y range:', minY.toFixed(1), '→', maxY.toFixed(1));
console.log('colliders:', E.colliders.length, '| interactables:', E.interactables.length, '| scene children:', E.scene.children.length);
console.log('floor checks: hall', E.floorHeightAt(0, 5, 0.1), '| basement floor', E.floorHeightAt(0, 10, -3.5), '| tower 12.6 slab', E.floorHeightAt(0, -12, 12.5));
console.log('flags:', JSON.stringify(Object.keys(E.flags)));
console.log('ERRORS:' + (errors.length ? '\n' + errors.slice(0, 12).join('\n') : ' none'));
await sleep(300);
window.close();
process.exit(0);
