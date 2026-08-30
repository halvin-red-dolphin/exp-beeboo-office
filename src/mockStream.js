// src/mockStream.js — deterministic mock agent event stream (EXP-001 slice 3)
// Stands in for the real OpenClaw event feed. Round-robin over agents;
// event types cycle task_started -> task_completed -> message_sent ->
// break_started; every task_started mints a new task name "task-N".

export function createMockStream(agentIds) {
  // TODO: return { next() } producing the deterministic sequence
  return { next: () => null };
}
