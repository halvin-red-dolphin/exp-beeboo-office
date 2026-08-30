// src/interpolate.js — frame interpolation between simulation ticks (EXP-001 slice 2)

export function lerp(a, b, t) {
  // TODO: linear blend with t clamped to [0, 1]
  return a;
}

export function lerpPos(from, to, t) {
  // TODO: component-wise lerp of { x, y }
  return { x: from.x, y: from.y };
}

export function progress(startMs, durationMs, nowMs) {
  // TODO: normalized clamped progress of now through [start, start+duration]
  return 0;
}
