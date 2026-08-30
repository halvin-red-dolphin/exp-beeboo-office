// src/App.jsx — thin Pixi v8 shell (EXP-001 slice 2).
// Architecture rule: the Pixi ticker owns per-frame movement; React owns
// low-frequency DOM only. All drawing decisions come from the pure scene
// model (src/scene.js) — this file just draws.
import React, { useEffect, useRef } from 'react';
import { Application, Container, Graphics } from 'pixi.js';
import { createGrid, addWall, isWalkable } from './grid.js';
import { findPath } from './astar.js';
import { createWorker, assignPath, tick } from './worker.js';
import { gridToScreen } from './iso.js';
import { lerpPos } from './interpolate.js';
import { buildSceneModel } from './scene.js';

const COLS = 12;
const ROWS = 8;
const TILE_W = 64;
const TILE_H = 32;
const SIM_HZ = 8;
const WALLS = [[3, 2], [3, 3], [3, 4], [7, 1], [7, 2], [8, 5], [9, 5], [5, 6]];
const WORKER_IDS = ['bilby', 'nagatha', 'halvin', 'echo', 'julie', 'clarance'];

function randomOpenCell(grid) {
  for (let tries = 0; tries < 200; tries++) {
    const x = Math.floor(Math.random() * grid.width);
    const y = Math.floor(Math.random() * grid.height);
    if (isWalkable(grid, x, y)) return { x, y };
  }
  return { x: 0, y: 0 };
}

export default function App() {
  const hostRef = useRef(null);

  useEffect(() => {
    let app = null;
    let destroyed = false;

    (async () => {
      // Pixi v8: bare constructor, options go to async init()
      app = new Application();
      await app.init({ width: 920, height: 540, background: 0x1e1e28, antialias: true });
      if (destroyed || !hostRef.current) { app.destroy(); return; }
      hostRef.current.appendChild(app.canvas);

      const grid = createGrid(COLS, ROWS);
      for (const [x, y] of WALLS) addWall(grid, x, y);

      const world = new Container();
      world.x = app.screen.width / 2;
      world.y = 90;
      app.stage.addChild(world);

      // floor
      const floor = new Graphics();
      for (let gy = 0; gy < ROWS; gy++) {
        for (let gx = 0; gx < COLS; gx++) {
          const { x, y } = gridToScreen(gx, gy, TILE_W, TILE_H);
          const wall = !isWalkable(grid, gx, gy);
          floor
            .poly([x, y - TILE_H / 2, x + TILE_W / 2, y, x, y + TILE_H / 2, x - TILE_W / 2, y])
            .fill({ color: wall ? 0x3a3a4a : (gx + gy) % 2 ? 0x262636 : 0x2c2c3e })
            .stroke({ color: 0x1a1a26, width: 1 });
        }
      }
      world.addChild(floor);

      // workers
      const workers = WORKER_IDS.map((id) => {
        const cell = randomOpenCell(grid);
        return createWorker(id, cell.x, cell.y);
      });
      const dots = new Map();
      const layer = new Container();
      world.addChild(layer);
      for (const w of workers) {
        const dot = new Graphics().circle(0, 0, 10).fill(0xffffff).stroke({ color: 0x14141c, width: 2 });
        dots.set(w.id, dot);
        layer.addChild(dot);
      }

      const retarget = (w) => {
        const goal = randomOpenCell(grid);
        const p = findPath(grid, { x: w.x, y: w.y }, goal);
        if (p.length > 1) assignPath(w, p.slice(1));
      };
      workers.forEach(retarget);

      // fixed-step simulation + interpolated rendering
      const prev = new Map(workers.map((w) => [w.id, { x: w.x, y: w.y }]));
      const STEP = 1000 / SIM_HZ;
      let acc = 0;
      app.ticker.add((ticker) => {
        acc += ticker.deltaMS;
        while (acc >= STEP) {
          acc -= STEP;
          for (const w of workers) {
            prev.set(w.id, { x: w.x, y: w.y });
            tick(w);
            if (w.state === 'idle') retarget(w);
          }
        }
        const t = acc / STEP;
        const view = workers.map((w) => ({ ...w, ...lerpPos(prev.get(w.id), { x: w.x, y: w.y }, t) }));
        const model = buildSceneModel(view, TILE_W, TILE_H);
        model.forEach((item, i) => {
          const dot = dots.get(item.id);
          dot.position.set(item.x, item.y);
          dot.tint = item.color;
          dot.zIndex = i;
          layer.setChildIndex(dot, i);
        });
      });
    })();

    return () => {
      destroyed = true;
      if (app) app.destroy(true, { children: true });
    };
  }, []);

  return (
    <div>
      <h1>BeeBoo Office — slice 2 (EXP-001)</h1>
      <div ref={hostRef} />
    </div>
  );
}
