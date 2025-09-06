import { makeGrid } from "./grid";
import type { Grid, Player, Project, Category, SpawnedMap } from "./types";
import { WORLD_CONTENT } from "./content/config";
import { neighbors, inBounds } from "./grid";

export interface World {
  grid: Grid;
  player: Player;
  projects: Project[];
  categories: Category[];
  heroTile: [number, number];
  activeCategoryIds: Set<string>;
  spawned: SpawnedMap;
}

export function createWorld(): World {
  const maxX = Math.max(
    ...WORLD_CONTENT.obstacles.map(([x]) => x),
    ...WORLD_CONTENT.categories.map((c) => c.x)
  );
  const maxY = Math.max(
    ...WORLD_CONTENT.obstacles.map(([_, y]) => y),
    ...WORLD_CONTENT.categories.map((c) => c.y)
  );
  const w = Math.max(12, maxX + 6);
  const h = Math.max(12, maxY + 6);

  const grid = makeGrid(w, h);
  WORLD_CONTENT.obstacles.forEach(([x, y]) => (grid[y][x] = 1));

  const [px, py] = WORLD_CONTENT.playerStart;
  const player: Player = { x: px, y: py, path: [] };

  return {
    grid,
    player,
    projects: WORLD_CONTENT.projects,
    categories: WORLD_CONTENT.categories,
    heroTile: WORLD_CONTENT.heroTile,
    activeCategoryIds: new Set(),
    spawned: {},
  };
}

// ---------- Spawn system ----------
export function isOccupied(world: World, x: number, y: number): boolean {
  if (!inBounds(x, y)) return true;
  if (world.grid[y][x] === 1) return true; // walls
  // consider spawned enemies as blockers
  for (const pid in world.spawned) {
    const pos = world.spawned[pid];
    if (pos.x === x && pos.y === y) return true;
  }
  // block the player’s current tile
  if (world.player.x === x && world.player.y === y) return true;
  return false;
}

export function buildTempGridWithSpawns(world: World): Grid {
  const g: Grid = world.grid.map((row) => row.slice());
  for (const pid in world.spawned) {
    const { x, y } = world.spawned[pid];
    if (inBounds(x, y)) g[y][x] = 1;
  }
  // also block player tile for pathing
  if (inBounds(world.player.x, world.player.y)) {
    g[world.player.y][world.player.x] = 1;
  }
  return g;
}

// Fisher–Yates shuffle (for random scatter)
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ensure a minimum spacing between spawned items (avoid clumps)
function isFarEnough(
  x: number,
  y: number,
  chosen: Array<[number, number]>,
  minManhattan: number
) {
  return chosen.every(
    ([cx, cy]) => Math.abs(cx - x) + Math.abs(cy - y) >= minManhattan
  );
}

/**
 * Collect candidate tiles within radius, walkable + not occupied.
 * We shuffle for randomness, and enforce simple spacing.
 */
function candidateTiles(
  world: World,
  cx: number,
  cy: number,
  radius: number
): [number, number][] {
  const out: [number, number][] = [];
  for (let y = cy - radius; y <= cy + radius; y++) {
    for (let x = cx - radius; x <= cx + radius; x++) {
      if (!inBounds(x, y)) continue;
      const dist = Math.abs(x - cx) + Math.abs(y - cy);
      if (dist === 0 || dist > radius) continue;
      if (!isOccupied(world, x, y)) out.push([x, y]);
    }
  }
  return shuffle(out);
}

/**
 * Spawn this category’s projects near its tile (random + scattered).
 * Does NOT clear any other categories (persistence across categories).
 * If called again on an already-active category, it re-spawns (fresh positions).
 */
export function spawnCategory(world: World, categoryId: string) {
  const cat = world.categories.find((c) => c.id === categoryId);
  if (!cat) return;

  const radius = cat.spawnRadius ?? 4;
  const minSpacing = cat.minSpacing ?? 2;

  // Remove previous placements of this category’s projects (if any) to re-roll
  for (const pid of cat.projectIds) delete world.spawned[pid];

  // Build fresh candidates AFTER removing this category’s old spawns
  const candidates = candidateTiles(world, cat.x, cat.y, radius);

  const chosen: Array<[number, number]> = [];
  for (const pid of cat.projectIds) {
    // pick the first candidate that’s far enough from already chosen
    const idx = candidates.findIndex(([x, y]) =>
      isFarEnough(x, y, chosen, minSpacing)
    );
    if (idx === -1) break;
    const [x, y] = candidates.splice(idx, 1)[0];
    world.spawned[pid] = { x, y };
    chosen.push([x, y]);
  }

  world.activeCategoryIds.add(categoryId);
}

/**
 * Toggle off one category: remove only its projects from spawn map.
 */
export function despawnCategory(world: World, categoryId: string) {
  const cat = world.categories.find((c) => c.id === categoryId);
  if (!cat) return;
  for (const pid of cat.projectIds) {
    delete world.spawned[pid];
  }
  world.activeCategoryIds.delete(categoryId);
}

export function isHeroTile(world: World, x: number, y: number) {
  return world.heroTile[0] === x && world.heroTile[1] === y;
}

export function isCategoryTile(world: World, x: number, y: number) {
  return world.categories.find((c) => c.x === x && c.y === y) ?? null;
}
