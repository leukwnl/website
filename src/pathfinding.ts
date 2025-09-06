import type { Grid } from "./types";
import { neighbors, inBounds } from "./grid";

export function bfs(
  grid: Grid,
  start: [number, number],
  goal: [number, number]
): [number, number][] | null {
  const q: [number, number][] = [start];
  const came = new Map<string, [number, number] | null>();
  const key = (x: number, y: number) => `${x},${y}`;
  came.set(key(start[0], start[1]), null);

  while (q.length) {
    const [cx, cy] = q.shift()!;
    if (cx === goal[0] && cy === goal[1]) {
      const path: [number, number][] = [];
      let cur: [number, number] | null = [cx, cy];
      while (cur) {
        path.push(cur);
        cur = came.get(key(cur[0], cur[1])) ?? null;
      }
      return path.reverse();
    }
    for (const [nx, ny] of neighbors(cx, cy)) {
      if (!inBounds(nx, ny)) continue;
      if (grid[ny][nx] === 1) continue; // blocked
      const k = key(nx, ny);
      if (!came.has(k)) {
        came.set(k, [cx, cy]);
        q.push([nx, ny]);
      }
    }
  }
  return null;
}
