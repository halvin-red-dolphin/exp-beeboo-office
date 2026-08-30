// src/mockStream.js — deterministic mock agent event stream (EXP-001 slice 3)
// Stands in for the real OpenClaw event feed. Round-robin over agents;
// event types cycle task_started -> task_completed -> message_sent ->
// break_started; every task_started mints a new task name "task-N".

export function createMockStream(agentIds) {
  let agentIndex = 0;
  let taskNumber = 1;
  const eventTypes = ['task_started', 'task_completed', 'message_sent', 'break_started'];
  let eventTypeIndex = 0;

  return {
    next() {
      const agent = agentIds[agentIndex];
      let event;

      if (eventTypes[eventTypeIndex] === 'task_started') {
        event = {
          type: 'task_started',
          agent: agent,
          task: `task-${taskNumber++}`
        };
      } else {
        event = {
          type: eventTypes[eventTypeIndex],
          agent: agent
        };
      }

      // Move to next agent (round-robin)
      agentIndex = (agentIndex + 1) % agentIds.length;

      // Move to next event type
      eventTypeIndex = (eventTypeIndex + 1) % eventTypes.length;

      return event;
    }
  };
}
