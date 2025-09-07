import type { World, Category, Project } from "./types";

type SectionKey = "projects" | "games" | "experience";
const SECTION_ORDER: SectionKey[] = ["projects", "games", "experience"];

export function initInfoPanel(world: World) {
  const tabsEl = document.getElementById("info-tabs") as HTMLDivElement;
  const titleEl = document.getElementById("info-title") as HTMLHeadingElement;
  const subEl = document.getElementById("info-sub") as HTMLParagraphElement;
  const bodyEl = document.getElementById("info-body") as HTMLDivElement;
  const backToMap = document.getElementById("back-to-map") as HTMLAnchorElement;

  const byKey: Record<SectionKey, Category | null> = {
    projects:
      world.categories.find(
        (c) => /project/i.test(c.id) || /project/i.test(c.name)
      ) ?? null,
    games:
      world.categories.find(
        (c) => /game/i.test(c.id) || /game/i.test(c.name)
      ) ?? null,
    experience:
      world.categories.find(
        (c) => /exp|experience|career/i.test(c.id) || /experience/i.test(c.name)
      ) ?? null,
  };

  // Build tabs (Tailwind classes match your previous style)
  tabsEl.innerHTML = SECTION_ORDER.map(
    (k) =>
      `<button role="tab" data-key="${k}"
       class="px-3 py-1 rounded-full border border-gray-300 bg-amber-50 text-[13px] font-semibold"
       aria-selected="false">${label(k)}</button>`
  ).join("");

  tabsEl
    .querySelectorAll<HTMLButtonElement>("button[role=tab]")
    .forEach((btn) => {
      btn.addEventListener("click", () =>
        openSection(btn.dataset.key as SectionKey, true)
      );
    });

  backToMap.addEventListener("click", (e) => {
    e.preventDefault();
    document
      .querySelector("header")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  function label(k: SectionKey) {
    return k === "projects"
      ? "Projects"
      : k === "games"
      ? "Games"
      : "Experience";
  }
  function selectTab(k: SectionKey | null) {
    tabsEl
      .querySelectorAll<HTMLButtonElement>("button")
      .forEach((b) =>
        b.setAttribute("aria-selected", b.dataset.key === k ? "true" : "false")
      );
  }

  function openHome() {
    selectTab(null);
    titleEl.textContent = "Welcome";
    subEl.textContent =
      "Step on a category to spawn items. Click an item to learn more.";
    bodyEl.innerHTML = `
      <section class="space-y-8 section-fade visible">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 items-start">
          <div><p class="text-sm font-light uppercase text-gray-700 tracking-wide">Start</p></div>
          <div class="md:col-span-2">
            <p class="text-sm font-light leading-relaxed">
              Use the schematic above, then read notes here. Tabs match Projects / Games / Experience.
            </p>
          </div>
        </div>
      </section>`;
    scrollToJournal();
    setHash("");
  }

  function openSection(key: SectionKey, fromUser = false) {
    const cat = byKey[key];
    selectTab(key);
    titleEl.textContent = label(key);
    subEl.textContent = cat ? "Browse items below" : "No items yet";
    const items = cat
      ? (cat.projectIds
          .map((id) => world.projects.find((p) => p.id === id))
          .filter(Boolean) as Project[])
      : [];
    bodyEl.innerHTML = renderList(items);
    bodyEl
      .querySelectorAll<HTMLButtonElement>(".card[data-id]")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const p = world.projects.find((px) => px.id === btn.dataset.id)!;
          openProject(p, key);
        });
      });
    scrollToJournal();
    if (fromUser) setHash(key);
  }

  function openProject(p: Project, fromKey: SectionKey | null) {
    selectTab(fromKey ?? null);
    titleEl.textContent = p.name || "Project";
    subEl.textContent = p.company
      ? `${p.company}${p.location ? " — " + p.location : ""}`
      : fromKey
      ? label(fromKey)
      : "Details";
    bodyEl.innerHTML = renderDetail(p, fromKey);
    bodyEl
      .querySelector<HTMLButtonElement>("#back-to-section")
      ?.addEventListener("click", () => {
        fromKey ? openSection(fromKey, true) : openHome();
      });
    scrollToJournal();
    setHash(
      fromKey
        ? `${fromKey}:${encodeURIComponent(p.id)}`
        : `detail:${encodeURIComponent(p.id)}`
    );
  }

  // ------------ Compatibility shims for older code (router.ts) ------------
  /**
   * Legacy: router.applyMode(mode, id?)
   * mode: "home" | "projects" | "games" | "experience" | "detail"
   */
  function applyMode(mode: string, id?: string) {
    switch (mode) {
      case "home":
        openHome();
        break;
      case "projects":
        openSection("projects", true);
        break;
      case "games":
        openSection("games", true);
        break;
      case "experience":
        openSection("experience", true);
        break;
      case "detail":
        if (id) {
          const p = world.projects.find((px) => px.id === id);
          if (p) openProject(p, null);
        }
        break;
      default:
        openHome();
    }
  }

  /**
   * Legacy: router.openProjectPage(projectId, fromKey?)
   */
  function openProjectPage(projectId: string, fromKey?: SectionKey | null) {
    const p = world.projects.find((px) => px.id === projectId);
    if (p) openProject(p, fromKey ?? null);
  }
  // ------------------------------------------------------------------------

  function renderList(items: Project[]) {
    if (!items.length) {
      return `<section class="space-y-8 section-fade visible">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 items-start">
          <div><p class="text-sm font-light uppercase text-gray-700 tracking-wide">Empty</p></div>
          <div class="md:col-span-2"><p class="text-sm font-light">Nothing to show yet.</p></div>
        </div>
      </section>`;
    }
    const cards = items
      .map(
        (p) => `
      <button class="card text-left space-y-2 p-3 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow transition shadow-gray-100"
              data-id="${p.id}">
        <h3 class="text-sm font-medium">${esc(p.name)}</h3>
        <p class="text-xs font-light text-gray-600 uppercase tracking-wide">
          ${(p.role ?? "").trim()}${
          p.role && (p.company || p.date) ? " • " : ""
        }${(p.company ?? "").trim()}${p.date ? " • " + esc(p.date) : ""}
        </p>
        ${bullets(p.desc)}
        ${badges(p.tags)}
      </button>
    `
      )
      .join("");

    return `
      <section class="space-y-8 section-fade visible">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">${cards}</div>
      </section>`;
  }

  function renderDetail(p: Project, fromKey: SectionKey | null) {
    return `
      <section class="space-y-8 section-fade visible">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 items-start">
          <div><p class="text-sm font-light uppercase text-gray-700 tracking-wide">${
            fromKey ? label(fromKey) : "Details"
          }</p></div>
          <div class="md:col-span-2 space-y-4">
            <div class="space-y-1">
              <h2 class="text-lg font-medium">${esc(p.name)}</h2>
              <p class="text-xs font-light text-gray-600 uppercase tracking-wide">
                ${(p.role ?? "").trim()}${
      p.role && (p.company || p.date) ? " • " : ""
    }${(p.company ?? "").trim()}${p.date ? " • " + esc(p.date) : ""}
              </p>
            </div>
            <div class="space-y-3">
              <p class="text-sm font-light leading-relaxed">${esc(
                p.desc ?? ""
              )}</p>
              ${
                p.url
                  ? `<p class="text-xs font-normal"><a class="text-blue-600 hover:underline project-link" href="${esc(
                      p.url
                    )}" target="_blank" rel="noopener">Open link →</a></p>`
                  : ""
              }
              ${badges(p.tags)}
            </div>

            <div class="pt-2">
              ${
                fromKey
                  ? `<button id="back-to-section" class="text-blue-600 hover:underline text-sm font-normal">← Back to ${label(
                      fromKey
                    )}</button>`
                  : ""
              }
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function bullets(desc?: string) {
    if (!desc) return "";
    const parts = desc
      .split(/[•●\-–]\s+|\. /)
      .filter(Boolean)
      .slice(0, 3);
    if (!parts.length) return "";
    return `<ul class="list-disc ml-5 text-sm font-light leading-relaxed">
      ${parts.map((s) => `<li>${esc(s)}</li>`).join("")}
    </ul>`;
  }
  function badges(tags?: string[]) {
    if (!tags?.length) return "";
    return `<div class="flex flex-wrap gap-2">
      ${tags
        .slice(0, 8)
        .map(
          (t) =>
            `<span class="text-[11px] px-2 py-0.5 rounded-full border border-gray-300 bg-white">${esc(
              t
            )}</span>`
        )
        .join("")}
    </div>`;
  }

  function esc(s: string) {
    return s.replace(
      /[&<>"]/g,
      (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string)
    );
  }
  function scrollToJournal() {
    document
      .getElementById("info")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function setHash(h: string) {
    history.replaceState(null, "", h ? `#${h}` : " ");
  }
  function parseHash(): { key?: SectionKey; id?: string } {
    const raw = (location.hash || "").slice(1);
    if (!raw) return {};
    const [k, rest] = raw.split(":");
    if ((SECTION_ORDER as string[]).includes(k))
      return rest
        ? { key: k as SectionKey, id: decodeURIComponent(rest) }
        : { key: k as SectionKey };
    return {};
  }
  function routeFromHash() {
    const { key, id } = parseHash();
    if (key && id) {
      const p = world.projects.find((px) => px.id === id);
      p ? openProject(p, key) : openSection(key);
    } else if (key) {
      openSection(key);
    } else {
      openHome();
    }
  }

  // Return public API (including legacy shims)
  return {
    openHome,
    openSection,
    openProject,
    routeFromHash,
    applyMode,
    openProjectPage,
  };
}
