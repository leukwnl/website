import { createWorld } from "./world";
import { createRenderer } from "./render";
import { bindControls } from "./controls";
import { INITIAL_CAMERA } from "./config";
import type { Camera } from "./types";
import { initBottomPanel } from "./bottomPanel";
import { initHoverHud } from "./hoverHud";
import { initAssets, whenAssetsReady } from "./assets";
import type { AssetManifest } from "./assets";

const canvas = document.getElementById("game") as HTMLCanvasElement;

const world = createWorld();
const camera: Camera = {
  x: INITIAL_CAMERA.x,
  y: INITIAL_CAMERA.y,
  scale: INITIAL_CAMERA.scale,
};

const renderer = createRenderer(canvas, world, camera);
const panel = initBottomPanel(world);
const hoverHud = initHoverHud(canvas, world, camera);
let hoverEnemy: { id: string; x: number; y: number } | null = null;
let hoverTile: [number, number] | null = null;

function draw() {
  renderer.draw({ hoverEnemy, hoverTile });
}
renderer.resize();

// Initialize asset manifest (edit paths under /public/assets)
const manifest: AssetManifest = {
  tiles: {
    "0": "/assets/tiles/ground.png",
    "1": "/assets/tiles/block.png",
  },
  player: "/assets/icons/player.png",
  categories: {
    projects: "/assets/icons/cat-projects.png",
    games: "/assets/icons/cat-games.png",
    experience: "/assets/icons/cat-experience.png",
  },
  thumbs: {
    "trigger-happy": "/example.png",
  },
};
initAssets(manifest);
whenAssetsReady().then(draw);

bindControls(
  canvas,
  world,
  camera,
  (tile, enemy) => {
    hoverTile = tile;
    hoverEnemy = enemy;
    hoverHud.update(tile);
  },
  draw
);

// Canvas → Bottom panel events
window.addEventListener("grid:open-category" as any, (e: any) => {
  const catId = e.detail?.categoryId as string;
  if (catId) panel.openCategory(catId);
});
window.addEventListener("grid:open-hero" as any, () => {
  panel.openAbout();
});
window.addEventListener("grid:open-project" as any, () => {
  panel.close();
});
