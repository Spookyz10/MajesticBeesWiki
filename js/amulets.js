const RARITY_COLORS = {
  rare: {
    text: "#82b8e8",
    border: "rgba(130,184,232,0.35)",
    bg: "rgba(130,184,232,0.1)",
  },
  epic: {
    text: "#ce93d8",
    border: "rgba(206,147,216,0.35)",
    bg: "rgba(206,147,216,0.1)",
  },
  legendary: {
    text: "#e8c040",
    border: "rgba(232,192,64,0.45)",
    bg: "rgba(232,192,64,0.12)",
  },
};

function fmtRange(buff) {
  if (buff.type === "Mult") {
    return `x${buff.min} – x${buff.max}`;
  }
  return `+${buff.min}% – +${buff.max}%`;
}

function fmtBuff(buff) {
  return `${buff.stat}`;
}

function chanceBarWidth(chance) {
  return Math.min(chance, 100);
}

function buildBuffRows(buffs) {
  const sorted = [...buffs].sort((a, b) => b.chance - a.chance);
  return sorted
    .map((b) => {
      const statLabel = `<span class="amulet-stat-name">${b.stat}</span>`;
      return `
        <tr class="amulet-buff-row">
          <td class="amulet-buff-stat">${statLabel}</td>
          <td class="amulet-buff-range">${fmtRange(b)}</td>
          <td class="amulet-buff-chance"><span class="amulet-chance-label">${b.chance}%</span></td>
        </tr>`;
    })
    .join("");
}

function buildAmuletCard(amulet) {
  const rKey = amulet.rarity.toLowerCase();
  const col = RARITY_COLORS[rKey] || RARITY_COLORS.rare;
  const plural = amulet.buffsAmount === 1 ? "buff" : "buffs";

  return `
    <div class="amulet-card">
      <div class="amulet-card-header">
        <div class="amulet-card-left">
          <div class="amulet-image-wrap">
            <img src="${amulet.image}" alt="${amulet.name}"
              onerror="this.onerror=null;this.src='images/ui/site-logo.png';" />
          </div>
          <div class="amulet-card-meta">
            <div class="amulet-card-name">${amulet.name}</div>
            <div class="amulet-card-desc">${amulet.desc}</div>
            <div class="amulet-card-tags">
              <span class="amulet-rarity-badge" style="color:${col.text};border-color:${col.border};background:${col.bg}">${amulet.rarity}</span>
              <span class="amulet-rolls-badge">Rolls <b>${amulet.buffsAmount}</b> ${plural}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="amulet-card-body">
        <table class="amulet-buff-table">
          <thead>
            <tr>
              <th>Possible Buff</th>
              <th>Range</th>
              <th>Chance</th>
            </tr>
          </thead>
          <tbody>
            ${buildBuffRows(amulet.buffs)}
          </tbody>
        </table>
      </div>
    </div>`;
}

async function loadAmulets() {
  const container = document.getElementById("amulets-list");
  if (!container) return;

  let amulets;
  try {
    const res = await fetch("data/amulets.json");
    amulets = await res.json();
  } catch {
    container.innerHTML =
      '<p style="text-align:center;color:var(--gold-dim);">Failed to load amulet data.</p>';
    return;
  }

  container.innerHTML = amulets.map(buildAmuletCard).join("");
}

document.addEventListener("DOMContentLoaded", loadAmulets);
