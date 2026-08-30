// src/panel.js — pure selectors for the worker side panel (EXP-001 slice 3)

export function formatEvent(event) {
  if (event.task) {
    return `${event.agent}: ${event.type} — ${event.task}`;
  }
  return `${event.agent}: ${event.type}`;
}

export function panelModel(worker, events, limit = 5) {
  const workerEvents = events.filter(e => e.agent === worker.id);
  const formattedEvents = workerEvents.map(formatEvent).reverse();
  const cappedEvents = formattedEvents.slice(0, limit);
  
  return { 
    id: worker.id, 
    state: worker.state, 
    task: worker.task, 
    log: cappedEvents 
  };
}
