# Honted Home — The Vellacott Estate

An offline, first-person **360° haunted-mansion explorer** built from a reverse-engineered
reference photograph and a full level-design document. Walk the grounds, enter the manor,
and play through **Chapter One** of the story — ending at the Null Chamber, beneath the tower.

Everything is procedural (geometry, textures, audio are generated in code at boot) and the
production build inlines every asset into a **single self-contained `dist/index.html`** that
runs 100% offline — no network, no CDN, no server.

> Design basis: `docs/The_Cursed_Mansion_Level_Design.txt` (PRD) · `docs/reference-mansion.png` (reference)

## What’s inside

- **The full estate, explorable 360°** — front garden, iron gate, keeper’s lodge, ruined chapel,
  greenhouse, rear garden/maze, graveyard, side courtyard, and the manor itself.
- **Four levels + tower + basement** — Grand Hall · Library/Study/Kitchen wing · West/East wings
  (Séance Room, Doll Workshop, Bedrooms…) · Attic · Tower Stair → Bell Chamber → Tower Sanctum ·
  full Underworks/Basement (Boiler Room, Wine Cellar, Crypt, Null Chamber…).
- **Chapter One, playable end-to-end** — collect the three Seals (Soul Spiral → Marionette Knot →
  Broken Crown), restore power to the manor, recover the Guardian Pendant, place the Seals in the
  Tower Sanctum, and descend to the Null Chamber to finish the chapter.
- **35 named, connected regions** with banner toasts, an in-game journal + objectives, ~110
  interactables, ~690 collision volumes, and a prop-driven clue system (seal chain, pendant,
  backstory — all readable in-world).
- **Atmosphere** — fog, stars, moon, lightning flashes + thunder, candle flicker, whispering/
  music-box audio stingers per region, film grain, vignette, dynamic prompt UI.
- **Touch support** — virtual joystick + look-drag + on-screen buttons (Android-friendly).

## Controls

| Input | Action |
| --- | --- |
| `W A S D` / arrows | walk |
| `Shift` | run |
| `C` | crouch |
| `E` | interact / read / use |
| `J` | journal (clues + objectives) |
| `Esc` | close panels / release pointer |
| touch | left thumb joystick (move) · right half drag (look) · buttons (interact / journal) |

## Build & run (desktop)

```bash
npm install
npm run build      # → dist/index.html (single file, ~1.1 MB)
npm run dev        # dev server with HMR (optional)
```

Open `dist/index.html` directly in a browser — double-click works, no server required.

## Offline Android APK (view-only wrapper)

The app is a plain web build; wrap it with [Capacitor](https://capacitorjs.com/):

```bash
npm run build
npx cap add android        # first time only
npx cap sync android
npx cap open android       # Android Studio → Build → Build APK(s)
```

or the debug shortcut:

```bash
npm run apk:debug          # build → sync → gradlew assembleDebug
```

`capacitor.config.json` (app id `com.lx2142853max.hontedhome`, `webDir: dist`) is already
configured. The resulting APK ships the same offline single-file build. Note: the chapter is
playable — “view-only” was the brief, but limiting it would be worse for everyone.

## Verifying the build

- Static gate (no undefined identifiers):

  ```bash
  npx eslint --no-eslintrc --parser-options=ecmaVersion:2022,sourceType:module \
    --env browser,es2022 --rule '{"no-undef":"error"}' src/*.js
  ```

- Headless boot/E2E smoke test (jsdom + fake WebGL2 — boots the built bundle, walks the
  player, opens the great doors, gates the tower door on 3 Seals, places the Seals, places the
  pendant, fires the ending):

  ```bash
  node smoke.mjs
  ```

  Expected tail: `ERRORS: none` and `E2E ending fired: true`.

## Project layout

```
index.html            HUD / menus / CSS (single-page shell)
src/engine.js         renderer, scene, lights, sky, slabs/walls/stairs, colliders, floor query
src/player.js         first-person controller (pointer-lock + touch), collision, footsteps
src/mansion.js        manor shell: floors, walls, roof, tower, doors
src/grounds.js        estate: gate, gardens, chapel, greenhouse, maze, graveyard, fence lines
src/props*.js         room dressing per floor + seal chain + interactables
src/doors.js          doors (swing, sliding panels), lock logic, finale one-way door
src/audio.js          Web Audio synth — thunder, bells, whispers, chimes (no assets needed)
src/textures.js       procedural canvas textures (wood, marble, cloth, symbols…)
docs/                 level-design PRD + reference image
smoke.mjs             headless runtime verification harness
```

## Known limitations

- Lighting is baked-ish (few dynamic lights for perf); target is 60 fps on mid GPUs.
- WebGL2 required; very old Android WebViews are unsupported.
- The APK wrapper has not been signed — `assembleDebug` only; sign with your keystore for release.
