// src/render.ts
import type { World, Camera } from "./types";
import { tileCenter, TILE_W, TILE_H } from "./math";
import { drawInteractableOverlays } from "./renderOverlay";
import { getTileImage } from "./assets";

export function createRenderer(
  canvas: HTMLCanvasElement,
  world: World,
  camera: Camera
) {
  const ctx = canvas.getContext("2d", { alpha: false })!;

  function resize() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();

    // backbuffer in device px
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);

    // reset transform & scale so drawing units = CSS px
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const diamondFill = (cx: number, cy: number, scale: number, fill: string) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy - (TILE_H / 2) * scale);
    ctx.lineTo(cx + (TILE_W / 2) * scale, cy);
    ctx.lineTo(cx, cy + (TILE_H / 2) * scale);
    ctx.lineTo(cx - (TILE_W / 2) * scale, cy);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  };

  const diamondStroke = (
    cx: number,
    cy: number,
    scale: number,
    stroke: string
  ) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy - (TILE_H / 2) * scale);
    ctx.lineTo(cx + (TILE_W / 2) * scale, cy);
    ctx.lineTo(cx, cy + (TILE_H / 2) * scale);
    ctx.lineTo(cx - (TILE_W / 2) * scale, cy);
    ctx.closePath();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = Math.max(1, 1 * scale);
    ctx.stroke();
  };

  function draw(state: {
    hoverEnemy: { id: string; x: number; y: number } | null;
    hoverTile: [number, number] | null;
  }) {
    // Use CSS dimensions here
    const rect = canvas.getBoundingClientRect();

    ctx.fillStyle = "#f2eddf";
    ctx.fillRect(0, 0, rect.width, rect.height);

    const rows = world.grid.length;
    const cols = world.grid[0].length;

    for (let s = 0; s < rows + cols - 1; s++) {
      for (let row = 0; row < rows; row++) {
        const col = s - row;
        if (col < 0 || col >= cols) continue;

        const wc = tileCenter(col, row);
        const sx = (wc.x - camera.x) * camera.scale + rect.width / 2;
        const sy = (wc.y - camera.y) * camera.scale + rect.height / 2;

        // draw tile image if available; otherwise fallback diamond
        const tileVal = world.grid[row][col];
        const img = getTileImage(tileVal);
        if (img) {
          const w = TILE_W * camera.scale;
          const h = TILE_H * camera.scale;
          // draw centered like iso diamond
          ctx.drawImage(img, sx - w / 2, sy - h / 2, w, h);
        } else {
          diamondFill(sx, sy, camera.scale, "#f9f6ee");
          diamondStroke(sx, sy, camera.scale, "rgba(0,0,0,0.12)");
        }

        // hover highlight
        if (
          state.hoverTile &&
          state.hoverTile[0] === col &&
          state.hoverTile[1] === row
        ) {
          ctx.save();
          ctx.globalCompositeOperation = "source-over";
          diamondStroke(sx, sy, camera.scale, "#f0b429");
          ctx.restore();
        }

        // removed spawned markers

        // player
        if (world.player.x === col && world.player.y === row) {
          ctx.beginPath();
          ctx.arc(sx, sy - 6 * camera.scale, 6 * camera.scale, 0, Math.PI * 2);
          ctx.fillStyle = "#5db1ff";
          ctx.fill();
        }
      }
    }

    // overlays + labels (uses CSS px inside)
    drawInteractableOverlays(
      ctx,
      canvas,
      world,
      camera,
      state.hoverEnemy,
      true
    );
  }

  return { resize, draw };
}
