import type { Grid } from "./types";
import { CONFIG } from "./config";

export function makeGrid(w: number, h: number): Grid {
  return Array.from({ length: h }, () => Array(w).fill(0));
}

export function inBounds(x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < CONFIG.cols && y < CONFIG.rows;
}

export function neighbors(x: number, y: number): [number, number][] {
  const n: [number, number][] = [];
  if (y > 0) n.push([x, y - 1]);
  if (y < CONFIG.rows - 1) n.push([x, y + 1]);
  if (x > 0) n.push([x - 1, y]);
  if (x < CONFIG.cols - 1) n.push([x + 1, y]);
  return n;
}
