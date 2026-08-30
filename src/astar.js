// src/astar.js — A* pathfinding over the office grid (EXP-001 slice 1)
// findPath(grid, start, goal) -> array of { x, y } cells from start to goal
// inclusive of both endpoints, or [] when no path exists.
import { neighbors, isWalkable } from './grid.js';

export function findPath(grid, start, goal) {
  if (!isWalkable(grid, start.x, start.y) || !isWalkable(grid, goal.x, goal.y)) {
    return [];
  }

  if (start.x === goal.x && start.y === goal.y) {
    return [start];
  }

  const queue = [start];
  const visited = new Set([`${start.x},${start.y}`]);
  const parent = new Map();

  while (queue.length > 0) {
    const cell = queue.shift();
    const neighborsList = neighbors(grid, cell.x, cell.y);

    for (const neighbor of neighborsList) {
      const key = `${neighbor.x},${neighbor.y}`;
      if (!visited.has(key)) {
        visited.add(key);
        queue.push(neighbor);
        parent.set(key, cell);
        if (neighbor.x === goal.x && neighbor.y === goal.y) {
          break;
        }
      }
    }
  }

  if (!parent.has(`${goal.x},${goal.y}`)) {
    return [];
  }

  const path = [];
  let current = goal;
  while (current) {
    path.unshift(current);
    const key = `${current.x},${current.y}`;
    current = parent.get(key);
  }

  return path;
}
