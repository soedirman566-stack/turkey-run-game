// run.js — one escape attempt: the turkey's lane and hop, the score, the
// distance to the Freedom Gate, and the farmer forever closing in behind.
// Turns input verbs and hazard events into the run's story, and decides
// how the story ends: caught, or escaped.

import {
  BASE_METRES_PER_SECOND,
  BASE_SCROLL_PX_PER_SECOND,
  BOOST_SECONDS,
  BOOST_SPEED_FACTOR,
  ESCAPE_METRES,
  GAP_GAIN_PER_CORN,
  GAP_GAIN_PER_GOLDEN_CORN,
  GAP_LOSS_PER_HIT,
  GAP_MAX,
  GAP_REGEN_PER_SECOND,
  GAP_START,
  HEARTS_START,
  INVULNERABLE_SECONDS,
  LANE_Y,
  SCORE_PER_CORN,
  SCORE_PER_GOLDEN_CORN,
  SCORE_PER_NEAR_MISS,
  STUMBLE_SLOW_SECONDS,
  STUMBLE_SPEED_FACTOR,
  TURKEY_X,
  VIEW_WIDTH,
} from './settings.js';
import { createField, updateField } from './hazards.js';

const HOP_SECONDS = 0.62;
const HOP_HEIGHT = 54;
const LANE_SWITCH_RATE = 10; // exponential approach, per second

export function createRun() {
  return {
    distance: 0,
    score: 0,
    hearts: HEARTS_START,
    gap: GAP_START,
    lane: 1,
    laneY: LANE_Y[1],
    hopTimer: -1, // -1: feet on the ground
    hopLift: 0,
    invulnerableTimer: 0,
    stumbleTimer: 0,
    boostTimer: 0,
    runPhase: 0,
    scrollPx: 0,
    field: createField(),
    outcome: null, // null while running, then 'caught' or 'escaped'
  };
}

export function changeLane(run, direction) {
  const next = run.lane + direction;
  if (next >= 0 && next < LANE_Y.length) run.lane = next;
}

export function startHop(run) {
  if (run.hopTimer < 0) run.hopTimer = 0;
}

export function farmerX(run) {
  // The fuller the gap meter, the further behind the farmer falls —
  // at zero he is close enough to grab.
  return -64 + (1 - run.gap / GAP_MAX) * 302;
}

export function freedomGateX(run) {
  // The gate slides in from off-screen over the last stretch of the run.
  const remaining = ESCAPE_METRES - run.distance;
  if (remaining >= 240) return null;
  const frac = 1 - remaining / 240;
  return VIEW_WIDTH + 170 - frac * (VIEW_WIDTH + 190 - TURKEY_X);
}

function currentSpeedFactor(run) {
  let factor = run.boostTimer > 0 ? BOOST_SPEED_FACTOR : 1;
  if (run.stumbleTimer > 0) factor *= STUMBLE_SPEED_FACTOR;
  return factor;
}

// Advances the run by dt seconds. Returns sound cues for game.js:
// 'corn' | 'goldenCorn' | 'hit' | 'caught' | 'escaped'.
export function updateRun(run, dt, rng) {
  const cues = [];
  if (run.outcome) return cues;

  const factor = currentSpeedFactor(run);
  const scrollSpeed = BASE_SCROLL_PX_PER_SECOND * factor;
  run.distance += BASE_METRES_PER_SECOND * factor * dt;
  run.scrollPx += scrollSpeed * dt;
  run.runPhase += dt * (5.4 + factor * 3.4);
  run.score = Math.max(run.score, Math.floor(run.distance));

  // Timers.
  if (run.invulnerableTimer > 0) run.invulnerableTimer -= dt;
  if (run.stumbleTimer > 0) run.stumbleTimer -= dt;
  if (run.boostTimer > 0) run.boostTimer -= dt;

  // Clean running wins breathing room back.
  run.gap = Math.min(GAP_MAX, run.gap + GAP_REGEN_PER_SECOND * dt);

  // Lane changes glide; hops arc.
  const targetY = LANE_Y[run.lane];
  run.laneY += (targetY - run.laneY) * Math.min(1, LANE_SWITCH_RATE * dt);
  if (run.hopTimer >= 0) {
    run.hopTimer += dt;
    const hopFrac = run.hopTimer / HOP_SECONDS;
    if (hopFrac >= 1) {
      run.hopTimer = -1;
      run.hopLift = 0;
    } else {
      run.hopLift = Math.sin(hopFrac * Math.PI) * HOP_HEIGHT;
    }
  }

  const distanceFrac = Math.min(1, run.distance / ESCAPE_METRES);
  const events = updateField(run.field, dt, scrollSpeed, distanceFrac, rng, run);
  for (const event of events) {
    if (event.type === 'collect') {
      const golden = event.entity.kind === 'goldenCorn';
      run.score += golden ? SCORE_PER_GOLDEN_CORN : SCORE_PER_CORN;
      run.gap = Math.min(GAP_MAX, run.gap + (golden ? GAP_GAIN_PER_GOLDEN_CORN : GAP_GAIN_PER_CORN));
      run.boostTimer = BOOST_SECONDS;
      cues.push(golden ? 'goldenCorn' : 'corn');
    } else if (event.type === 'hit') {
      if (run.invulnerableTimer > 0) continue; // ghosting through, no penalty
      run.hearts -= 1;
      run.gap -= GAP_LOSS_PER_HIT;
      run.invulnerableTimer = INVULNERABLE_SECONDS;
      run.stumbleTimer = STUMBLE_SLOW_SECONDS;
      cues.push('hit');
    } else if (event.type === 'nearMiss') {
      run.score += SCORE_PER_NEAR_MISS;
    }
  }

  // Endings.
  if (run.distance >= ESCAPE_METRES) {
    run.outcome = 'escaped';
    cues.push('escaped');
  } else if (run.gap <= 0 || run.hearts <= 0) {
    run.gap = Math.max(0, run.gap);
    run.outcome = 'caught';
    cues.push('caught');
  }
  return cues;
}
