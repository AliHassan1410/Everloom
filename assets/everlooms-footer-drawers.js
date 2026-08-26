// Collapses the MY ACCOUNT / SHOP / SUPPORT footer columns into tap-to-open
// drawers on phones. Desktop and tablet are left completely untouched: the
// classes and ARIA attributes below are only applied while the mobile media
// query matches, and are stripped again the moment it stops matching.
//
// Groups are matched on their heading text rather than on :nth-child so that
// reordering the footer blocks in the theme editor cannot silently retarget
// the wrong column. CONTACT and the brand column are deliberately excluded.
(function () {
  const MOBILE_QUERY = "(max-width: 749px)";
  const DRAWER_LABELS = ["MY ACCOUNT", "SHOP", "SUPPORT"];

  const mql = window.matchMedia(MOBILE_QUERY);
  let drawers = [];

  function collect() {
    const blocks = document.querySelectorAll(".footer-content > .group-block");

    return Array.from(blocks)
      .map((block) => {
        const content = block.querySelector(":scope > .group-block-content");
        if (!content) return null;

        const children = Array.from(content.children);
        if (children.length < 2) return null;

        const heading = children[0];
        const label = (heading.textContent || "").trim().toUpperCase();
        if (!DRAWER_LABELS.includes(label)) return null;

        return { block, heading, panels: children.slice(1) };
      })
      .filter(Boolean);
  }

  function setOpen(drawer, open) {
    drawer.block.classList.toggle("is-open", open);
    drawer.heading.setAttribute("aria-expanded", open ? "true" : "false");
    drawer.panels.forEach((panel) => {
      panel.setAttribute("aria-hidden", open ? "false" : "true");
    });
  }

  function enable(drawer, index) {
    drawer.block.classList.add("everlooms-fdrawer");
    drawer.heading.classList.add("everlooms-fdrawer__heading");
    drawer.heading.setAttribute("role", "button");
    drawer.heading.setAttribute("tabindex", "0");

    const ids = drawer.panels.map((panel, i) => {
      panel.classList.add("everlooms-fdrawer__panel");
      if (!panel.id) panel.id = "everlooms-fdrawer-panel-" + index + "-" + i;
      return panel.id;
    });
    drawer.heading.setAttribute("aria-controls", ids.join(" "));

    // Start collapsed.
    setOpen(drawer, false);
  }

  function disable(drawer) {
    drawer.block.classList.remove("everlooms-fdrawer", "is-open");
    drawer.heading.classList.remove("everlooms-fdrawer__heading");
    ["role", "tabindex", "aria-expanded", "aria-controls"].forEach((attr) => {
      drawer.heading.removeAttribute(attr);
    });
    drawer.panels.forEach((panel) => {
      panel.classList.remove("everlooms-fdrawer__panel");
      panel.removeAttribute("aria-hidden");
    });
  }

  function sync() {
    drawers = collect();
    drawers.forEach((drawer, index) => {
      if (mql.matches) {
        enable(drawer, index);
      } else {
        disable(drawer);
      }
    });
  }

  function toggleFrom(target) {
    if (!mql.matches) return false;

    const heading = target.closest && target.closest(".everlooms-fdrawer__heading");
    if (!heading) return false;

    const block = heading.closest(".everlooms-fdrawer");
    const drawer = drawers.find((item) => item.block === block);
    if (!drawer) return false;

    setOpen(drawer, !block.classList.contains("is-open"));
    return true;
  }

  // Delegated so the handlers survive theme-editor section re-renders.
  document.addEventListener("click", (event) => {
    toggleFrom(event.target);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " " && event.key !== "Spacebar") return;
    if (toggleFrom(event.target)) event.preventDefault();
  });

  if (mql.addEventListener) {
    mql.addEventListener("change", sync);
  } else {
    mql.addListener(sync);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", sync);
  } else {
    sync();
  }

  document.addEventListener("shopify:section:load", sync);
})();
