// bridge/ring.js — bounded ring buffer for event replay (EXP-002)

export function createRing(capacity) {
  // TODO: { push(item), toArray(), size() } dropping oldest beyond capacity
  return { push: () => {}, toArray: () => [], size: () => 0 };
}
