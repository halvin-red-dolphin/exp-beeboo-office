import { neighbors } from './grid.js';

export function findPath(grid, start, goal) {
  if (start.x === goal.x && start.y === goal.y) {
    return [start];
  }

  const openSet = [{ ...start, g: 0, h: 0, f: 0, parent: null }];
  const closedSet = new Set();
  const cameFrom = new Map();

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();

    const key = `${current.x},${current.y}`;
    if (closedSet.has(key)) continue;
    closedSet.add(key);

    if (current.x === goal.x && current.y === goal.y) {
      const path = [];
      let node = current;
      while (node) {
        path.unshift({ x: node.x, y: node.y });
        node = node.parent;
      }
      return path;
    }

    for (const neighbor of neighbors(grid, current.x, current.y)) {
      if (closedSet.has(`${neighbor.x},${neighbor.y}`)) continue;

      const tentativeG = current.g + 1;
      const existingNode = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);

      if (!existingNode) {
        const h = Math.abs(neighbor.x - goal.x) + Math.abs(neighbor.y - goal.y);
        const f = tentativeG + h;
        openSet.push({
          x: neighbor.x,
          y: neighbor.y,
          g: tentativeG,
          h: h,
          f: f,
          parent: current
        });
      } else if (tentativeG < existingNode.g) {
        existingNode.g = tentativeG;
        existingNode.f = tentativeG + existingNode.h;
        existingNode.parent = current;
      }
    }
  }

  return [];
}
