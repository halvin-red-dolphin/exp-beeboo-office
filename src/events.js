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

// Replay-flicker fix (EXP-002 follow-up): events replayed from the bridge's
// ring buffer on (re)connect carry their original timestamps. Anything older
// than maxAgeMs should be logged but must not drive choreography, otherwise
// a page refresh animates the whole buffered burst (green desks flickering).
// Events without a parseable ts are treated as fresh (mock stream, tests).
export function isStaleEvent(event, now = Date.now(), maxAgeMs = 30000) {
  if (!event || !event.ts) {
    return false;
  }
  const t = Date.parse(event.ts);
  if (Number.isNaN(t)) {
    return false;
  }
  return now - t > maxAgeMs;
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
