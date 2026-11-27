// hazards.js — everything that appears in the lanes ahead of the turkey:
// ovens to hop, carving knives to dodge, and corn to gobble. Owns the
// field of entities, their spawning rhythm, their movement, and the
// moment-by-moment collision tests against the turkey.

import {
  KNIFE_SPEED_EARLY,
  KNIFE_SPEED_LATE,
  LANE_Y,
  SPAWN_SECONDS_EARLY,
  SPAWN_SECONDS_LATE,
  TURKEY_X,
  VIEW_WIDTH,
} from './settings.js';
import { pickWeighted, randomLane, randomRange } from './rng.js';

const SPAWN_X = VIEW_WIDTH + 70;
const DESPAWN_X = -90;

export function createField() {
  return { entities: [], spawnTimer: 0.7 };
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Collision boxes, as {cx, cy, halfW, halfH} in screen space.
export function turkeyBox(turkey) {
  return {
    cx: TURKEY_X,
    cy: turkey.laneY - 40 - turkey.hopLift,
    halfW: 30,
    halfH: 26,
  };
}

function entityBox(entity) {
  const laneY = LANE_Y[entity.lane];
  switch (entity.kind) {
    case 'oven':
      return { cx: entity.x, cy: laneY - 30, halfW: 32, halfH: 30 };
    case 'knife':
      return { cx: entity.x, cy: laneY - 30, halfW: 27, halfH: 9 };
    default: // corn and goldenCorn
      return { cx: entity.x, cy: laneY - 26, halfW: 16, halfH: 20 };
  }
}

function boxesOverlap(a, b) {
  return (
    Math.abs(a.cx - b.cx) < a.halfW + b.halfW &&
    Math.abs(a.cy - b.cy) < a.halfH + b.halfH
  );
}

function laneIsClear(field, lane) {
  for (const entity of field.entities) {
    if (entity.lane === lane && entity.x > SPAWN_X - 190) return false;
  }
  return true;
}

function spawnEntity(field, rng, distanceFrac) {
  const kind = pickWeighted(rng, [
    { value: 'oven', weight: 42 },
    { value: 'knife', weight: 38 },
    { value: 'corn', weight: 16 },
    { value: 'goldenCorn', weight: 4 },
  ]);
  const lane = randomLane(rng);
  if ((kind === 'oven' || kind === 'knife') && !laneIsClear(field, lane)) return;
  field.entities.push({
    kind,
    lane,
    x: SPAWN_X,
    spin: randomRange(rng, 0, Math.PI * 2),
    knifeSpeed: lerp(KNIFE_SPEED_EARLY, KNIFE_SPEED_LATE, distanceFrac) * randomRange(rng, 0.92, 1.1),
    counted: false, // near-miss already awarded
    resolved: false, // hit or collected already handled
  });
}

// Advances the field and returns the events the run must answer:
// { type: 'hit' | 'collect' | 'nearMiss', entity }.
export function updateField(field, dt, scrollSpeed, distanceFrac, rng, turkey) {
  const events = [];

  field.spawnTimer -= dt;
  if (field.spawnTimer <= 0) {
    spawnEntity(field, rng, distanceFrac);
    const base = lerp(SPAWN_SECONDS_EARLY, SPAWN_SECONDS_LATE, distanceFrac);
    field.spawnTimer = base * randomRange(rng, 0.8, 1.3);
  }

  const box = turkeyBox(turkey);
  const survivors = [];
  for (const entity of field.entities) {
    const ownSpeed = entity.kind === 'knife' ? entity.knifeSpeed : 0;
    entity.x -= (scrollSpeed + ownSpeed) * dt;
    entity.spin += dt * 5.2;
    if (entity.x < DESPAWN_X) continue;

    if (!entity.resolved && boxesOverlap(box, entityBox(entity))) {
      entity.resolved = true;
      if (entity.kind === 'corn' || entity.kind === 'goldenCorn') {
        events.push({ type: 'collect', entity });
        continue; // eaten — off the field
      }
      events.push({ type: 'hit', entity });
    }

    // A hazard that slips past untouched earns the turkey a near-miss.
    if (
      !entity.resolved &&
      !entity.counted &&
      (entity.kind === 'oven' || entity.kind === 'knife') &&
      entity.x < TURKEY_X - 46
    ) {
      entity.counted = true;
      events.push({ type: 'nearMiss', entity });
    }

    survivors.push(entity);
  }
  field.entities = survivors;
  return events;
}
