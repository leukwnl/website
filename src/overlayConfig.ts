// Screen-space bases; we’ll multiply by camera.scale so they grow/shrink with the grid.
export const UI_SIZES = {
  heroRing: 20,
  heroDot: 6,

  categoryRing: 18,
  categoryDiamond: 8,

  spawnDot: 8,
  spawnHalo: 16,

  labelOffsetY: 24,
  labelFontPx: 13,
  labelMaxChars: 28,
};

// Behavior for scaling with zoom
export const UI_SCALE = {
  scaleWithCamera: true, // <— key: markers follow zoom
  minFactor: 0.6, // clamp to avoid disappearing when zoomed way out
  maxFactor: 2.5, // clamp to avoid comically huge when zoomed in
};
