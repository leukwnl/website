export function makeGrid(w: number, h: number): number[][] {
  return Array.from({ length: h }, () => Array.from({ length: w }, () => 0));
}
export function inBounds(
  x: number,
  y: number,
  w?: number,
  h?: number,
  grid?: number[][]
) {
  if (grid) return y >= 0 && y < grid.length && x >= 0 && x < grid[0].length;
  if (w == null || h == null) return false;
  return x >= 0 && x < w && y >= 0 && y < h;
}
