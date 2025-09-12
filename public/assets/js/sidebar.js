(() => {
    const btn = document.getElementById("hamburger");
    const closeBtn = document.getElementById("close-sidebar");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebar-overlay");
    const pageEl = document.getElementById("page") || document.querySelector("main.wrap");

    if (!btn || !sidebar || !overlay) return;

    let savedScrollTop = 0;

    function open() {
        // Save current scroll position
        savedScrollTop = window.pageYOffset || document.documentElement.scrollTop;

        sidebar.classList.add("is-open");
        overlay.classList.add("show");
        overlay.removeAttribute("hidden");
        btn.setAttribute("aria-expanded", "true");
        sidebar.setAttribute("aria-hidden", "false");

        document.body.classList.add("sidebar-open");

        // Apply scroll lock while preserving position
        document.body.style.position = 'fixed';
        document.body.style.top = `-${savedScrollTop}px`;
        document.body.style.width = '100%';

        btn.classList.add("is-open");
        if (pageEl) pageEl.classList.add("pushed");
    }

    function close() {
        sidebar.classList.remove("is-open");
        overlay.classList.remove("show");
        overlay.setAttribute("hidden", "");
        btn.setAttribute("aria-expanded", "false");
        sidebar.setAttribute("aria-hidden", "true");

        document.body.classList.remove("sidebar-open");

        // Restore scroll position
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, savedScrollTop);

        btn.classList.remove("is-open");
        if (pageEl) pageEl.classList.remove("pushed");
    }

    btn.addEventListener("click", () => {
        const openNow = sidebar.classList.contains("is-open");
        openNow ? close() : open();
    });
    if (closeBtn) closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", close);
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") close();
    });
})();



