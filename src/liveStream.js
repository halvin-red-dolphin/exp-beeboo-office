// src/liveStream.js — live event source for the office (EXP-002).
// Connects to the bridge's SSE stream and feeds office events to a callback.
// Falls back to the mock stream when the bridge is unreachable, and keeps
// trying to reconnect in the background ("demo mode" until live returns).
import { createMockStream } from './mockStream.js';

export function createLiveStream(url, onEvent, onStatus, { EventSourceImpl = globalThis.EventSource, mockIntervalMs = 1800 } = {}) {
  let es = null;
  let mockTimer = null;
  let mock = null;
  let closed = false;

  const startMock = (agentIds) => {
    if (mockTimer || closed) return;
    mock = createMockStream(agentIds);
    onStatus?.('demo');
    mockTimer = setInterval(() => onEvent(mock.next()), mockIntervalMs);
  };

  const stopMock = () => {
    if (mockTimer) { clearInterval(mockTimer); mockTimer = null; mock = null; }
  };

  const connect = (agentIds) => {
    if (closed || !EventSourceImpl) { startMock(agentIds); return; }
    es = new EventSourceImpl(url);
    es.onopen = () => { stopMock(); onStatus?.('live'); };
    es.onmessage = (m) => {
      try { onEvent(JSON.parse(m.data)); } catch { /* skip bad frame */ }
    };
    es.onerror = () => {
      // EventSource auto-reconnects; run demo mode while it tries
      startMock(agentIds);
    };
  };

  return {
    start(agentIds) { connect(agentIds); },
    close() {
      closed = true;
      stopMock();
      if (es) es.close();
    }
  };
}
