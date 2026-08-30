// bridge/server.js — thin SSE fan-out for the live BeeBoo Office (EXP-002).
// Receives sanitized gateway events from the office-events hook (POST /events),
// translates them to office events, and rebroadcasts over SSE (GET /stream)
// with a replay of recent history on connect.
//
// Run on the Mac host:  npm run bridge   (default port 9901)
// Auth: hook POSTs must carry Authorization: Bearer $BRIDGE_TOKEN when set.
import http from 'node:http';
import crypto from 'node:crypto';
import { translate } from '../src/translate.js';
import { createRing } from '../src/ring.js';

const PORT = parseInt(process.env.BRIDGE_PORT || '9901', 10);
const TOKEN = process.env.BRIDGE_TOKEN || '';
const ring = createRing(50);
const clients = new Set();

// second privacy fence: nothing content-shaped leaves the bridge
function officePayload(evt) {
  return { type: evt.type, agent: evt.agent, ...(evt.task ? { task: evt.task } : {}), ts: new Date().toISOString() };
}

function broadcast(evt) {
  const payload = officePayload(evt);
  ring.push(payload);
  const frame = `data: ${JSON.stringify(payload)}\n\n`;
  for (const res of clients) {
    try { res.write(frame); } catch { clients.delete(res); }
  }
}

const server = http.createServer((req, res) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type'
  };

  if (req.method === 'OPTIONS') { res.writeHead(204, cors); res.end(); return; }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json', ...cors });
    res.end(JSON.stringify({ ok: true, clients: clients.size, buffered: ring.size() }));
    return;
  }

  if (req.method === 'GET' && req.url === '/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      ...cors
    });
    for (const evt of ring.toArray()) res.write(`data: ${JSON.stringify(evt)}\n\n`);
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  if (req.method === 'POST' && req.url === '/events') {
    if (TOKEN) {
      const auth = req.headers.authorization || '';
      const expected = `Bearer ${TOKEN}`;
      const ok = auth.length === expected.length &&
        crypto.timingSafeEqual(Buffer.from(auth), Buffer.from(expected));
      if (!ok) { res.writeHead(401); res.end(); return; }
    }
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 65536) req.destroy(); });
    req.on('end', () => {
      try {
        const evt = translate(JSON.parse(body));
        if (evt) broadcast(evt);
        res.writeHead(202); res.end();
      } catch {
        res.writeHead(400); res.end();
      }
    });
    return;
  }

  res.writeHead(404); res.end();
});

server.listen(PORT, () => {
  console.log(`[bridge] listening on :${PORT} — POST /events (hook), GET /stream (SSE), GET /health`);
});
