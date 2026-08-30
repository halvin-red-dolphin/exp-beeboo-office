// src/astar.js — A* pathfinding over the office grid (EXP-001 slice 1)
// findPath(grid, start, goal) -> array of { x, y } cells from start to goal
// inclusive of both endpoints, or [] when no path exists.
import { neighbors, isWalkable } from './grid.js';

export function findPath(grid, start, goal) {
  if (start.x === goal.x && start.y === goal.y) {
    return [start];
  }

  const openSet = [{ ...start, g: 0, h: manhattanDistance(start, goal), f: manhattanDistance(start, goal) }];
  const cameFrom = new Map();
  const gScore = new Map();
  const fScore = new Map();

  gScore.set(`${start.x},${start.y}`, 0);
  fScore.set(`${start.x},${start.y}`, manhattanDistance(start, goal));

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();

    if (current.x === goal.x && current.y === goal.y) {
      const path = [];
      let c = current;
      while (c) {
        path.unshift({ x: c.x, y: c.y });
        c = cameFrom.get(`${c.x},${c.y}`);
      }
      return path;
    }

    const currentKey = `${current.x},${current.y}`;
    const currentNeighbors = neighbors(grid, current.x, current.y);

    for (const neighbor of currentNeighbors) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      const tentativeGScore = gScore.get(currentKey) + 1;

      if (tentativeGScore < (gScore.get(neighborKey) || Infinity)) {
        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeGScore);
        const h = manhattanDistance(neighbor, goal);
        const f = tentativeGScore + h;
        fScore.set(neighborKey, f);

        if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
          openSet.push({ ...neighbor, g: tentativeGScore, h, f });
        }
      }
    }
  }

  return [];
}

function manhattanDistance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
