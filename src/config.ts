import type { Config } from "./types";

export const CONFIG: Config = {
  cols: 12,
  rows: 12,
  tileW: 64,
  tileH: 32,
  camOffsetX: 0,
  camOffsetY: -80
  
};

// Animation speed (px-per-tile snap in this minimal build)
export const STEP_SPEED = 6;
export const SCALE_MIN = 0.5;
export const SCALE_MAX = 2.5;
export const SCALE_STEP = 0.1;          // per wheel notch (we’ll normalize)
export const PAN_BUTTON = 2;            // right mouse button
export const INITIAL_CAMERA = { x: 0, y: -80, scale: 1 } as const;
