// src/grid.js — office grid model (EXP-001 slice 1)
// Cells are identified by integer coordinates { x, y }.
// A cell is walkable when it is inside the grid bounds and not a wall.

export function createGrid(width, height) {
  return { width, height, walls: new Set() };
}

export function addWall(grid, x, y) {
  // TODO: mark the cell as a wall
}

export function isWalkable(grid, x, y) {
  // TODO: bounds check + wall check
  return true;
}

export function neighbors(grid, x, y) {
  // TODO: return the 4-directionally adjacent walkable cells as [{ x, y }]
  return [];
}
