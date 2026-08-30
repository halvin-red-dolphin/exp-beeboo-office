// src/grid.js — office grid model (EXP-001 slice 1)
// Cells are identified by integer coordinates { x, y }.
// A cell is walkable when it is inside the grid bounds and not a wall.

export function createGrid(width, height) {
  return { width, height, walls: new Set() };
}

export function addWall(grid, x, y) {
  grid.walls.add(`${x},${y}`);
}

export function isWalkable(grid, x, y) {
  if (x < 0 || x >= grid.width || y < 0 || y >= grid.height) {
    return false;
  }
  return !grid.walls.has(`${x},${y}`);
}

export function neighbors(grid, x, y) {
  const result = [];
  const directions = [
    { x: 0, y: -1 }, // up
    { x: 1, y: 0 },  // right
    { x: 0, y: 1 },  // down
    { x: -1, y: 0 }  // left
  ];
  
  for (const dir of directions) {
    const nx = x + dir.x;
    const ny = y + dir.y;
    if (isWalkable(grid, nx, ny)) {
      result.push({ x: nx, y: ny });
    }
  }
  
  return result;
}
