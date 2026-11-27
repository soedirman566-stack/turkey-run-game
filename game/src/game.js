// game.js — boots Gobble Run and runs its frame loop. Owns the mode
// machine (title → playing → over), feeds input verbs and hazard cues to
// the right places, and plays the little sounds the run calls for.

import { createInput } from './keys.js';
import { makeRng } from './rng.js';
import { changeLane, createRun, startHop, updateRun } from './run.js';
import { drawEndScreen, drawPlayScene, drawTitleScreen } from './screens.js';
import {
  playCaughtSting,
  playCornChime,
  playEscapeFanfare,
  playGobble,
  playThud,
  unlockAudio,
} from './sound.js';
import { buildCaughtRun, buildEscapedRun, buildPlaySceneRun, readShotKind } from './shots.js';

const canvas = document.getElementById('gobble-canvas');
const ctx = canvas.getContext('2d');
const input = createInput(canvas);

// Live runs reseed from the clock; the run itself is replaced on restart.
const liveRng = makeRng((Date.now() % 2147483647) + 1);

const game = {
  mode: 'title', // 'title' | 'playing' | 'over'
  run: createRun(),
};

// A handle for the maker's own playtesting in the console.
window.__gobble = game;

function startRun() {
  game.run = createRun();
  game.mode = 'playing';
  playGobble();
}

function handleVerbs(verbs) {
  for (const verb of verbs) {
    unlockAudio();
    if (game.mode === 'title') {
      if (verb === 'confirm') startRun();
    } else if (game.mode === 'playing') {
      if (verb === 'laneUp') changeLane(game.run, -1);
      else if (verb === 'laneDown') changeLane(game.run, 1);
      else if (verb === 'hop') startHop(game.run);
    } else if (game.mode === 'over') {
      if (verb === 'confirm') startRun();
    }
  }
}

function playCues(cues) {
  for (const cue of cues) {
    if (cue === 'corn') playCornChime(false);
    else if (cue === 'goldenCorn') playCornChime(true);
    else if (cue === 'hit') playThud();
    else if (cue === 'caught') playCaughtSting();
    else if (cue === 'escaped') playEscapeFanfare();
  }
}

// Screenshot mode: hold one scene still and paint it, nothing more.
const shotKind = readShotKind();
if (shotKind) {
  const shotRun =
    shotKind === 'play'
      ? buildPlaySceneRun()
      : shotKind === 'caught'
        ? buildCaughtRun()
        : shotKind === 'escaped'
          ? buildEscapedRun()
          : null;
  game.mode = shotKind === 'title' ? 'title' : shotKind === 'play' ? 'playing' : 'over';
  if (shotRun) game.run = shotRun;

  const paintShot = (nowMs) => {
    const t = nowMs / 1000;
    if (shotKind === 'title') drawTitleScreen(ctx, t);
    else if (shotKind === 'play') drawPlayScene(ctx, game.run, t);
    else drawEndScreen(ctx, game.run, t);
    requestAnimationFrame(paintShot);
  };
  requestAnimationFrame(paintShot);
} else {
  let lastMs = performance.now();
  const frame = (nowMs) => {
    const dt = Math.min(0.033, (nowMs - lastMs) / 1000);
    lastMs = nowMs;
    const t = nowMs / 1000;

    handleVerbs(input.takeVerbs());

    if (game.mode === 'playing') {
      const cues = updateRun(game.run, dt, liveRng);
      playCues(cues);
      if (game.run.outcome) game.mode = 'over';
    }

    if (game.mode === 'title') drawTitleScreen(ctx, t);
    else if (game.mode === 'playing') drawPlayScene(ctx, game.run, t);
    else drawEndScreen(ctx, game.run, t);

    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
