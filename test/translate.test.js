import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { translate, agentFromSessionKey, mapWorker } from '../src/translate.js';

// Real captured gateway events (content-redacted, anonymized) — the ground truth.
const FIXTURES = readFileSync(new URL('./fixtures/capture.jsonl', import.meta.url), 'utf8')
  .trim()
  .split('\n')
  .map((l) => JSON.parse(l));

const byKind = (t, a) => FIXTURES.find((f) => f.type === t && f.action === a);

describe('agentFromSessionKey', () => {
  it('extracts the agent id from agent-scoped session keys', () => {
    expect(agentFromSessionKey('agent:main:telegram:direct:1000000001')).toBe('main');
    expect(agentFromSessionKey('agent:bilby:cron:job')).toBe('bilby');
  });

  it('returns null for non-agent keys', () => {
    expect(agentFromSessionKey('gateway:startup')).toBe(null);
    expect(agentFromSessionKey('')).toBe(null);
    expect(agentFromSessionKey(undefined)).toBe(null);
  });
});

describe('mapWorker', () => {
  const ROSTER = { main: 'halvin', bilby: 'bilby', nagatha: 'nagatha' };

  it('maps known agent ids to their office worker', () => {
    expect(mapWorker('main', ROSTER)).toBe('halvin');
    expect(mapWorker('bilby', ROSTER)).toBe('bilby');
  });

  it('maps unknown agents to visitor', () => {
    expect(mapWorker('mystery-agent', ROSTER)).toBe('visitor');
    expect(mapWorker(null, ROSTER)).toBe('visitor');
  });
});

describe('translate (fixture-driven)', () => {
  it('message:received starts work for the session agent', () => {
    const rec = byKind('message', 'received');
    expect(translate(rec)).toEqual({ type: 'task_started', agent: 'main', task: 'reply:telegram' });
  });

  it('message:sent completes work', () => {
    const rec = byKind('message', 'sent');
    expect(translate(rec)).toEqual({ type: 'task_completed', agent: 'main' });
  });

  it('noise events translate to null', () => {
    expect(translate(byKind('message', 'preprocessed'))).toBe(null);
    expect(translate(byKind('agent', 'bootstrap'))).toBe(null);
    expect(translate(byKind('gateway', 'startup'))).toBe(null);
    expect(translate(byKind('gateway', 'shutdown'))).toBe(null);
  });

  it('command events read as chat activity for the session agent', () => {
    // synthetic: no command fixture captured yet, shape mirrors the docs
    const rec = { type: 'command', action: 'new', sessionKey: 'agent:main:telegram:direct:1000000001', context: {} };
    expect(translate(rec)).toEqual({ type: 'message_sent', agent: 'main' });
  });

  it('never throws on junk and returns null', () => {
    expect(translate(null)).toBe(null);
    expect(translate({})).toBe(null);
    expect(translate({ type: 'message', action: 'received', sessionKey: 'gateway:x', context: {} })).toBe(null);
    expect(translate({ type: 'session', action: 'patch', sessionKey: 'agent:main:x', context: {} })).toBe(null);
  });

  it('every fixture line translates without throwing', () => {
    for (const rec of FIXTURES) {
      const out = translate(rec);
      if (out !== null) {
        expect(out).toHaveProperty('type');
        expect(out).toHaveProperty('agent');
        expect(['task_started', 'task_completed', 'message_sent', 'break_started']).toContain(out.type);
      }
    }
  });
});
