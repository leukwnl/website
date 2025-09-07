import type { World, Project } from "./types";
import { ABOUT, PIN_LAYOUTS } from "./content";
import { getThumbUrl } from "./assets";

function ensureRoot(): HTMLDivElement {
  let el = document.getElementById("bottom-panel") as HTMLDivElement | null;
  if (el) return el;
  el = document.createElement("div");
  el.id = "bottom-panel";
  el.innerHTML = `
    <div id="bp-overlay" class="bp-overlay"></div>
    <section id="bp" class="bp hidden" aria-modal="true" role="dialog">
      <header class="bp-header">
        <h2 id="bp-title" class="bp-title">Gallery</h2>
        <button id="bp-close" class="bp-close" aria-label="Close">✕</button>
      </header>
      <div id="bp-body" class="bp-body"></div>
      <button id="bp-rolldown" class="bp-rolldown" aria-label="Minimize">Roll down</button>
    </section>
  `;
  document.body.appendChild(el);
  return el;
}

function renderPolaroids(projects: Project[]): string {
  if (!projects.length) {
    return `<div class="bp-empty">No items in this category yet.</div>`;
  }
  // Slight random rotation for that pinned-polaroid vibe
  const rand = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  return `
    <div class="bp-grid">
      ${projects
        .map((p, i) => {
          const r = (rand(i + p.id.length) - 0.5) * 8; // -4deg..4deg
          const img =
            getThumbUrl(p.id) ||
            `https://picsum.photos/seed/${encodeURIComponent(p.id)}/480/320`;
          const link = p.url
            ? `href="${p.url}" target="_blank" rel="noopener"`
            : "";
          return `
            <a class="polaroid" ${link} style="transform: rotate(${r.toFixed(
            2
          )}deg)">
              <figure>
                <div class="polaroid-wrap">
                  <img class="polaroid-img" src="${img}" alt="${escapeHtml(
            p.name || "Item"
          )}">
                </div>
                <figcaption>
                  <div class="p-title">${escapeHtml(p.name || "Item")}</div>
                  ${
                    p.company
                      ? `<div class="p-sub">${escapeHtml(p.company)}</div>`
                      : ""
                  }
                </figcaption>
              </figure>
            </a>`;
        })
        .join("")}
    </div>
  `;
}

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"]/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string)
  );
}

export function initBottomPanel(world: World) {
  const root = ensureRoot();
  const overlay = root.querySelector("#bp-overlay") as HTMLDivElement;
  const panel = root.querySelector("#bp") as HTMLDivElement;
  const title = root.querySelector("#bp-title") as HTMLHeadingElement;
  const body = root.querySelector("#bp-body") as HTMLDivElement;
  const closeBtn = root.querySelector("#bp-close") as HTMLButtonElement;
  const rollBtn = root.querySelector("#bp-rolldown") as HTMLButtonElement;
  let openedAt = 0;
  let opening = false;
  let atEnd = false;

  function openCategory(categoryId: string) {
    const cat = world.categories.find((c) => c.id === categoryId);
    const items = cat
      ? (cat.projectIds
          .map((id) => world.projects.find((p) => p.id === id))
          .filter(Boolean) as Project[])
      : [];
    title.textContent = cat?.name || "Gallery";
    // Portfolio-style or Pin-board based on layout presence
    const layout = PIN_LAYOUTS[categoryId];
    if (layout && layout.length) {
      const board = renderPinBoard(items, layout);
      body.innerHTML = board || renderPortfolioGrid(items);
    } else {
      body.innerHTML = renderPortfolioGrid(items);
    }
    show();
  }

  function openAbout() {
    title.textContent = ABOUT.title || "Who's Luke";
    const bodyHtml = ABOUT.html
      ? ABOUT.html
      : (ABOUT.paragraphs || [])
          .map((p) => `<p>${escapeHtml(p)}</p>`) // basic escaping
          .join("");
    const photo = ABOUT.photoUrl || "";
    body.innerHTML = `
      <div class="about-wrap">
        <div class="about-photo">
          ${
            photo
              ? `<img src="${photo}" alt="${escapeHtml(ABOUT.title)}" />`
              : ""
          }
        </div>
        <div class="about-body">
          <div class="about-editor" contenteditable="true" spellcheck="true">
            ${bodyHtml || "<p>Write about yourself here…</p>"}
          </div>
        </div>
      </div>`;
    show();
  }

  function openNpc(id: string) {
    const npc = world.npcs.find((n) => n.id === id);
    if (!npc) return;
    title.textContent = npc.name;
    body.innerHTML = `
      <div class="about-body">
        <div class="about-editor">
          ${npc.lines.map((l) => `<p>${escapeHtml(l)}</p>`).join("")}
        </div>
      </div>`;
    show();
  }

  function openInteractable(id: string) {
    const it = world.interactables.find((i) => i.id === id);
    if (!it) return;
    title.textContent = it.name;
    body.innerHTML = `
      <div class="about-body">
        <div class="about-editor">
          <p>${escapeHtml(it.text || "")}</p>
        </div>
      </div>`;
    show();
  }

  function show() {
    opening = true;
    // ensure panel is on top and interactive
    (root as HTMLDivElement).style.pointerEvents = "auto";
    overlay.style.pointerEvents = "none"; // avoid immediate close from original click
    overlay.classList.add("visible");
    panel.classList.remove("hidden");
    // force reflow to allow transition when toggling from hidden
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    panel.offsetHeight;
    panel.classList.add("open");
    document.body.classList.add("bp-open");
    openedAt = performance.now();

    const onOpened = () => {
      opening = false;
      overlay.style.pointerEvents = "auto";
      panel.removeEventListener("transitionend", onOpened);
    };
    panel.addEventListener("transitionend", onOpened);

    // reset roll-down button
    if (rollBtn) rollBtn.classList.remove("expanded");
    atEnd = false;
    // track scroll to expand button when near end
    // ensure body is visible & scrollable after content injected
    body.style.display = "block";
    body.addEventListener("scroll", onScroll, { passive: true });
  }

  function close() {
    overlay.classList.remove("visible");
    panel.classList.remove("open");
    document.body.classList.remove("bp-open");
    // Hide after transition ends
    const onEnd = () => {
      panel.classList.add("hidden");
      overlay.style.pointerEvents = "none";
      (root as HTMLDivElement).style.pointerEvents = "none";
      panel.removeEventListener("transitionend", onEnd);
    };
    panel.addEventListener("transitionend", onEnd);
    body.removeEventListener("scroll", onScroll as any);
  }

  function onScroll() {
    const nearEnd = body.scrollTop + body.clientHeight >= body.scrollHeight - 8;
    if (nearEnd && !atEnd) {
      atEnd = true;
      rollBtn?.classList.add("expanded");
      if (rollBtn) rollBtn.textContent = "Roll down";
    } else if (!nearEnd && atEnd) {
      atEnd = false;
      rollBtn?.classList.remove("expanded");
      if (rollBtn) rollBtn.textContent = "Roll down";
    }
  }

  closeBtn.addEventListener("click", close);
  rollBtn?.addEventListener("click", close);
  overlay.addEventListener("click", () => {
    // swallow clicks that immediately follow opening
    if (opening) return;
    if (performance.now() - openedAt < 200) return;
    close();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  return { openCategory, openAbout, openNpc, openInteractable, close };
}

function renderPortfolioGrid(items: Project[]): string {
  if (!items.length) return `<div class="bp-empty">No items to show.</div>`;
  const cards = items
    .map((p) => {
      const href = p.url ? p.url : `/${encodeURIComponent(p.slug || p.id)}`;
      const img =
        getThumbUrl(p.id) ||
        `https://picsum.photos/seed/${encodeURIComponent(p.id)}/960/600`;
      const sub = [p.role, p.company, p.date].filter(Boolean).join(" • ");
      return `
      <a class="pf-card" href="${href}" target="${
        p.url ? "_blank" : "_self"
      }" rel="noopener">
        <img class="pf-img" src="${img}" alt="${escapeHtml(p.name)}">
        <div class="pf-meta">
          <div class="pf-title">${escapeHtml(p.name)}</div>
          ${sub ? `<div class="pf-sub">${escapeHtml(sub)}</div>` : ""}
        </div>
      </a>`;
    })
    .join("");
  return `<div class="pf-grid">${cards}</div>`;
}

function renderPinBoard(
  items: Project[],
  layout: { id: string; x: number; y: number; rot?: number }[]
): string {
  const byId = new Map(items.map((p) => [p.id, p] as const));
  const cards = layout
    .map((pos) => {
      const p = byId.get(pos.id);
      if (!p) return "";
      const href = p.url ? p.url : `/${encodeURIComponent(p.slug || p.id)}`;
      const img =
        getThumbUrl(p.id) ||
        `https://picsum.photos/seed/${encodeURIComponent(p.id)}/960/600`;
      const sub = [p.role, p.company, p.date].filter(Boolean).join(" • ");
      const rot = pos.rot ? `rotate(${pos.rot}deg)` : "none";
      return `
        <a class="pf-card" href="${href}" target="${
        p.url ? "_blank" : "_self"
      }" rel="noopener"
           style="position:absolute; left:${Math.round(
             pos.x
           )}px; top:${Math.round(pos.y)}px; transform:${rot};">
          <img class="pf-img" src="${img}" alt="${escapeHtml(p.name)}">
          <div class="pf-meta">
            <div class="pf-title">${escapeHtml(p.name)}</div>
            ${sub ? `<div class="pf-sub">${escapeHtml(sub)}</div>` : ""}
          </div>
        </a>`;
    })
    .join("");
  if (!cards.trim()) return "";
  // Provide a large scrollable canvas area for absolute cards
  return `<div style="position:relative; min-height: 70vh; height: 1200px;">${cards}</div>`;
}
