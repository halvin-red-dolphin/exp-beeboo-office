// src/mockStream.js — deterministic mock agent event stream (EXP-001 slice 3)
// Stands in for the real OpenClaw event feed. Round-robin over agents;
// event types cycle task_started -> task_completed -> message_sent ->
// break_started; every task_started mints a new task name "task-N".

export function createMockStream(agentIds) {
  const eventTypes = ['task_started', 'task_completed', 'message_sent', 'break_started'];
  let typeIndex = 0;
  let taskNumber = 0;
  const queue = [];

  function refillQueue() {
    const type = eventTypes[typeIndex];
    queue.length = 0;
    for (const agent of agentIds) {
      if (type === 'task_started') {
        queue.push({
          type: 'task_started',
          agent: agent,
          task: `task-${++taskNumber}`
        });
      } else {
        queue.push({
          type: type,
          agent: agent
        });
      }
    }
    typeIndex = (typeIndex + 1) % eventTypes.length;
  }

  return {
    next() {
      if (queue.length === 0) {
        refillQueue();
      }
      return queue.shift();
    }
  };
}
