import { describe, it, expect } from 'vitest';
import { createBus, mapAgentEvent, applyEvent } from '../src/events.js';
import { createWorker } from '../src/worker.js';

describe('event bus', () => {
  it('on/emit delivers the payload to the handler', () => {
    const bus = createBus();
    let got = null;
    bus.on('ping', (p) => { got = p; });
    bus.emit('ping', { n: 1 });
    expect(got).toEqual({ n: 1 });
  });

  it('multiple handlers for the same type are all called, in order', () => {
    const bus = createBus();
    const calls = [];
    bus.on('e', () => calls.push('a'));
    bus.on('e', () => calls.push('b'));
    bus.emit('e', {});
    expect(calls).toEqual(['a', 'b']);
  });

  it('emit with no handlers does not throw', () => {
    const bus = createBus();
    expect(() => bus.emit('nobody-home', {})).not.toThrow();
  });
});

describe('agent event mapping', () => {
  it('maps the four known agent event types to worker actions', () => {
    expect(mapAgentEvent({ type: 'task_started', agent: 'bilby' })).toEqual({ workerId: 'bilby', action: 'work' });
    expect(mapAgentEvent({ type: 'task_completed', agent: 'bilby' })).toEqual({ workerId: 'bilby', action: 'idle' });
    expect(mapAgentEvent({ type: 'message_sent', agent: 'nagatha' })).toEqual({ workerId: 'nagatha', action: 'chat' });
    expect(mapAgentEvent({ type: 'break_started', agent: 'halvin' })).toEqual({ workerId: 'halvin', action: 'coffee' });
  });

  it('returns null for unknown types or missing agent', () => {
    expect(mapAgentEvent({ type: 'reboot', agent: 'bilby' })).toBe(null);
    expect(mapAgentEvent({ type: 'task_started' })).toBe(null);
    expect(mapAgentEvent(null)).toBe(null);
  });

  it('applyEvent updates the matching worker and reports success', () => {
    const workers = new Map([['bilby', createWorker('bilby', 0, 0)]]);
    expect(applyEvent(workers, { type: 'message_sent', agent: 'bilby' })).toBe(true);
    expect(workers.get('bilby').state).toBe('chat');
    // unknown worker or unmappable event -> false, nothing changes
    expect(applyEvent(workers, { type: 'task_started', agent: 'ghost' })).toBe(false);
    expect(applyEvent(workers, { type: 'reboot', agent: 'bilby' })).toBe(false);
    expect(workers.get('bilby').state).toBe('chat');
  });
});
