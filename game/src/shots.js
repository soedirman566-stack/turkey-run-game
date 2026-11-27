// shots.js — frozen scenes for the maker's screenshots, reached with a
// ?shot=title|play|caught|escaped query. Each scene is assembled from the
// game's own state and painters (the same code a live run uses), then
// held still so a screenshot shows the game exactly as it plays.

import { LANE_Y } from './settings.js';
import { createRun } from './run.js';

export function readShotKind() {
  const shot = new URLSearchParams(window.location.search).get('shot');
  return ['title', 'play', 'caught', 'escaped'].includes(shot) ? shot : null;
}

function placeEntity(run, kind, lane, x) {
  run.field.entities.push({
    kind,
    lane,
    x,
    spin: 0.7,
    knifeSpeed: 0,
    counted: false,
    resolved: false,
  });
}

// A run caught mid-stride: turkey hopping the middle lane's oven, a knife
// coming down its own lane, corn waiting in the far lane, farmer close.
export function buildPlaySceneRun() {
  const run = createRun();
  run.distance = 437;
  run.score = 812;
  run.hearts = 2;
  run.gap = 34;
  run.lane = 1;
  run.laneY = LANE_Y[1];
  run.hopTimer = 0.3;
  run.hopLift = 47;
  run.scrollPx = 5200;
  run.runPhase = 3.1;
  placeEntity(run, 'oven', 1, 356);
  placeEntity(run, 'knife', 1, 726);
  placeEntity(run, 'knife', 2, 892);
  placeEntity(run, 'oven', 0, 838);
  placeEntity(run, 'corn', 2, 566);
  placeEntity(run, 'goldenCorn', 0, 618);
  placeEntity(run, 'corn', 1, 950);
  return run;
}

export function buildCaughtRun() {
  const run = createRun();
  run.distance = 863;
  run.score = 1204;
  run.hearts = 0;
  run.gap = 0;
  run.lane = 1;
  run.laneY = LANE_Y[1];
  run.scrollPx = 14100;
  run.runPhase = 5.2;
  run.outcome = 'caught';
  placeEntity(run, 'oven', 2, 620);
  placeEntity(run, 'knife', 0, 760);
  placeEntity(run, 'corn', 2, 430);
  return run;
}

export function buildEscapedRun() {
  const run = createRun();
  run.distance = 1200;
  run.score = 2210;
  run.hearts = 2;
  run.gap = 47;
  run.lane = 1;
  run.laneY = LANE_Y[1];
  run.scrollPx = 19600;
  run.runPhase = 2.4;
  run.outcome = 'escaped';
  placeEntity(run, 'corn', 0, 700);
  placeEntity(run, 'goldenCorn', 2, 830);
  return run;
}
