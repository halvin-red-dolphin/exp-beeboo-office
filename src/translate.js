// bridge/translate.js — pure: captured gateway event -> office event (EXP-002)
// Input: one record from the office-events hook: { ts, type, action, sessionKey, context }
// Output: { type, agent, task? } in the office schema, or null for noise.
// Must NEVER throw, whatever junk arrives.

export function agentFromSessionKey(sessionKey) {
  if (!sessionKey || typeof sessionKey !== 'string' || !sessionKey.startsWith('agent:')) {
    return null;
  }
  const parts = sessionKey.split(':');
  if (parts.length < 3) {
    return null;
  }
  return parts[1];
}

export function mapWorker(agentId, roster) {
  if (!agentId || !roster || typeof roster !== 'object') {
    return 'visitor';
  }
  return roster[agentId] || 'visitor';
}

export function translate(record) {
  if (!record || typeof record !== 'object') {
    return null;
  }

  const agentId = agentFromSessionKey(record.sessionKey);
  if (!agentId) {
    return null;
  }

  if (record.type === 'message' && record.action === 'received') {
    const channelId = record.context?.channelId || 'telegram';
    return { type: 'task_started', agent: agentId, task: `reply:${channelId}` };
  }

  if (record.type === 'message' && record.action === 'sent') {
    return { type: 'task_completed', agent: agentId };
  }

  if (record.type === 'command') {
    return { type: 'message_sent', agent: agentId };
  }

  return null;
}
