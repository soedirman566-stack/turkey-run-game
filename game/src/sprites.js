// sprites.js — every painter for Gobble Run. All art is drawn in code on
// the canvas: the turkey, the farmer, the hazards, the pickups and the
// farm itself. Each painter takes the context and a ground point (the
// spot where the character's feet meet the dirt) unless noted.

import { COLOURS, HORIZON_Y, LANE_Y, VIEW_HEIGHT, VIEW_WIDTH } from './settings.js';
import { makeRng } from './rng.js';

// Scenery layout is fixed by seed so the farm looks the same every load.
const sceneryRng = makeRng(20261127);
const CLOUDS = Array.from({ length: 7 }, () => ({
  spacing: 260 + sceneryRng() * 220,
  y: 26 + sceneryRng() * 84,
  scale: 0.7 + sceneryRng() * 0.9,
}));
const HILL_BUMPS = Array.from({ length: 9 }, () => 14 + sceneryRng() * 26);

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function drawCloud(ctx, x, y, scale) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ellipse(ctx, x, y, 34 * scale, 15 * scale);
  ellipse(ctx, x + 24 * scale, y + 3 * scale, 26 * scale, 12 * scale);
  ellipse(ctx, x - 26 * scale, y + 4 * scale, 22 * scale, 11 * scale);
}

function drawBarn(ctx, x) {
  // A red barn with a silo, sitting on the horizon line.
  const base = HORIZON_Y + 6;
  ctx.fillStyle = '#a03a30';
  ctx.fillRect(x, base - 64, 92, 64);
  ctx.fillStyle = '#7e2a22';
  ctx.beginPath();
  ctx.moveTo(x - 8, base - 64);
  ctx.lineTo(x + 46, base - 96);
  ctx.lineTo(x + 100, base - 64);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e8ddc8';
  ctx.fillRect(x + 34, base - 40, 24, 40);
  ctx.strokeStyle = '#7e2a22';
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 34, base - 40, 24, 40);
  ctx.beginPath();
  ctx.moveTo(x + 34, base - 40);
  ctx.lineTo(x + 58, base);
  ctx.moveTo(x + 58, base - 40);
  ctx.lineTo(x + 34, base);
  ctx.stroke();
  ctx.fillStyle = '#b9bec6';
  ctx.fillRect(x + 108, base - 88, 26, 88);
  ellipse(ctx, x + 121, base - 88, 13, 8);
}

function drawPineTree(ctx, x, base, height) {
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(x - 3, base - height * 0.22, 6, height * 0.22);
  ctx.fillStyle = '#2f6b33';
  for (let tier = 0; tier < 3; tier++) {
    const tierY = base - height * 0.16 - tier * height * 0.24;
    const half = height * (0.34 - tier * 0.08);
    ctx.beginPath();
    ctx.moveTo(x - half, tierY);
    ctx.lineTo(x, tierY - height * 0.34);
    ctx.lineTo(x + half, tierY);
    ctx.closePath();
    ctx.fill();
  }
}

// gateX: x of the Freedom Gate when it is on screen, else null.
export function drawBackdrop(ctx, scrollPx, gateX) {
  // Sky.
  const sky = ctx.createLinearGradient(0, 0, 0, HORIZON_Y + 40);
  sky.addColorStop(0, COLOURS.skyTop);
  sky.addColorStop(1, COLOURS.skyLow);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VIEW_WIDTH, HORIZON_Y + 40);

  // Sun, low and golden.
  ctx.fillStyle = COLOURS.sun;
  ellipse(ctx, 822, 74, 34, 34);
  ctx.fillStyle = 'rgba(255, 223, 107, 0.35)';
  ellipse(ctx, 822, 74, 52, 52);

  // Clouds drift slowest.
  let cloudCursor = 0;
  for (const cloud of CLOUDS) {
    cloudCursor += cloud.spacing;
    const x = VIEW_WIDTH - ((cloudCursor - scrollPx * 0.12) % (VIEW_WIDTH + 320)) - 160;
    drawCloud(ctx, x, cloud.y, cloud.scale);
  }

  // Far hills.
  ctx.fillStyle = COLOURS.hillFar;
  ctx.beginPath();
  ctx.moveTo(0, HORIZON_Y + 4);
  for (let i = 0; i <= 8; i++) {
    const x = i * 140 - ((scrollPx * 0.25) % 140);
    ctx.arc(x, HORIZON_Y + 30, 90, Math.PI, 0);
  }
  ctx.lineTo(VIEW_WIDTH, HORIZON_Y + 4);
  ctx.closePath();
  ctx.fill();

  // The barn passes now and then.
  const barnX = 1500 - (scrollPx * 0.45) % 2900;
  if (barnX > -180 && barnX < VIEW_WIDTH + 60) drawBarn(ctx, barnX);

  // Ground.
  ctx.fillStyle = COLOURS.ground;
  ctx.fillRect(0, HORIZON_Y, VIEW_WIDTH, VIEW_HEIGHT - HORIZON_Y);
  ctx.fillStyle = COLOURS.groundDark;
  ctx.fillRect(0, HORIZON_Y, VIEW_WIDTH, 8);

  // Fence posts along the horizon, scrolling at near-ground speed.
  ctx.fillStyle = '#8a6134';
  const postGap = 92;
  for (let x = -((scrollPx * 0.85) % postGap); x < VIEW_WIDTH; x += postGap) {
    ctx.fillRect(x, HORIZON_Y - 20, 7, 26);
  }
  ctx.fillRect(0, HORIZON_Y - 14, VIEW_WIDTH, 4);

  // Lane bands and dashed dividers.
  for (let lane = 0; lane < LANE_Y.length; lane++) {
    if (lane % 2 === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.fillRect(0, LANE_Y[lane] - 42, VIEW_WIDTH, 84);
    }
    if (lane > 0) {
      ctx.fillStyle = COLOURS.laneLine;
      const dashY = (LANE_Y[lane - 1] + LANE_Y[lane]) / 2;
      for (let x = -((scrollPx) % 64); x < VIEW_WIDTH; x += 64) {
        ctx.fillRect(x, dashY, 34, 4);
      }
    }
  }

  // The Freedom Gate and its forest, when the run brings them on screen.
  if (gateX !== null && gateX < VIEW_WIDTH + 160) {
    for (let i = 0; i < 6; i++) {
      drawPineTree(ctx, gateX + 120 + i * 64, HORIZON_Y + 120, 130 + HILL_BUMPS[i] * 2.4);
    }
    drawFreedomGate(ctx, gateX);
  }
}

export function drawFreedomGate(ctx, x) {
  // Two posts and a sign: the way out of the farm.
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(x, 168, 12, 318);
  ctx.fillRect(x + 128, 168, 12, 318);
  ctx.fillStyle = '#8a6134';
  ctx.fillRect(x - 14, 150, 168, 34);
  ctx.fillStyle = COLOURS.paper;
  ctx.font = 'bold 21px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('FREEDOM', x + 70, 168);
}

// runPhase advances with distance; hopLift is the hop's height in pixels.
export function drawTurkey(ctx, x, groundY, hopLift, runPhase, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const bodyY = groundY - 40 - hopLift;
  const stride = Math.sin(runPhase * 9);

  // Shadow stays on the ground and shrinks as the hop rises.
  ctx.fillStyle = 'rgba(43, 26, 18, 0.25)';
  ellipse(ctx, x, groundY + 6, 34 - hopLift * 0.12, 7);

  // Legs: scissoring while running, tucked while airborne.
  ctx.strokeStyle = '#e07b2a';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  for (const side of [-1, 1]) {
    const swing = hopLift > 4 ? -6 : stride * 11 * side;
    const hipX = x - 4 + side * 7;
    const footX = hipX + swing;
    const footY = hopLift > 4 ? groundY - hopLift * 0.55 : groundY;
    ctx.beginPath();
    ctx.moveTo(hipX, bodyY + 18);
    ctx.lineTo(footX, footY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(footX, footY);
    ctx.lineTo(footX + 7, footY);
    ctx.stroke();
  }

  // Tail fan: five feathers fanned behind, tips dipped in red.
  for (let i = 0; i < 5; i++) {
    const angle = (-58 + i * 24) * (Math.PI / 180);
    const featherX = x - 26 + Math.cos(angle) * 26;
    const featherY = bodyY - 6 + Math.sin(angle) * 26;
    ctx.save();
    ctx.translate(featherX, featherY);
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillStyle = COLOURS.turkeyTail;
    ellipse(ctx, 0, 0, 8, 20);
    ctx.fillStyle = COLOURS.turkeyTailTip;
    ellipse(ctx, 0, -13, 8, 7);
    ctx.restore();
  }

  // Body.
  ctx.fillStyle = COLOURS.turkeyBody;
  ellipse(ctx, x, bodyY, 35, 26);

  // Wing, flapping a little with the stride.
  ctx.save();
  ctx.translate(x - 2, bodyY - 2);
  ctx.rotate(Math.sin(runPhase * 9) * 0.08);
  ctx.fillStyle = COLOURS.turkeyWing;
  ellipse(ctx, 0, 0, 22, 14);
  ctx.restore();

  // Neck and head, stretched forward — this bird is going somewhere.
  ctx.strokeStyle = COLOURS.turkeyHead;
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.moveTo(x + 24, bodyY - 14);
  ctx.quadraticCurveTo(x + 38, bodyY - 30, x + 42, bodyY - 40);
  ctx.stroke();
  ctx.fillStyle = COLOURS.turkeyHead;
  ellipse(ctx, x + 45, bodyY - 44, 12, 11);

  // Eye, beak and wattle.
  ctx.fillStyle = '#ffffff';
  ellipse(ctx, x + 48, bodyY - 47, 4.4, 4.4);
  ctx.fillStyle = COLOURS.ink;
  ellipse(ctx, x + 49.5, bodyY - 47, 2.2, 2.2);
  ctx.fillStyle = COLOURS.beak;
  ctx.beginPath();
  ctx.moveTo(x + 55, bodyY - 46);
  ctx.lineTo(x + 68, bodyY - 41);
  ctx.lineTo(x + 54, bodyY - 37);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = COLOURS.wattle;
  ctx.beginPath();
  ctx.moveTo(x + 52, bodyY - 36);
  ctx.quadraticCurveTo(x + 58, bodyY - 24, x + 50, bodyY - 22);
  ctx.quadraticCurveTo(x + 45, bodyY - 28, x + 47, bodyY - 35);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawFarmer(ctx, x, groundY, runPhase) {
  const bodyY = groundY - 96;
  const stride = Math.sin(runPhase * 8.2);

  ctx.fillStyle = 'rgba(43, 26, 18, 0.25)';
  ellipse(ctx, x, groundY + 6, 30, 7);

  // Legs in overalls, pumping.
  ctx.strokeStyle = COLOURS.farmerOveralls;
  ctx.lineWidth = 11;
  ctx.lineCap = 'round';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(x + side * 6, bodyY + 52);
    ctx.lineTo(x + side * 6 + stride * 13 * side, groundY - 4);
    ctx.stroke();
  }
  // Boots.
  ctx.fillStyle = '#4a3220';
  for (const side of [-1, 1]) {
    const footX = x + side * 6 + stride * 13 * side;
    ctx.fillRect(footX - 3, groundY - 8, 17, 8);
  }

  // Torso: plaid shirt under an overall bib.
  ctx.fillStyle = COLOURS.farmerShirt;
  roundedRect(ctx, x - 21, bodyY, 42, 56, 9);
  ctx.strokeStyle = 'rgba(90, 16, 10, 0.45)';
  ctx.lineWidth = 2;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * 13, bodyY + 2);
    ctx.lineTo(x + i * 13, bodyY + 54);
    ctx.stroke();
  }
  ctx.fillStyle = COLOURS.farmerOveralls;
  roundedRect(ctx, x - 13, bodyY + 22, 26, 34, 4);

  // Back arm pumping; front arm raised, carving knife in hand.
  ctx.strokeStyle = COLOURS.farmerShirt;
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(x - 16, bodyY + 10);
  ctx.lineTo(x - 26, bodyY + 34 + stride * 7);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 16, bodyY + 10);
  ctx.lineTo(x + 32, bodyY - 12);
  ctx.stroke();
  drawKnife(ctx, x + 40, bodyY - 24, -0.5 + Math.sin(runPhase * 8.2) * 0.14, 0.9);

  // Head with a straw hat and a determined scowl.
  ctx.fillStyle = COLOURS.farmerSkin;
  ellipse(ctx, x, bodyY - 14, 14, 15);
  ctx.fillStyle = COLOURS.farmerHat;
  ellipse(ctx, x, bodyY - 24, 24, 6);
  roundedRect(ctx, x - 11, bodyY - 38, 22, 15, 5);
  ctx.strokeStyle = COLOURS.ink;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(x + 2, bodyY - 18);
  ctx.lineTo(x + 10, bodyY - 15);
  ctx.stroke();
  ctx.fillStyle = COLOURS.ink;
  ellipse(ctx, x + 7, bodyY - 12, 2.2, 2.6);
  ctx.beginPath();
  ctx.arc(x + 8, bodyY - 2, 4, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
}

export function drawOven(ctx, x, groundY, flamePhase) {
  const w = 68;
  const h = 60;
  const top = groundY - h;
  ctx.fillStyle = 'rgba(43, 26, 18, 0.25)';
  ellipse(ctx, x, groundY + 5, 38, 6);
  // Chimney with a wisp of smoke.
  ctx.fillStyle = COLOURS.ovenBody;
  ctx.fillRect(x + w / 2 - 20, top - 16, 10, 16);
  ctx.fillStyle = 'rgba(240, 240, 240, 0.4)';
  ellipse(ctx, x + w / 2 - 16, top - 24 - Math.sin(flamePhase * 3) * 2, 5, 6.5);
  // Body and burners.
  ctx.fillStyle = COLOURS.ovenBody;
  roundedRect(ctx, x - w / 2, top, w, h, 7);
  ctx.fillStyle = '#565b63';
  ellipse(ctx, x - 16, top + 3, 10, 3.4);
  ellipse(ctx, x + 16, top + 3, 10, 3.4);
  // One burner lit, flames flickering — dinner is expected.
  ctx.fillStyle = COLOURS.ovenGlow;
  for (let i = -1; i <= 1; i++) {
    const flameH = 9 + Math.sin(flamePhase * 11 + i * 1.7) * 3;
    ctx.beginPath();
    ctx.moveTo(x + 16 + i * 7 - 3.4, top);
    ctx.lineTo(x + 16 + i * 7, top - flameH);
    ctx.lineTo(x + 16 + i * 7 + 3.4, top);
    ctx.closePath();
    ctx.fill();
  }
  // Door with a glowing window and a handle.
  ctx.fillStyle = COLOURS.ovenDoor;
  roundedRect(ctx, x - w / 2 + 9, top + 14, w - 18, h - 24, 5);
  ctx.fillStyle = COLOURS.ovenGlow;
  roundedRect(ctx, x - w / 2 + 16, top + 21, w - 32, 16, 4);
  ctx.fillStyle = '#c8ccd4';
  ctx.fillRect(x - w / 2 + 12, top + 9, w - 24, 4);
}

export function drawKnife(ctx, x, y, spin, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(spin);
  ctx.scale(scale, scale);
  // Blade: a long carving profile with a bright edge.
  ctx.fillStyle = COLOURS.knifeBlade;
  ctx.beginPath();
  ctx.moveTo(-6, -5);
  ctx.lineTo(26, -5);
  ctx.quadraticCurveTo(38, -4, 40, 0);
  ctx.quadraticCurveTo(30, 4, 12, 4.6);
  ctx.lineTo(-6, 4.6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = COLOURS.knifeEdge;
  ctx.fillRect(-4, 2.6, 34, 2);
  // Handle with two rivets.
  ctx.fillStyle = COLOURS.knifeHandle;
  roundedRect(ctx, -24, -4.4, 19, 8.8, 4);
  ctx.fillStyle = '#e8ddc8';
  ellipse(ctx, -18, 0, 1.8, 1.8);
  ellipse(ctx, -10, 0, 1.8, 1.8);
  ctx.restore();
}

export function drawCornCob(ctx, x, groundY, golden, bobPhase) {
  const bobY = Math.sin(bobPhase * 2.4 + x * 0.05) * 3;
  const cy = groundY - 26 + bobY;
  ctx.fillStyle = 'rgba(43, 26, 18, 0.2)';
  ellipse(ctx, x, groundY + 4, 16, 4);
  ctx.save();
  ctx.translate(x, cy);
  ctx.rotate(-0.35);
  // Husk leaves at the base.
  ctx.fillStyle = COLOURS.cornHusk;
  ctx.beginPath();
  ctx.moveTo(-6, 16);
  ctx.quadraticCurveTo(-18, 6, -14, -6);
  ctx.quadraticCurveTo(-6, 4, -2, 14);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(6, 16);
  ctx.quadraticCurveTo(18, 8, 13, -4);
  ctx.quadraticCurveTo(6, 4, 2, 14);
  ctx.closePath();
  ctx.fill();
  // Cob.
  ctx.fillStyle = golden ? '#ffe066' : COLOURS.cornKernel;
  roundedRect(ctx, -8, -18, 16, 34, 8);
  ctx.fillStyle = golden ? '#e0a92e' : '#d9a92e';
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      ellipse(ctx, -4.6 + col * 4.6, -12 + row * 8, 1.5, 2.1);
    }
  }
  ctx.restore();
  if (golden) {
    // Sparkles so the eye catches the good one.
    ctx.fillStyle = '#fff3b0';
    const twinkle = 0.6 + Math.sin(bobPhase * 5) * 0.4;
    ctx.globalAlpha = twinkle;
    for (const [sx, sy] of [[-14, -34], [13, -22], [2, -42]]) {
      ctx.beginPath();
      ctx.moveTo(x + sx, cy + sy - 6);
      ctx.lineTo(x + sx + 2.4, cy + sy);
      ctx.lineTo(x + sx, cy + sy + 6);
      ctx.lineTo(x + sx - 2.4, cy + sy);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

export function drawHeart(ctx, x, y, size, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 20, size / 20);
  ctx.beginPath();
  ctx.moveTo(0, 7);
  ctx.bezierCurveTo(-13, -3, -9, -13, 0, -6);
  ctx.bezierCurveTo(9, -13, 13, -3, 0, 7);
  ctx.closePath();
  if (filled) {
    ctx.fillStyle = COLOURS.heart;
    ctx.fill();
  } else {
    ctx.strokeStyle = 'rgba(255, 246, 227, 0.55)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
}
