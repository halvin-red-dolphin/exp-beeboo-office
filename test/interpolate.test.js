import { describe, it, expect } from 'vitest';
import { lerp, lerpPos, progress } from '../src/interpolate.js';

describe('interpolation', () => {
  it('lerp blends between two numbers', () => {
    expect(lerp(0, 10, 0)).toBe(0);
    expect(lerp(0, 10, 1)).toBe(10);
    expect(lerp(0, 10, 0.25)).toBe(2.5);
    expect(lerp(-4, 4, 0.5)).toBe(0);
  });

  it('lerp clamps t to [0, 1]', () => {
    expect(lerp(0, 10, -0.5)).toBe(0);
    expect(lerp(0, 10, 1.5)).toBe(10);
  });

  it('lerpPos blends positions component-wise', () => {
    expect(lerpPos({ x: 0, y: 0 }, { x: 2, y: 4 }, 0.5)).toEqual({ x: 1, y: 2 });
    expect(lerpPos({ x: 1, y: 1 }, { x: 1, y: 1 }, 0.7)).toEqual({ x: 1, y: 1 });
  });

  it('progress converts a start time + duration + now into clamped t', () => {
    expect(progress(100, 50, 125)).toBe(0.5);
    expect(progress(100, 50, 100)).toBe(0);
    expect(progress(100, 50, 150)).toBe(1);
    expect(progress(100, 50, 300)).toBe(1); // past the end
    expect(progress(100, 50, 90)).toBe(0);  // before the start
  });
});
