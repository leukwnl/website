import type { Grid } from "./types";

export function bfs(
  grid: Grid,
  start: [number, number],
  goal: [number, number]
): [number, number][] {
  const [sx, sy] = start,
    [gx, gy] = goal;
  const h = grid.length,
    w = grid[0].length;
  const inb = (x: number, y: number) => y >= 0 && y < h && x >= 0 && x < w;
  const key = (x: number, y: number) => `${x},${y}`;
  const q: [number, number][] = [[sx, sy]];
  const prev = new Map<string, [number, number] | null>();
  prev.set(key(sx, sy), null);
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  while (q.length) {
    const [x, y] = q.shift()!;
    if (x === gx && y === gy) break;
    for (const [dx, dy] of dirs) {
      const nx = x + dx,
        ny = y + dy;
      if (!inb(nx, ny)) continue;
      if (grid[ny][nx] === 1) continue;
      const k = key(nx, ny);
      if (!prev.has(k)) {
        prev.set(k, [x, y]);
        q.push([nx, ny]);
      }
    }
  }
  const out: [number, number][] = [];
  let cur: [number, number] | null = [gx, gy];
  if (!prev.has(key(gx, gy))) return out;
  while (cur) {
    out.push(cur);
    cur = prev.get(key(cur[0], cur[1])) ?? null;
  }
  out.reverse();
  return out;
}
