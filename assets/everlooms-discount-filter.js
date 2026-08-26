// Drives the "Discount" / On Sale checkbox in the filters drawer, using
// Shopify's native tag-in-URL collection filtering (/collections/{handle}/sale)
// instead of a filter query param, since Shopify has no built-in discount
// filter type. A full navigation (not AJAX) is used since this changes the
// collection URL itself, not just a query string - the target URL preserves
// the current query string so it combines correctly with any active real
// filters, sort order, and pagination.
//
// Also collapses every filter accordion in the drawer by default: Horizon's
// list-filter.liquid/the custom Discount panel both render <details open>
// when filter_style is 'vertical' (which the drawer always uses), so every
// section starts expanded unless overridden here.
(function () {
  const REOPEN_KEY = "everlooms-filters-reopen";

  // The Discount toggle is a full navigation (changing the URL path, not
  // just a query param), which necessarily closes the drawer along with the
  // rest of the page's JS state - without this, the user has to manually
  // reopen "Filters" every time just to pick a second filter alongside
  // Discount. A sessionStorage flag survives the reload so the drawer can
  // reopen itself automatically once the new page's JS runs.
  function initDiscountToggle() {
    document.querySelectorAll("[data-everlooms-discount-toggle]").forEach((checkbox) => {
      if (checkbox.dataset.everloomsDiscountInit) return;
      checkbox.dataset.everloomsDiscountInit = "true";

      checkbox.addEventListener("change", () => {
        try {
          sessionStorage.setItem(REOPEN_KEY, "true");
        } catch (e) {
          // storage unavailable, drawer just won't auto-reopen
        }
        const base = checkbox.checked ? checkbox.dataset.urlOn : checkbox.dataset.urlOff;
        window.location.href = base + window.location.search;
      });
    });
  }

  function reopenAfterDiscountNavigation() {
    const drawer = document.getElementById("filters-drawer");
    if (!drawer || drawer.dataset.everloomsReopenInit) return;
    drawer.dataset.everloomsReopenInit = "true";

    let shouldReopen = false;
    try {
      shouldReopen = sessionStorage.getItem(REOPEN_KEY) === "true";
      sessionStorage.removeItem(REOPEN_KEY);
    } catch (e) {
      // storage unavailable
    }

    if (shouldReopen && typeof drawer.open === "function") drawer.open();
  }

  function collapseFilterPanels() {
    const drawer = document.getElementById("filters-drawer");
    if (!drawer || drawer.dataset.everloomsCollapseInit) return;
    drawer.dataset.everloomsCollapseInit = "true";

    drawer.querySelectorAll(".facets__panel[open]").forEach((panel) => {
      panel.removeAttribute("open");
    });
  }

  // Horizon's native click-outside-to-close only works in its "modal" mode
  // (narrow viewports, real ::backdrop). On wide viewports it normally uses
  // a non-modal "squeeze" mode instead (no backdrop, so outside clicks never
  // reach the drawer's own click listener) - since the squeeze itself is
  // disabled for this drawer (see the CSS margin-right override), outside
  // clicks need their own handler here so the drawer can still be dismissed
  // by clicking anywhere outside it, on every viewport size.
  function initClickOutsideToClose() {
    const drawer = document.getElementById("filters-drawer");
    if (!drawer || drawer.dataset.everloomsClickOutsideInit) return;
    drawer.dataset.everloomsClickOutsideInit = "true";

    document.addEventListener("click", (event) => {
      const dialog = drawer.querySelector(".theme-drawer__dialog");
      if (!dialog || !dialog.hasAttribute("open")) return;
      if (dialog.contains(event.target)) return;
      if (event.target.closest(".facets-toggle__button")) return;
      if (typeof drawer.close === "function") drawer.close();
    });
  }

  function init() {
    initDiscountToggle();
    collapseFilterPanels();
    initClickOutsideToClose();
    reopenAfterDiscountNavigation();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  document.addEventListener("shopify:section:load", init);
})();
