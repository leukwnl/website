import { toGrid, toScreen } from "./math";
import { bfs } from "./pathfinding";
import type { World } from "./world";
import type { Project, Camera } from "./types";
import {
  showProjectInDock,
  showHeroInDock,
  updateSpawnedGallery,
  selectProjectById,
} from "./ui";
import { PAN_BUTTON, SCALE_MAX, SCALE_MIN } from "./config";
import {
  buildTempGridWithSpawns,
  spawnCategory,
  despawnCategory,
  isHeroTile,
  isCategoryTile,
} from "./world";

export function bindControls(
  canvas: HTMLCanvasElement,
  world: World,
  camera: Camera,
  onHoverChange: (p: { id: string; x: number; y: number } | null) => void,
  onDraw: () => void
) {
  const coordsEl = document.getElementById("coords")!;
  let animId = 0;

  function enemyAtGrid(
    x: number,
    y: number
  ): { id: string; x: number; y: number } | null {
    for (const pid in world.spawned) {
      const pos = world.spawned[pid];
      if (pos.x === x && pos.y === y) return { id: pid, x: pos.x, y: pos.y };
    }
    return null;
  }

  function pathfindTo(target: [number, number], onArrive?: () => void) {
    const [tx, ty] = target;

    // If already there, arrive immediately
    if (world.player.x === tx && world.player.y === ty) {
      onArrive?.();
      onDraw();
      return;
    }

    const temp = buildTempGridWithSpawns(world);
    const path = bfs(temp, [world.player.x, world.player.y], target);

    // If BFS fails (edge cases), still “arrive” so category/hero toggles work
    if (!path || path.length === 0) {
      onArrive?.();
      onDraw();
      return;
    }

    if (
      path.length &&
      path[0][0] === world.player.x &&
      path[0][1] === world.player.y
    )
      path.shift();
    world.player.path = path;

    cancelAnimationFrame(animId);
    function step() {
      if (!world.player.path || world.player.path.length === 0) {
        onArrive?.();
        onDraw();
        return;
      }
      const [nx, ny] = world.player.path[0];
      if (world.player.x === nx && world.player.y === ny) {
        world.player.path.shift();
        requestAnimationFrame(step);
        return;
      }
      world.player.x = nx;
      world.player.y = ny;
      onDraw();
      animId = requestAnimationFrame(step);
    }
    step();
  }

  // ----- Hover / highlight -----
  canvas.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    const [gx, gy] = toGrid(
      e.clientX - r.left,
      e.clientY - r.top,
      canvas.width,
      camera
    );
    coordsEl.textContent = `x:${gx} y:${gy}`;
    onHoverChange(enemyAtGrid(gx, gy));
    onDraw();
  });

  canvas.addEventListener("mouseleave", () => {
    coordsEl.textContent = "x:– y:–";
    onHoverChange(null);
    onDraw();
  });

  // ----- Click behavior -----
  canvas.addEventListener("mousedown", (e) => {
    if (e.button === PAN_BUTTON) return; // RMB reserved for pan

    const r = canvas.getBoundingClientRect();
    const [gx, gy] = toGrid(
      e.clientX - r.left,
      e.clientY - r.top,
      canvas.width,
      camera
    );

    const enemy = enemyAtGrid(gx, gy);
    if (enemy) {
      const enemyTarget = enemy; // capture non-null
      const adj: [number, number][] = [];
      if (gy > 0 && world.grid[gy - 1][gx] === 0) adj.push([gx, gy - 1]);
      if (gy < world.grid.length - 1 && world.grid[gy + 1][gx] === 0)
        adj.push([gx, gy + 1]);
      if (gx > 0 && world.grid[gy][gx - 1] === 0) adj.push([gx - 1, gy]);
      if (gx < world.grid[0].length - 1 && world.grid[gy][gx + 1] === 0)
        adj.push([gx + 1, gy]);

      let best: [number, number][] | null = null;
      const temp = buildTempGridWithSpawns(world);
      for (const goal of adj) {
        const p = bfs(temp, [world.player.x, world.player.y], goal);
        if (p && (!best || p.length < best.length)) best = p;
      }
      if (best) {
        if (
          best.length &&
          best[0][0] === world.player.x &&
          best[0][1] === world.player.y
        )
          best.shift();
        world.player.path = best;
        cancelAnimationFrame(animId);

        const proj = world.projects.find((p) => p.id === enemyTarget.id);

        function step() {
          if (!world.player.path || world.player.path.length === 0) {
            if (proj) {
              showProjectInDock(proj); // update left dock
              selectProjectById?.(proj.id, false); // highlight in bottom bar (no navigation emit)
            }
            onDraw();
            return;
          }

          const [tx, ty] = world.player.path[0];
          if (world.player.x === tx && world.player.y === ty) {
            world.player.path.shift();
            requestAnimationFrame(step);
            return;
          }
          world.player.x = tx;
          world.player.y = ty;
          onDraw();
          animId = requestAnimationFrame(step);
        }
        step();
      }
      return;
    }

    // Not an enemy: allow moving to empty tiles
    // On arrival, handle hero/category toggles
    pathfindTo([gx, gy], () => {
      if (isHeroTile(world, world.player.x, world.player.y)) {
        showHeroInDock();
        return;
      }
      const cat = isCategoryTile(world, world.player.x, world.player.y);
      if (cat) {
        const isActive = world.activeCategoryIds.has(cat.id);

        if (isActive) {
          if (cat.rerollOnStep) {
            spawnCategory(world, cat.id); // re-roll positions
          } else {
            despawnCategory(world, cat.id); // toggle off
          }
        } else {
          spawnCategory(world, cat.id); // toggle on; persists with others
        }

        // 🔁 keep the bottom bar thumbnails in sync
        updateSpawnedGallery?.(world.spawned);
      }
    });
  });

  // ===== Camera pan/zoom (same as before) =====
  let isPanning = false;
  let lastX = 0,
    lastY = 0;
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  canvas.addEventListener("mousedown", (e) => {
    if (e.button === 2) {
      isPanning = true;
      lastX = e.clientX;
      lastY = e.clientY;
    }
  });
  window.addEventListener("mouseup", () => {
    isPanning = false;
  });
  window.addEventListener("mousemove", (e) => {
    if (!isPanning) return;
    camera.x += e.clientX - lastX;
    camera.y += e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    onDraw();
  });
  canvas.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      const mouseX = e.clientX - r.left;
      const mouseY = e.clientY - r.top;
      const old = camera.scale;
      const direction = e.deltaY > 0 ? -1 : 1;
      let next = Math.max(
        SCALE_MIN,
        Math.min(SCALE_MAX, old * (1 + direction * 0.1))
      );
      if (next === old) return;

      const centerX = canvas.width / 2;
      const originX = centerX + camera.x;
      const originY = 120 + camera.y;

      const worldX = (mouseX - originX) / old;
      const worldY = (mouseY - originY) / old;

      const newOriginX = mouseX - worldX * next;
      const newOriginY = mouseY - worldY * next;

      camera.x = newOriginX - centerX;
      camera.y = newOriginY - 120;
      camera.scale = next;
      onDraw();
    },
    { passive: false }
  );
}

// === Programmatic navigation from UI: move to a spawned project, pan camera, and show dock ===
export function goToProjectById(
  world: World,
  camera: Camera,
  projectId: string,
  onDraw: () => void
) {
  const pos = world.spawned[projectId];
  const proj = world.projects.find((p) => p.id === projectId);
  if (!pos || !proj) return;

  // choose best adjacent walkable goal next to the project spawn
  const adj: [number, number][] = [];
  const { x, y } = pos;
  if (y > 0 && world.grid[y - 1][x] === 0) adj.push([x, y - 1]);
  if (y < world.grid.length - 1 && world.grid[y + 1][x] === 0)
    adj.push([x, y + 1]);
  if (x > 0 && world.grid[y][x - 1] === 0) adj.push([x - 1, y]);
  if (x < world.grid[0].length - 1 && world.grid[y][x + 1] === 0)
    adj.push([x + 1, y]);

  // pathfind on a temp grid that includes spawned blockers
  const temp = buildTempGridWithSpawns(world);
  let best: [number, number][] | null = null;
  for (const g of adj) {
    const p = bfs(temp, [world.player.x, world.player.y], g);
    if (p && (!best || p.length < best.length)) best = p;
  }
  if (!best) return;
  if (
    best.length &&
    best[0][0] === world.player.x &&
    best[0][1] === world.player.y
  )
    best.shift();
  world.player.path = best;

  // pan camera so the project is nicely in view (keeps dock visible)
  panCameraToTile(camera, pos.x, pos.y, onDraw);

  // animate the player, then update dock on arrival
  function step() {
    const proj = world.projects.find((p) => p.id === projectId);
    if (!pos || !proj) return;
    if (!world.player.path || world.player.path.length === 0) {
      showProjectInDock(proj);
      onDraw();
      return;
    }
    const [tx, ty] = world.player.path[0];
    if (world.player.x === tx && world.player.y === ty) {
      world.player.path.shift();
      requestAnimationFrame(step);
      return;
    }
    world.player.x = tx;
    world.player.y = ty;
    onDraw();
    requestAnimationFrame(step);
  }
  step();
}

function panCameraToTile(
  camera: Camera,
  gx: number,
  gy: number,
  onDraw: () => void
) {
  const canvas = document.getElementById("game") as HTMLCanvasElement;
  const [sx, sy] = toScreen(gx, gy, canvas.width, camera);
  // aim slightly left/top so the left dock doesn't cover the target
  const targetScreenX = canvas.width * 0.45;
  const targetScreenY = canvas.height * 0.45;
  const dx = targetScreenX - sx;
  const dy = targetScreenY - sy;

  const startX = camera.x,
    startY = camera.y;
  const endX = startX + dx,
    endY = startY + dy;
  const t0 = performance.now(),
    dur = 260;

  function anim(t: number) {
    const k = Math.min(1, (t - t0) / dur);
    const ease = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; // easeInOutQuad
    camera.x = startX + (endX - startX) * ease;
    camera.y = startY + (endY - startY) * ease;
    onDraw();
    if (k < 1) requestAnimationFrame(anim);
  }
  requestAnimationFrame(anim);
}
