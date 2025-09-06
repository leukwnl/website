import { CONFIG } from "./config";
import type { Camera } from "./types";

/**
 * Convert grid (x,y) to screen coordinates, accounting for camera + scale.
 */
export function toScreen(
  x: number,
  y: number,
  canvasWidth: number,
  camera: Camera
): [number, number] {
  // base isometric
  const sx = (x - y) * (CONFIG.tileW / 2);
  const sy = (x + y) * (CONFIG.tileH / 2);

  // origin: horizontally centered, with camera offsets
  const centerX = canvasWidth / 2;
  const originX = centerX + camera.x;
  const originY = 120 + camera.y;

  // apply scale around origin (0,0 in world mapped to origin in screen)
  return [sx * camera.scale + originX, sy * camera.scale + originY];
}

/**
 * Inverse transform: screen → grid (integers).
 * Important: subtract origin and divide by scale before iso inverse.
 */
export function toGrid(
  px: number,
  py: number,
  canvasWidth: number,
  camera: Camera
): [number, number] {
  const centerX = canvasWidth / 2;
  const originX = centerX + camera.x;
  const originY = 120 + camera.y;

  const x = (px - originX) / camera.scale;
  const y = (py - originY) / camera.scale;

  const gx = (y / (CONFIG.tileH / 2) + x / (CONFIG.tileW / 2)) / 2;
  const gy = (y / (CONFIG.tileH / 2) - x / (CONFIG.tileW / 2)) / 2;

  return [Math.floor(gx), Math.floor(gy)];
}
