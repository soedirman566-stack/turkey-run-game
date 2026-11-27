// keys.js — keyboard and mouse input, translated into the game's verbs:
// laneUp, laneDown, hop, confirm (start / restart). The game polls the
// one-shot queue once per frame, so a tap is never lost between frames.

const LANE_UP_CODES = ['ArrowUp', 'KeyW'];
const LANE_DOWN_CODES = ['ArrowDown', 'KeyS'];
const HOP_CODES = ['Space'];
const CONFIRM_CODES = ['Space', 'Enter', 'KeyR'];

export function createInput(canvas) {
  const queue = [];

  function push(verb) {
    queue.push(verb);
  }

  window.addEventListener('keydown', (event) => {
    if (LANE_UP_CODES.includes(event.code)) {
      push('laneUp');
      event.preventDefault();
    } else if (LANE_DOWN_CODES.includes(event.code)) {
      push('laneDown');
      event.preventDefault();
    } else if (HOP_CODES.includes(event.code)) {
      push('hop');
      push('confirm');
      event.preventDefault();
    } else if (CONFIRM_CODES.includes(event.code)) {
      push('confirm');
      event.preventDefault();
    }
  });

  canvas.addEventListener('pointerdown', (event) => {
    const rect = canvas.getBoundingClientRect();
    // With object-fit: contain the canvas box matches the drawn picture's
    // aspect, so fractions of the element box are fractions of the scene.
    const yFraction = (event.clientY - rect.top) / rect.height;
    push('confirm');
    if (yFraction < 0.4) push('laneUp');
    else if (yFraction > 0.62) push('laneDown');
    else push('hop');
  });

  return {
    // Drains and returns the verbs pressed since the last frame.
    takeVerbs() {
      const verbs = queue.slice();
      queue.length = 0;
      return verbs;
    },
  };
}
