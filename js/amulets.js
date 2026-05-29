// ── Rarity theme palette ──────────────────────────────────────────────────────
// Mirrors starflower tier colours: Common = white/grey, Rare = silver,
// Epic = gold, Legendary = blue, Mythic = purple
const RARITY = {
  Common: {
    label: "Common",
    text: "#c4cdd4",
    border: "rgba(180,196,208,0.35)",
    bg: "rgba(175,192,205,0.07)",
    bgHeader: "rgba(175,192,205,0.13)",
    pill: "rgba(175,192,205,0.18)",
    pillBorder: "rgba(180,196,208,0.45)",
  },
  Rare: {
    label: "Rare",
    text: "#b8bec4",
    border: "rgba(160,170,178,0.32)",
    bg: "rgba(155,165,172,0.07)",
    bgHeader: "rgba(155,165,172,0.13)",
    pill: "rgba(155,165,172,0.18)",
    pillBorder: "rgba(160,170,178,0.4)",
  },
  Epic: {
    label: "Epic",
    text: "#c9a84c",
    border: "rgba(180,140,50,0.32)",
    bg: "rgba(175,135,45,0.07)",
    bgHeader: "rgba(175,135,45,0.14)",
    pill: "rgba(175,135,45,0.18)",
    pillBorder: "rgba(180,140,50,0.45)",
  },
  Legendary: {
    label: "Legendary",
    text: "#7aaccc",
    border: "rgba(90,148,190,0.32)",
    bg: "rgba(85,142,185,0.07)",
    bgHeader: "rgba(85,142,185,0.14)",
    pill: "rgba(85,142,185,0.18)",
    pillBorder: "rgba(90,148,190,0.45)",
  },
  Mythic: {
    label: "Mythic",
    text: "#9e8bbf",
    border: "rgba(120,96,168,0.32)",
    bg: "rgba(115,90,162,0.07)",
    bgHeader: "rgba(115,90,162,0.16)",
    pill: "rgba(115,90,162,0.18)",
    pillBorder: "rgba(120,96,168,0.45)",
  },
};

function rarityIconPath(rarity) {
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

function rarityIconTag(rarity, size = 18) {
  const src = rarityIconPath(rarity);
  return `<img class="amulet-rarity-icon" src="${src}" width="${size}" height="${size}" alt="${rarity} icon" loading="lazy" onerror="this.onerror=null;this.style.opacity='0.35'" />`;
}

function fmtRange(buff) {
  if (buff.type === "Mult") return `x${buff.min} – x${buff.max}`;
  if (buff.type === "Add") return `+${buff.min} – +${buff.max}`;
  return `+${buff.min}% – +${buff.max}%`;
}

function buildBuffRows(buffs) {
  return [...buffs]
    .sort((a, b) => b.chance - a.chance)
    .map(
      (b) => `
      <tr class="amulet-buff-row">
        <td class="amulet-buff-stat"><span class="amulet-stat-name">${b.stat}</span></td>
        <td class="amulet-buff-range">${fmtRange(b)}</td>
        <td class="amulet-buff-chance"><span class="amulet-chance-label">${b.chance}%</span></td>
      </tr>`,
    )
    .join("");
}

// Build a single variant panel (table only — meta moved to header)
function buildVariantPanel(variant, col, amuletId, variantIdx) {
  const panelId = `av-${amuletId}-${variantIdx}`;

  return `
    <div class="amulet-variant-panel" id="${panelId}"
         style="--av-bg:${col.bg};--av-border:${col.border};--av-bg-header:${col.bgHeader};">
      <div class="amulet-card-body">
        <table class="amulet-buff-table">
          <thead>
            <tr>
              <th>Possible Buff</th>
              <th>Range</th>
              <th>Chance</th>
            </tr>
          </thead>
          <tbody>${buildBuffRows(variant.buffs)}</tbody>
        </table>
      </div>
    </div>`;
}

// Build the rarity toggle pills for multi-variant amulets
function buildTogglePills(variants, amuletId) {
  return variants
    .map((v, i) => {
      const col = RARITY[v.rarity] || RARITY.Epic;
      return `
      <button class="amulet-rarity-pill${i === 0 ? " active" : ""}"
              data-amulet="${amuletId}"
              data-idx="${i}"
              style="--pill-text:${col.text};--pill-border:${col.pillBorder};--pill-bg:${col.pill};">
        ${col.label}
      </button>`;
    })
    .join("");
}

function buildAmuletCard(amulet) {
  const hasMultiple = amulet.variants.length > 1;
  const firstVariant = amulet.variants[0];
  const firstCol = RARITY[firstVariant.rarity] || RARITY.Epic;

  // Header rarity pill + rolls badge (both update when toggling)
  const firstPlural = firstVariant.buffsAmount === 1 ? "buff" : "buffs";
  const headerPill = `
    <span class="amulet-rarity-badge amulet-rarity-active-pill"
          style="color:${firstCol.text};border-color:${firstCol.border};background:${firstCol.pill};"
          data-amulet-rarity="${amulet.id}">
      ${firstCol.label}
    </span>
    <span class="amulet-rolls-badge"
          style="border-color:${firstCol.border};color:${firstCol.text};background:${firstCol.pill};"
          data-amulet-rolls="${amulet.id}">
      Rolls <b>${firstVariant.buffsAmount}</b> ${firstPlural}
    </span>`;

  const toggleSection = hasMultiple
    ? `
    <div class="amulet-toggle-row" data-amulet="${amulet.id}">
      ${buildTogglePills(amulet.variants, amulet.id)}
    </div>`
    : "";

  const panels = amulet.variants
    .map((v, i) =>
      buildVariantPanel(v, RARITY[v.rarity] || RARITY.Epic, amulet.id, i),
    )
    .join("");

  return `
    <div class="amulet-card" id="amulet-${amulet.id}"
         style="border-color:${firstCol.border};background:${firstCol.bg};">
      <div class="amulet-card-header" style="background:${firstCol.bgHeader};"
           data-amulet-header="${amulet.id}">
        <div class="amulet-card-left">
          <div class="amulet-image-wrap">
            <img src="${amulet.image}" alt="${amulet.name}"
              onerror="this.onerror=null;this.src='images/ui/site-logo.png';" />
          </div>
          <div class="amulet-card-meta">
            <div class="amulet-card-name">${amulet.name}</div>
            <div class="amulet-card-desc" style="color:var(--gold-dim);" data-amulet-source="${amulet.id}">From: ${firstVariant.source ?? amulet.source}</div>
            <div class="amulet-card-tags">
              ${headerPill}
            </div>
          </div>
        </div>
      </div>
      ${toggleSection}
      <div class="amulet-panels-wrap" data-amulet-panels="${amulet.id}">
        ${panels}
      </div>
    </div>`;
}

// ── Toggle logic ──────────────────────────────────────────────────────────────
function initToggles() {
  document.querySelectorAll(".amulet-rarity-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      const amuletId = btn.dataset.amulet;
      const idx = parseInt(btn.dataset.idx, 10);

      // Deactivate siblings
      document
        .querySelectorAll(`.amulet-rarity-pill[data-amulet="${amuletId}"]`)
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Show matching panel, hide others
      const panelsWrap = document.querySelector(
        `[data-amulet-panels="${amuletId}"]`,
      );
      panelsWrap
        .querySelectorAll(".amulet-variant-panel")
        .forEach((panel, i) => {
          panel.style.display = i === idx ? "" : "none";
        });

      // Update card border/bg and header bg to match new rarity
      const variantRarity = btn.textContent.trim();
      const col = RARITY[variantRarity] || RARITY.Epic;
      const card = document.getElementById(`amulet-${amuletId}`);
      if (card) {
        card.style.borderColor = col.border;
        card.style.background = col.bg;
      }
      const header = document.querySelector(
        `[data-amulet-header="${amuletId}"]`,
      );
      if (header) header.style.background = col.bgHeader;

      // Update the active rarity pill in the header
      const activePill = document.querySelector(
        `[data-amulet-rarity="${amuletId}"]`,
      );
      if (activePill) {
        activePill.textContent = col.label;
        activePill.style.color = col.text;
        activePill.style.borderColor = col.border;
        activePill.style.background = col.pill;
      }

      // Update the main amulet image to reflect selected rarity (use variant image if provided, otherwise use rarity icon)
      try {
        const card = document.getElementById(`amulet-${amuletId}`);
        if (card) {
          const imgEl = card.querySelector(".amulet-image-wrap img");
          const variantData = _amuletsData.find((a) => a.id === amuletId)
            ?.variants[idx];
          if (imgEl && variantData) {
            const newSrc =
              variantData.image ||
              rarityIconPath(variantData.rarity || variantRarity);
            imgEl.src = newSrc;
            imgEl.alt = `${_amuletsData.find((a) => a.id === amuletId)?.name} - ${col.label}`;
          }
        }
      } catch (e) {
        // ignore
      }

      // Update the rolls badge in the header
      const rollsBadge = document.querySelector(
        `[data-amulet-rolls="${amuletId}"]`,
      );
      if (rollsBadge) {
        // find the variant data from the amulets array to get correct buffsAmount
        const variantData = _amuletsData.find((a) => a.id === amuletId)
          ?.variants[idx];
        if (variantData) {
          const plural = variantData.buffsAmount === 1 ? "buff" : "buffs";
          rollsBadge.innerHTML = `Rolls <b>${variantData.buffsAmount}</b> ${plural}`;

          // Update "From:" source text if variant has its own source
          const sourceEl = document.querySelector(
            `[data-amulet-source="${amuletId}"]`,
          );
          if (sourceEl) {
            const amuletData = _amuletsData.find((a) => a.id === amuletId);
            const activeSource = variantData.source ?? amuletData?.source ?? "";
            sourceEl.textContent = `From: ${activeSource}`;
          }
        }
        rollsBadge.style.color = col.text;
        rollsBadge.style.borderColor = col.border;
        rollsBadge.style.background = col.pill;
      }
    });
  });

  // Hide all panels except first for multi-variant amulets
  document.querySelectorAll(".amulet-panels-wrap").forEach((wrap) => {
    wrap.querySelectorAll(".amulet-variant-panel").forEach((panel, i) => {
      if (i !== 0) panel.style.display = "none";
    });
  });
}

// ── Load ──────────────────────────────────────────────────────────────────────
let _amuletsData = [];

async function loadAmulets() {
  const container = document.getElementById("amulets-list");
  if (!container) return;

  let amulets;
  try {
    const res = await fetch("data/amulets.json");
    amulets = await res.json();
    _amuletsData = amulets;
  } catch {
    container.innerHTML =
      '<p style="text-align:center;color:var(--gold-dim);">Failed to load amulet data.</p>';
    return;
  }

  container.innerHTML = amulets.map(buildAmuletCard).join("");
  initToggles();
}

document.addEventListener("DOMContentLoaded", loadAmulets);
