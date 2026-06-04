let ALL_ITEMS = [];
let MIXER_RECIPES = {};
let activeCategory = "All";
let searchQuery = "";
let expandedSections = new Map();

const SOURCE_LABELS = {
  mixer: { label: "Mixer" },
  dispenser: { label: "Dispenser" },
  quest: { label: "Quest" },
  shop: { label: "Shop" },
  drop: { label: "Drop" },
  event: { label: "Event" },
};

const BUFF_COLORS = {
  "Capacity Bonus": {
    bg: "rgba(100,181,246,0.12)",
    border: "rgba(100,181,246,0.35)",
    text: "#82c8f0",
  },
  "Energy Bonus": {
    bg: "rgba(100,181,246,0.12)",
    border: "rgba(100,181,246,0.35)",
    text: "#82c8f0",
  },
  Movespeed: {
    bg: "rgba(122,184,96,0.12)",
    border: "rgba(122,184,96,0.35)",
    text: "#9ed080",
  },
  "Red Pollen": {
    bg: "rgba(212,96,96,0.12)",
    border: "rgba(212,96,96,0.35)",
    text: "#e88080",
  },
  "Blue Pollen": {
    bg: "rgba(100,181,246,0.12)",
    border: "rgba(100,181,246,0.35)",
    text: "#82c8f0",
  },
  "White Pollen": {
    bg: "rgba(220,220,220,0.1)",
    border: "rgba(220,220,220,0.3)",
    text: "#d8d8d8",
  },
  Pollen: {
    bg: "rgba(220,220,220,0.1)",
    border: "rgba(220,220,220,0.3)",
    text: "#d8d8d8",
  },
  "Honey Bonus": {
    bg: "rgba(232,192,64,0.12)",
    border: "rgba(232,192,64,0.35)",
    text: "#e8c040",
  },
  "Convert Rate": {
    bg: "rgba(206,147,216,0.12)",
    border: "rgba(206,147,216,0.35)",
    text: "#ce93d8",
  },
  "Convert Amount": {
    bg: "rgba(206,147,216,0.12)",
    border: "rgba(206,147,216,0.35)",
    text: "#ce93d8",
  },
  "Bee Attack": {
    bg: "rgba(255,160,0,0.12)",
    border: "rgba(255,160,0,0.35)",
    text: "#ffa000",
  },
};

const DEFAULT_BUFF_COLOR = {
  bg: "rgba(232,192,64,0.08)",
  border: "rgba(232,192,64,0.25)",
  text: "#c8a84e",
};

function formatBuffValue(buff) {
  if (buff.type === "Mult") {
    const mult = (1 + buff.value).toFixed(2).replace(/\.?0+$/, "");
    return `${mult}x`;
  }
  return `+${buff.value}`;
}

function formatDuration(seconds) {
  if (!seconds) return "";
  const mins = Math.round(seconds / 60);
  return `${mins} min`;
}

function buildBuffContent(buffs, time) {
  if (!buffs || buffs.length === 0) return "";
  const timeHtml = time
    ? `<div class="item-buff-duration">${escHtml(formatDuration(time))}</div>`
    : "";
  const chips = buffs
    .map((b) => {
      const col = BUFF_COLORS[b.name] || DEFAULT_BUFF_COLOR;
      return `<span class="item-buff-chip" style="background:${col.bg};border-color:${col.border};color:${col.text}">
      <span class="item-buff-val">${escHtml(formatBuffValue(b))}</span>
      <span class="item-buff-name">${escHtml(b.name)}</span>
    </span>`;
    })
    .join("");
  return `${timeHtml}<div class="item-buff-chips">${chips}</div>`;
}

function buildRecipeContent(recipe) {
  return recipe
    .map(
      (ing) => `
    <div class="item-recipe-row">
      <img src="${escHtml(ing.image)}" alt="${escHtml(ing.item)}" width="28" height="28"
        loading="lazy" onerror="this.onerror=null;this.style.opacity='0.3';" />
      <span class="item-recipe-name">${escHtml(ing.item)}</span>
      <span class="item-recipe-qty">×${ing.amount.toLocaleString()}</span>
    </div>
  `,
    )
    .join("");
}

function buildSourcesContent(item) {
  const sources = item.sources || [];
  if (sources.length === 0) return "";

  let html = `<div class="item-sources">`;
  for (const src of sources) {
    const meta = SOURCE_LABELS[src.type] || { label: src.type };
    let labelText = src.name || src.mixerName || meta.label;
    html += `<span class="item-source-tag">${escHtml(labelText)}</span>`;
  }
  html += `</div>`;
  return html;
}

function getRecipeForItem(item) {
  const hasMixerSource = (item.sources || []).some((s) => s.type === "mixer");
  if (!hasMixerSource) return null;
  const mixerKey = item.name.toLowerCase();
  return (
    MIXER_RECIPES[mixerKey] || MIXER_RECIPES[item.id.toLowerCase()] || null
  );
}

function hasItemBuffs(item) {
  return item.buffs && item.buffs.length > 0;
}

function hasItemSources(item) {
  return item.sources && item.sources.length > 0;
}

function hasItemRecipe(item) {
  return getRecipeForItem(item) !== null;
}

function getSectionOpenState(itemId, section) {
  const sections = expandedSections.get(itemId);
  return sections ? sections.has(section) : false;
}

function toggleSection(itemId, section) {
  let sections = expandedSections.get(itemId);
  if (!sections) {
    sections = new Set();
    expandedSections.set(itemId, sections);
  }
  if (sections.has(section)) {
    sections.delete(section);
  } else {
    sections.add(section);
  }
}

function buildToggleSection(itemId, label, sectionKey, contentHtml) {
  if (!contentHtml) return "";
  const isOpen = getSectionOpenState(itemId, sectionKey);
  const openClass = isOpen ? " item-toggle--open" : "";
  return `
    <div class="item-toggle-section${openClass}" data-item-id="${escHtml(itemId)}" data-section="${sectionKey}">
      <div class="item-toggle-header" role="button" tabindex="0" aria-expanded="${isOpen}">
        <span class="item-toggle-label">${escHtml(label)}</span>
        <span class="item-toggle-chevron" aria-hidden="true">›</span>
      </div>
      <div class="item-toggle-body">${contentHtml}</div>
    </div>
  `;
}

function buildItemCard(item) {
  const rarityCls = "item-rarity-tag--" + item.rarity.replace(/\s+/g, "-");
  const id = item.id;

  const buffContent = buildBuffContent(item.buffs, item.time);
  const sourcesContent = buildSourcesContent(item);
  const recipe = getRecipeForItem(item);
  const recipeContent = recipe ? buildRecipeContent(recipe) : "";

  let sectionsHtml = "";
  sectionsHtml += buildToggleSection(id, "Buffs", "buffs", buffContent);
  sectionsHtml += buildToggleSection(
    id,
    "Obtainment Method",
    "sources",
    sourcesContent,
  );
  sectionsHtml += buildToggleSection(id, "Recipe", "recipe", recipeContent);

  return `
    <div class="item-card" data-id="${escHtml(id)}">
      <div class="item-card-main">
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
      ${sectionsHtml ? `<div class="item-toggle-sections">${sectionsHtml}</div>` : ""}
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
    bindToggleClicks(list);
  }
}

function bindToggleClicks(container) {
  container.addEventListener("click", (e) => {
    const header = e.target.closest(".item-toggle-header");
    if (!header) return;
    const section = header.closest(".item-toggle-section");
    if (!section) return;
    const itemId = section.dataset.itemId;
    const sectionKey = section.dataset.section;
    if (!itemId || !sectionKey) return;

    toggleSection(itemId, sectionKey);
    const isOpen = getSectionOpenState(itemId, sectionKey);
    section.classList.toggle("item-toggle--open", isOpen);
    header.setAttribute("aria-expanded", String(isOpen));
  });

  container.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      const header = e.target.closest(".item-toggle-header");
      if (!header) return;
      e.preventDefault();
      header.click();
    }
  });
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
    const [itemsRes, worldRes] = await Promise.all([
      fetch("data/items.json"),
      fetch("data/world.json"),
    ]);
    const itemsData = await itemsRes.json();
    const worldData = await worldRes.json();

    ALL_ITEMS = [...itemsData].sort((a, b) => a.order - b.order);

    for (const recipe of worldData.mixer || []) {
      MIXER_RECIPES[recipe.name.toLowerCase()] = recipe.recipe;
    }
  } catch (err) {
    console.error("Failed to load data:", err);
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
