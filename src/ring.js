// bridge/ring.js — bounded ring buffer for event replay (EXP-002)

export function createRing(capacity) {
  const buffer = new Array(capacity);
  let size = 0;
  let head = 0;
  let tail = 0;

  return {
    push(item) {
      if (size < capacity) {
        size++;
      } else {
        head = (head + 1) % capacity;
      }
      buffer[tail] = item;
      tail = (tail + 1) % capacity;
    },

    toArray() {
      const result = new Array(size);
      for (let i = 0; i < size; i++) {
        result[i] = buffer[(head + i) % capacity];
      }
      return result;
    },

    size() {
      return size;
    }
  };
}
