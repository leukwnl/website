import type { Grid, World } from "./types";
import { makeGrid } from "./grid";

export function createWorld(): World {
  const grid: Grid = makeGrid(16, 16);
  const playerX = 1;
  const playerY = 1;
  return {
    grid,
    player: { x: playerX, y: playerY, path: [] },
  };
}

export function buildTempGrid(world: World): Grid {
  return world.grid.map((r) => r.slice());
}
