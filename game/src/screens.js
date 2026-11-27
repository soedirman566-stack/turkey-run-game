// screens.js — the four faces of Gobble Run: the title screen, the run
// itself with its HUD, and the two endings. Composes the painters from
// sprites.js into whole scenes.

import {
  COLOURS,
  ESCAPE_METRES,
  GAP_MAX,
  HEARTS_START,
  LANE_Y,
  TURKEY_X,
  VIEW_HEIGHT,
  VIEW_WIDTH,
} from './settings.js';
import {
  drawBackdrop,
  drawCornCob,
  drawFarmer,
  drawHeart,
  drawKnife,
  drawOven,
  drawTurkey,
} from './sprites.js';
import { farmerX, freedomGateX } from './run.js';

function text(ctx, value, x, y, { size = 20, colour = COLOURS.paper, align = 'left', bold = true, font = 'Georgia, serif' } = {}) {
  ctx.fillStyle = colour;
  ctx.font = `${bold ? 'bold ' : ''}${size}px ${font}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

function shadowText(ctx, value, x, y, options) {
  text(ctx, value, x + 3, y + 3, { ...options, colour: 'rgba(43, 26, 18, 0.45)' });
  text(ctx, value, x, y, options);
}

function drawHud(ctx, run) {
  // Top bar.
  ctx.fillStyle = 'rgba(43, 26, 18, 0.74)';
  ctx.fillRect(0, 0, VIEW_WIDTH, 54);

  text(ctx, `SCORE ${String(run.score).padStart(5, '0')}`, 18, 28, { size: 22 });

  // Distance and the road to freedom.
  const progress = Math.min(1, run.distance / ESCAPE_METRES);
  text(ctx, `${Math.floor(run.distance)} m`, 372, 28, { size: 22, align: 'right' });
  ctx.fillStyle = 'rgba(255, 246, 227, 0.3)';
  ctx.fillRect(388, 19, 240, 16);
  ctx.fillStyle = COLOURS.safe;
  ctx.fillRect(388, 19, 240 * progress, 16);
  text(ctx, 'FREEDOM', 676, 28, { size: 13, align: 'right', colour: COLOURS.skyLow });

  // Hearts.
  for (let i = 0; i < HEARTS_START; i++) {
    drawHeart(ctx, 694 + i * 34, 28, 24, i < run.hearts);
  }

  // The farmer meter: how much breathing room is left.
  const gapFrac = Math.max(0, run.gap / GAP_MAX);
  text(ctx, 'FARMER', 836, 15, { size: 11, align: 'left', colour: COLOURS.skyLow });
  ctx.fillStyle = 'rgba(255, 246, 227, 0.3)';
  ctx.fillRect(836, 24, 106, 12);
  ctx.fillStyle = gapFrac < 0.25 ? COLOURS.danger : COLOURS.safe;
  ctx.fillRect(836, 24, 106 * gapFrac, 12);
  if (gapFrac < 0.25 && Math.floor(performance.now() / 300) % 2 === 0) {
    text(ctx, 'HE IS RIGHT THERE!', 480, 78, { size: 20, align: 'center', colour: COLOURS.danger });
  }
}

export function drawPlayScene(ctx, run, timeSeconds) {
  drawBackdrop(ctx, run.scrollPx, freedomGateX(run));

  // Field entities, far lanes first so near ones overlap them.
  const sorted = [...run.field.entities].sort((a, b) => a.lane - b.lane);
  for (const entity of sorted) {
    const groundY = LANE_Y[entity.lane];
    if (entity.kind === 'oven') drawOven(ctx, entity.x, groundY, timeSeconds);
    else if (entity.kind === 'knife') drawKnife(ctx, entity.x, groundY - 30, entity.spin);
    else drawCornCob(ctx, entity.x, groundY, entity.kind === 'goldenCorn', timeSeconds);
  }

  // The farmer chases on the turkey's own lane, then the turkey itself.
  drawFarmer(ctx, farmerX(run), run.laneY, run.runPhase);
  const blinking = run.invulnerableTimer > 0;
  const alpha = blinking ? (Math.floor(run.invulnerableTimer * 16) % 2 === 0 ? 0.35 : 0.9) : 1;
  drawTurkey(ctx, TURKEY_X, run.laneY, run.hopLift, run.runPhase, alpha);

  drawHud(ctx, run);
}

export function drawTitleScreen(ctx, timeSeconds) {
  drawBackdrop(ctx, timeSeconds * 46, null);

  // The chase, frozen as a tableau: turkey mid-stride, farmer looming.
  drawFarmer(ctx, 96, LANE_Y[1], timeSeconds * 1.5);
  drawTurkey(ctx, 330, LANE_Y[1], 0, timeSeconds * 1.5, 1);

  // Title card.
  ctx.fillStyle = 'rgba(43, 26, 18, 0.55)';
  ctx.fillRect(0, 48, VIEW_WIDTH, 190);
  shadowText(ctx, 'GOBBLE RUN', VIEW_WIDTH / 2, 106, { size: 64, align: 'center', colour: COLOURS.sun });
  text(ctx, 'The Great Turkey Escape', VIEW_WIDTH / 2, 154, { size: 26, align: 'center', colour: COLOURS.paper });
  text(ctx, 'Thanksgiving is coming, and Farmer Hank has plans for you.', VIEW_WIDTH / 2, 188, { size: 18, align: 'center', bold: false });
  text(ctx, 'Dodge his ovens and carving knives. Reach the Freedom Gate!', VIEW_WIDTH / 2, 212, { size: 18, align: 'center', bold: false });

  if (Math.floor(timeSeconds * 1.6) % 2 === 0) {
    shadowText(ctx, 'PRESS SPACE OR CLICK TO RUN', VIEW_WIDTH / 2, 292, { size: 24, align: 'center', colour: COLOURS.sun });
  }

  // Controls.
  ctx.fillStyle = 'rgba(43, 26, 18, 0.55)';
  ctx.fillRect(VIEW_WIDTH / 2 - 320, 466, 640, 62);
  text(ctx, '↑ ↓ / W S — switch lane      SPACE — hop the ovens', VIEW_WIDTH / 2, 488, { size: 17, align: 'center' });
  text(ctx, 'Click high / low — switch lane · click middle — hop', VIEW_WIDTH / 2, 512, { size: 17, align: 'center' });
}

export function drawEndScreen(ctx, run, timeSeconds) {
  // The last moment of the run stays visible under a dim veil.
  drawPlayScene(ctx, run, timeSeconds);
  ctx.fillStyle = 'rgba(43, 26, 18, 0.52)';
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

  const escaped = run.outcome === 'escaped';
  ctx.fillStyle = 'rgba(255, 246, 227, 0.96)';
  ctx.beginPath();
  ctx.roundRect(VIEW_WIDTH / 2 - 300, 128, 600, 284, 18);
  ctx.fill();

  shadowText(ctx, escaped ? 'ESCAPED!' : 'CAUGHT!', VIEW_WIDTH / 2, 188, {
    size: 54,
    align: 'center',
    colour: escaped ? COLOURS.safe : COLOURS.danger,
  });
  text(
    ctx,
    escaped
      ? 'You outran the menu. The forest is yours now.'
      : 'Farmer Hank finally got his hands on dinner.',
    VIEW_WIDTH / 2,
    240,
    { size: 19, align: 'center', colour: COLOURS.ink, bold: false },
  );
  text(ctx, `Final score  ${run.score}`, VIEW_WIDTH / 2, 292, { size: 24, align: 'center', colour: COLOURS.ink });
  text(
    ctx,
    escaped ? `Distance  ${ESCAPE_METRES} m — all the way` : `Distance  ${Math.floor(run.distance)} m of ${ESCAPE_METRES} m`,
    VIEW_WIDTH / 2,
    330,
    { size: 20, align: 'center', colour: COLOURS.ink },
  );
  if (Math.floor(timeSeconds * 1.6) % 2 === 0) {
    text(ctx, 'PRESS SPACE OR CLICK TO RUN AGAIN', VIEW_WIDTH / 2, 378, { size: 19, align: 'center', colour: COLOURS.turkeyTailTip });
  }
}
