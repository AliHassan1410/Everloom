// Adds a "View more" toggle to the "Popular picks" product grid on the Men/Women
// landing pages, revealing products 13-24 after the first 12 on click.
// Vanilla JS by design: keeps Horizon's core product-list.liquid untouched.
(function () {
  const VISIBLE_COUNT = 12;
  const SECTION_IDS = ["shopify-section-gender_products_men", "shopify-section-gender_products_women"];

  function init() {
    for (const id of SECTION_IDS) {
      const section = document.getElementById(id);
      if (!section) continue;

      const grid = section.querySelector(".resource-list");
      if (!grid) continue;

      const items = Array.from(grid.querySelectorAll(":scope > .resource-list__item"));
      if (items.length <= VISIBLE_COUNT) continue;

      const extraItems = items.slice(VISIBLE_COUNT);
      extraItems.forEach((item) => item.classList.add("everlooms-view-more-hidden"));

      const wrap = document.createElement("div");
      wrap.className = "everlooms-view-more-wrap";

      const button = document.createElement("button");
      button.type = "button";
      button.className = "button-secondary everlooms-view-more-button";
      button.textContent = "View more";

      button.addEventListener("click", () => {
        const expanded = button.getAttribute("aria-expanded") === "true";
        extraItems.forEach((item) => item.classList.toggle("everlooms-view-more-hidden", expanded));
        button.setAttribute("aria-expanded", String(!expanded));
        button.textContent = expanded ? "View more" : "View less";
      });

      button.setAttribute("aria-expanded", "false");
      wrap.appendChild(button);
      grid.insertAdjacentElement("afterend", wrap);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
