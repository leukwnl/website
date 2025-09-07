// src/renderOverlay.ts
import { PALETTE } from "./palette";
import { UI_SIZES, UI_SCALE } from "./overlayConfig";
import type { World, Camera, Project } from "./types";
import { toScreen } from "./math";
import { getPlayerIcon, getCategoryIcon, getProjectIcon } from "./assets";

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}
function trunc(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function scale(camera: Camera) {
  if (!UI_SCALE.scaleWithCamera) return 1;
  return clamp(camera.scale, UI_SCALE.minFactor, UI_SCALE.maxFactor);
}

function drawLabel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  cam: Camera
) {
  const k = scale(cam);
  const padX = 6 * k,
    padY = 4 * k;
  ctx.save();
  ctx.font = `600 ${Math.round(
    UI_SIZES.labelFontPx * k
  )}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto`;
  const w = Math.ceil(ctx.measureText(text).width);
  const h = Math.round(UI_SIZES.labelFontPx * k) + padY * 2;

  const rx = 6 * k;
  const left = Math.round(x - w / 2 - padX);
  const top = Math.round(y - h);

  // bg bubble
  ctx.beginPath();
  const right = left + w + padX * 2;
  const bottom = top + h;
  const r = rx;
  ctx.moveTo(left + r, top);
  ctx.lineTo(right - r, top);
  ctx.quadraticCurveTo(right, top, right, top + r);
  ctx.lineTo(right, bottom - r);
  ctx.quadraticCurveTo(right, bottom, right - r, bottom);
  ctx.lineTo(left + r, bottom);
  ctx.quadraticCurveTo(left, bottom, left, bottom - r);
  ctx.lineTo(left, top + r);
  ctx.quadraticCurveTo(left, top, left + r, top);
  ctx.closePath();

  ctx.fillStyle = PALETTE.labelBg;
  ctx.fill();

  // text with subtle outline
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.labelText;
  ctx.strokeStyle = PALETTE.labelStroke;
  ctx.lineWidth = 2 * k;
  ctx.strokeText(text, Math.round(x), Math.round(top + h / 2));
  ctx.fillText(text, Math.round(x), Math.round(top + h / 2));
  ctx.restore();
}

export function drawInteractableOverlays(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  world: World,
  camera: Camera,
  hoverEnemy: { id: string; x: number; y: number } | null,
  showText = true
) {
  const t = performance.now() / 1000;
  const pulse = (Math.sin(t * 3) + 1) / 2;
  const k = scale(camera);

  const ring = (
    sx: number,
    sy: number,
    radiusBasePx: number,
    color: string,
    glow = false
  ) => {
    const R = radiusBasePx * k;
    ctx.save();
    if (glow) {
      ctx.globalCompositeOperation = "lighter";
      ctx.shadowColor = color;
      ctx.shadowBlur = 18 * k;
    }
    ctx.beginPath();
    ctx.arc(sx, sy, R, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3 * k;
    ctx.stroke();
    ctx.restore();
  };

  const dot = (
    sx: number,
    sy: number,
    rBasePx: number,
    fill: string,
    outline = "#fff"
  ) => {
    const R = rBasePx * k;
    ctx.save();
    ctx.beginPath();
    ctx.arc(sx, sy, R, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = 3 * k;
    ctx.strokeStyle = outline;
    ctx.stroke();
    ctx.restore();
  };

  if (!world.grid?.length) return;

  // HERO
  {
    const [hx, hy] = world.heroTile;
    const [sx, sy] = toScreen(hx, hy, canvas, camera); // 👈 pass canvas
    const playerImg = getPlayerIcon();
    if (playerImg) {
      const r = 10 * k;
      ctx.drawImage(
        playerImg,
        Math.round(sx - r),
        Math.round(sy - r * 2),
        Math.round(r * 2),
        Math.round(r * 2)
      );
    } else {
      ring(sx, sy, UI_SIZES.heroRing, PALETTE.hero, true);
      dot(sx, sy, UI_SIZES.heroDot, PALETTE.hero);
    }
    if (showText)
      drawLabel(ctx, sx, sy - UI_SIZES.labelOffsetY * k, "Who's Luke", camera);
  }

  // CATEGORIES
  for (const c of world.categories) {
    if (typeof c.x !== "number" || typeof c.y !== "number") continue;
    const [sx, sy] = toScreen(c.x, c.y, canvas, camera); // 👈 pass canvas
    const catIcon = getCategoryIcon(c.id);
    if (catIcon) {
      const r = 10 * k;
      ctx.drawImage(
        catIcon,
        Math.round(sx - r),
        Math.round(sy - r),
        Math.round(r * 2),
        Math.round(r * 2)
      );
    } else {
      ring(sx, sy, UI_SIZES.categoryRing, PALETTE.category, true);
      // diamond marker fallback
      const r = UI_SIZES.categoryDiamond * k;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = PALETTE.category;
      ctx.lineWidth = 3 * k;
      ctx.beginPath();
      ctx.rect(-r, -r, r * 2, r * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    if (showText) {
      const label = trunc(c.name ?? "Category", UI_SIZES.labelMaxChars);
      drawLabel(ctx, sx, sy - UI_SIZES.labelOffsetY * k, label, camera);
    }
  }

  // Removed spawned projects overlay

  // NPCs
  for (const npc of world.npcs) {
    const [sx, sy] = toScreen(npc.x, npc.y, canvas, camera);
    const r = 9 * k;
    ctx.save();
    ctx.beginPath();
    ctx.arc(sx, sy - 8 * k, r, 0, Math.PI * 2);
    ctx.fillStyle = "#ffe08a";
    ctx.fill();
    ctx.lineWidth = 2 * k;
    ctx.strokeStyle = "#a47100";
    ctx.stroke();
    ctx.restore();
    if (showText)
      drawLabel(
        ctx,
        sx,
        sy - (UI_SIZES.labelOffsetY + 6) * k,
        npc.name,
        camera
      );
  }

  // Interactables
  for (const it of world.interactables) {
    const [sx, sy] = toScreen(it.x, it.y, canvas, camera);
    const r = 7 * k;
    ctx.save();
    ctx.beginPath();
    ctx.rect(
      Math.round(sx - r),
      Math.round(sy - r),
      Math.round(r * 2),
      Math.round(r * 2)
    );
    ctx.fillStyle = "#d1fae5";
    ctx.fill();
    ctx.lineWidth = 2 * k;
    ctx.strokeStyle = "#065f46";
    ctx.stroke();
    ctx.restore();
    if (showText)
      drawLabel(ctx, sx, sy - UI_SIZES.labelOffsetY * k, it.name, camera);
  }

  // HOVER target
  if (hoverEnemy) {
    const [sx, sy] = toScreen(hoverEnemy.x, hoverEnemy.y, canvas, camera); // 👈 pass canvas
    ring(
      sx,
      sy,
      clamp(UI_SIZES.spawnHalo + 6, 16, 28),
      PALETTE.hoverEdge,
      true
    );
  }
}
