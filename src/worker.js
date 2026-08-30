// src/worker.js — worker state machine (EXP-001 slice 1)
// States: 'idle' | 'walk' | 'work' | 'chat' | 'coffee'
// A worker walks one path cell per tick(); a task started while walking is
// deferred and begins when the worker arrives.

export function createWorker(id, x, y) {
  // TODO: return the initial worker object
  return { id, x, y };
}

export function assignPath(worker, path) {
  // TODO: store the path; switch to 'walk' when the path is non-empty
}

export function tick(worker) {
  // TODO: advance one cell while walking; on arrival switch to the pending
  // task ('work') if one is set, otherwise back to 'idle'
}

export function startTask(worker, task) {
  // TODO: store the task; begin 'work' now unless the worker is walking
}

export function finishTask(worker) {
  // TODO: clear the task and return to 'idle'
}

export function setState(worker, state) {
  // TODO: set only known states; return true when applied, false otherwise
  return false;
}
