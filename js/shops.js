async function loadShops() {
  const container = document.getElementById("shops-list");

  if (!container) {
    return;
  }

  try {
    const response = await fetch("data/shops.json");
    if (!response.ok) {
      throw new Error("Failed to load shops data.");
    }

    const payload = await response.json();
    const shops = Array.isArray(payload.shops) ? payload.shops : [];

    if (!shops.length) {
      container.innerHTML =
        '<p class="shops-empty">No shops available yet.</p>';
      return;
    }

    container.innerHTML = shops.map(renderShopCard).join("");
  } catch (error) {
    console.error(error);
    container.innerHTML =
      '<p class="shops-empty">Could not load shops right now.</p>';
  }
}

function normalizeShopHref(path, id) {
  try {
    if (!path) return `shop.html?shop=${encodeURIComponent(id || "")}`;
    const parts = path.split("?");
    const query = parts[1]
      ? "?" + parts[1]
      : `?shop=${encodeURIComponent(id || "")}`;
    return `shop.html${query}`;
  } catch {
    return `shop.html?shop=${encodeURIComponent(id || "")}`;
  }
}

function renderTags(tags) {
  if (!Array.isArray(tags) || !tags.length) {
    return "";
  }

  return tags
    .map((tag) => `<span class="shop-tag">${escapeHtml(tag)}</span>`)
    .join("");
}

function renderShopCard(shop) {
  const href = normalizeShopHref(shop.path, shop.id);
  const tags = renderTags(shop.tags);
  const image = escapeHtml(shop.image || "images/ui/site-logo.png");
  const name = escapeHtml(shop.name || "Unknown Shop");
  const location = escapeHtml(shop.location || "Unknown location");
  const description = escapeHtml(
    shop.description || "No description available.",
  );

  return `
    <a class="shop-card-link-wrap" href="${href}" style="text-decoration: none; display: block">
      <div class="shop-card">
        <div class="shop-card-img">
          <img
            src="${image}"
            alt="${name}"
            onerror="this.onerror=null;this.src='images/ui/site-logo.png';"
          />
        </div>

        <div class="shop-card-body">
          <div class="shop-card-header">
            <div class="shop-card-name">${name}</div>
            <div class="shop-card-location">${location}</div>
          </div>

          <p class="shop-card-desc">${description}</p>

          <div class="shop-card-tags">${tags}</div>

          <div class="shop-card-link">View full details -></div>
        </div>
      </div>
    </a>
  `;
}

document.addEventListener("DOMContentLoaded", loadShops);
