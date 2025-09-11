// src/controls.ts
import { toGrid } from "./math";
import { bfs } from "./pathfinding";
import type { World, Camera } from "./types";
import { buildTempGrid } from "./world";

const PAN_BUTTON = 2;
const SCALE_MIN = 0.3;
const SCALE_MAX = 3.0;

export function bindControls(
  canvas: HTMLCanvasElement,
  world: World,
  camera: Camera,
  onHover: (tile: [number, number] | null) => void,
  onDraw: () => void
) {
  let animId = 0;

  function enemyAtGrid(_x: number, _y: number) { return null; }

  function moveAlong(path: [number, number][], onArrive?: () => void) {
    if (!path || !path.length) {
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
      if (!world.player.path || !world.player.path.length) {
        onArrive?.();
        onDraw();
        return;
      }
      const [nx, ny] = world.player.path.shift()!;
      world.player.x = nx;
      world.player.y = ny;
      onDraw();
      animId = requestAnimationFrame(step);
    }
    step();
  }

  // ===== Hover =====
  canvas.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    const [col, row] = toGrid(
      e.clientX - r.left,
      e.clientY - r.top,
      r.width,
      r.height,
      camera
    );
    onHover([col, row]);
    onDraw();
  });
  canvas.addEventListener("mouseleave", () => {
    onHover(null);
    onDraw();
  });

  // ===== Click/tap =====
  const clickAt = (clientX: number, clientY: number, button = 0) => {
    if (button === PAN_BUTTON) return;
    const r = canvas.getBoundingClientRect();
    const [col, row] = toGrid(
      clientX - r.left,
      clientY - r.top,
      r.width,
      r.height,
      camera
    );

    // empty tile → move
    const temp = buildTempGrid(world);
    const path = bfs(temp, [world.player.x, world.player.y], [col, row]);
    moveAlong(path ?? [], () => {});
  };

  canvas.addEventListener("mousedown", (e) =>
    clickAt(e.clientX, e.clientY, e.button)
  );
  canvas.addEventListener(
    "touchstart",
    (e) => {
      const t = e.changedTouches[0];
      if (t) clickAt(t.clientX, t.clientY, 0);
    },
    { passive: true }
  );

  // ===== Pan / Zoom =====
  let isPanning = false,
    lastX = 0,
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
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    camera.x -= dx / camera.scale;
    camera.y -= dy / camera.scale;
    lastX = e.clientX;
    lastY = e.clientY;
    onDraw();
  });

  canvas.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      const old = camera.scale;
      const factor = Math.pow(1.0015, -e.deltaY);
      const next = Math.max(SCALE_MIN, Math.min(SCALE_MAX, old * factor));
      if (next === old) return;

      // NOTE: use CSS rect width/height, not canvas.width
      const cx = r.width / 2;
      const cy = r.height / 2;

      const worldX = (mx - cx) / old + camera.x;
      const worldY = (my - cy) / old + camera.y;

      camera.scale = next;
      camera.x = worldX - (mx - cx) / next;
      camera.y = worldY - (my - cy) / next;
      onDraw();
    },
    { passive: false }
  );
}
