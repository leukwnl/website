import type { Project, Camera } from "./types";
import type { SpawnedMap } from "./types";

/** --- Refs & state --- */
let hudEl!: HTMLDivElement, canvasEl!: HTMLCanvasElement, camRef!: Camera;
let dockEl!: HTMLDivElement;
let dockBodyEl!: HTMLDivElement;
let dockToggleEl!: HTMLButtonElement;
let dockTitleEl!: HTMLDivElement;

let bbarEl!: HTMLDivElement,
  bimgEl!: HTMLImageElement,
  btitleEl!: HTMLDivElement,
  bgalleryEl!: HTMLDivElement;
let bcompanyEl!: HTMLDivElement,
  blocationEl!: HTMLDivElement,
  bdateEl!: HTMLDivElement;

const DOCK_COLLAPSED_KEY = "dock:collapsed";

let allProjects: Project[] = [];
let spawnedOrder: string[] = [];
let currentIdx = -1;
let currentProjectId: string | null = null;
let lastSpawned: SpawnedMap | null = null; // keep snapshot so we can rebuild gallery on selection

/** --- Dock collapse behavior --- */
function initDockBehavior() {
  const stored = localStorage.getItem(DOCK_COLLAPSED_KEY);
  const collapsed = stored === "1";
  setDockCollapsed(collapsed, /*skipStore*/ true);

  dockToggleEl.addEventListener("click", () => {
    setDockCollapsed(!dockEl.classList.contains("dock--collapsed"));
  });

  // keyboard: press "H" to toggle
  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "h") {
      setDockCollapsed(!dockEl.classList.contains("dock--collapsed"));
    }
  });
}

function setDockCollapsed(collapsed: boolean, skipStore = false) {
  if (!dockEl || !dockToggleEl) return;
  dockEl.classList.toggle("dock--collapsed", collapsed);
  dockEl.setAttribute("aria-expanded", collapsed ? "false" : "true");
  dockToggleEl.setAttribute("aria-expanded", collapsed ? "false" : "true");
  if (!skipStore)
    localStorage.setItem(DOCK_COLLAPSED_KEY, collapsed ? "1" : "0");
}

/** --- Public init --- */
export function initUI(
  hud: HTMLDivElement,
  canvas: HTMLCanvasElement,
  camera: Camera
) {
  hudEl = hud;
  canvasEl = canvas;
  camRef = camera;

  dockEl = document.getElementById("dock") as HTMLDivElement;
  dockBodyEl = document.getElementById("dock-body") as HTMLDivElement;
  dockToggleEl = document.getElementById("dock-toggle") as HTMLButtonElement;
  dockTitleEl = document.getElementById("dock-title") as HTMLDivElement;

  bbarEl = document.getElementById("bbar") as HTMLDivElement;
  bimgEl = document.getElementById("bbar-img") as HTMLImageElement;
  btitleEl = document.getElementById("bbar-title") as HTMLDivElement;
  bgalleryEl = document.getElementById("bbar-gallery") as HTMLDivElement;

  bcompanyEl = document.getElementById("bbar-company") as HTMLDivElement;
  blocationEl = document.getElementById("bbar-location") as HTMLDivElement;
  bdateEl = document.getElementById("bbar-date") as HTMLDivElement;

  initDockBehavior();
  showWelcomeInDock(); // set default content safely

  // Wheel-to-cycle: only among "others" (exclude current)
  bbarEl.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      if (spawnedOrder.length === 0) return;

      const dir = e.deltaY > 0 ? 1 : -1;
      const curPos = currentProjectId
        ? spawnedOrder.indexOf(currentProjectId)
        : -1;

      // if nothing selected yet, pick first/last depending on direction
      let nextPos =
        curPos === -1
          ? dir > 0
            ? 0
            : spawnedOrder.length - 1
          : (curPos + dir + spawnedOrder.length) % spawnedOrder.length;

      // ensure we don't "reselect" the same current project
      if (
        spawnedOrder[nextPos] === currentProjectId &&
        spawnedOrder.length > 1
      ) {
        nextPos = (nextPos + dir + spawnedOrder.length) % spawnedOrder.length;
      }

      selectByIndex(nextPos, /*emit*/ true);
    },
    { passive: false }
  );
}

/** Provide master list of projects once (from world) */
export function setAllProjects(projects: Project[]) {
  allProjects = projects;
}

/** merge new spawned set into existing order while preserving user order */
function reconcileSpawnedOrder(spawned: SpawnedMap) {
  const incoming = Object.keys(spawned);

  // keep only items that still exist
  const kept = spawnedOrder.filter((id) => incoming.includes(id));

  // append any new ids at the end (in incoming order)
  const appended = incoming.filter((id) => !kept.includes(id));

  spawnedOrder = [...kept, ...appended];
}

export function updateSpawnedGallery(spawned: SpawnedMap) {
  lastSpawned = spawned;
  reconcileSpawnedOrder(spawned);
  renderGallery(spawned, /*keepSelection*/ true);
}

/** External select (e.g., clicking on canvas enemy) */
export function selectProjectById(id: string, emit = false) {
  const idx = spawnedOrder.indexOf(id);
  if (idx !== -1) selectByIndex(idx, emit);
}

/** Internal select/cycle by index */
function selectByIndex(idx: number, emit: boolean) {
  const prevId = currentProjectId;

  // compute new current
  currentIdx = idx;
  currentProjectId = spawnedOrder[idx] ?? null;

  // rotate: move previous to end (if still present and different)
  if (prevId && prevId !== currentProjectId) {
    const i = spawnedOrder.indexOf(prevId);
    if (i !== -1) {
      spawnedOrder.splice(i, 1);
      spawnedOrder.push(prevId);
    }
  }

  // ensure currentIdx points at the new current in the (possibly) new order
  if (currentProjectId) currentIdx = spawnedOrder.indexOf(currentProjectId);

  const p = allProjects.find((px) => px.id === currentProjectId) || null;
  renderCurrent(p);

  // rebuild gallery so prev appears and current is excluded
  if (lastSpawned) renderGallery(lastSpawned, /*keepSelection*/ true);

  if (emit && currentProjectId) {
    window.dispatchEvent(
      new CustomEvent("ui:select-project", {
        detail: { projectId: currentProjectId },
      })
    );
  }
}

/** --- Rendering --- */
function renderCurrent(p: Project | null) {
  if (!bimgEl || !btitleEl || !bcompanyEl || !blocationEl || !bdateEl) return;

  if (!p) {
    bimgEl.src = `https://picsum.photos/seed/placeholder/220/132`;
    bimgEl.alt = "";
    btitleEl.textContent = "—";
    bcompanyEl.textContent = "Company —";
    blocationEl.textContent = "Location —";
    bdateEl.textContent = "Date —";
    return;
  }

  bimgEl.src = `https://picsum.photos/seed/${encodeURIComponent(p.id)}/220/132`;
  bimgEl.alt = p.name;

  btitleEl.textContent = p.name;
  bcompanyEl.textContent = p.company || "—";
  blocationEl.textContent = p.location || "—";
  bdateEl.textContent = p.date || "—";

  showProjectInDock(p);
}

/** Build gallery thumbs (exclude current) */
function renderGallery(spawned: SpawnedMap, keepSelection: boolean) {
  if (!bgalleryEl) return;
  bgalleryEl.innerHTML = "";

  for (const pid of spawnedOrder) {
    if (pid === currentProjectId) continue; // skip current

    const p = allProjects.find((px) => px.id === pid);
    if (!p) continue;

    const item = document.createElement("button");
    item.className = "gitem";
    item.setAttribute("role", "option");
    item.dataset.id = pid;
    item.innerHTML = `
      <img src="https://picsum.photos/seed/${encodeURIComponent(
        pid
      )}/110/70" alt="${p.name}">
      <div class="label">${p.name}</div>
    `;
    item.addEventListener("click", () => {
      const idx = spawnedOrder.indexOf(pid);
      if (idx !== -1) selectByIndex(idx, /*emit*/ true);
    });
    bgalleryEl.appendChild(item);
  }

  // Maintain a valid selection (do not change currentProjectId here)
  if (!currentProjectId && spawnedOrder.length > 0) {
    selectByIndex(0, /*emit*/ false);
  }
}

/** Current isn't in gallery; no 'active' styling needed */
function highlightActiveThumb(_id: string | null) {
  // no-op by design
}

/** ===== Dock renderers ===== */
function showWelcomeInDock() {
  if (!dockEl || !dockBodyEl || !dockTitleEl) return;
  dockTitleEl.textContent = "Welcome";
  dockBodyEl.innerHTML = `
    <p class="subtitle">Step on a category tile to spawn projects. Click a project or use the bottom bar to select.</p>
    <p class="hint">Scroll to zoom. Right-click drag to pan. Hover the bottom bar and use the mouse wheel to cycle.</p>
  `;
}

export function showProjectInDock(p: Project) {
  if (!dockEl || !dockBodyEl || !dockTitleEl) return;
  dockTitleEl.textContent = p.name;

  const chips = (vals?: string[]) =>
    vals && vals.length
      ? `<div class="chips">${vals
          .map((t) => `<span class="chip">${t}</span>`)
          .join("")}</div>`
      : "";

  const list = (
    label: string,
    items?: { label: string; value?: string; detail?: string }[]
  ) =>
    items && items.length
      ? `<div class="section-title">${label}</div>
         <ul style="margin:6px 0 0 16px; padding:0;">
           ${items
             .map(
               (s) => `<li style="margin:2px 0;">
                 <span style="opacity:.95">${s.label}</span>${
                 s.value ? ` — <span style="opacity:.85">${s.value}</span>` : ""
               }${
                 s.detail
                   ? ` — <span style="opacity:.75">${s.detail}</span>`
                   : ""
               }
               </li>`
             )
             .join("")}
         </ul>`
      : "";

  dockBodyEl.innerHTML = `
    <p class="subtitle">${p.desc ?? ""}</p>
    ${p.role ? `<p><strong>Role:</strong> ${p.role}</p>` : ""}
    ${chips(p.tags)}
    ${list("Stats", p.stats)}
    ${list("Abilities", p.abilities)}
    <div class="section-title">Case Study</div>
    <p>This area holds your long-form write-up, diagrams, etc.</p>
    ${
      p.url
        ? `<p style="margin-top:10px"><a href="${p.url}">Open project →</a></p>`
        : ""
    }
  `;

  // Auto-expand if collapsed (optional)
  if (dockEl.classList.contains("dock--collapsed")) {
    setDockCollapsed(false);
  }
}

export function showHeroInDock() {
  if (!dockEl || !dockBodyEl || !dockTitleEl) return;
  dockTitleEl.textContent = "About";
  dockBodyEl.innerHTML = `
    <p class="subtitle">I build stages where collaborators improvise in real time.</p>
    <p><strong>Focus:</strong> Real-time multiplayer, gameplay tools, systems design.</p>
    <p><strong>Stack:</strong> Unity/CUGL, TypeScript, Python, Azure, Kafka.</p>
    <div class="section-title">About</div>
    <p>Short bio / principles / how you work with teams.</p>
  `;
}
