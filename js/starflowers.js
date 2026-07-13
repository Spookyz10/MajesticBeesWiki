const STARFLOWER_DURATION = {
  Basic: "3 minutes",
  Rare: "4 minutes",
  Epic: "5 minutes",
  Legendary: "7 minutes",
  Mythic: "8 minutes",
  Lunar: "4 minutes",
};

const FIELD_COLORS = {
  "White Field": {
    tab: "#c8dce8",
    active: "rgba(185,205,220,0.18)",
    border: "rgba(185,205,220,0.35)",
    tbody: "rgba(160,185,200,0.07)",
  },
  "Blue Field": {
    tab: "#88bedd",
    active: "rgba(60,110,165,0.28)",
    border: "rgba(80,130,175,0.38)",
    tbody: "rgba(40,90,145,0.14)",
  },
  "Red Field": {
    tab: "#d48880",
    active: "rgba(140,50,45,0.3)",
    border: "rgba(165,65,55,0.38)",
    tbody: "rgba(110,30,25,0.18)",
  },
  "Bamboo Field": {
    tab: "#78c882",
    active: "rgba(50,110,60,0.26)",
    border: "rgba(65,130,75,0.36)",
    tbody: "rgba(30,90,40,0.16)",
  },
  "Coconut Field": {
    tab: "#d4b054",
    active: "rgba(130,95,15,0.26)",
    border: "rgba(165,125,30,0.36)",
    tbody: "rgba(100,70,5,0.18)",
  },
  "Lemon Field": {
    tab: "#e0d060",
    active: "rgba(140,125,10,0.26)",
    border: "rgba(175,155,20,0.36)",
    tbody: "rgba(110,95,5,0.18)",
  },
};

const FIELD_ORDER = [
  "White Field",
  "Blue Field",
  "Red Field",
  "Bamboo Field",
  "Coconut Field",
  "Lemon Field",
];

function formatChance(value) {
  const n = Number(value);
  if (isNaN(n)) return value + "%";
  return parseFloat(n.toFixed(3)) + "%";
}

function localImg(src, size, alt) {
  return `<img src="${src}" alt="${alt}" width="${size}" height="${size}" loading="lazy" onerror="this.style.opacity='0.25';" />`;
}

function sfRarityIconPath(rarity) {
  if (!rarity) return "images/amulets/Star Amulet.png";
  const r = String(rarity).toLowerCase();
  if (r.includes("basic") || r.includes("common"))
    return "images/amulets/Star Amulet.png";
  if (r.includes("rare")) return "images/amulets/Rare Star Amulet.png";
  if (r.includes("epic")) return "images/amulets/Epic Star Amulet.png";
  if (r.includes("legend")) return "images/amulets/Legendary Star Amulet.png";
  if (r.includes("myth")) return "images/amulets/Mythic star Amulet.png";
  if (r.includes("lunar")) return "images/amulets/Lunar Amulet.png";
  return "images/amulets/Star Amulet.png";
}

function sfRarityIconTag(rarity, size = 18) {
  const src = sfRarityIconPath(rarity);
  return `<img class="sf-tier-rarity-icon" src="${src}" width="${size}" height="${size}" alt="${rarity} icon" loading="lazy" onerror="this.style.opacity='0.25'" />`;
}

function buildChances(chances) {
  const rows = chances
    .map(
      (c) => `
      <tr>
        <td>${c.tier}</td>
        <td>${typeof c.approxPct === "number" || /^\d+(?:\.\d+)?$/.test(String(c.approxPct)) ? c.approxPct + "%" : String(c.approxPct)}</td>
      </tr>`,
    )
    .join("");

  return `
    <div class="sf-section">
      <div class="sf-section-heading">Spawn Chances</div>
      <div class="sf-section-desc">
        When any Starflower is placed, the game rolls to decide which tier spawns.
      </div>
      <table class="sf-chances-table">
        <thead><tr><th>Tier</th><th>Chance</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

// Junta os itens de um field (já resolvidos pelo Python com own+All / white+All+coconut etc.)
// e calcula a chance de cada um com base no weight relativo ao total daquele pool.
function withComputedChances(items) {
  const totalWeight = items.reduce(
    (sum, it) => sum + (Number(it.weight) || 0),
    0,
  );
  return items
    .map((it) => ({
      ...it,
      chance: totalWeight > 0 ? (Number(it.weight) / totalWeight) * 100 : 0,
    }))
    .sort((a, b) => b.chance - a.chance);
}

function buildTierCard(tier, activeField) {
  const duration = STARFLOWER_DURATION[tier.name] || "Unknown duration";

  const availableFields = FIELD_ORDER.filter(
    (f) => tier.drops[f] && tier.drops[f].length > 0,
  );

  const tabButtons = availableFields
    .map((field, i) => {
      const col = FIELD_COLORS[field] || {};
      const label = field.replace(" Field", "");
      const isActive = activeField ? field === activeField : i === 0;
      return `<button
      class="sf-field-tab${isActive ? " active" : ""}"
      data-field="${field}"
      style="--tab-color:${col.tab || "#c8a84e"};--tab-active-bg:${col.active || "rgba(58,40,0,0.4)"};--tab-border:${col.border || "rgba(58,40,0,0.5)"}"
    >${label}</button>`;
    })
    .join("");

  const tabPanels = availableFields
    .map((field, i) => {
      const col = FIELD_COLORS[field] || {};
      const items = withComputedChances(tier.drops[field] || []);
      const isActive = activeField ? field === activeField : i === 0;

      const rows = items
        .map((it) => {
          const sourceBadge =
            it.source === "field"
              ? `<span class="sf-source-badge sf-source-badge--field">Field</span>`
              : `<span class="sf-source-badge sf-source-badge--all">All</span>`;
          const amountDisplay = it.amount > 1 ? `×${it.amount}` : "×1";
          const ll = window.MajesticLootLuck
            ? window.MajesticLootLuck.apply(it.chance)
            : { chance: it.chance, boosted: false };
          const badge = window.MajesticLootLuck
            ? window.MajesticLootLuck.badge(ll.boosted)
            : "";
          return `
        <tr>
          <td class="sf-drop-item-cell">
            <div class="sf-drop-item-wrap">
              ${localImg(it.image, 32, it.item)}
              <span>${it.item}</span>
              ${sourceBadge}
            </div>
          </td>
          <td class="sf-drop-amount">${amountDisplay}</td>
          <td class="sf-drop-chance-cell">${badge}${formatChance(ll.chance)}</td>
        </tr>`;
        })
        .join("");

      return `
      <div
        class="sf-field-panel${isActive ? " active" : ""}"
        data-field="${field}"
        style="--panel-tbody:${col.tbody || "rgba(58,40,0,0.12)"};--panel-border:${col.border || "rgba(58,40,0,0.3)"}"
      >
        <table class="sf-drop-table">
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align:center">Amount</th>
              <th>Chance</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
    })
    .join("");

  return `
    <div class="sf-tier-card" style="border-color:${tier.colorBorder};background:${tier.colorBg}">
      <div class="sf-tier-header" style="border-color:${tier.colorBorder};background:${tier.colorBgHeader}">
        <div class="sf-tier-img" style="border-color:${tier.colorBorder}">
          ${localImg(tier.image, 72, tier.name)}
        </div>
        <div class="sf-tier-meta">
          <div class="sf-tier-name" style="color:${tier.color}">${sfRarityIconTag(tier.name)}${tier.name} Starflower</div>
          ${
            tier.healthLabel
              ? `<div class="sf-tier-health">
                  <span class="sf-health-val" style="color:${tier.color}">${tier.healthLabel} pollen to destroy</span>
                </div>`
              : ""
          }
          <div class="sf-tier-duration">
            <span class="sf-duration-val" style="color:${tier.color}">Lasts ${duration}</span>
          </div>
        </div>
      </div>
      <div class="sf-tier-body">
        <div class="sf-field-tabs-note">Select the field you're placing this Starflower in to see the combined drop chances.</div>
        <div class="sf-field-tabs" role="tablist">${tabButtons}</div>
        <div class="sf-field-panels">${tabPanels}</div>
      </div>
    </div>`;
}

function buildTiers(tiers, activeFields) {
  const cards = tiers
    .map((t) => buildTierCard(t, activeFields && activeFields[t.name]))
    .join("");
  return `
    <div class="sf-section">
      <div class="sf-section-heading">Tiers and Drops</div>
      <div class="sf-section-desc">
        Each tier has a different health pool, duration, and its own drop table.
        Chances shown already account for field-specific items competing in the same pool.
      </div>
      <div class="sf-tiers">${cards}</div>
    </div>`;
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".sf-field-tab");
  if (!btn) return;
  const card = btn.closest(".sf-tier-card");
  const field = btn.dataset.field;

  card
    .querySelectorAll(".sf-field-tab")
    .forEach((b) => b.classList.toggle("active", b === btn));
  card
    .querySelectorAll(".sf-field-panel")
    .forEach((p) => p.classList.toggle("active", p.dataset.field === field));
});

let sfData = null;

function currentActiveFields() {
  const map = {};
  document.querySelectorAll(".sf-tier-card").forEach((card) => {
    const nameEl = card.querySelector(".sf-tier-name");
    const activeTab = card.querySelector(".sf-field-tab.active");
    if (nameEl && activeTab) {
      map[nameEl.textContent.replace(/ Starflower$/, "").trim()] =
        activeTab.dataset.field;
    }
  });
  return map;
}

function renderStarflowers() {
  const root = document.getElementById("sf-root");
  if (!root || !sfData) return;
  const activeFields = currentActiveFields();
  root.className = "sf-root";
  root.innerHTML =
    buildChances(sfData.chances) + buildTiers(sfData.tiers, activeFields);
}

async function loadStarflowers() {
  const root = document.getElementById("sf-root");
  if (!root) return;

  try {
    const res = await fetch("data/starflowers.json");
    if (!res.ok) throw new Error();
    sfData = await res.json();
  } catch {
    root.innerHTML =
      '<p style="text-align:center;color:var(--gold-dim)">Failed to load starflower data.</p>';
    return;
  }

  renderStarflowers();
}

document.addEventListener("DOMContentLoaded", loadStarflowers);
document.addEventListener("majestic-loot-luck-change", renderStarflowers);
