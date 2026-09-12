// src/events.js — event bus + agent-event mapping (EXP-001 slice 1)
// Maps real BeeBoo agent events onto worker behaviour in the office.
import { setState, startTask, finishTask } from './worker.js';

export function createBus() {
  const handlers = new Map();
  
  return {
    on(type, handler) {
      if (!handlers.has(type)) {
        handlers.set(type, []);
      }
      handlers.get(type).push(handler);
    },
    
    emit(type, payload) {
      if (handlers.has(type)) {
        for (const handler of handlers.get(type)) {
          handler(payload);
        }
      }
    }
  };
}

// Replay-flicker fix (EXP-002 follow-up, v2): the bridge flags frames it
// replays from its ring buffer on (re)connect with { replay: true }. Those are
// history — log them, never animate them. Deterministic: no clock comparison,
// immune to device clock skew (v1 compared browser clock to bridge ts and
// silently ate ALL choreography when clocks disagreed by >30s).
export function shouldAnimate(event) {
  return !!event && event.replay !== true;
}

export function mapAgentEvent(event) {
  if (!event || !event.type || !event.agent) {
    return null;
  }
  
  const mapping = {
    'task_started': 'work',
    'task_completed': 'idle',
    'message_sent': 'chat',
    'break_started': 'coffee'
  };
  
  const action = mapping[event.type];
  if (!action) {
    return null;
  }
  
  return { workerId: event.agent, action };
}

export function applyEvent(workers, event) {
  const mapping = mapAgentEvent(event);
  if (!mapping) {
    return false;
  }
  
  const worker = workers.get(mapping.workerId);
  if (!worker) {
    return false;
  }
  
  if (mapping.action === 'work') {
    startTask(worker, event.task);
  } else if (mapping.action === 'idle') {
    finishTask(worker);
  }

  return setState(worker, mapping.action);
}
