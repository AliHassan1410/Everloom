// Size guide page tabs (Men's / Women's), mirroring the Everlooms React storefront's
// /size-guide page. Supports preselecting a tab via ?tab=men|women, matching the React
// page reading the same query param when linked from the PDP size chart modal.
(function () {
  function init() {
    document.querySelectorAll("[data-size-guide]").forEach((root) => {
      if (root.dataset.sizeGuideInit) return;
      root.dataset.sizeGuideInit = "true";

      const tabs = root.querySelectorAll("[data-size-guide-tab]");
      const panels = root.querySelectorAll("[data-size-guide-panel]");
      const fitProblems = root.querySelector("[data-size-guide-fit-problems]");

      function activate(tab) {
        tabs.forEach((button) => {
          const isActive = button.dataset.sizeGuideTab === tab;
          button.classList.toggle("is-active", isActive);
          button.setAttribute("aria-selected", isActive ? "true" : "false");
        });
        panels.forEach((panel) => {
          panel.hidden = panel.dataset.sizeGuidePanel !== tab;
        });
        if (fitProblems) fitProblems.hidden = tab !== "women";
      }

      tabs.forEach((button) => {
        button.addEventListener("click", () => {
          const tab = button.dataset.sizeGuideTab;
          activate(tab);
          const url = new URL(window.location.href);
          url.searchParams.set("tab", tab);
          window.history.replaceState({}, "", url);
        });
      });

      const requested = new URLSearchParams(window.location.search).get("tab");
      const initialTab = requested === "men" || requested === "women" ? requested : "women";
      activate(initialTab);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  document.addEventListener("shopify:section:load", init);
})();
