import type { Grid, World } from "./types";
import { WORLD_CONTENT, NPCS, INTERACTABLES } from "./content";
import { makeGrid, inBounds } from "./grid";

export function createWorld(): World {
  const grid: Grid = WORLD_CONTENT.grid ?? makeGrid(16, 16);
  const w = grid[0]?.length ?? 16;
  const h = grid.length ?? 16;
  const center: [number, number] = [Math.floor(w / 2), Math.floor(h / 2)];
  const heroTile = WORLD_CONTENT.heroTile ?? center;

  // initial player spawn (fixed for now)
  const playerX = 1;
  const playerY = 1;

  // ensure hero tile does not collide with player start
  let hero: [number, number] = heroTile;
  if (heroTile[0] === playerX && heroTile[1] === playerY) {
    const alt: [number, number][] = [
      [playerX + 1, playerY],
      [playerX, playerY + 1],
      [playerX + 1, playerY + 1],
      [playerX + 2, playerY],
      [playerX, playerY + 2],
    ];
    const pick = alt.find(
      ([x, y]) => inBounds(x, y, undefined, undefined, grid) && grid[y][x] === 0
    );
    if (pick) hero = pick;
  }

  return {
    grid,
    player: { x: playerX, y: playerY, path: [] },
    projects: WORLD_CONTENT.projects ?? [],
    categories: WORLD_CONTENT.categories ?? [],
    heroTile: hero,
    npcs: NPCS,
    interactables: INTERACTABLES,
  };
}

export function buildTempGridWithSpawns(world: World): Grid {
  const g: Grid = world.grid.map((r) => r.slice());
  if (inBounds(world.player.x, world.player.y, undefined, undefined, g)) {
    g[world.player.y][world.player.x] = 1;
  }
  return g;
}

export function isHeroTile(world: World, x: number, y: number) {
  return world.heroTile[0] === x && world.heroTile[1] === y;
}

export function isCategoryTile(world: World, x: number, y: number) {
  return world.categories.find((c) => c.x === x && c.y === y) ?? null;
}

// Removed spawn/despawn logic; categories only open panels now
