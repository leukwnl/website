import type { Camera } from "./types";

export interface AssetManifest {
  tiles?: Record<string, string>; // key by grid value as string, e.g., "0", "1"
  player?: string; // icon path
  categories?: Record<string, string>; // by category id
  projects?: Record<string, string>; // by project id
  thumbs?: Record<string, string>; // thumbnails by project id
}

let manifestRef: AssetManifest = {};
const imageCache = new Map<string, HTMLImageElement>();
let readyPromise: Promise<void> = Promise.resolve();

export function initAssets(manifest: AssetManifest) {
  manifestRef = manifest || {};
  const paths = new Set<string>();
  if (manifestRef.tiles)
    Object.values(manifestRef.tiles).forEach((p) => p && paths.add(p));
  if (manifestRef.player) paths.add(manifestRef.player);
  if (manifestRef.categories)
    Object.values(manifestRef.categories).forEach((p) => p && paths.add(p));
  if (manifestRef.projects)
    Object.values(manifestRef.projects).forEach((p) => p && paths.add(p));
  if (manifestRef.thumbs)
    Object.values(manifestRef.thumbs).forEach((p) => p && paths.add(p));

  const loaders: Promise<void>[] = [];
  paths.forEach((src) => loaders.push(loadImage(src)));
  readyPromise = Promise.all(loaders).then(() => undefined);
}

export function whenAssetsReady() {
  return readyPromise;
}

export function getTileImage(value: number | string): HTMLImageElement | null {
  const key = String(value);
  const src = manifestRef.tiles?.[key];
  if (!src) return null;
  const img = imageCache.get(src) || null;
  return img && img.complete && img.naturalWidth > 0 ? img : null;
}

export function getPlayerIcon(): HTMLImageElement | null {
  const src = manifestRef.player;
  if (!src) return null;
  const img = imageCache.get(src) || null;
  return img && img.complete && img.naturalWidth > 0 ? img : null;
}

export function getCategoryIcon(id: string): HTMLImageElement | null {
  const src = manifestRef.categories?.[id];
  if (!src) return null;
  const img = imageCache.get(src) || null;
  return img && img.complete && img.naturalWidth > 0 ? img : null;
}

export function getProjectIcon(id: string): HTMLImageElement | null {
  const src = manifestRef.projects?.[id];
  if (!src) return null;
  const img = imageCache.get(src) || null;
  return img && img.complete && img.naturalWidth > 0 ? img : null;
}

export function getFrame(name: string): string | null {
  // Legacy: no-op frame support. If you want frames, wire a separate map.
  return null;
}

export function getThumbUrl(projectId: string): string | null {
  return manifestRef.thumbs?.[projectId] || null;
}

function loadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (imageCache.has(src)) {
      const img = imageCache.get(src)!;
      if (img.complete && img.naturalWidth > 0) return resolve();
    }
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // tolerate missing assets in dev
    img.src = src;
    imageCache.set(src, img);
  });
}
