import { createWorld } from "./world";
import { createRenderer } from "./render";
import { bindControls } from "./controls";
import { INITIAL_CAMERA } from "./config";
import type { Camera } from "./types";

const canvas = document.getElementById("game") as HTMLCanvasElement;

const world = createWorld();
const camera: Camera = {
  x: INITIAL_CAMERA.x,
  y: INITIAL_CAMERA.y,
  scale: INITIAL_CAMERA.scale,
};

const renderer = createRenderer(canvas, world, camera);
let hoverTile: [number, number] | null = null;

function draw() {
  renderer.draw({ hoverTile });
}
renderer.resize();

bindControls(canvas, world, camera, (tile) => {
  hoverTile = tile;
}, draw);
