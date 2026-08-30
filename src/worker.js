// src/worker.js — worker state machine (EXP-001 slice 1)
// States: 'idle' | 'walk' | 'work' | 'chat' | 'coffee'
// A worker walks one path cell per tick(); a task started while walking is
// deferred and begins when the worker arrives.

export function createWorker(id, x, y) {
  return { id, x, y, state: 'idle', path: [], task: null };
}

export function assignPath(worker, path) {
  worker.path = path;
  if (path.length > 0) {
    worker.state = 'walk';
  }
}

export function tick(worker) {
  if (worker.state === 'walk' && worker.path.length > 0) {
    worker.x = worker.path[0].x;
    worker.y = worker.path[0].y;
    worker.path.shift();
    if (worker.path.length === 0) {
      if (worker.task) {
        worker.state = 'work';
      } else {
        worker.state = 'idle';
      }
    }
  } else if (worker.state === 'work' && worker.task) {
    worker.task = null;
    worker.state = 'idle';
  }
}

export function startTask(worker, task) {
  worker.task = task;
  if (worker.state !== 'walk') {
    worker.state = 'work';
  }
}

export function finishTask(worker) {
  worker.task = null;
  worker.state = 'idle';
}

export function setState(worker, state) {
  const validStates = ['idle', 'walk', 'work', 'chat', 'coffee'];
  if (!validStates.includes(state)) {
    return false;
  }
  worker.state = state;
  return true;
}
