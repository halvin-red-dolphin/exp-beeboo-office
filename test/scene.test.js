import { describe, it, expect } from 'vitest';
import { stateColor, buildSceneModel } from '../src/scene.js';
import { gridToScreen } from '../src/iso.js';
import { createWorker, setState } from '../src/worker.js';

describe('scene model', () => {
  it('stateColor maps every worker state to its palette colour', () => {
    expect(stateColor('idle')).toBe(0x9e9e9e);
    expect(stateColor('walk')).toBe(0x42a5f5);
    expect(stateColor('work')).toBe(0x66bb6a);
    expect(stateColor('chat')).toBe(0xffa726);
    expect(stateColor('coffee')).toBe(0x8d6e63);
    expect(stateColor('unknown-state')).toBe(0xffffff);
  });

  it('projects each worker to screen coordinates with its state colour', () => {
    const w = createWorker('bilby', 2, 3);
    const [item] = buildSceneModel([w], 64, 32);
    const { x, y } = gridToScreen(2, 3, 64, 32);
    expect(item).toEqual({ id: 'bilby', x, y, color: 0x9e9e9e, state: 'idle' });
  });

  it('uses the current state colour, not the initial one', () => {
    const w = createWorker('nagatha', 1, 1);
    setState(w, 'coffee');
    const [item] = buildSceneModel([w], 64, 32);
    expect(item.color).toBe(0x8d6e63);
  });

  it('sorts by screen y ascending so nearer workers draw last (painter order)', () => {
    const far = createWorker('far', 1, 1);     // screen y = 32
    const mid = createWorker('mid', 3, 1);     // screen y = 64
    const near = createWorker('near', 0, 5);   // screen y = 80
    const model = buildSceneModel([near, far, mid], 64, 32);
    expect(model.map((m) => m.id)).toEqual(['far', 'mid', 'near']);
  });

  it('handles fractional (interpolated) worker positions', () => {
    const w = createWorker('bilby', 1.5, 0.5);
    const [item] = buildSceneModel([w], 64, 32);
    expect({ x: item.x, y: item.y }).toEqual(gridToScreen(1.5, 0.5, 64, 32));
  });
});
