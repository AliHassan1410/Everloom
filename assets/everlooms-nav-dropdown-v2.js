// Replaces Horizon's native full-bleed mega-menu panel with a small, plain
// dropdown for header nav items that have sub-links (MEN, WOMEN, MY ACCOUNT),
// matching the Everlooms React storefront's NavDropdown.
//
// Built as a fully independent overlay appended to <body> and positioned via
// getBoundingClientRect(), rather than as children inserted into the native
// menu markup: Horizon's <overflow-list> uses declarative Shadow DOM
// (<template shadowrootmode="open">) with slot-based reflow, which was
// silently dropping/hiding elements appended into that structure (both a
// ::after pseudo-element and a real inserted <span> chevron got lost the
// same way). Reading the trigger's rendered position instead sidesteps that
// entirely - it works regardless of whatever the native component does
// internally, since getBoundingClientRect() reflects wherever the browser
// actually placed the element, shadow DOM or not.
(function () {
  function buildTrigger(listItem, submenu) {
    if (listItem.dataset.everloomsDropdownInit) return;

    const links = Array.from(submenu.querySelectorAll("a"))
      .map((a) => ({ href: a.getAttribute("href"), text: a.textContent.trim() }))
      .filter((link) => link.text.length > 0);
    if (links.length === 0) return;

    const trigger = listItem.querySelector(":scope > .menu-list__link");
    if (!trigger) return;

    listItem.dataset.everloomsDropdownInit = "true";

    const chevron = document.createElement("span");
    chevron.className = "everlooms-chevron-overlay";
    chevron.setAttribute("aria-hidden", "true");
    chevron.innerHTML =
      '<svg width="10" height="10" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 5.5L7 9.5L3 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    document.body.appendChild(chevron);

    const panel = document.createElement("div");
    panel.className = "everlooms-dropdown";
    links.forEach((link, index) => {
      const a = document.createElement("a");
      a.href = link.href || "#";
      a.textContent = link.text;
      a.className = "everlooms-dropdown__link" + (index === 0 ? " everlooms-dropdown__link--bold" : "");
      panel.appendChild(a);
    });
    document.body.appendChild(panel);

    // position: fixed (viewport-relative, no scroll offset needed) rather
    // than absolute (document-relative): if getBoundingClientRect() ever
    // returns an unexpectedly large value, an absolutely-positioned element
    // placed far outside the viewport can widen the page's own scrollable
    // width, whereas a fixed element is always clipped to the viewport and
    // can never do that.
    function updatePosition() {
      const rect = trigger.getBoundingClientRect();

      chevron.style.left = rect.right - 8 + "px";
      chevron.style.top = rect.top + rect.height / 2 + "px";

      panel.style.left = rect.left + "px";
      panel.style.top = rect.bottom + 8 + "px";
    }

    let hideTimeout;
    function show() {
      clearTimeout(hideTimeout);
      updatePosition();
      panel.classList.add("everlooms-dropdown--open");
    }
    function scheduleHide() {
      hideTimeout = setTimeout(() => panel.classList.remove("everlooms-dropdown--open"), 150);
    }

    // The chevron/panel are position: fixed overlays appended to <body>, so
    // they don't move when the sticky header hides/reveals itself via
    // transform on scroll - only the real nav text inside the header does.
    // Re-reading the trigger's rect on scroll (rAF-throttled) keeps them
    // glued to it instead of visibly lagging behind.
    //
    // Horizon's own header listens for scroll on different targets depending
    // on viewport (see assets/scroll-container.js getScrollEventTarget):
    // `.page-wrapper` scrolls internally in the desktop "squeeze" layout
    // (>=990px), while `document`/window only ever scrolls on mobile. A
    // listener on window alone never fires at all on desktop, which is
    // exactly where this hover dropdown is used - so both targets are bound
    // here; whichever one isn't the active scroll container simply never
    // fires, which is harmless.
    let scrollTicking = false;
    function onScroll() {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(() => {
        updatePosition();
        scrollTicking = false;
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true, capture: true });
    const pageWrapper = document.querySelector(".page-wrapper");
    if (pageWrapper) pageWrapper.addEventListener("scroll", onScroll, { passive: true });

    // Mouse: only the chevron icon opens the dropdown, not the word itself
    // (the word stays a plain link straight to the collection). Keyboard:
    // still opens on focusing the link, since the icon isn't a focusable
    // element and shouldn't be a separate tab stop just for this.
    chevron.addEventListener("mouseenter", show);
    chevron.addEventListener("mouseleave", scheduleHide);
    trigger.addEventListener("focusin", show);
    trigger.addEventListener("focusout", scheduleHide);
    panel.addEventListener("mouseenter", () => clearTimeout(hideTimeout));
    panel.addEventListener("mouseleave", scheduleHide);
  }

  // Desktop (>=990px) only - this is a hover dropdown built entirely around
  // mouseenter/mouseleave on a fixed-position overlay, for the .menu-list
  // nav row that Horizon only shows at that width. Below it, Horizon renders
  // a completely different header-drawer with its own native <details>/
  // <summary> accordion (see snippets/header-drawer.liquid) that already
  // opens correctly on tap with no JS from this file needed.
  //
  // This used to run unconditionally on every viewport: the .menu-list items
  // still exist in the DOM on mobile (just CSS-hidden), so it was building
  // this overlay there too. getBoundingClientRect() on a hidden trigger
  // returns a collapsed 0x0 rect, so the resulting chevron/panel landed
  // stacked at the top of the page instead of near "MEN"/"WOMEN" - a real,
  // click-catching overlay sitting on top of the mobile drawer, which is what
  // broke tapping "MEN"/"WOMEN" open in the drawer.
  function init() {
    if (!window.matchMedia("(min-width: 990px)").matches) return;
    document.querySelectorAll(".menu-list__list-item").forEach((listItem) => {
      const submenu = listItem.querySelector(":scope > .menu-list__submenu");
      if (submenu) buildTrigger(listItem, submenu);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  document.addEventListener("shopify:section:load", init);
})();
