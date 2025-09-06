import { createWorld } from "./world";
import { createRenderer } from "./render";
import { bindControls, goToProjectById } from "./controls";
import { INITIAL_CAMERA } from "./config";
import type { Camera } from "./types";
import { initUI, setAllProjects, updateSpawnedGallery } from "./ui";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const hud = document.getElementById("hud") as HTMLDivElement;

const world = createWorld();
const camera: Camera = {
  x: INITIAL_CAMERA.x,
  y: INITIAL_CAMERA.y,
  scale: INITIAL_CAMERA.scale,
};

initUI(hud, canvas, camera);

const renderer = createRenderer(canvas, world, camera);

setAllProjects(world.projects);
// listen to UI selection changes (wheel/click on bottom bar)
window.addEventListener("ui:select-project", (e: any) => {
  const id = e.detail?.projectId as string;
  if (!id) return;
  goToProjectById(world, camera, id, draw);
});

let hoverEnemy = null as any;

function draw() {
  renderer.draw(hoverEnemy);
}

renderer.resize();
draw();

bindControls(
  canvas,
  world,
  camera,
  (p) => {
    hoverEnemy = p;
  },
  draw
);
