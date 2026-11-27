[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/soedirman566-stack/turkey-run-game/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/soedirman566-stack/turkey-run-game/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

# Gobble Run — The Great Turkey Escape

Thanksgiving is coming, and Farmer Hank has plans for you. You are the
turkey. Run.

**Gobble Run** is a three-lane escape runner drawn entirely in code on a
canvas — no assets, no libraries, no network. Dodge the ovens (hop them)
and the carving knives Farmer Hank throws down your lane, gobble corn to
win back your breath, and cover 1,200 metres to the Freedom Gate before
he closes the gap and catches you.

- **Controls:** ↑/↓ or W/S switch lane, SPACE hops, mouse clicks steer,
  hop, start and restart.
- **Screens:** title, the run with its HUD (score, distance, hearts and
  the Farmer meter), and an ending for caught and one for escaped — each
  with a restart.
- **Layout:** `game/` is the playable site (`index.html` plus one module
  per job under `game/src/`), `screenshots/` holds the maker's renders,
  and `main.ts` hands the entry in: it copies `game/` and `screenshots/`
  to the output directory and writes `dossier.json` with the vendored
  make.fun library in `vendor/`.

Serve it locally with any static file server over `game/` and open
`index.html`, or hand it in with `MAKEFUN_OUTPUT_DIR=out node main.ts`.
