// Adds a "View more" toggle to the /collections/men and /collections/women
// product grids, revealing 12 more products per click instead of Shopify's
// classic reload pagination. Re-applies itself whenever the facets/filter
// system replaces the grid (AJAX section re-render), since that wipes out
// any classes/elements this script previously added.
(function () {
  const BATCH_SIZE = 12;
  const SECTION_IDS = ["shopify-section-gender_shop_all_men", "shopify-section-gender_shop_all_women"];
  const HIDDEN_CLASS = "everlooms-view-more-hidden";

  const observers = new WeakMap();
  const state = new WeakMap();

  function withObserverPaused(sectionEl, fn) {
    const observer = observers.get(sectionEl);
    if (observer) observer.disconnect();
    fn();
    if (observer) observer.observe(sectionEl, { childList: true, subtree: true });
  }

  function applyChunk(sectionEl, grid, visibleCount) {
    const items = Array.from(grid.querySelectorAll(":scope > .product-grid__item"));
    items.forEach((item, i) => item.classList.toggle(HIDDEN_CLASS, i >= visibleCount));

    let wrap = sectionEl.querySelector(":scope > .everlooms-view-more-wrap");

    if (items.length <= visibleCount) {
      if (wrap) wrap.remove();
      return;
    }

    if (wrap) return;

    wrap = document.createElement("div");
    wrap.className = "everlooms-view-more-wrap";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "button-secondary everlooms-view-more-button";
    button.textContent = "View more";

    button.addEventListener("click", () => {
      const current = state.get(sectionEl) || BATCH_SIZE;
      const next = current + BATCH_SIZE;
      state.set(sectionEl, next);
      withObserverPaused(sectionEl, () => applyChunk(sectionEl, grid, next));
    });

    wrap.appendChild(button);
    grid.insertAdjacentElement("afterend", wrap);
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

  function init() {
    for (const id of SECTION_IDS) {
      const section = document.getElementById(id);
      if (section) setupSection(section);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
