import { describe, it, expect } from 'vitest';
import { createRing } from '../src/ring.js';

describe('ring buffer', () => {
  it('stores pushed items in order', () => {
    const r = createRing(5);
    r.push(1);
    r.push(2);
    r.push(3);
    expect(r.toArray()).toEqual([1, 2, 3]);
    expect(r.size()).toBe(3);
  });

  it('drops the oldest items beyond capacity', () => {
    const r = createRing(3);
    for (const n of [1, 2, 3, 4, 5]) r.push(n);
    expect(r.toArray()).toEqual([3, 4, 5]);
    expect(r.size()).toBe(3);
  });

  it('capacity 1 keeps only the latest', () => {
    const r = createRing(1);
    r.push('a');
    r.push('b');
    expect(r.toArray()).toEqual(['b']);
  });

  it('toArray returns a copy, not internal state', () => {
    const r = createRing(3);
    r.push(1);
    const a = r.toArray();
    a.push(99);
    expect(r.toArray()).toEqual([1]);
  });

  it('handles many wraps correctly', () => {
    const r = createRing(4);
    for (let i = 1; i <= 103; i++) r.push(i);
    expect(r.toArray()).toEqual([100, 101, 102, 103]);
  });
});
