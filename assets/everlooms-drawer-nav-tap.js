// Mobile drawer: tapping the top-level "MEN"/"WOMEN" label navigates straight to that
// item's own page instead of only expanding the submenu - matching desktop, where the
// word is a plain link and only the chevron icon opens the dropdown (see
// everlooms-nav-dropdown-v2.js). Horizon's <summary> here toggles open on any tap by
// default (drawer_accordion setting, snippets/header-drawer.liquid), so tapping the
// label has to stop that click from reaching the summary and navigate manually instead.
(function () {
  function init() {
    document.querySelectorAll("[data-everlooms-drawer-nav-url]").forEach((label) => {
      if (label.dataset.everloomsDrawerNavInit) return;
      label.dataset.everloomsDrawerNavInit = "true";

      label.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        window.location.href = label.dataset.everloomsDrawerNavUrl;
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  document.addEventListener("shopify:section:load", init);
})();
