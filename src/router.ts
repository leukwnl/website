import type { World } from "./types";
import { initInfoPanel } from "./infoPanel";

export function initRouter(world: World) {
  const journal = initInfoPanel(world);

  function route(pathname: string) {
    // normalize
    const p = pathname.replace(/\/+$/, "") || "/";
    if (p === "/") {
      journal.applyMode("map");
      journal.openHome();
      document.title = "Luke Leh — TRPG Portfolio";
      return;
    }
    if (p === "/projects" || p === "/games" || p === "/experience") {
      journal.applyMode("map");
      journal.openSection(p.slice(1) as any, false);
      document.title = `Luke — ${p.slice(1)}`;
      return;
    }
    // /:slug
    const slug = p.slice(1);
    const proj = world.projects.find((pp) => pp.slug === slug);
    if (proj) {
      journal.applyMode("page");
      journal.openProjectPage(proj.id);
      document.title = `${proj.name} — Luke Leh`;
      return;
    }
    // 404 fallback
    journal.applyMode("map");
    journal.openHome();
  }

  // intercept clicks on <a data-nav>
  document.addEventListener("click", (e) => {
    const a = (e.target as HTMLElement).closest(
      "a[data-nav]"
    ) as HTMLAnchorElement | null;
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("http") || href.startsWith("mailto:")) return;
    e.preventDefault();
    history.pushState({}, "", href);
    route(location.pathname);
  });

  window.addEventListener("popstate", () => route(location.pathname));

  // initial
  route(location.pathname);

  // also listen to canvas events → navigate
  window.addEventListener("grid:open-project" as any, (e: any) => {
    const id = e.detail?.projectId as string;
    const p = world.projects.find((pp) => pp.id === id);
    if (p) {
      history.pushState({}, "", `/${p.slug}`);
      route(location.pathname);
    }
  });
  window.addEventListener("grid:open-hero" as any, () => {
    history.pushState({}, "", "/");
    route(location.pathname);
  });
  window.addEventListener("grid:open-category" as any, (e: any) => {
    const catId = e.detail?.categoryId as string;
    if (catId === "projects" || catId === "games" || catId === "experience") {
      history.pushState({}, "", `/${catId}`);
      route(location.pathname);
    }
  });
}
