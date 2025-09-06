import { toScreen } from "./math";
import type { World } from "./world";
import type { Project, Camera } from "./types";

export interface Renderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  resize: () => void;
  draw: (hoverEnemy: { id: string; x: number; y: number } | null) => void;
}

export function createRenderer(
  canvas: HTMLCanvasElement,
  world: World,
  camera: Camera
): Renderer {
  const ctx = canvas.getContext("2d")!;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw(null);
  }

  function diamondPath(scale: number) {
    const halfW = 32 * scale;
    const halfH = 16 * scale;
    const fullH = 32 * scale;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(halfW, halfH);
    ctx.lineTo(0, fullH);
    ctx.lineTo(-halfW, halfH);
    ctx.closePath();
    return { halfW, halfH, fullH };
  }

  function drawTile(
    x: number,
    y: number,
    fill: string,
    lineAlpha = 0.18,
    lw = 1
  ) {
    const [sx, sy] = toScreen(x, y, canvas.width, camera);
    ctx.save();
    ctx.translate(sx, sy);
    diamondPath(camera.scale);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.globalAlpha = lineAlpha;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = Math.max(lw, camera.scale);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawCategoryMarker(x: number, y: number, label: string) {
    const [sx, sy] = toScreen(x, y, canvas.width, camera);
    ctx.save();
    ctx.translate(sx, sy);
    const { fullH } = diamondPath(camera.scale);
    ctx.fillStyle = "rgba(56,189,248,0.25)";
    ctx.fill();
    ctx.lineWidth = Math.max(1.5, camera.scale);
    ctx.strokeStyle = "rgba(56,189,248,0.8)";
    ctx.stroke();

    const fontSize = Math.max(11, Math.min(14, 12 * camera.scale));
    ctx.font = `${fontSize}px system-ui, sans-serif`;
    ctx.fillStyle = "rgba(168, 232, 255, 0.95)";
    ctx.textAlign = "center";
    ctx.fillText(label, 0, -8 * camera.scale);
    ctx.restore();
  }

  function drawHeroMarker(x: number, y: number) {
    const [sx, sy] = toScreen(x, y, canvas.width, camera);
    ctx.save();
    ctx.translate(sx, sy);
    const { fullH } = diamondPath(camera.scale);
    ctx.fillStyle = "rgba(236,72,153,0.22)";
    ctx.fill();
    ctx.lineWidth = Math.max(1.5, camera.scale);
    ctx.strokeStyle = "rgba(236,72,153,0.85)";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, fullH / 2 - 6 * camera.scale, 9 * camera.scale, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fill();

    const fontSize = Math.max(11, Math.min(14, 12 * camera.scale));
    ctx.font = `${fontSize}px system-ui, sans-serif`;
    ctx.fillStyle = "rgba(255, 200, 230, 0.95)";
    ctx.textAlign = "center";
    ctx.fillText("You", 0, -8 * camera.scale);
    ctx.restore();
  }

  function draw(hoverEnemy: { id: string; x: number; y: number } | null) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // base tiles
    for (let y = 0; y < world.grid.length; y++) {
      for (let x = 0; x < world.grid[0].length; x++) {
        const walkable = world.grid[y][x] === 0;
        const c = walkable ? "#0f315d" : "#0a2547";
        drawTile(x, y, c);
      }
    }

    // hero tile & category tiles
    drawHeroMarker(world.heroTile[0], world.heroTile[1]);
    for (const c of world.categories) {
      drawCategoryMarker(c.x, c.y, c.name);
    }

    // hovered enemy adjacents
    if (hoverEnemy) {
      for (const [ax, ay] of adjacentWalkable(
        world,
        hoverEnemy.x,
        hoverEnemy.y
      )) {
        drawTile(ax, ay, "rgba(110,168,254,0.3)", 0.8);
      }
    }

    // spawned enemies
    for (const pid in world.spawned) {
      const pos = world.spawned[pid];
      const [sx, sy] = toScreen(pos.x, pos.y, canvas.width, camera);
      ctx.save();
      ctx.translate(sx, sy);
      diamondPath(camera.scale);
      ctx.fillStyle = "#1a2f55";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, (32 * camera.scale) / 2, 10 * camera.scale, 0, Math.PI * 2);
      ctx.fillStyle =
        getComputedStyle(document.documentElement).getPropertyValue(
          "--enemy"
        ) || "#ef476f";
      ctx.fill();

      const proj = world.projects.find((p) => p.id === pid)!;
      const fontSize = Math.max(10, Math.min(14, 12 * camera.scale));
      ctx.font = `${fontSize}px system-ui, sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.textAlign = "center";
      ctx.fillText(proj.name, 0, -8 * camera.scale);
      ctx.restore();
    }

    // player marker
    {
      const [psx, psy] = toScreen(
        world.player.x,
        world.player.y,
        canvas.width,
        camera
      );
      ctx.save();
      ctx.translate(psx, psy);
      diamondPath(camera.scale);
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = Math.max(1, camera.scale);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(
        0,
        (32 * camera.scale) / 2 - 6 * camera.scale,
        9 * camera.scale,
        0,
        Math.PI * 2
      );
      ctx.fillStyle =
        getComputedStyle(document.documentElement).getPropertyValue(
          "--player"
        ) || "#ffd166";
      ctx.fill();
      ctx.restore();
    }
  }

  function adjacentWalkable(
    world: World,
    x: number,
    y: number
  ): [number, number][] {
    const out: [number, number][] = [];
    if (y > 0 && world.grid[y - 1][x] === 0) out.push([x, y - 1]);
    if (y < world.grid.length - 1 && world.grid[y + 1][x] === 0)
      out.push([x, y + 1]);
    if (x > 0 && world.grid[y][x - 1] === 0) out.push([x - 1, y]);
    if (x < world.grid[0].length - 1 && world.grid[y][x + 1] === 0)
      out.push([x + 1, y]);
    return out;
  }

  window.addEventListener("resize", resize);
  return { canvas, ctx, resize, draw };
}
