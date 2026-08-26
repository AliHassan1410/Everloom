// Drives autoplay for carousels built on Horizon's native <slideshow-component>
// (e.g. the "Shop by Category" carousel). The component itself is rendered
// with infinite: true in Liquid, so calling .next() at the last slide already
// wraps smoothly back to the first via Horizon's own placeholder-reorder
// scroll trick — this script only owns the timer, not the wrap logic.
(function () {
  const INTERVAL_MS = 2000;

  function setupAutoplay(el) {
    if (el.dataset.everloomsAutoplayInit) return;
    el.dataset.everloomsAutoplayInit = "true";

    let timer = null;

    function tick() {
      if (typeof el.next !== "function") return;
      el.next();
    }

    function start() {
      stop();
      timer = setInterval(tick, INTERVAL_MS);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    start();
    el.addEventListener("mouseenter", stop);
    el.addEventListener("mouseleave", start);
    el.addEventListener("focusin", stop);
    el.addEventListener("focusout", start);
  }

  function init() {
    document.querySelectorAll(".everlooms-autoplay-carousel").forEach(setupAutoplay);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Re-scan after Shopify section re-renders (filters, editor, etc.)
  document.addEventListener("shopify:section:load", init);
})();
