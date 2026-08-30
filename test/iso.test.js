import { describe, it, expect } from 'vitest';
import { gridToScreen, screenToGrid } from '../src/iso.js';

describe('isometric projection', () => {
  it('projects the origin to screen 0,0', () => {
    expect(gridToScreen(0, 0, 64, 32)).toEqual({ x: 0, y: 0 });
  });

  it('projects +x to the right and down', () => {
    expect(gridToScreen(1, 0, 64, 32)).toEqual({ x: 32, y: 16 });
  });

  it('projects +y to the left and down', () => {
    expect(gridToScreen(0, 1, 64, 32)).toEqual({ x: -32, y: 16 });
  });

  it('projects arbitrary cells (x-y spreads horizontally, x+y stacks vertically)', () => {
    expect(gridToScreen(2, 3, 64, 32)).toEqual({ x: -32, y: 80 });
    expect(gridToScreen(5, 1, 64, 32)).toEqual({ x: 128, y: 96 });
  });

  it('handles fractional coordinates (needed for interpolated walking)', () => {
    expect(gridToScreen(1.5, 0.5, 64, 32)).toEqual({ x: 32, y: 32 });
  });

  it('screenToGrid inverts gridToScreen', () => {
    expect(screenToGrid(-32, 80, 64, 32)).toEqual({ x: 2, y: 3 });
    expect(screenToGrid(128, 96, 64, 32)).toEqual({ x: 5, y: 1 });
    expect(screenToGrid(0, 0, 64, 32)).toEqual({ x: 0, y: 0 });
  });
});
