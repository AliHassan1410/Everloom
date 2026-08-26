// Populates the Wishlist page grid client-side: reads saved product handles
// from localStorage (via window.EverloomsWishlist) and resolves each one
// through Shopify's public /products/{handle}.js AJAX endpoint. Cards use the
// same everlooms-card-actions heart button, so un-hearting one here removes
// it from view immediately via the everlooms:wishlist:change event.
(function () {
  function formatPrice(cents) {
    const amount = cents / 100;
    return "Rs." + amount.toLocaleString("en-US", { maximumFractionDigits: 2 });
  }

  function buildHeartButton(handle) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "everlooms-card-actions__button everlooms-card-actions__button--wishlist";
    button.setAttribute("data-everlooms-wishlist-toggle", "");
    button.setAttribute("data-product-handle", handle);
    button.setAttribute("aria-pressed", "true");
    button.setAttribute("aria-label", "Remove from wishlist");

    const span = document.createElement("span");
    span.className = "svg-wrapper";
    span.setAttribute("aria-hidden", "true");
    span.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" /></svg>';
    button.appendChild(span);
    return button;
  }

  function buildCard(product) {
    const li = document.createElement("li");
    li.className = "everlooms-wishlist-card";
    li.dataset.productHandle = product.handle;

    const media = document.createElement("a");
    media.className = "everlooms-wishlist-card__media";
    media.href = product.url;

    const img = document.createElement("img");
    img.src = product.featured_image || (product.images && product.images[0]) || "";
    img.alt = product.title;
    img.loading = "lazy";
    img.width = 600;
    img.height = 800;
    media.appendChild(img);

    const actions = document.createElement("div");
    actions.className = "everlooms-card-actions";
    actions.appendChild(buildHeartButton(product.handle));

    const details = document.createElement("div");
    details.className = "everlooms-wishlist-card__details";

    if (product.type) {
      const category = document.createElement("p");
      category.className = "everlooms-wishlist-card__category";
      category.textContent = product.type;
      details.appendChild(category);
    }

    const title = document.createElement("h3");
    title.className = "everlooms-wishlist-card__title";
    const titleLink = document.createElement("a");
    titleLink.href = product.url;
    titleLink.textContent = product.title;
    title.appendChild(titleLink);
    details.appendChild(title);

    const price = document.createElement("p");
    price.className = "everlooms-wishlist-card__price";
    const onSale = product.compare_at_price && product.compare_at_price > product.price;
    if (onSale) {
      const compare = document.createElement("span");
      compare.className = "everlooms-wishlist-card__price--compare";
      compare.textContent = formatPrice(product.compare_at_price);
      price.appendChild(compare);
    }
    const current = document.createElement("span");
    current.className = "everlooms-wishlist-card__price--current";
    current.textContent = formatPrice(product.price);
    price.appendChild(current);
    details.appendChild(price);

    li.appendChild(media);
    li.appendChild(actions);
    li.appendChild(details);
    return li;
  }

  function updateEmptyState(grid, empty) {
    const hasCards = grid.children.length > 0;
    empty.hidden = hasCards;
    grid.hidden = !hasCards;
  }

  async function init() {
    const grid = document.getElementById("everlooms-wishlist-grid");
    const empty = document.getElementById("everlooms-wishlist-empty");
    if (!grid || !empty || !window.EverloomsWishlist) return;

    const handles = window.EverloomsWishlist.readWishlist();
    updateEmptyState(grid, empty);

    if (handles.length === 0) return;

    const results = await Promise.allSettled(
      handles.map((handle) => fetch("/products/" + encodeURIComponent(handle) + ".js").then((res) => {
        if (!res.ok) throw new Error("Not found: " + handle);
        return res.json();
      })),
    );

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        grid.appendChild(buildCard(result.value));
      }
    });

    window.EverloomsWishlist.initButtons(grid);
    updateEmptyState(grid, empty);
  }

  document.addEventListener("everlooms:wishlist:change", (event) => {
    const grid = document.getElementById("everlooms-wishlist-grid");
    const empty = document.getElementById("everlooms-wishlist-empty");
    if (!grid || !empty) return;
    if (event.detail.active) return;

    const card = grid.querySelector('[data-product-handle="' + CSS.escape(event.detail.handle) + '"]');
    if (card) card.remove();
    updateEmptyState(grid, empty);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
