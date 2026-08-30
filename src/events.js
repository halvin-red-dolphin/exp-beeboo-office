// src/events.js — event bus + agent-event mapping (EXP-001 slice 1)
// Maps real BeeBoo agent events onto worker behaviour in the office.
import { setState } from './worker.js';

export function createBus() {
  // TODO: minimal pub/sub: on(type, handler), emit(type, payload)
  return {};
}

export function mapAgentEvent(event) {
  // TODO: task_started->work, task_completed->idle, message_sent->chat,
  // break_started->coffee; anything else (or missing agent) -> null
  return null;
}

export function applyEvent(workers, event) {
  // TODO: map the event and update the matching worker's state via setState;
  // return true when a worker was updated, false otherwise
  return false;
}
