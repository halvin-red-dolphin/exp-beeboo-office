import { describe, it, expect } from 'vitest';
import { createMockStream } from '../src/mockStream.js';
import { mapAgentEvent } from '../src/events.js';

describe('mock agent event stream', () => {
  it('emits a deterministic round-robin sequence', () => {
    const s = createMockStream(['bilby', 'nagatha']);
    expect(s.next()).toEqual({ type: 'task_started', agent: 'bilby', task: 'task-1' });
    expect(s.next()).toEqual({ type: 'task_started', agent: 'nagatha', task: 'task-2' });
    expect(s.next()).toEqual({ type: 'task_completed', agent: 'bilby' });
    expect(s.next()).toEqual({ type: 'task_completed', agent: 'nagatha' });
    expect(s.next()).toEqual({ type: 'message_sent', agent: 'bilby' });
    expect(s.next()).toEqual({ type: 'message_sent', agent: 'nagatha' });
    expect(s.next()).toEqual({ type: 'break_started', agent: 'bilby' });
    expect(s.next()).toEqual({ type: 'break_started', agent: 'nagatha' });
  });

  it('wraps around and keeps numbering new tasks', () => {
    const s = createMockStream(['solo']);
    expect(s.next()).toEqual({ type: 'task_started', agent: 'solo', task: 'task-1' });
    s.next(); // task_completed
    s.next(); // message_sent
    s.next(); // break_started
    expect(s.next()).toEqual({ type: 'task_started', agent: 'solo', task: 'task-2' });
  });

  it('every emitted event is consumable by mapAgentEvent', () => {
    const s = createMockStream(['a', 'b', 'c']);
    for (let i = 0; i < 24; i++) {
      expect(mapAgentEvent(s.next())).not.toBe(null);
    }
  });
});
