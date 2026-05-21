let ALL_ITEMS = [];
let activeCategory = "All";
let searchQuery = "";

function escHtml(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildItemCard(item) {
  const rarityCls = "item-rarity-tag--" + item.rarity.replace(/\s+/g, "-");
  return `
    <div class="item-card">
      <div class="item-card-img">
        <img
          src="${escHtml(item.image)}"
          alt="${escHtml(item.name)}"
          onerror="this.onerror=null;this.src='images/ui/site-logo.png';"
          loading="lazy"
        />
      </div>
      <div class="item-card-name">${escHtml(item.name)}</div>
      <div class="item-card-desc">${escHtml(item.desc)}</div>
      <div class="item-card-footer">
        <span class="item-rarity-tag ${rarityCls}">${escHtml(item.rarity)}</span>
        <span class="item-category-tag">${escHtml(item.category)}</span>
      </div>
    </div>
  `;
}

function renderItems() {
  const list = document.getElementById("items-list");
  const empty = document.getElementById("items-empty");
  if (!list) return;

  const q = searchQuery.trim().toLowerCase();

  const filtered = ALL_ITEMS.filter((item) => {
    const catMatch =
      activeCategory === "All" || item.category === activeCategory;
    if (!catMatch) return false;
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.rarity.toLowerCase().includes(q)
    );
  });

  if (filtered.length === 0) {
    list.innerHTML = "";
    empty.style.display = "";
  } else {
    empty.style.display = "none";
    list.innerHTML = filtered.map(buildItemCard).join("");
  }
}

function buildCategoryFilters() {
  const wrap = document.getElementById("items-category-filters");
  if (!wrap) return;

  const categories = ["All", ...new Set(ALL_ITEMS.map((i) => i.category))];

  wrap.innerHTML = categories
    .map((cat) => {
      const active = cat === activeCategory ? " active" : "";
      return `<button class="items-filter-btn${active}" data-cat="${escHtml(cat)}">${escHtml(cat)}</button>`;
    })
    .join("");

  wrap.querySelectorAll(".items-filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.cat;
      wrap
        .querySelectorAll(".items-filter-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderItems();
    });
  });
}

async function initItems() {
  try {
    const res = await fetch("data/items.json");
    const data = await res.json();
    ALL_ITEMS = [...data].sort((a, b) => a.order - b.order);
  } catch (err) {
    console.error("Failed to load items.json:", err);
    ALL_ITEMS = [];
  }

  buildCategoryFilters();
  renderItems();

  const searchEl = document.getElementById("item-search");
  if (searchEl) {
    searchEl.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderItems();
    });
    searchEl.addEventListener("keyup", (e) => {
      if (e.key === "Escape") {
        searchEl.value = "";
        searchQuery = "";
        renderItems();
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", initItems);
