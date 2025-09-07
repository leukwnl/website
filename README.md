# Assets and Content

This app supports a hand-drawn asset pipeline for tilesets, icons, and frames, plus centralized content for About, Projects, and Categories.

## Where to put files

- Place image assets in `public/assets/` so they are served at `/assets/...`:
  - `public/assets/tiles/` — tileset images (e.g., `ground.png`, `block.png`)
  - `public/assets/icons/` — icons for player, categories, projects
  - `public/assets/frames/` — frame overlays (e.g., `polaroid.png`)

## Configure the manifest

Edit `src/main.ts` to point the manifest at your assets, then call `initAssets` and `whenAssetsReady()` before the first draw.

```ts
import { initAssets, whenAssetsReady } from "./assets";
import type { AssetManifest } from "./assets";

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
  frames: {
    polaroid: "/assets/frames/polaroid.png",
  },
};
initAssets(manifest);
whenAssetsReady().then(draw);
```

## How assets are used

- Tiles: `render.ts` calls `getTileImage(value)` to draw a tile image if present, else falls back to an isometric diamond.
- Player/Categories/Projects: `renderOverlay.ts` calls `getPlayerIcon`, `getCategoryIcon`, and `getProjectIcon` to draw icons if available.
- Frames: `bottomPanel.ts` calls `getFrame('polaroid')` to overlay a frame around gallery thumbnails.

## Centralized content

- `src/content.ts` exposes:
  - `PROJECTS`: list of projects
  - `CATEGORIES`: categories and their project IDs and grid anchors
  - `ABOUT`: About page data (title, `photoUrl`, and content as `html` or `paragraphs`)

Update these objects to change your site content in one place.

# website
