const FIELD_NOTE = {
  "White Field": "Only on White fields",
  "Blue Field": "Only on Blue fields",
  "Red Field": "Only on Red fields",
  "Bamboo Field": "Only on Bamboo fields",
  "All Fields": "Applies on every field type",
};

const STARFLOWER_DURATION = {
  Basic: "3 minutes",
  Rare: "4 minutes",
  Epic: "5 minutes",
  Legendary: "7 minutes",
  Mythic: "8 minutes",
  Lunar: "4 minutes",
};

function formatChanceValue(value) {
  return typeof value === "number" || /^\d+(?:\.\d+)?$/.test(String(value))
    ? `${value}%`
    : String(value);
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
        <td>${formatChanceValue(c.approxPct)}</td>
      </tr>
    `,
    )
    .join("");

  return `
    <div class="sf-section">
      <div class="sf-section-heading">Spawn Chances</div>
      <div class="sf-section-desc">
        When any Starflower is placed, the game rolls to decide which tier spawns.
      </div>
      <table class="sf-chances-table">
        <thead>
          <tr>
            <th>Tier</th>
            <th>Chance</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function buildDropPool(poolName, items) {
  const note = FIELD_NOTE[poolName] || "";
  const noteHtml = note ? `<span class="sf-pool-note">${note}</span>` : "";

  const rows = items
    .map(
      (it) => `
      <tr>
        <td class="sf-drop-item-cell">
          <div class="sf-drop-item-wrap">
            ${localImg(it.image, 32, it.item)}
            <span>${it.item}</span>
          </div>
        </td>
        <td class="sf-drop-amount">${it.amount > 1 ? "x" + it.amount : "x1"}</td>
        <td class="sf-drop-chance-cell">${it.chance}%</td>
      </tr>
    `,
    )
    .join("");

  return `
    <div class="sf-pool" data-pool="${poolName}">
      <div class="sf-pool-header">
        <span class="sf-pool-name">${poolName}</span>
        ${noteHtml}
      </div>
      <table class="sf-drop-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Amount</th>
            <th>Chance per token</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function buildTierCard(tier) {
  const pools = Object.entries(tier.drops)
    .map(([k, v]) => buildDropPool(k, v))
    .join("");
  const duration = STARFLOWER_DURATION[tier.name] || "Unknown duration";

  return `
    <div class="sf-tier-card" style="border-color:${tier.colorBorder};background:${tier.colorBg}">
      <div class="sf-tier-header" style="border-color:${tier.colorBorder};background:${tier.colorBgHeader}">
        <div class="sf-tier-img" style="border-color:${tier.colorBorder}">
          ${localImg(tier.image, 72, tier.name)}
        </div>
        <div class="sf-tier-meta">
          <div class="sf-tier-name" style="color:${tier.color}">${sfRarityIconTag(tier.name)}${tier.name} Starflower</div>
          <div class="sf-tier-health">
            <span class="sf-health-val" style="color:${tier.color}">${tier.healthLabel} pollen to destroy</span>
          </div>
          <div class="sf-tier-duration">
            <span class="sf-duration-val" style="color:${tier.color}">Lasts ${duration}</span>
          </div>
        </div>
      </div>
      <div class="sf-tier-body">
        <div class="sf-pools">${pools}</div>
      </div>
    </div>
  `;
}

function buildTiers(tiers) {
  const cards = tiers.map(buildTierCard).join("");
  return `
    <div class="sf-section">
      <div class="sf-section-heading">Tiers and Drops</div>
      <div class="sf-section-desc">
        Each tier has a different health pool, duration, and its own drop table.
       
      </div>
      <div class="sf-tiers">${cards}</div>
    </div>
  `;
}

async function loadStarflowers() {
  const root = document.getElementById("sf-root");
  if (!root) return;

  let data;
  try {
    const res = await fetch("data/starflowers.json");
    if (!res.ok) throw new Error();
    data = await res.json();
  } catch {
    root.innerHTML =
      '<p style="text-align:center;color:var(--gold-dim)">Failed to load starflower data.</p>';
    return;
  }

  root.className = "sf-root";
  root.innerHTML = buildChances(data.chances) + buildTiers(data.tiers);
}

document.addEventListener("DOMContentLoaded", loadStarflowers);
