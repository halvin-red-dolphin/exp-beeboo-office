// src/scene.js — pure scene model for the render layer (EXP-001 slice 2)
// Computes WHAT to draw; the Pixi layer just draws it. Fully unit-testable.
import { gridToScreen } from './iso.js';

export function stateColor(state) {
  // TODO: idle/walk/work/chat/coffee palette; unknown states -> 0xffffff
  return 0xffffff;
}

export function buildSceneModel(workers, tileW, tileH) {
  // TODO: project every worker to screen space with its state colour,
  // sorted by screen y ascending (painter order)
  return [];
}
