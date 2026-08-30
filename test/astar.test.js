import { describe, it, expect } from 'vitest';
import { createGrid, addWall, isWalkable } from '../src/grid.js';
import { findPath } from '../src/astar.js';

function assertValidPath(g, path, start, goal) {
  expect(path.length).toBeGreaterThan(0);
  expect(path[0]).toEqual(start);
  expect(path[path.length - 1]).toEqual(goal);
  for (const step of path) {
    expect(isWalkable(g, step.x, step.y)).toBe(true);
  }
  for (let i = 1; i < path.length; i++) {
    const d = Math.abs(path[i].x - path[i - 1].x) + Math.abs(path[i].y - path[i - 1].y);
    expect(d).toBe(1); // 4-directional, one cell per step
  }
}

describe('astar findPath', () => {
  it('returns [start] when start equals goal', () => {
    const g = createGrid(5, 5);
    expect(findPath(g, { x: 2, y: 2 }, { x: 2, y: 2 })).toEqual([{ x: 2, y: 2 }]);
  });

  it('finds a straight-line path inclusive of both endpoints', () => {
    const g = createGrid(5, 5);
    const path = findPath(g, { x: 0, y: 0 }, { x: 3, y: 0 });
    expect(path.length).toBe(4); // (0,0) (1,0) (2,0) (3,0)
    assertValidPath(g, path, { x: 0, y: 0 }, { x: 3, y: 0 });
  });

  it('finds the shortest path around a wall', () => {
    const g = createGrid(5, 5);
    // vertical wall at x=2 covering y=0..3, gap only at y=4
    addWall(g, 2, 0);
    addWall(g, 2, 1);
    addWall(g, 2, 2);
    addWall(g, 2, 3);
    const path = findPath(g, { x: 0, y: 0 }, { x: 4, y: 0 });
    assertValidPath(g, path, { x: 0, y: 0 }, { x: 4, y: 0 });
    expect(path.length).toBe(13); // must detour through the gap at (2,4)
  });

  it('returns [] when the goal is unreachable', () => {
    const g = createGrid(5, 5);
    // box in the goal at (4,4)
    addWall(g, 3, 4);
    addWall(g, 4, 3);
    addWall(g, 3, 3);
    expect(findPath(g, { x: 0, y: 0 }, { x: 4, y: 4 })).toEqual([]);
  });

  it('returns [] when the goal itself is a wall', () => {
    const g = createGrid(5, 5);
    addWall(g, 3, 3);
    expect(findPath(g, { x: 0, y: 0 }, { x: 3, y: 3 })).toEqual([]);
  });
});
