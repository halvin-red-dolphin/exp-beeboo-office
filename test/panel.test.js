import { describe, it, expect } from 'vitest';
import { formatEvent, panelModel } from '../src/panel.js';
import { createWorker, startTask } from '../src/worker.js';

describe('side panel model', () => {
  it('formats events compactly, with the task when present', () => {
    expect(formatEvent({ type: 'task_started', agent: 'bilby', task: 'task-3' })).toBe('bilby: task_started — task-3');
    expect(formatEvent({ type: 'message_sent', agent: 'nagatha' })).toBe('nagatha: message_sent');
  });

  it('builds the panel with only the selected worker\u2019s events, most recent first', () => {
    const w = createWorker('bilby', 0, 0);
    startTask(w, 'task-9');
    const events = [
      { type: 'task_started', agent: 'bilby', task: 'task-9' },
      { type: 'message_sent', agent: 'nagatha' },
      { type: 'message_sent', agent: 'bilby' }
    ];
    const p = panelModel(w, events);
    expect(p.id).toBe('bilby');
    expect(p.state).toBe('work');
    expect(p.task).toBe('task-9');
    expect(p.log).toEqual(['bilby: message_sent', 'bilby: task_started — task-9']);
  });

  it('caps the log at the given limit (default 5)', () => {
    const w = createWorker('a', 0, 0);
    const events = Array.from({ length: 10 }, () => ({ type: 'message_sent', agent: 'a' }));
    expect(panelModel(w, events).log.length).toBe(5);
    expect(panelModel(w, events, 3).log.length).toBe(3);
  });
});
