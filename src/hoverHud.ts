import type { Camera, World } from "./types";
import { toScreen } from "./math";

export function initHoverHud(
  canvas: HTMLCanvasElement,
  world: World,
  camera: Camera
) {
  const rootId = "hover-hud";
  let el = document.getElementById(rootId) as HTMLDivElement | null;
  if (!el) {
    el = document.createElement("div");
    el.id = rootId;
    el.style.position = "fixed";
    el.style.pointerEvents = "none";
    el.style.zIndex = "50";
    el.style.transform = "translate(-50%, -100%)"; // center over tile, above
    el.style.transition = "opacity .12s ease, transform .12s ease";
    el.style.opacity = "0";
    document.body.appendChild(el);
  }

  function renderCategoryPreview(col: number, row: number) {
    const c = world.categories.find((cc) => cc.x === col && cc.y === row);
    if (!c) {
      el!.style.opacity = "0";
      return;
    }
    const items = c.projectIds
      .map((id) => world.projects.find((p) => p.id === id))
      .filter(Boolean);
    const thumbs = (items as any[])
      .slice(0, 4)
      .map(
        (p) => `
        <div class="hh-thumb">
          <img src="https://picsum.photos/seed/${encodeURIComponent(
            p.id
          )}/120/80" alt="${escapeHtml(p.name)}" />
        </div>`
      )
      .join("");
    el!.innerHTML = `
      <div class="hh-card">
        <div class="hh-title">${escapeHtml(c.name)}</div>
        <div class="hh-grid">${
          thumbs || '<div class="hh-empty">No items</div>'
        }</div>
        <div class="hh-hint">Click to open</div>
      </div>`;

    const [sx, sy] = toScreen(col, row, canvas, camera);
    el!.style.left = `${Math.round(sx)}px`;
    el!.style.top = `${Math.round(sy - 10)}px`;
    el!.style.opacity = "1";
    el!.style.transform = "translate(-50%, -110%)";
  }

  function update(tile: [number, number] | null) {
    if (!tile) {
      el!.style.opacity = "0";
      return;
    }
    const [col, row] = tile;
    renderCategoryPreview(col, row);
  }

  return { update };
}

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"]/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string)
  );
}
