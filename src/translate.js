// bridge/translate.js — pure: captured gateway event -> office event (EXP-002)
// Input: one record from the office-events hook: { ts, type, action, sessionKey, context }
// Output: { type, agent, task? } in the office schema, or null for noise.
// Must NEVER throw, whatever junk arrives.

export function agentFromSessionKey(sessionKey) {
  // TODO: 'agent:<id>:...' -> '<id>', anything else -> null
  return null;
}

export function mapWorker(agentId, roster) {
  // TODO: roster is { agentId: workerId }; unknown/missing -> 'visitor'
  return 'visitor';
}

export function translate(record) {
  // TODO: message:received -> task_started (task 'reply:<channelId>'),
  // message:sent -> task_completed, command:* -> message_sent,
  // everything else (or no agent in sessionKey) -> null
  return null;
}
