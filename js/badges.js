const TIER_LABELS = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
];
const TIER_COLORS = [
  {
    bg: "rgba(255,169,98,0.13)",
    border: "rgba(255,169,98,0.45)",
    text: "#FFA962",
    label: "Bronze",
  },
  {
    bg: "rgba(220,220,220,0.13)",
    border: "rgba(220,220,220,0.4)",
    text: "#DCDCDC",
    label: "Silver",
  },
  {
    bg: "rgba(255,220,19,0.13)",
    border: "rgba(255,220,19,0.45)",
    text: "#FFDC13",
    label: "Gold",
  },
  {
    bg: "rgba(55,218,255,0.13)",
    border: "rgba(55,218,255,0.45)",
    text: "#37DAFF",
    label: "Diamond",
  },
  {
    bg: "rgba(41,255,130,0.13)",
    border: "rgba(41,255,130,0.45)",
    text: "#29FF82",
    label: "Emerald",
  },
];

function getTierColor(tier) {
  const idx = Math.ceil(tier / 2) - 1;
  return TIER_COLORS[Math.min(idx, TIER_COLORS.length - 1)];
}

let ALL_BADGES = [];
const DISPLAY_LIMIT = 3;
let BADGES_EXPANDED = false;

function getReq(badge, tier) {
  if (tier <= 1) return badge.start;
  return badge.start * Math.pow(badge.mult, tier - 1);
}

function formatNum(n) {
  if (n >= 1e12) return (n / 1e12).toFixed(1).replace(/\.0$/, "") + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

function buffText(buff, tier) {
  if (!buff || tier < 2) return null;
  const steps = tier - 1;
  if (buff.type === "Perc") {
    return `+${buff.value * steps}% ${buff.stat}`;
  } else if (buff.type === "Mult") {
    return `x${(1 + buff.value * steps).toFixed(1)} ${buff.stat}`;
  } else {
    return `+${buff.value * steps} ${buff.stat}`;
  }
}

function buildTierRows(badge) {
  const MAX = 10;
  return Array.from({ length: MAX }, (_, i) => {
    const tier = i + 1;
    const color = getTierColor(tier);
    const req = getReq(badge, tier);
    const buff = buffText(badge.buff, tier);
    return `
      <tr class="badge-tier-row">
        <td>
          <span class="badge-tier-pill" style="color:${color.text};border-color:${color.border};background:${color.bg}">
            ${TIER_LABELS[i]}
          </span>
          <span class="badge-tier-grade" style="color:${color.text}">${color.label}</span>
        </td>
        <td class="badge-tier-req">${formatNum(req)}</td>
        <td class="badge-tier-buff">${buff ? `<span class="badge-buff-value">${buff}</span>` : `<span class="badge-no-buff">—</span>`}</td>
      </tr>`;
  }).join("");
}

function buildBadgeCard(badge) {
  return `
    <div class="badge-card">
      <div class="badge-card-left">
        
        <div class="badge-card-name">${badge.name}</div>
        <div class="badge-card-task">${badge.desc}</div>
      </div>
      <div class="badge-card-right">
        <table class="badge-tier-table">
          <thead>
            <tr>
              <th>Tier</th>
              <th>Required</th>
              <th>Bonus (stacks per tier)</th>
            </tr>
          </thead>
          <tbody>
            ${buildTierRows(badge)}
          </tbody>
        </table>
      </div>
    </div>`;
}

function renderBadges(query) {
  const container = document.getElementById("badges-list");
  const controls = document.getElementById("badges-controls");
  if (!container || !controls) return;
  const q = (query || "").trim().toLowerCase();
  const list = ALL_BADGES.filter((b) => {
    if (!q) return true;
    return (
      (b.name && b.name.toLowerCase().includes(q)) ||
      (b.id && b.id.toLowerCase().includes(q)) ||
      (b.desc && b.desc.toLowerCase().includes(q))
    );
  });

  if (q) {
    container.innerHTML =
      list.length > 0
        ? list.map(buildBadgeCard).join("")
        : '<p style="text-align:center;color:var(--gold-dim);">No badges found.</p>';
    controls.innerHTML = "";
    return;
  }

  const shouldLimit = !BADGES_EXPANDED && list.length > DISPLAY_LIMIT;
  const toRender = shouldLimit ? list.slice(0, DISPLAY_LIMIT) : list;

  container.innerHTML =
    toRender.length > 0
      ? toRender.map(buildBadgeCard).join("")
      : '<p style="text-align:center;color:var(--gold-dim);">No badges found.</p>';

  if (list.length > DISPLAY_LIMIT) {
    let btn = controls.querySelector(".load-more-btn");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "load-more-btn";
      controls.appendChild(btn);
      btn.addEventListener("click", () => {
        BADGES_EXPANDED = !BADGES_EXPANDED;
        renderBadges("");
      });
    }
    btn.textContent = BADGES_EXPANDED ? "Show fewer" : "Load more";
  } else {
    controls.innerHTML = "";
  }
}

async function loadBadges() {
  const container = document.getElementById("badges-list");
  if (!container) return;

  let badges;
  try {
    const res = await fetch("data/badges.json");
    badges = await res.json();
  } catch (err) {
    container.innerHTML =
      '<p style="text-align:center;color:var(--gold-dim);">Failed to load badge data.</p>';
    return;
  }

  badges.sort((a, b) => a.order - b.order);
  ALL_BADGES = badges;
  renderBadges("");

  const searchInput = document.getElementById("badge-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => renderBadges(e.target.value));
    searchInput.addEventListener("keyup", (e) => {
      if (e.key === "Escape") {
        e.target.value = "";
        renderBadges("");
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", loadBadges);
