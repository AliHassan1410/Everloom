// Adds a "View more" / "View less" toggle to the /collections/men and
// /collections/women product grids, revealing 12 more products per click
// instead of Shopify's classic reload pagination. Re-applies itself
// whenever the facets/filter system replaces the grid (AJAX section
// re-render), since that wipes out any classes/elements this script
// previously added.
(function () {
  const BATCH_SIZE = 12;
  const HIDDEN_CLASS = "everlooms-view-more-hidden";

  const observers = new WeakMap();
  const state = new WeakMap();
  // Tracks the wrap/button this script created per section directly, rather
  // than re-querying the DOM for them - a DOM query for "does a wrap already
  // exist" is fragile here (the wrap is a sibling of the grid, which isn't
  // necessarily a direct child of sectionEl, so a :scope-qualified search
  // for it can miss it and create a second one on every re-run).
  const wraps = new WeakMap();

  function withObserverPaused(sectionEl, fn) {
    const observer = observers.get(sectionEl);
    if (observer) observer.disconnect();
    fn();
    if (observer) observer.observe(sectionEl, { childList: true, subtree: true });
  }

  function applyChunk(sectionEl, grid, visibleCount) {
    const items = Array.from(grid.querySelectorAll(":scope > .product-grid__item"));
    items.forEach((item, i) => item.classList.toggle(HIDDEN_CLASS, i >= visibleCount));

    if (items.length <= BATCH_SIZE) {
      const existing = wraps.get(sectionEl);
      if (existing) {
        existing.remove();
        wraps.delete(sectionEl);
      }
      return;
    }

    const isExpanded = visibleCount >= items.length;
    let entry = wraps.get(sectionEl);

    if (!entry) {
      const wrap = document.createElement("div");
      wrap.className = "everlooms-view-more-wrap";

      const button = document.createElement("button");
      button.type = "button";
      button.className = "button-secondary everlooms-view-more-button";

      button.addEventListener("click", () => {
        const current = state.get(sectionEl) || BATCH_SIZE;
        const currentItems = grid.querySelectorAll(":scope > .product-grid__item").length;
        const next = current >= currentItems ? BATCH_SIZE : current + BATCH_SIZE;
        state.set(sectionEl, next);
        withObserverPaused(sectionEl, () => applyChunk(sectionEl, grid, next));
      });

      wrap.appendChild(button);
      grid.insertAdjacentElement("afterend", wrap);
      entry = { wrap, button };
      wraps.set(sectionEl, entry);
    }

    entry.button.textContent = isExpanded ? "View less" : "View more";
  }

  function setupSection(sectionEl) {
    const observer = new MutationObserver(() => {
      const grid = sectionEl.querySelector(".product-grid");
      if (!grid) return;
      state.set(sectionEl, BATCH_SIZE);
      withObserverPaused(sectionEl, () => applyChunk(sectionEl, grid, BATCH_SIZE));
    });
    observers.set(sectionEl, observer);

    // Always start observing, even if the grid isn't in the DOM yet - if it
    // was only attached when the grid already existed, a grid that renders
    // even slightly asynchronously (AJAX section re-render, filter results)
    // would mean the observer never gets attached at all and "View more"
    // silently never activates for the rest of the page's lifetime.
    observer.observe(sectionEl, { childList: true, subtree: true });

    const grid = sectionEl.querySelector(".product-grid");
    if (!grid) return;

    state.set(sectionEl, BATCH_SIZE);
    withObserverPaused(sectionEl, () => applyChunk(sectionEl, grid, BATCH_SIZE));
  }

  // Finds the grid(s) directly instead of guessing the exact
  // shopify-section-<id> wrapper id (JSON template section ids aren't
  // guaranteed to match the key written in the template file verbatim, and
  // this script only ever loads on men/women pages anyway, where a
  // ".product-grid" match is unambiguous).
  function init() {
    const grids = document.querySelectorAll(".product-grid");
    grids.forEach((grid) => {
      const sectionEl = grid.closest('[id^="shopify-section-"]') || grid.parentElement;
      if (sectionEl) setupSection(sectionEl);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
