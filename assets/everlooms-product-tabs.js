// Simple click-to-switch tabs for the product page's Description /
// Additional information / Reviews panels.
(function () {
  function setupTabs(wrapper) {
    if (wrapper.dataset.everloomsTabsInit) return;
    wrapper.dataset.everloomsTabsInit = "true";

    const tabs = wrapper.querySelectorAll("[data-everlooms-tab]");
    const panels = wrapper.querySelectorAll("[data-everlooms-panel]");

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const target = tab.dataset.everloomsTab;

        tabs.forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
        panels.forEach((panel) => {
          panel.hidden = panel.dataset.everloomsPanel !== target;
        });
      });
    });
  }

  function init() {
    document.querySelectorAll(".everlooms-product-tabs").forEach(setupTabs);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  document.addEventListener("shopify:section:load", init);
})();
