import { describe, it, expect } from 'vitest';
import { createWorker, assignPath, tick, startTask, finishTask, setState } from '../src/worker.js';

describe('worker state machine', () => {
  it('createWorker starts idle at the given position', () => {
    const w = createWorker('bilby', 2, 3);
    expect(w.id).toBe('bilby');
    expect(w.x).toBe(2);
    expect(w.y).toBe(3);
    expect(w.state).toBe('idle');
    expect(w.path).toEqual([]);
    expect(w.task).toBe(null);
  });

  it('assignPath stores the path and switches to walk', () => {
    const w = createWorker('bilby', 0, 0);
    assignPath(w, [{ x: 1, y: 0 }, { x: 2, y: 0 }]);
    expect(w.state).toBe('walk');
    expect(w.path).toEqual([{ x: 1, y: 0 }, { x: 2, y: 0 }]);
  });

  it('assignPath with an empty path leaves the worker idle', () => {
    const w = createWorker('bilby', 0, 0);
    assignPath(w, []);
    expect(w.state).toBe('idle');
  });

  it('tick advances one cell per call while walking', () => {
    const w = createWorker('bilby', 0, 0);
    assignPath(w, [{ x: 1, y: 0 }, { x: 2, y: 0 }]);
    tick(w);
    expect({ x: w.x, y: w.y }).toEqual({ x: 1, y: 0 });
    expect(w.state).toBe('walk');
    expect(w.path).toEqual([{ x: 2, y: 0 }]);
  });

  it('tick on the last path cell arrives and returns to idle', () => {
    const w = createWorker('bilby', 0, 0);
    assignPath(w, [{ x: 1, y: 0 }]);
    tick(w);
    expect({ x: w.x, y: w.y }).toEqual({ x: 1, y: 0 });
    expect(w.state).toBe('idle');
    expect(w.path).toEqual([]);
  });

  it('startTask while idle begins work immediately', () => {
    const w = createWorker('bilby', 0, 0);
    startTask(w, 'write-code');
    expect(w.state).toBe('work');
    expect(w.task).toBe('write-code');
    finishTask(w);
    expect(w.state).toBe('idle');
    expect(w.task).toBe(null);
  });

  it('startTask while walking defers work until arrival', () => {
    const w = createWorker('bilby', 0, 0);
    assignPath(w, [{ x: 1, y: 0 }]);
    startTask(w, 'write-code');
    expect(w.state).toBe('walk'); // still walking
    expect(w.task).toBe('write-code');
    tick(w); // arrives
    expect(w.state).toBe('work'); // pending task kicks in on arrival
  });

  it('setState accepts only known states and reports rejection', () => {
    const w = createWorker('bilby', 0, 0);
    expect(setState(w, 'chat')).toBe(true);
    expect(w.state).toBe('chat');
    expect(setState(w, 'coffee')).toBe(true);
    expect(w.state).toBe('coffee');
    expect(setState(w, 'flying')).toBe(false);
    expect(w.state).toBe('coffee'); // unchanged
  });
});
