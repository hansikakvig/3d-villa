// Procedural terrain: flat resort plateau, valley drop, then flat-topped
// Sahyadri-style ridges. Approximate scenery, not survey data.

const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const noise = (x: number, y: number) => {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};

export const fbm = (x: number, y: number, oct = 5) => {
  let t = 0, amp = 0.5, f = 1;
  for (let i = 0; i < oct; i++) {
    t += amp * noise(x * f, y * f);
    f *= 2;
    amp *= 0.5;
  }
  return t;
};

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export const PLATEAU = 60;

export function heightAt(x: number, z: number) {
  const wobble = (fbm(x * 0.02 + 5, z * 0.02) - 0.5) * 16;
  const r = Math.hypot(x, z) + wobble;
  if (r < PLATEAU) return 0;
  const t = r - PLATEAU;
  const drop = -30 * smooth(0, 40, t);
  const ridge = smooth(180, 380, r) * (25 + 85 * fbm(x * 0.008, z * 0.008));
  let h = drop + ridge + (fbm(x * 0.05, z * 0.05) - 0.5) * 8 * smooth(0, 12, t);
  const cap = 62;
  if (h > cap) h = cap + (h - cap) * 0.12; // mesa tops
  return h;
}

export const rand = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};
