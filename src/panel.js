// src/panel.js — pure selectors for the worker side panel (EXP-001 slice 3)

export function formatEvent(event) {
  // TODO: "agent: type" plus " — task" when the event carries a task
  return '';
}

export function panelModel(worker, events, limit = 5) {
  // TODO: { id, state, task, log } — log holds the worker's own events only,
  // formatted, most recent first, capped at limit
  return { id: worker.id, state: worker.state, task: null, log: [] };
}
