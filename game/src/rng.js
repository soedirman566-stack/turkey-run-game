// rng.js — a tiny seeded random number generator (mulberry32), so scenery
// and the frozen screenshot scenes come out the same on every load, while
// real runs reseed it from the clock.

export function makeRng(seed) {
  let state = seed >>> 0;
  return function nextRandom() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomRange(rng, low, high) {
  return low + rng() * (high - low);
}

export function randomLane(rng) {
  return Math.floor(rng() * 3);
}

export function pickWeighted(rng, entries) {
  // entries: [{ value, weight }] — returns one value by weight.
  let total = 0;
  for (const entry of entries) total += entry.weight;
  let roll = rng() * total;
  for (const entry of entries) {
    roll -= entry.weight;
    if (roll <= 0) return entry.value;
  }
  return entries[entries.length - 1].value;
}
