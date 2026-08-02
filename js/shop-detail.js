function highlightHoney(text) {
  return textToHtml(text).replace(
    /Honey/gi,
    '<span class="honey-word">$&</span>',
  );
}

function renderCost(item) {
  const entries = Array.isArray(item.costs)
    ? item.costs
    : item.cost
      ? [item.cost]
      : ["-"];

  if (!entries.length) {
    return "-";
  }

  if (entries.length === 1) {
    return highlightHoney(String(entries[0]));
  }

  const body = entries
    .slice(0, 5)
    .map((entry) => `<li>${highlightHoney(String(entry))}</li>`)
    .join("");

  return `<ul class="shop-cost-list">${body}</ul>`;
}

function renderItem(item) {
  const name = escapeHtml(item.name || "Unknown Item");
  const type = escapeHtml(item.type || "");
  const image = escapeHtml(item.image || "images/ui/site-logo.png");

  const elementId = item.name.replace(/\s+/g, "-");

  return `
    <div id="${elementId}" class="shop-item">
      <div class="shop-item-name">${name}</div>
      <div class="shop-item-type">${type}</div>
      <div class="shop-item-panel image-panel">
        <img
          src="${image}"
          alt="${name}"
          onerror="this.onerror=null;this.src='images/ui/site-logo.png';"
        />
      </div>
      <div class="shop-item-panels">
        <div class="shop-item-panel">
          <h4>Description</h4>
          <p>${textToHtml(item.description || "No description available.")}</p>
        </div>
        <div class="shop-item-panel">
          <h4>Info</h4>
          <p>${textToHtml(item.info || "No details available.")}</p>
        </div>
      </div>
      <div class="shop-item-panel cost-panel">
        <h4>Cost</h4>
        <p>${renderCost(item)}</p>
      </div>
      ${
        item.passives && item.passives.length
          ? `
      <div class="shop-item-panel passive-panel">
        <h4>Passive</h4>
        <div class="passive-list">
          ${item.passives
            .map(
              (p) => `
            <div class="passive-tag">
              <span class="passive-name">${escapeHtml(p.name)}</span>
              <span class="passive-type">(${escapeHtml(p.type)})</span>
              <p class="passive-desc">${escapeHtml(p.desc)}</p>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
      `
          : ""
      }
    </div>
  `;
}

function renderSection(section) {
  const title = escapeHtml(section.title || "Items");
  const description = escapeHtml(section.description || "");
  const items = Array.isArray(section.items) ? section.items : [];

  return `
    <div class="shop-section">
      <h2>${title}</h2>
      <p class="shop-section-desc">${description}</p>
      <div class="shop-grid">
        ${items.map(renderItem).join("")}
      </div>
    </div>
  `;
}

function renderShop(shop) {
  const title = shop.title || shop.name || "Shop";
  const heroTitle = document.getElementById("shop-title");
  const aboutText = document.getElementById("shop-about");
  const heroImage = document.getElementById("shop-image");
  const sectionsRoot = document.getElementById("shop-sections");

  if (!heroTitle || !aboutText || !heroImage || !sectionsRoot) {
    return;
  }

  document.title = title;
  heroTitle.textContent = title;
  aboutText.textContent = shop.about || "No shop description available.";
  heroImage.src = shop.image || "images/ui/site-logo.png";
  heroImage.alt = title;

  const sections = Array.isArray(shop.sections) ? shop.sections : [];
  sectionsRoot.innerHTML = sections.map(renderSection).join("");
}

function renderOtherShopsList(allShops, currentId) {
  const container = document.getElementById("other-shops-list");
  if (!container) return;

  const shops = Array.isArray(allShops) ? allShops : [];
  const others = shops.filter((s) => s.id !== currentId);

  if (!others.length) {
    container.textContent = "No other shops.";
    return;
  }

  container.innerHTML = others
    .map((s) => {
      const name = escapeHtml(s.name || s.title || s.id);
      const href = `shop.html?shop=${encodeURIComponent(s.id)}`;
      return `<a href="${href}" style="color:inherit;text-decoration:underline;">${name}</a>`;
    })
    .join(" · ");
}

async function loadShopDetail() {
  const params = new URLSearchParams(window.location.search);
  const shopId = params.get("shop") || "starter-shop";

  const state = document.getElementById("shop-sections");
  if (state) {
    state.innerHTML = '<p class="shops-empty">Loading shop data...</p>';
  }

  try {
    const response = await fetch("data/shops.json");
    if (!response.ok) {
      throw new Error("Failed to load shops data.");
    }

    const payload = await response.json();
    const shops = Array.isArray(payload.shops) ? payload.shops : [];
    const shop = shops.find((entry) => entry.id === shopId);

    if (!shop) {
      throw new Error(`Shop not found: ${shopId}`);
    }

    renderShop(shop);

    renderOtherShopsList(shops, shopId);
  } catch (error) {
    console.error(error);
    if (state) {
      state.innerHTML =
        '<p class="shops-empty">Could not load this shop right now.</p>';
    }
  }
}

document.addEventListener("DOMContentLoaded", loadShopDetail);

window.addEventListener("DOMContentLoaded", () => {
  if (window.location.hash) {
    setTimeout(() => {
      const targetId = decodeURIComponent(window.location.hash.substring(1));
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "center" });

        targetElement.style.outline = "2px solid var(--gold)";
        targetElement.style.boxShadow = "0 0 25px rgba(232, 192, 64, 0.4)";
        targetElement.style.transition = "all 0.5s ease";

        setTimeout(() => {
          targetElement.style.outline = "none";
          targetElement.style.boxShadow = "none";
        }, 2500);
      }
    }, 350);
  }
});
