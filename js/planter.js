const ITEM_IMAGES = {
  Strawberry: "images/items/Strawberry.png",
  Blueberry: "images/items/Blueberry.png",
  "Pine Cone": "images/items/Pine Cone.png",
  Bamboo: "images/items/Bamboo.png",
  "Fire Essence": "images/items/Fire Essence.png",
  "Water Essence": "images/items/Water Essence.png",
  "Wind Essence": "images/items/Wind Essence.png",
  Seed: "images/items/Seed.png",
  Treat: "images/items/Treat.png",
  Ticket: "images/items/Ticket.png",
  Starflower: "images/items/Starflower.png",
  Honey: "images/currencies/Honey.png",
};

function escHtml(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatGrowTime(seconds) {
  if (seconds >= 3600) {
    const h = seconds / 3600;
    return h === Math.floor(h)
      ? `${h} hour${h !== 1 ? "s" : ""}`
      : `${h.toFixed(1)} hours`;
  }
  const m = seconds / 60;
  return `${m} minute${m !== 1 ? "s" : ""}`;
}

function formatHoney(n) {
  return Number(n).toLocaleString("pt-BR");
}

function getItemImage(drop) {
  const name = drop?.item;
  if (ITEM_IMAGES[name]) return ITEM_IMAGES[name];

  if (drop?.type === "Sticker") {
    return `images/hive/stickers/${name}.png`;
  }

  if (drop?.type === "Skin") {
    return `images/hive/skins/${String(name).replace(/ Hive$/, " Skin")}.png`;
  }

  return "images/ui/site-logo.png";
}

function buildInfobox(planter) {
  const rarityColors = {
    Rare: {
      text: "#82b8e8",
      border: "rgba(130,184,232,0.35)",
      bg: "rgba(130,184,232,0.1)",
    },
    Epic: {
      text: "#ce93d8",
      border: "rgba(206,147,216,0.35)",
      bg: "rgba(206,147,216,0.1)",
    },
  };
  const col = rarityColors[planter.rarity] || rarityColors.Epic;

  return `
    <div class="planter-infobox">
      <div class="planter-infobox-header"><div class="planter-infobox-label">Planter Info</div></div>
      <div class="planter-infobox-image">
        <img src="${escHtml(planter.icon)}" alt="${escHtml(planter.name)}"
          onerror="this.onerror=null;this.src='images/ui/site-logo.png';" />
      </div>
      <div class="planter-infobox-stats">
        <div class="planter-infobox-stat">
          <span class="planter-infobox-stat-label">Rarity</span>
          <span class="planter-infobox-stat-value">
            <span style="color:${col.text};border:1px solid ${col.border};background:${col.bg};border-radius:5px;padding:1px 8px;font-size:.82em;font-weight:700;">${escHtml(planter.rarity)}</span>
          </span>
        </div>
        <div class="planter-infobox-stat">
          <span class="planter-infobox-stat-label">Grow Time</span>
          <span class="planter-infobox-stat-value">${formatGrowTime(planter.growTime)}</span>
        </div>
        <div class="planter-infobox-stat">
          <span class="planter-infobox-stat-label">Tokens Given</span>
          <span class="planter-infobox-stat-value">${planter.tokens}</span>
        </div>
      </div>
    </div>`;
}

function buildObtain(planter) {
  if (!planter.obtain || !planter.obtain.length) return "";
  return `
    <div class="planter-obtain-box">
      <div class="planter-obtain-title">How to Obtain</div>
      <div class="planter-obtain-list">
        ${planter.obtain
          .map(
            (o) => `
          <div class="planter-obtain-item">
            <span class="planter-obtain-method">${escHtml(o.method)}</span>
            ${o.detail ? `<span class="planter-obtain-detail">${escHtml(o.detail)}</span>` : ""}
          </div>`,
          )
          .join("")}
      </div>
    </div>`;
}

function totalWeight(drops) {
  return drops.reduce((sum, d) => sum + (d.chance || 0), 0);
}

function buildDropRow(drop, isWeighted, total) {
  const imgSrc = getItemImage(drop);
  const typeBadge = drop.type
    ? `<span class="planter-drop-type-badge planter-drop-type-badge--${drop.type}">${drop.type}</span>`
    : "";

  let chanceHtml;
  let chanceClass = "planter-drop-chance";

  if (isWeighted) {
    const pct = (drop.chance / total) * 100;
    const display =
      pct < 0.1
        ? pct.toFixed(3) + "%"
        : pct < 1
          ? pct.toFixed(2) + "%"
          : pct.toFixed(1) + "%";
    if (pct < 0.5) chanceClass += " planter-drop-chance--rare";
    else if (pct < 3) chanceClass += " planter-drop-chance--low";
    chanceHtml = `<td class="${chanceClass}">${display}</td>`;
  } else {
    const val = drop.chance;
    if (val < 1) chanceClass += " planter-drop-chance--rare";
    else if (val < 5) chanceClass += " planter-drop-chance--low";
    const displayChance = val % 1 !== 0 ? val.toFixed(1) + "%" : val + "%";
    chanceHtml = `<td class="${chanceClass}">${displayChance}</td>`;
  }

  const amountDisplay = drop.isHoney
    ? `x${formatHoney(drop.amount)}`
    : drop.amount > 1
      ? `×${drop.amount}`
      : "×1";

  return `
    <tr>
      <td>
        <div class="planter-drop-item-cell">
          <img src="${imgSrc}" alt="${escHtml(drop.item)}" onerror="this.onerror=null;this.src='images/ui/site-logo.png';" />
          <span>${escHtml(drop.item)}</span>
          ${typeBadge}
        </div>
      </td>
      <td class="planter-drop-amount">${amountDisplay}</td>
      ${chanceHtml}
    </tr>`;
}

const POOL_NOTES = {
  "Red Field": "Only on Red fields",
  "Blue Field": "Only on Blue fields",
  "White Field": "Only on White fields",
  "Bamboo Field": "Only on Bamboo fields",
  "All Fields": "Applies on every field",
};

function buildPool(poolName, drops) {
  const isEmpty = !drops || drops.length === 0;
  if (isEmpty) return "";

  const noteHtml = POOL_NOTES[poolName]
    ? `<span class="planter-pool-note">${POOL_NOTES[poolName]}</span>`
    : "";

  const isWeighted = drops.some((d) => d.isWeight);
  const total = isWeighted ? totalWeight(drops) : 0;

  const rows = [...drops]
    .sort((a, b) => b.chance - a.chance)
    .map((d) => buildDropRow(d, isWeighted, total))
    .join("");

  return `
    <div class="planter-pool" data-pool="${escHtml(poolName)}">
      <div class="planter-pool-header">
        <span class="planter-pool-name">${escHtml(poolName)}</span>
        ${noteHtml}
      </div>
      <table class="planter-drop-table">
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
}

function buildDropsSection(planter) {
  const pools = Object.entries(planter.drops).filter(
    ([, drops]) => drops && drops.length,
  );
  if (!pools.length) return "";

  const isWeightedPlanter = pools.some(
    ([, drops]) => drops.some && drops.some((d) => d.isWeight),
  );

  const note = isWeightedPlanter
    ? "This planter rolls a single item from the pool each token, using weighted random selection. Field-specific pools only apply when the planter is placed in that field type."
    : "Each drop rolls independently per token. Field-specific pools only apply when the planter is placed in that field type. The All Fields pool always applies.";

  return `
    <div class="planter-section">
      <div class="planter-section-heading">
        <span class="planter-section-deco"></span>Drops<span class="planter-section-deco"></span>
      </div>
      <div class="planter-drops-note">${note}</div>
      <div class="planter-pools">
        ${pools.map(([name, drops]) => buildPool(name, drops)).join("")}
      </div>
    </div>`;
}

function buildAllPlantersSection(all, currentId) {
  return `
    <div class="planter-section" style="margin-top:32px;">
      <div class="planter-section-heading">
        <span class="planter-section-deco"></span>All Planters<span class="planter-section-deco"></span>
      </div>
      <div class="planter-all-grid">
        ${all
          .map(
            (p) => `
          <a class="planter-mini-link" href="planter.html?planter=${encodeURIComponent(p.id)}">
            <div class="planter-mini-card${p.id === currentId ? " planter-mini-card--current" : ""}">
              <div class="planter-mini-img">
                <img src="${escHtml(p.icon)}" alt="${escHtml(p.name)}" loading="lazy"
                  onerror="this.onerror=null;this.src='images/ui/site-logo.png';" />
              </div>
              <div class="planter-mini-name">${escHtml(p.name)}</div>
            </div>
          </a>`,
          )
          .join("")}
      </div>
    </div>`;
}

function buildPage(planter, all) {
  return `
    <div class="planter-detail-shell">
      <div class="planter-detail-hero">
        <div class="planter-detail-left">
          <div class="planter-detail-title">
            <div class="planter-detail-name">${escHtml(planter.name)}</div>
          </div>
          <div class="planter-detail-desc">${escHtml(planter.desc)}</div>
          ${buildObtain(planter)}
        </div>
        ${buildInfobox(planter)}
      </div>
      ${buildDropsSection(planter)}
      ${buildAllPlantersSection(all, planter.id)}
    </div>`;
}

async function loadPlanterDetail() {
  const root = document.getElementById("planter-detail-root");
  const planterId = new URLSearchParams(window.location.search).get("planter");
  if (!planterId) {
    root.innerHTML =
      '<div class="planter-detail-error">No planter specified.</div>';
    return;
  }
  try {
    const res = await fetch("data/planters.json");
    if (!res.ok) throw new Error();
    const planters = await res.json();
    const planter = planters.find((p) => p.id === planterId);
    if (!planter) {
      root.innerHTML = `<div class="planter-detail-error">Planter "${escHtml(planterId)}" not found.</div>`;
      return;
    }
    document.title = `${planter.name} - The Majestic Bees Wiki`;
    root.innerHTML = buildPage(planter, planters);
  } catch {
    root.innerHTML =
      '<div class="planter-detail-error">Failed to load planter data.</div>';
  }
}

document.addEventListener("DOMContentLoaded", loadPlanterDetail);
