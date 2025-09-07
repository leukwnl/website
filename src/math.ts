// src/math.ts
import type { Camera } from "./types";

// 2:1 iso tile size
export const TILE_W = 96;
export const TILE_H = 48;

/** Utility: resolve CSS width/height from a canvas or number */
function cssDims(
  canvasOrWidth: number | HTMLCanvasElement,
  height?: number
): { w: number; h: number } {
  if (typeof canvasOrWidth === "number") {
    return { w: canvasOrWidth, h: height ?? canvasOrWidth };
  }
  const r = canvasOrWidth.getBoundingClientRect();
  return { w: r.width, h: r.height };
}

/** Screen (client px) -> World (iso px) */
export function toWorld(
  screenX: number,
  screenY: number,
  canvasOrWidth: number | HTMLCanvasElement,
  canvasHeightOrCam: number | Camera,
  cam?: Camera
) {
  // Support both signatures:
  // (x, y, canvas, cam) or (x, y, width, height, cam)
  let w: number, h: number, c: Camera;
  if (typeof canvasOrWidth === "number") {
    w = canvasOrWidth;
    h = canvasHeightOrCam as number;
    c = cam as Camera;
  } else {
    const dims = cssDims(canvasOrWidth);
    w = dims.w;
    h = dims.h;
    c = canvasHeightOrCam as Camera;
  }

  const cx = w / 2;
  const cy = h / 2;
  const x = (screenX - cx) / c.scale + c.x;
  const y = (screenY - cy) / c.scale + c.y;
  return { x, y };
}

/** Screen (client px) -> Tile indices (col,row) */
export function toGrid(
  screenX: number,
  screenY: number,
  canvasOrWidth: number | HTMLCanvasElement,
  canvasHeightOrCam: number | Camera,
  cam?: Camera
): [number, number] {
  let w: number, h: number, c: Camera;
  if (typeof canvasOrWidth === "number") {
    w = canvasOrWidth;
    h = canvasHeightOrCam as number;
    c = cam as Camera;
  } else {
    const dims = cssDims(canvasOrWidth);
    w = dims.w;
    h = dims.h;
    c = canvasHeightOrCam as Camera;
  }

  const world = toWorld(screenX, screenY, w, h, c);

  const colF = (world.y / (TILE_H / 2) + world.x / (TILE_W / 2)) * 0.5;
  const rowF = (world.y / (TILE_H / 2) - world.x / (TILE_W / 2)) * 0.5;

  const col = Math.round(colF);
  const row = Math.round(rowF);
  return [col, row];
}

/** Tile (col,row) -> world px center */
export function tileCenter(col: number, row: number) {
  const x = (col - row) * (TILE_W / 2);
  const y = (col + row) * (TILE_H / 2);
  return { x, y };
}

/** Grid -> Screen (client px) center */
export function toScreen(
  gx: number,
  gy: number,
  canvasOrWidth: number | HTMLCanvasElement,
  camera: Camera
): [number, number] {
  const { w, h } = cssDims(canvasOrWidth);
  const world = tileCenter(gx, gy);
  const sx = (world.x - camera.x) * camera.scale + w / 2;
  const sy = (world.y - camera.y) * camera.scale + h / 2;
  return [sx, sy];
}
