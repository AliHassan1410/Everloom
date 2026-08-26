// Adds a "Clear" link next to the (first) variant option's label on the
// product page, matching the Everlooms React storefront's size selector.
// Clearing reloads the page at its base URL (stripping ?variant=), which is
// a safe, guaranteed-correct reset without hooking into Horizon's internal
// variant-picker state machine.
(function () {
  function addClearLink(legend) {
    if (legend.querySelector(".everlooms-variant-clear")) return;

    const link = document.createElement("a");
    link.href = window.location.pathname;
    link.className = "everlooms-variant-clear";
    link.textContent = "Clear";
    legend.appendChild(link);
  }

  function init() {
    document.querySelectorAll("variant-picker fieldset[data-option-id]").forEach((fieldset, index) => {
      if (index > 0) return;
      const legend = fieldset.querySelector(":scope > legend");
      if (legend) addClearLink(legend);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  document.addEventListener("shopify:section:load", init);
})();
