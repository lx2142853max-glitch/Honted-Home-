// ============================================================
// PROPS — orchestrator + region trigger volumes (discovery system)
// ============================================================
import { buildGroundFloorProps } from './props_ground.js';
import { buildFloor1Props } from './props_floor1.js';
import { buildAtticProps } from './props_attic.js';
import { buildBasementProps } from './props_basement.js';

export function buildProps(E, M) {
  buildGroundFloorProps(E, M);
  buildFloor1Props(E, M);
  buildAtticProps(E, M);
  buildBasementProps(E, M);
}

// ------------------------------------------------------------
// REGION TRIGGERS — ordered small → large (first match wins)
// ------------------------------------------------------------
const R = (minX, maxX, minZ, maxZ, minY, maxY) => ({ minX, maxX, minZ, maxZ, minY, maxY });

export const REGIONS = [
  { box: R(-7, 7, 6, 15, -3.6, 0.5), name: 'The Null Chamber', sub: 'The silence has a shape', id: 'nullChamber', small: true },
  { box: R(-3.4, 3.4, -15, -8, 16.8, 21.2), name: 'The Tower Sanctum', sub: 'Three Seals · One Door', id: 'sanctum', small: true },
  { box: R(-3.4, 3.4, -15, -8, 12.5, 16.8), name: 'The Bell Chamber', sub: 'The bell that never rang', id: 'bellChamber', small: true },
  { box: R(-3.4, 3.4, -15, -8, 8.4, 12.6), name: 'The Tower Stair', sub: 'Up', id: 'towerStair', small: true },
  { box: R(-6, 6, -8, -2, 8.4, 12.6), name: 'Tower Antechamber', sub: 'The iron door', id: 'antechamber', small: true },
  { box: R(-20.6, -6, -15, 2, 8.4, 12.6), name: 'The Forbidden Study', sub: 'The Fifth Frame', id: 'forbiddenStudy' },
  { box: R(6, 20.6, -15, 2, 8.4, 12.6), name: 'The Observation Room', sub: 'It will not turn toward the house', id: 'observation' },
  { box: R(6, 20.6, 2, 15, 8.4, 12.6), name: 'The Display Room', sub: 'The Visitors', id: 'taxidermy' },
  { box: R(-20.6, -6, 2, 15, 8.4, 12.6), name: 'The Family Archive', sub: 'Nine generations of keepers', id: 'familyArchive' },
  { box: R(-6, 6, -2, 15, 8.4, 12.6), name: 'The Attic', sub: 'Low beams, lower thoughts', id: 'attic' },
  { box: R(13, 20.6, -15, -8, 4.2, 8.4), name: 'The Cold Chamber', sub: 'Frost, and one coiled shape', id: 'coldChamber' },
  { box: R(6, 13, -15, -8, 4.2, 8.4), name: 'The Séance Room', sub: 'The circle is drawn', id: 'seance', audio: 'whisper' },
  { box: R(6, 20.6, -8, -2, 4.2, 8.4), name: "Vorak's Spirit Archive", sub: 'The guardians were protectors', id: 'archive', audio: 'whisper' },
  { box: R(-13, -6, -15, -7, 4.2, 8.4), name: 'The Music Room', sub: 'In tune. Impossibly in tune.', id: 'musicRoom', audio: 'musicBox' },
  { box: R(-20.6, -13, -15, -7, 4.2, 8.4), name: 'Morvex\'s Doll Workshop', sub: 'Everything here is handmade', id: 'workshop', audio: 'musicBox' },
  { box: R(-20.6, -6, -7, 4, 4.2, 8.4), name: 'The Puppet Gallery', sub: 'They only move when you don\'t watch', id: 'puppetGallery', audio: 'musicBox' },
  { box: R(6, 20.6, -2, 7, 4.2, 8.4), name: "The Children's Room", sub: 'Three figures and an empty oval', id: 'childrensRoom' },
  { box: R(6, 20.6, 7, 15, 4.2, 8.4), name: 'The Guest Room', sub: 'The one meant for you, perhaps', id: 'guestRoom' },
  { box: R(-20.6, -6, 4, 15, 4.2, 8.4), name: 'The Master Bedroom', sub: '1897 — the night they left', id: 'masterBedroom' },
  { box: R(-6, 6, -6, -2, 4.2, 8.4), name: 'The Service Passage', sub: 'Behind the walls', id: 'servicePassage' },
  { box: R(-6, 6, -2, 15, 4.2, 8.4), name: 'The Upper Landing', sub: 'Portraits on every wall', id: 'landing' },
  { box: R(6, 20.6, -15, -7, -3.6, 0.4), name: 'The Tunnel Room', sub: 'The old way out is sealed', id: 'tunnelRoom' },
  { box: R(-7, 7, -6, 6, -3.6, 0.4), name: 'The Central Hall (Underworks)', sub: 'The beating floor', id: 'underworks' },
  { box: R(-7, 7, -15, -6, -3.6, 0.4), name: 'The Boiler Room', sub: '3 · 1 · 4', id: 'boilerRoom' },
  { box: R(-20.6, -7, -15, 2, -3.6, 0.4), name: 'The Wine Cellar', sub: 'The last vintage, never opened', id: 'wineCellar' },
  { box: R(7, 20.6, -15, 2, -3.6, 0.4), name: 'The Storage Room', sub: 'Everything the manor kept', id: 'storageRoom' },
  { box: R(-20.6, -7, 2, 15, -3.6, 0.4), name: 'The Crypt', sub: 'Keepers, not monsters', id: 'crypt', audio: 'whisper' },
  { box: R(-20.6, -6, -15, -7, 0, 4.2), name: 'The West Corridor', sub: 'Footprints in the dust', id: 'westCorridor' },
  { box: R(6, 20.6, -15, -7, 0, 4.2), name: 'The East Corridor', sub: 'Colder air…', id: 'eastCorridor', audio: 'whisper' },
  { box: R(-6, 6, -8, -2, 0, 4.2), name: 'The Conservatory', sub: 'Glass, stone and old rain', id: 'conservatory' },
  { box: R(6, 20.6, -7, 4, 0, 4.2), name: 'The Kitchen', sub: 'It has not gone cold for a hundred years', id: 'kitchen' },
  { box: R(6, 20.6, 4, 15, 0, 4.2), name: 'The Dining Room', sub: 'Thirteen settings for twelve names', id: 'diningRoom' },
  { box: R(-20.6, -6, -7, 4, 0, 4.2), name: 'The Library', sub: 'Catalogued by symbol, not by letter', id: 'library' },
  { box: R(-20.6, -6, 4, 15, 0, 4.2), name: 'The Study', sub: 'Where the last letter was written', id: 'study' },
  { box: R(-6, 6, -2, 15, 0, 4.2), name: 'The Grand Hall', sub: 'The house watches the door you came through', id: 'grandHall' },
  { box: R(-30, -21, 2, 16, 0, 5), name: 'The Side Courtyard', sub: 'Service entrance — locked', id: 'courtyard' },
  { box: R(16, 26, -46, -37, 0, 6), name: 'The Ruined Chapel', sub: 'Three keepers. One door.', id: 'chapel' },
  { box: R(-28.5, -19.5, -41.5, -34.5, 0, 6), name: 'The Greenhouse', sub: 'Everything here died kneeling', id: 'greenhouse' },
  { box: R(-30, 30, -52, -25, 0, 6), name: 'The Rear Garden', sub: 'The maze resets itself', id: 'rearGarden' },
  { box: R(29, 60, 25, 50, 0, 6), name: 'The Graveyard', sub: 'One stone is new', id: 'graveyard' },
  { box: R(-24, 24, 20, 52, 0, 6), name: 'The Front Garden', sub: 'Dead roses, watching face', id: 'frontGarden' },
  { box: R(-7, 7, 50, 58, 0, 6), name: 'The Iron Gate', sub: 'The estate remembers every name', id: 'frontGate' },
  { box: R(-75, 75, -64, 74, -4, 40), name: 'The Estate', sub: 'Outer boundary — the fog decides', id: 'estate' },
];

export function checkRegions(E) {
  const p = E.camera.position;
  const fired = E.flags.regionsFired || (E.flags.regionsFired = new Set());
  for (const r of REGIONS) {
    if (fired.has(r.id)) continue;
    const b = r.box;
    if (p.x >= b.minX && p.x <= b.maxX && p.z >= b.minZ && p.z <= b.maxZ && p.y >= b.minY && p.y <= b.maxY) {
      fired.add(r.id);
      if (E.hooks && E.hooks.onRegion) E.hooks.onRegion(r.id, r.name, r.sub, r.audio || null);
      break; // one region per frame is plenty
    }
  }
}
