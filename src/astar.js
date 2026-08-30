// src/astar.js — A* pathfinding over the office grid (EXP-001 slice 1)
// findPath(grid, start, goal) -> array of { x, y } cells from start to goal
// inclusive of both endpoints, or [] when no path exists.
import { neighbors } from './grid.js';

export function findPath(grid, start, goal) {
  if (start.x === goal.x && start.y === goal.y) {
    return [start];
  }
  
  const openSet = new Set();
  const cameFrom = new Map();
  const gScore = new Map();
  const fScore = new Map();
  
  const startKey = `${start.x},${start.y}`;
  const goalKey = `${goal.x},${goal.y}`;
  
  openSet.add(startKey);
  gScore.set(startKey, 0);
  fScore.set(startKey, manhattanDistance(start, goal));
  
  while (openSet.size > 0) {
    let currentKey = null;
    let lowestFScore = Infinity;
    
    for (const key of openSet) {
      const score = fScore.get(key);
      if (score < lowestFScore) {
        lowestFScore = score;
        currentKey = key;
      }
    }
    
    if (currentKey === goalKey) {
      const path = [];
      let current = currentKey;
      while (current) {
        const [x, y] = current.split(',').map(Number);
        path.unshift({ x, y });
        current = cameFrom.get(current);
      }
      return path;
    }
    
    openSet.delete(currentKey);
    
    const [x, y] = currentKey.split(',').map(Number);
    const currentNeighbors = neighbors(grid, { x, y });
    
    for (const neighbor of currentNeighbors) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      
      if (openSet.has(neighborKey)) {
        const tentativeGScore = gScore.get(currentKey) + 1;
        if (tentativeGScore < gScore.get(neighborKey)) {
          cameFrom.set(neighborKey, currentKey);
          gScore.set(neighborKey, tentativeGScore);
          fScore.set(neighborKey, tentativeGScore + manhattanDistance(neighbor, goal));
        }
      } else {
        const tentativeGScore = gScore.get(currentKey) + 1;
        gScore.set(neighborKey, tentativeGScore);
        fScore.set(neighborKey, tentativeGScore + manhattanDistance(neighbor, goal));
        openSet.add(neighborKey);
        cameFrom.set(neighborKey, currentKey);
      }
    }
  }
  
  return [];
}

function manhattanDistance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
