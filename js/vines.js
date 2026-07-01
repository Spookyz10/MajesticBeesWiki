const VINE_DURATION = {
  Basic: "Unknown",
  Rare: "Unknown",
  Epic: "Unknown",
  Legendary: "Unknown",
  Mythic: "Unknown",
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
    <div class="vine-section">
      <div class="vine-section-heading">Spawn Chances</div>
      <div class="vine-section-desc">
        When any Vine is placed, the game rolls to decide which tier spawns.
      </div>
      <table class="vine-chances-table">
        <thead><tr><th>Tier</th><th>Chance</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function buildTierCard(tier, activeField) {
  const duration = VINE_DURATION[tier.name] || "Unknown";
  const durationHtml =
    duration === "Unknown"
      ? `<span class="vine-duration-val" style="color:${tier.color};opacity:0.55">Duration unknown</span>`
      : `<span class="vine-duration-val" style="color:${tier.color}">Lasts ${duration}</span>`;

  const availableFields = FIELD_ORDER.filter(
    (f) => tier.drops[f] && tier.drops[f].length > 0,
  );

  const tabButtons = availableFields
    .map((field, i) => {
      const col = FIELD_COLORS[field] || {};
      const label = field.replace(" Field", "");
      const isActive = activeField ? field === activeField : i === 0;
      return `<button
      class="vine-field-tab${isActive ? " active" : ""}"
      data-field="${field}"
      style="--tab-color:${col.tab || "#c8a84e"};--tab-active-bg:${col.active || "rgba(58,40,0,0.4)"};--tab-border:${col.border || "rgba(58,40,0,0.5)"}"
    >${label}</button>`;
    })
    .join("");

  const tabPanels = availableFields
    .map((field, i) => {
      const col = FIELD_COLORS[field] || {};
      const items = tier.drops[field] || [];
      const isActive = activeField ? field === activeField : i === 0;

      const rows = items
        .map((it) => {
          const amountDisplay = it.amount > 1 ? `×${it.amount}` : "×1";
          const ll = window.MajesticLootLuck
            ? window.MajesticLootLuck.apply(it.chance)
            : { chance: it.chance, boosted: false };
          const badge = window.MajesticLootLuck
            ? window.MajesticLootLuck.badge(ll.boosted)
            : "";
          return `
        <tr>
          <td class="vine-drop-item-cell">
            <div class="vine-drop-item-wrap">
              ${localImg(it.image, 32, it.item)}
              <span>${it.item}</span>
            </div>
          </td>
          <td class="vine-drop-amount">${amountDisplay}</td>
          <td class="vine-drop-chance-cell">${badge}${formatChance(ll.chance)}</td>
        </tr>`;
        })
        .join("");

      return `
      <div
        class="vine-field-panel${isActive ? " active" : ""}"
        data-field="${field}"
        style="--panel-tbody:${col.tbody || "rgba(58,40,0,0.1)"};--panel-border:${col.border || "rgba(58,40,0,0.3)"}"
      >
        <table class="vine-drop-table">
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
    <div class="vine-tier-card" style="border-color:${tier.colorBorder};background:${tier.colorBg}">
      <div class="vine-tier-header" style="border-color:${tier.colorBorder};background:${tier.colorBgHeader}">
        <div class="vine-tier-img" style="border-color:${tier.colorBorder}">
          ${localImg(tier.image, 72, tier.name)}
        </div>
        <div class="vine-tier-meta">
          <div class="vine-tier-name" style="color:${tier.color}">${tier.name} Vine</div>
          <div class="vine-tier-health">
            <span class="vine-health-val" style="color:${tier.color}">${tier.healthLabel} pollen to destroy</span>
          </div>
          <div class="vine-tier-duration">${durationHtml}</div>
        </div>
      </div>
      <div class="vine-tier-body">
        <div class="vine-field-tabs-note">Select the field type to see the drop chances for that combination.</div>
        <div class="vine-field-tabs" role="tablist">${tabButtons}</div>
        <div class="vine-field-panels">${tabPanels}</div>
      </div>
    </div>`;
}

function buildTiers(tiers, activeFields) {
  return `
    <div class="vine-section">
      <div class="vine-section-heading">Tiers and Drops</div>
      <div class="vine-section-desc">
        Each tier has a different health pool and its own drop table.
        Chances shown are already weighted — the game picks a single item per roll from the combined pool.
      </div>
      <div class="vine-tiers">${tiers
        .map((t) => buildTierCard(t, activeFields && activeFields[t.name]))
        .join("")}</div>
    </div>`;
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".vine-field-tab");
  if (!btn) return;
  const card = btn.closest(".vine-tier-card");
  const field = btn.dataset.field;
  card
    .querySelectorAll(".vine-field-tab")
    .forEach((b) => b.classList.toggle("active", b === btn));
  card
    .querySelectorAll(".vine-field-panel")
    .forEach((p) => p.classList.toggle("active", p.dataset.field === field));
});

let VINES_DATA = null;

function currentActiveFields() {
  const map = {};
  document.querySelectorAll(".vine-tier-card").forEach((card) => {
    const nameEl = card.querySelector(".vine-tier-name");
    const activeTab = card.querySelector(".vine-field-tab.active");
    if (nameEl && activeTab) {
      map[nameEl.textContent.replace(/ Vine$/, "")] = activeTab.dataset.field;
    }
  });
  return map;
}

function renderVines(data) {
  const root = document.getElementById("vine-root");
  if (!root) return;
  const activeFields = currentActiveFields();
  root.className = "vine-root";
  root.innerHTML =
    buildChances(data.chances) + buildTiers(data.tiers, activeFields);
}

document.addEventListener("majestic-loot-luck-change", () => {
  if (VINES_DATA) renderVines(VINES_DATA);
});

async function loadVines() {
  const root = document.getElementById("vine-root");
  if (!root) return;

  let data;
  try {
    const res = await fetch("data/vines.json");
    if (!res.ok) throw new Error();
    data = await res.json();
  } catch {
    root.innerHTML =
      '<p style="text-align:center;color:var(--gold-dim)">Failed to load vine data.</p>';
    return;
  }

  VINES_DATA = data;
  renderVines(data);
}

document.addEventListener("DOMContentLoaded", loadVines);
