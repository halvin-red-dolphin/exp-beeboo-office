import { describe, it, expect } from 'vitest';
import { createGrid, addWall, isWalkable, neighbors } from '../src/grid.js';

describe('grid', () => {
  it('createGrid stores width and height', () => {
    const g = createGrid(10, 6);
    expect(g.width).toBe(10);
    expect(g.height).toBe(6);
  });

  it('isWalkable is true for open in-bounds cells', () => {
    const g = createGrid(4, 4);
    expect(isWalkable(g, 0, 0)).toBe(true);
    expect(isWalkable(g, 3, 3)).toBe(true);
  });

  it('isWalkable is false outside the grid bounds', () => {
    const g = createGrid(4, 4);
    expect(isWalkable(g, -1, 0)).toBe(false);
    expect(isWalkable(g, 0, -1)).toBe(false);
    expect(isWalkable(g, 4, 0)).toBe(false);
    expect(isWalkable(g, 0, 4)).toBe(false);
  });

  it('addWall makes a cell unwalkable', () => {
    const g = createGrid(4, 4);
    addWall(g, 2, 1);
    expect(isWalkable(g, 2, 1)).toBe(false);
    expect(isWalkable(g, 1, 2)).toBe(true);
  });

  it('neighbors returns the 4-directional neighbours of an open cell', () => {
    const g = createGrid(3, 3);
    const n = neighbors(g, 1, 1).map(({ x, y }) => `${x},${y}`).sort();
    expect(n).toEqual(['0,1', '1,0', '1,2', '2,1']);
  });

  it('neighbors excludes walls and out-of-bounds cells', () => {
    const g = createGrid(3, 3);
    addWall(g, 1, 0);
    // corner cell (0,0): (-1,0) and (0,-1) are out of bounds, (1,0) is a wall
    const corner = neighbors(g, 0, 0).map(({ x, y }) => `${x},${y}`).sort();
    expect(corner).toEqual(['0,1']);
  });
});
