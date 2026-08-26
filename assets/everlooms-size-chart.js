// Opens/closes the "Size Charts" dialog on the product page using the
// standard HTMLDialogElement API (showModal/close) for broad browser support.
(function () {
  function init() {
    document.querySelectorAll("[data-everlooms-size-chart-open]").forEach((button) => {
      if (button.dataset.everloomsSizeChartInit) return;
      button.dataset.everloomsSizeChartInit = "true";

      button.addEventListener("click", () => {
        const dialog = document.getElementById(button.dataset.everloomsSizeChartOpen);
        if (dialog && typeof dialog.showModal === "function") dialog.showModal();
      });
    });

    document.querySelectorAll("[data-everlooms-size-chart-close]").forEach((button) => {
      if (button.dataset.everloomsSizeChartCloseInit) return;
      button.dataset.everloomsSizeChartCloseInit = "true";

      button.addEventListener("click", () => {
        const dialog = button.closest("dialog");
        if (dialog) dialog.close();
      });
    });

    document.querySelectorAll(".everlooms-size-chart__dialog").forEach((dialog) => {
      if (dialog.dataset.everloomsSizeChartBackdropInit) return;
      dialog.dataset.everloomsSizeChartBackdropInit = "true";

      dialog.addEventListener("click", (event) => {
        if (event.target === dialog) dialog.close();
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
