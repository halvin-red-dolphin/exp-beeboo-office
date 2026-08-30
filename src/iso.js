// src/iso.js — isometric projection helpers (EXP-001 slice 2)
// Classic 2:1 diamond projection. tileW/tileH are the full diamond dimensions.

export function gridToScreen(gx, gy, tileW, tileH) {
  const x = (gx - gy) * tileW / 2;
  const y = (gx + gy) * tileH / 2;
  return { x, y };
}

export function screenToGrid(sx, sy, tileW, tileH) {
  const a = sx / (tileW / 2);
  const b = sy / (tileH / 2);
  return { x: (a + b) / 2, y: (b - a) / 2 };
}
