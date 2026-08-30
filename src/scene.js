// src/scene.js — pure scene model for the render layer (EXP-001 slice 2)
// Computes WHAT to draw; the Pixi layer just draws it. Fully unit-testable.
import { gridToScreen } from './iso.js';

export function stateColor(state) {
  switch (state) {
    case 'idle': return 0x9e9e9e;
    case 'walk': return 0x42a5f5;
    case 'work': return 0x66bb6a;
    case 'chat': return 0xffa726;
    case 'coffee': return 0x8d6e63;
    default: return 0xffffff;
  }
}

export function buildSceneModel(workers, tileW, tileH) {
  return workers
    .map((worker) => {
      const { x, y } = gridToScreen(worker.x, worker.y, tileW, tileH);
      return {
        id: worker.id,
        x,
        y,
        color: stateColor(worker.state),
        state: worker.state
      };
    })
    .sort((a, b) => a.y - b.y);
}
