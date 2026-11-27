// settings.js — every fixed number Gobble Run is tuned by, in one place.

// Canvas geometry (logical pixels; the page scales the canvas to the window).
export const VIEW_WIDTH = 960;
export const VIEW_HEIGHT = 540;
export const HORIZON_Y = 208; // where sky ends and the farmyard begins

// The three running lanes, as ground-line y coordinates (front lane lowest).
export const LANE_Y = [318, 402, 486];
export const LANE_COUNT = LANE_Y.length;

// The turkey's fixed station on screen; the world scrolls past it.
export const TURKEY_X = 268;

// A run: cover ESCAPE_METRES before the farmer closes the gap for good.
export const ESCAPE_METRES = 1200;
export const BASE_METRES_PER_SECOND = 15;
export const BASE_SCROLL_PX_PER_SECOND = 252;

// Farmer pressure: the gap is a 0..100 meter. It regrows while the turkey
// runs clean, and every stumble lets the farmer lunge closer.
export const GAP_START = 58;
export const GAP_MAX = 100;
export const GAP_REGEN_PER_SECOND = 2.1;
export const GAP_LOSS_PER_HIT = 21;
export const GAP_GAIN_PER_CORN = 6;
export const GAP_GAIN_PER_GOLDEN_CORN = 13;

// Hearts: three stumbles and the farmer's hands close in.
export const HEARTS_START = 3;
export const INVULNERABLE_SECONDS = 1.25;
export const STUMBLE_SLOW_SECONDS = 0.85;
export const STUMBLE_SPEED_FACTOR = 0.55;

// Pickups.
export const SCORE_PER_CORN = 25;
export const SCORE_PER_GOLDEN_CORN = 100;
export const SCORE_PER_NEAR_MISS = 10;
export const BOOST_SECONDS = 2.4;
export const BOOST_SPEED_FACTOR = 1.28;

// Hazard pacing: both values ease from the "early" end to the "late" end
// across the whole escape distance.
export const SPAWN_SECONDS_EARLY = 1.18;
export const SPAWN_SECONDS_LATE = 0.64;
export const KNIFE_SPEED_EARLY = 372;
export const KNIFE_SPEED_LATE = 596;

// Colours shared by the painters.
export const COLOURS = {
  ink: '#2b1a12',
  paper: '#fff6e3',
  skyTop: '#6fb3dd',
  skyLow: '#fde3ae',
  sun: '#ffdf6b',
  hillFar: '#9db98a',
  hillNear: '#7ba05b',
  ground: '#c98d4e',
  groundDark: '#b57a3e',
  laneLine: 'rgba(255, 246, 227, 0.5)',
  turkeyBody: '#8a5a2b',
  turkeyWing: '#6f4520',
  turkeyTail: '#a8662c',
  turkeyTailTip: '#d94f30',
  turkeyHead: '#96622f',
  wattle: '#d23b2e',
  beak: '#f2a03d',
  farmerShirt: '#c73e2e',
  farmerOveralls: '#2e5f8a',
  farmerHat: '#e8c268',
  farmerSkin: '#f0b98a',
  ovenBody: '#3d4148',
  ovenDoor: '#23262b',
  ovenGlow: '#ff8c3a',
  knifeBlade: '#d9dee6',
  knifeEdge: '#f4f7fb',
  knifeHandle: '#7a4a21',
  cornKernel: '#ffd23e',
  cornHusk: '#5da244',
  heart: '#e83e52',
  danger: '#d23b2e',
  safe: '#5da244',
};
