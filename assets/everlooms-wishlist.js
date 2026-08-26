// Lightweight client-side wishlist: persists liked product handles in
// localStorage and toggles the heart icon's pressed state on product cards.
// Exposes window.EverloomsWishlist so the wishlist page script can reuse the
// same toggle/init logic for its dynamically-built cards.
(function () {
  const STORAGE_KEY = "everlooms:wishlist";

  function readWishlist() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function writeWishlist(handles) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(handles));
    } catch (e) {
      // storage unavailable, ignore
    }
  }

  function syncButton(button) {
    const handle = button.dataset.productHandle;
    const active = readWishlist().includes(handle);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  }

  function toggle(button) {
    const handle = button.dataset.productHandle;
    if (!handle) return;

    const wishlist = readWishlist();
    const index = wishlist.indexOf(handle);
    const active = index === -1;

    if (active) {
      wishlist.push(handle);
    } else {
      wishlist.splice(index, 1);
    }
    writeWishlist(wishlist);

    document
      .querySelectorAll('[data-everlooms-wishlist-toggle][data-product-handle="' + CSS.escape(handle) + '"]')
      .forEach(syncButton);

    document.dispatchEvent(new CustomEvent("everlooms:wishlist:change", { detail: { handle, active } }));
  }

  function initButtons(root) {
    (root || document).querySelectorAll("[data-everlooms-wishlist-toggle]").forEach((button) => {
      syncButton(button);
      if (button.dataset.everloomsWishlistInit) return;
      button.dataset.everloomsWishlistInit = "true";
      button.addEventListener("click", (event) => {
        event.preventDefault();
        toggle(button);
      });
    });
  }

  window.EverloomsWishlist = { readWishlist, initButtons };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initButtons());
  } else {
    initButtons();
  }

  document.addEventListener("shopify:section:load", () => initButtons());
})();
