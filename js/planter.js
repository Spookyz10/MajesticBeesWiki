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

function formatChance(value) {
  const n = Number(value);
  if (n < 0.1) return n.toFixed(3) + "%";
  if (n < 1) return n.toFixed(2) + "%";
  return parseFloat(n.toFixed(2)) + "%";
}

function getItemImage(drop) {
  const name = drop?.item;

  if (drop?.type === "Sticker") return `images/hive/stickers/${name}.png`;

  if (drop?.type === "Skin")
    return `images/hive/skins/${String(name).replace(/ Hive$/, " Skin")}.png`;

  return `images/items/${name}.png`;
}

const FIELD_COLORS = {
  "Red Field": {
    tab: "#d48880",
    active: "rgba(140,50,45,0.3)",
    border: "rgba(165,65,55,0.38)",
    tbody: "rgba(110,30,25,0.18)",
  },
  "Blue Field": {
    tab: "#88bedd",
    active: "rgba(60,110,165,0.28)",
    border: "rgba(80,130,175,0.38)",
    tbody: "rgba(40,90,145,0.14)",
  },
  "White Field": {
    tab: "#c8dce8",
    active: "rgba(185,205,220,0.18)",
    border: "rgba(185,205,220,0.35)",
    tbody: "rgba(160,185,200,0.07)",
  },
  "Bamboo Field": {
    tab: "#78c882",
    active: "rgba(50,110,60,0.26)",
    border: "rgba(65,130,75,0.36)",
    tbody: "rgba(30,90,40,0.16)",
  },
};

const FIELD_ORDER = ["Red Field", "Blue Field", "White Field", "Bamboo Field"];

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

function withComputedChances(items) {
  const total = items.reduce((sum, it) => sum + (it.weight || 0), 0);
  return items
    .map((it) => ({
      ...it,
      chance: total > 0 ? (it.weight / total) * 100 : 0,
    }))
    .sort((a, b) => b.chance - a.chance);
}

function buildDropRow(drop) {
  const imgSrc = getItemImage(drop);
  const typeBadge = drop.type
    ? `<span class="planter-drop-type-badge planter-drop-type-badge--${drop.type}">${drop.type}</span>`
    : "";
  const sourceBadge =
    drop.source === "field"
      ? `<span class="sf-source-badge sf-source-badge--field">Field</span>`
      : `<span class="sf-source-badge sf-source-badge--all">All</span>`;

  const amountDisplay = drop.isHoney
    ? `x${formatHoney(drop.amount)}`
    : drop.amount > 1
      ? `×${drop.amount}`
      : "×1";

  return `
    <tr>
      <td class="sf-drop-item-cell">
        <div class="sf-drop-item-wrap">
          <img src="${imgSrc}" alt="${escHtml(drop.item)}" onerror="this.onerror=null;this.src='images/ui/site-logo.png';" />
          <span>${escHtml(drop.item)}</span>
          ${sourceBadge}
          ${typeBadge}
        </div>
      </td>
      <td class="sf-drop-amount">${amountDisplay}</td>
      <td class="sf-drop-chance-cell">${formatChance(drop.chance)}</td>
    </tr>`;
}

function buildFieldTable(items) {
  const rows = withComputedChances(items).map(buildDropRow).join("");
  return `
    <table class="sf-drop-table">
      <thead>
        <tr>
          <th>Item</th>
          <th style="text-align:center">Amount</th>
          <th>Chance</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function buildDropsSection(planter) {
  const drops = planter.drops || {};
  const allItems = (drops["All Fields"] || []).map((d) => ({
    ...d,
    source: "all",
  }));

  const availableFields = FIELD_ORDER.filter(
    (f) => drops[f] && drops[f].length > 0,
  );

  if (!availableFields.length) {
    if (!allItems.length) return "";
    return `
      <div class="planter-section">
        <div class="planter-section-heading">
          <span class="planter-section-deco"></span>Drops<span class="planter-section-deco"></span>
        </div>
        <div class="planter-drops-note">This planter rolls a single item from the pool each token, using weighted random selection.</div>
        ${buildFieldTable(allItems)}
      </div>`;
  }

  const tabButtons = availableFields
    .map((field, i) => {
      const col = FIELD_COLORS[field] || {};
      const label = field.replace(" Field", "");
      return `<button
      class="sf-field-tab${i === 0 ? " active" : ""}"
      data-field="${field}"
      style="--tab-color:${col.tab};--tab-active-bg:${col.active};--tab-border:${col.border}"
    >${label}</button>`;
    })
    .join("");

  const tabPanels = availableFields
    .map((field, i) => {
      const col = FIELD_COLORS[field] || {};
      const fieldItems = (drops[field] || []).map((d) => ({
        ...d,
        source: "field",
      }));
      const merged = [...fieldItems, ...allItems];
      return `
      <div
        class="sf-field-panel${i === 0 ? " active" : ""}"
        data-field="${field}"
        style="--panel-tbody:${col.tbody};--panel-border:${col.border}"
      >
        ${buildFieldTable(merged)}
      </div>`;
    })
    .join("");

  return `
    <div class="planter-section">
      <div class="planter-section-heading">
        <span class="planter-section-deco"></span>Drops<span class="planter-section-deco"></span>
      </div>
      <div class="planter-drops-note">Each field's pool competes with the All Fields pool as a single weighted roll per token. Select the field this planter is placed in to see the combined chances.</div>
      <div class="sf-field-tabs" role="tablist">${tabButtons}</div>
      <div class="sf-field-panels">${tabPanels}</div>
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

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".sf-field-tab");
  if (!btn) return;
  const section = btn.closest(".planter-section");
  if (!section) return;
  const field = btn.dataset.field;

  section
    .querySelectorAll(".sf-field-tab")
    .forEach((b) => b.classList.toggle("active", b === btn));
  section
    .querySelectorAll(".sf-field-panel")
    .forEach((p) => p.classList.toggle("active", p.dataset.field === field));
});

let loadedPlanters = null;
let currentPlanter = null;

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
    loadedPlanters = await res.json();
    currentPlanter = loadedPlanters.find((p) => p.id === planterId);
    if (!currentPlanter) {
      root.innerHTML = `<div class="planter-detail-error">Planter "${escHtml(planterId)}" not found.</div>`;
      return;
    }
    document.title = `${currentPlanter.name} - The Majestic Bees Wiki`;
    renderPlanterDetail();
  } catch {
    root.innerHTML =
      '<div class="planter-detail-error">Failed to load planter data.</div>';
  }
}

function renderPlanterDetail() {
  const root = document.getElementById("planter-detail-root");
  if (!root || !currentPlanter) return;
  root.innerHTML = buildPage(currentPlanter, loadedPlanters);
}

document.addEventListener("DOMContentLoaded", loadPlanterDetail);
