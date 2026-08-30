// src/interpolate.js — frame interpolation between simulation ticks (EXP-001 slice 2)

export function lerp(a, b, t) {
  // linear blend with t clamped to [0, 1]
  t = Math.max(0, Math.min(1, t));
  return a + (b - a) * t;
}

export function lerpPos(from, to, t) {
  // component-wise lerp of { x, y }
  return { x: lerp(from.x, to.x, t), y: lerp(from.y, to.y, t) };
}

export function progress(startMs, durationMs, nowMs) {
  // normalized clamped progress of now through [start, start+duration]
  const t = (nowMs - startMs) / durationMs;
  return Math.max(0, Math.min(1, t));
}
