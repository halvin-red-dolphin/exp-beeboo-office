// src/App.jsx — thin Pixi v8 shell (EXP-001 slice 3).
// Architecture rule: the Pixi ticker owns per-frame movement; React owns
// low-frequency DOM (the side panel). All drawing decisions come from the
// pure scene model; all behaviour comes from the mock agent event stream.
import React, { useEffect, useRef, useState } from 'react';
import { Application, Container, Graphics } from 'pixi.js';
import { createGrid, addWall, isWalkable } from './grid.js';
import { findPath } from './astar.js';
import { createWorker, assignPath, tick } from './worker.js';
import { applyEvent } from './events.js';
import { createMockStream } from './mockStream.js';
import { gridToScreen } from './iso.js';
import { lerpPos } from './interpolate.js';
import { buildSceneModel, stateColor } from './scene.js';
import { panelModel } from './panel.js';

const COLS = 12;
const ROWS = 8;
const TILE_W = 64;
const TILE_H = 32;
const SIM_HZ = 8;
const EVENT_EVERY_MS = 1800;
const WALLS = [[3, 2], [3, 3], [3, 4], [7, 1], [7, 2], [8, 5], [9, 5], [5, 6]];
const DESKS = {
  bilby: { x: 1, y: 1 },
  nagatha: { x: 5, y: 1 },
  halvin: { x: 10, y: 1 },
  echo: { x: 1, y: 6 },
  julie: { x: 6, y: 4 },
  clarance: { x: 10, y: 7 }
};
const COFFEE = { x: 11, y: 4 };
const CHAT = { x: 4, y: 7 };
const WORKER_IDS = Object.keys(DESKS);
const STATES = ['idle', 'walk', 'work', 'chat', 'coffee'];

function destinationFor(action, id) {
  if (action === 'work') return DESKS[id];
  if (action === 'coffee') return COFFEE;
  if (action === 'chat') return CHAT;
  return null; // idle: stay where you are
}

export default function App() {
  const hostRef = useRef(null);
  const workersRef = useRef(new Map());
  const eventLogRef = useRef([]);
  const [selected, setSelected] = useState(null);
  const [, setPulse] = useState(0);

  // low-frequency panel refresh
  useEffect(() => {
    const t = setInterval(() => setPulse((p) => p + 1), 400);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let app = null;
    let destroyed = false;

    (async () => {
      // Pixi v8: bare constructor, options go to async init()
      app = new Application();
      await app.init({ width: 900, height: 560, background: 0x1e1e28, antialias: true });
      if (destroyed || !hostRef.current) { app.destroy(); return; }
      hostRef.current.appendChild(app.canvas);

      const grid = createGrid(COLS, ROWS);
      for (const [x, y] of WALLS) addWall(grid, x, y);

      const world = new Container();
      world.x = app.screen.width / 2;
      world.y = 110;
      app.stage.addChild(world);

      // floor + clearly visible walls
      const floor = new Graphics();
      for (let gy = 0; gy < ROWS; gy++) {
        for (let gx = 0; gx < COLS; gx++) {
          const { x, y } = gridToScreen(gx, gy, TILE_W, TILE_H);
          const wall = !isWalkable(grid, gx, gy);
          const diamond = [x, y - TILE_H / 2, x + TILE_W / 2, y, x, y + TILE_H / 2, x - TILE_W / 2, y];
          if (wall) {
            // raised block: darker top, drawn slightly higher
            floor.poly(diamond.map((v, i) => (i % 2 ? v - 14 : v)))
              .fill(0x55556e)
              .stroke({ color: 0x6a6a88, width: 1.5 });
          } else {
            floor.poly(diamond)
              .fill((gx + gy) % 2 ? 0x262636 : 0x2c2c3e)
              .stroke({ color: 0x1a1a26, width: 1 });
          }
        }
      }
      // spot markers: coffee corner + chat spot
      for (const [spot, color] of [[COFFEE, 0x8d6e63], [CHAT, 0xffa726]]) {
        const { x, y } = gridToScreen(spot.x, spot.y, TILE_W, TILE_H);
        floor.circle(x, y, 5).fill({ color, alpha: 0.8 });
      }
      world.addChild(floor);

      // workers at their desks
      const workers = WORKER_IDS.map((id) => createWorker(id, DESKS[id].x, DESKS[id].y));
      workersRef.current = new Map(workers.map((w) => [w.id, w]));
      const layer = new Container();
      world.addChild(layer);
      const dots = new Map();
      const ring = new Graphics().circle(0, 0, 15).stroke({ color: 0xffffff, width: 2, alpha: 0.9 });
      ring.visible = false;
      layer.addChild(ring);
      for (const w of workers) {
        const dot = new Graphics().circle(0, 0, 10).fill(0xffffff).stroke({ color: 0x14141c, width: 2 });
        dot.eventMode = 'static';
        dot.cursor = 'pointer';
        dot.on('pointerdown', () => setSelected(w.id));
        dots.set(w.id, dot);
        layer.addChild(dot);
      }

      // event-driven behaviour
      const stream = createMockStream(WORKER_IDS);
      const pending = new Map();
      let sinceEvent = 0;
      const dispatch = () => {
        const evt = stream.next();
        eventLogRef.current = [...eventLogRef.current.slice(-199), evt];
        const w = workersRef.current.get(evt.agent);
        if (!w) return;
        const dest = destinationFor({ task_started: 'work', task_completed: 'idle', message_sent: 'chat', break_started: 'coffee' }[evt.type], evt.agent);
        if (dest && (dest.x !== w.x || dest.y !== w.y)) {
          const p = findPath(grid, { x: w.x, y: w.y }, dest);
          if (p.length > 1) {
            assignPath(w, p.slice(1));
            pending.set(w.id, evt);
            return;
          }
        }
        applyEvent(workersRef.current, evt); // already there (or idle): apply now
      };

      // fixed-step simulation + interpolated rendering
      const prev = new Map(workers.map((w) => [w.id, { x: w.x, y: w.y }]));
      const STEP = 1000 / SIM_HZ;
      let acc = 0;
      app.ticker.add((ticker) => {
        acc += ticker.deltaMS;
        sinceEvent += ticker.deltaMS;
        if (sinceEvent >= EVENT_EVERY_MS) {
          sinceEvent = 0;
          dispatch();
        }
        while (acc >= STEP) {
          acc -= STEP;
          for (const w of workers) {
            prev.set(w.id, { x: w.x, y: w.y });
            const wasWalking = w.state === 'walk';
            tick(w);
            if (wasWalking && w.state !== 'walk' && pending.has(w.id)) {
              applyEvent(workersRef.current, pending.get(w.id));
              pending.delete(w.id);
            }
          }
        }
        const t = acc / STEP;
        const view = workers.map((w) => ({ ...w, ...lerpPos(prev.get(w.id), { x: w.x, y: w.y }, t) }));
        const model = buildSceneModel(view, TILE_W, TILE_H);
        let selPos = null;
        model.forEach((item, i) => {
          const dot = dots.get(item.id);
          dot.position.set(item.x, item.y);
          dot.tint = item.color;
          layer.setChildIndex(dot, Math.min(i + 1, layer.children.length - 1));
          if (item.id === selectedRef.current) selPos = item;
        });
        ring.visible = !!selPos;
        if (selPos) ring.position.set(selPos.x, selPos.y);
      });
    })();

    return () => {
      destroyed = true;
      if (app) app.destroy(true, { children: true });
    };
  }, []);

  // keep the ticker's view of the selection fresh without re-running the effect
  const selectedRef = useRef(null);
  selectedRef.current = selected;

  const worker = selected ? workersRef.current.get(selected) : null;
  const panel = worker ? panelModel(worker, eventLogRef.current) : null;

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      <div>
        <h1>BeeBoo Office — slice 3 (EXP-001)</h1>
        <div ref={hostRef} />
        <p style={{ fontSize: 12, opacity: 0.7 }}>
          {STATES.map((s) => (
            <span key={s} style={{ marginRight: 14 }}>
              <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 5, background: `#${stateColor(s).toString(16).padStart(6, '0')}`, marginRight: 5 }} />
              {s}
            </span>
          ))}
        </p>
      </div>
      <div style={{ width: 260, marginTop: 52, padding: 16, background: '#1e1e28', borderRadius: 8, minHeight: 200 }}>
        {panel ? (
          <>
            <h2 style={{ marginTop: 0, fontSize: 16, textTransform: 'capitalize' }}>{panel.id}</h2>
            <p>
              <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 5, background: `#${stateColor(panel.state).toString(16).padStart(6, '0')}`, marginRight: 6 }} />
              <b>{panel.state}</b>
              {panel.task ? <span style={{ opacity: 0.8 }}> · {panel.task}</span> : null}
            </p>
            <h3 style={{ fontSize: 13, opacity: 0.7 }}>Recent events</h3>
            {panel.log.length ? (
              <ul style={{ fontSize: 12, paddingLeft: 16, lineHeight: 1.7 }}>
                {panel.log.map((line, i) => <li key={i}>{line}</li>)}
              </ul>
            ) : (
              <p style={{ fontSize: 12, opacity: 0.6 }}>No events yet.</p>
            )}
          </>
        ) : (
          <p style={{ fontSize: 13, opacity: 0.6 }}>Click a worker to inspect their status and event log.</p>
        )}
      </div>
    </div>
  );
}
