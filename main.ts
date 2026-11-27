// Gobble Run — hand-in program for the make.fun bounty turkey-run-game-01.
//
// The game itself is the plain static site in game/ beside this file: a
// turkey escape game a desktop browser plays offline, no build step and
// no network. This program's whole job is the hand-in: copy game/ and
// screenshots/ into the output directory and write dossier.json there
// with buildDossier from the vendored make.fun library, so the gate can
// compare it byte for byte with its own rebuild.
//
// The output directory is /output in the grader; anywhere else,
// MAKEFUN_OUTPUT_DIR names it instead:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Nothing here ever deletes from the output directory: it is created if
// missing and the game's files are copied into it, full stop.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyHandIn() {
  mkdirSync(outputDir, { recursive: true });
  cpSync(join(repoDir, 'game'), join(outputDir, 'game'), { recursive: true });
  const shotsDir = join(repoDir, 'screenshots');
  if (existsSync(shotsDir)) {
    mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
    cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
  }
}

// The dossier caps are the scorer's own: the judge's text view is capped
// at 160 KiB, screenshots at 4 files of 256 KiB, and the game tree at 993
// entries, 48 MiB in all and 1,000 bytes a path. buildDossier refuses a
// tree that breaks them, which is what we want: better to fail here than
// hand in an entry the scorer would refuse.
function writeDossier() {
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

copyHandIn();
writeDossier();
