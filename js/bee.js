const RARITY_CLASS = {
  common: "bee-common",
  rare: "bee-rare",
  epic: "bee-epic",
  legendary: "bee-golden",
  special: "bee-boss",
  boss: "bee-boss",
};

function tokenIcon(tokenName) {
  return `images/tokens/${tokenName}.png`;
}

function fmtStat(val) {
  if (val === undefined || val === null) return "—";
  return Number(val) % 1 === 0 ? String(Number(val)) : Number(val).toFixed(1);
}

function buildShinyBonus(shinyBonus) {
  if (!shinyBonus) return "";
  let valText = "";
  if (shinyBonus.type === "Mult") {
    valText = `x${shinyBonus.value}`;
  } else if (shinyBonus.type === "Perc") {
    valText = `+${shinyBonus.value}%`;
  } else if (shinyBonus.type === "Add") {
    valText = `+${shinyBonus.value}`;
  } else {
    valText = String(shinyBonus.value);
  }
  return `
    <div class="bee-shiny-bonus">
      <span class="bee-shiny-icon">✦</span>
      <span class="bee-shiny-label">Shiny:</span>
      <span class="bee-shiny-stat">${escHtml(shinyBonus.stat)}</span>
      <span class="bee-shiny-val">${escHtml(valText)}</span>
    </div>`;
}

function buildStatsGrid(bee) {
  const stats = [
    { label: "Speed", key: "speed", icon: "🏃" },
    { label: "Attack", key: "attack", icon: "⚔️" },
    { label: "Energy", key: "energy", icon: "⚡" },
    { label: "Gather", key: "gather", icon: "🌸" },
    { label: "Gather Time", key: "gatherTime", icon: "⏱", suffix: "s" },
    { label: "Convert", key: "convert", icon: "🍯" },
    { label: "Conv. Time", key: "convertTime", icon: "⏳", suffix: "s" },
  ];

  const hasStats = stats.some((s) => bee[s.key] !== undefined);
  if (!hasStats) return "";

  const rows = stats
    .filter((s) => bee[s.key] !== undefined)
    .map(
      (s) => `
      <div class="bee-stat-row">
        <span class="bee-stat-icon">${s.icon}</span>
        <span class="bee-stat-label">${escHtml(s.label)}</span>
        <span class="bee-stat-value">${fmtStat(bee[s.key])}${s.suffix || ""}</span>
      </div>`,
    )
    .join("");

  return rows;
}

function buildInfobox(bee) {
  const rarityKey = (bee.rarity || "").toLowerCase();
  const rarityClass = RARITY_CLASS[rarityKey] || "bee-common";
  const abilityCount = Array.isArray(bee.tokens)
    ? bee.tokens.length
    : Array.isArray(bee.abilities)
      ? bee.abilities.length
      : 0;

  const rows = [
    {
      label: "Rarity",
      value: `<span class="${rarityClass}">${escHtml(bee.rarity || "Unknown")}</span>`,
    },
    { label: "Color", value: escHtml(bee.color || "Unknown") },
    { label: "Abilities", value: escHtml(String(abilityCount)) },
  ];

  return `
    <div class="bee-infobox">
      <div class="bee-infobox-header"><div class="bee-infobox-label">Bee Info</div></div>
      <div class="bee-infobox-image">
        <img src="${escHtml(bee.icon || "images/ui/site-logo.png")}" alt="${escHtml(bee.name)} icon"
          onerror="this.onerror=null;this.src='images/ui/site-logo.png';" />
      </div>
      <div class="bee-infobox-stats">
        ${rows
          .map(
            (r) => `
          <div class="bee-infobox-stat">
            <span class="bee-infobox-stat-label">${escHtml(r.label)}</span>
            <span class="bee-infobox-stat-value">${r.value}</span>
          </div>`,
          )
          .join("")}
      </div>
    </div>`;
}

function buildObtain(bee) {
  const obtain = Array.isArray(bee.obtain)
    ? bee.obtain
    : Array.isArray(bee.obtains)
      ? bee.obtains
      : [];
  if (!obtain.length) return "";
  return `
    <div class="bee-obtain-box">
      <div class="bee-obtain-title">How to Obtain</div>
      <div class="bee-obtain-list">
        ${obtain
          .map(
            (o) => `
          <div class="bee-obtain-item">
            <span class="bee-obtain-method">${escHtml(o.method || "Unknown")}</span>
            ${o.detail ? `<span class="bee-obtain-detail">${escHtml(o.detail)}</span>` : ""}
          </div>`,
          )
          .join("")}
      </div>
    </div>`;
}

function buildAbilities(bee) {
  const abilities = bee.tokens || bee.abilities;
  if (!abilities || !abilities.length) return "";

  const cards = abilities
    .map((ab, index) => {
      const unlockLevel = ab.level || ab.unlock_level || 1;
      const unlockLabel =
        unlockLevel <= 1
          ? "Available at Level 1"
          : `Unlocks at Level ${unlockLevel}`;
      const isLocked = unlockLevel > 1;

      const abName = ab.token || ab.name || "";
      const iconSrc = tokenIcon(abName);
      const desc = ab.desc || ab.description || "";

      const chanceHtml =
        ab.chance !== undefined
          ? `<span class="ab-chance">${ab.chance}% chance</span>`
          : "";
      const expiresHtml =
        ab.expires !== undefined
          ? `<span class="ab-expires">Expires in ${ab.expires}s</span>`
          : "";

      return `
      <div class="ab-card" style="animation-delay:${index * 0.07}s">
        <div class="ab-media-top">
          <div class="ab-media-frame">
            <div class="ab-media-layer ab-media-layer--icon">
              <img src="${escHtml(iconSrc)}" alt="${escHtml(abName)}"
                onerror="this.onerror=null;this.src='images/ui/site-logo.png';" />
            </div>
          </div>
        </div>
        <div class="ab-body">
          <div class="ab-top-row">
            <span class="ab-name">${escHtml(abName)}</span>
            <span class="ab-badge ${isLocked ? "ab-badge--locked" : ""}">${escHtml(unlockLabel)}</span>
          </div>
          ${chanceHtml || expiresHtml ? `<div class="ab-meta-row">${chanceHtml}${expiresHtml}</div>` : ""}
          <div class="ab-separator"></div>
          <div class="ab-desc">${escHtml(desc)}</div>
        </div>
      </div>`;
    })
    .join("");

  return `
    <div class="bee-section bee-section--abilities">
      <div class="bee-section-heading">
        <span class="bee-section-heading-deco"></span>Abilities<span class="bee-section-heading-deco"></span>
      </div>
      <div class="ab-list">${cards}</div>
    </div>`;
}

function buildTrivia(trivia) {
  if (!trivia || !trivia.length) return "";
  return `
    <div class="bee-section">
      <div class="bee-section-heading">
        <span class="bee-section-heading-deco"></span>Trivia<span class="bee-section-heading-deco"></span>
      </div>
      <div class="bee-trivia-list">
        ${trivia.map((t) => `<div class="bee-trivia-item">${escHtml(t)}</div>`).join("")}
      </div>
    </div>`;
}

function buildStatsSection(bee) {
  const stats = [
    { label: "Speed", key: "speed", icon: "🏃" },
    { label: "Attack", key: "attack", icon: "⚔️" },
    { label: "Energy", key: "energy", icon: "⚡" },
    { label: "Gather", key: "gather", icon: "🌸" },
    { label: "Gather Time", key: "gatherTime", icon: "⏱", suffix: "s" },
    { label: "Convert", key: "convert", icon: "🍯" },
    { label: "Conv. Time", key: "convertTime", icon: "⏳", suffix: "s" },
  ];
  const rows = stats.filter((s) => bee[s.key] !== undefined);
  if (!rows.length) return "";
  const pills = rows
    .map(
      (s) => `
      <div class="bee-stat-pill">
        <span class="bee-stat-icon">${s.icon}</span>
        <span class="bee-stat-label">${escHtml(s.label)}</span>
        <span class="bee-stat-value">${fmtStat(bee[s.key])}${s.suffix || ""}</span>
      </div>`,
    )
    .join("");
  return `
    <div class="bee-section bee-section--stats">
      <div class="bee-section-heading">
        <span class="bee-section-heading-deco"></span>Stats<span class="bee-section-heading-deco"></span>
      </div>
      <div class="bee-stats-pills">${pills}</div>
    </div>`;
}

function buildPage(bee) {
  const rarityClass =
    RARITY_CLASS[(bee.rarity || "").toLowerCase()] || "bee-common";
  return `
    <div class="bee-detail-hero">
      <div class="bee-detail-left">
        <div class="bee-detail-title">
          <div class="bee-detail-name">${escHtml(bee.name)}</div>
          <span class="bee-detail-rarity ${rarityClass}">${escHtml(bee.rarity)}</span>
        </div>
        ${buildShinyBonus(bee.shinyBonus)}
        <div class="bee-detail-desc">${escHtml(bee.description || bee.desc || "")}</div>
        ${buildObtain(bee)}
        ${buildStatsSection(bee)}
      </div>
      ${buildInfobox(bee)}
    </div>
    
    ${buildAbilities(bee)}
    <div class="bee-section bee-section--all">
      <div class="bee-section-heading">
        <span class="bee-section-heading-deco"></span>All Bees<span class="bee-section-heading-deco"></span>
      </div>
      <div id="all-bees-list" class="bee-all-list"></div>
    </div>
    ${buildTrivia(bee.trivia)}`;
}

function bindAbilityClicks(root, bee) {
  root.querySelectorAll(".ab-card").forEach((card, i) => {
    card.style.cursor = "default";
  });
}

function renderAllBeesList(beePayload, currentBeeName) {
  const container = document.getElementById("all-bees-list");
  if (!container) return;
  const bees = Array.isArray(beePayload)
    ? beePayload
    : Object.values(beePayload).filter((v) => v && v.name);
  if (!bees.length) {
    container.innerHTML = '<p class="shops-empty">No bees available.</p>';
    return;
  }
  container.innerHTML = bees
    .map((b) => {
      const name = escHtml(b.name || "Unknown Bee");
      const icon = escHtml(b.icon || b.image || "images/ui/site-logo.png");
      const href = `bee.html?bee=${encodeURIComponent(b.name || "")}`;
      const isCurrent = (b.name || "") === (currentBeeName || "");
      return `
      <a class="bee-mini-link" href="${href}" aria-label="${name}">
        <div class="bee-mini-card${isCurrent ? " bee-mini-card--current" : ""}">
          <div class="bee-mini-img"><img src="${icon}" alt="${name}" loading="lazy" onerror="this.onerror=null;this.src='images/ui/site-logo.png';"/></div>
          <div class="bee-mini-body"><div class="bee-mini-name">${name}</div></div>
        </div>
      </a>`;
    })
    .join("");
}

async function loadBeeDetail() {
  const root = document.getElementById("bee-detail-root");
  const beeName = new URLSearchParams(window.location.search).get("bee");
  if (!beeName) {
    root.innerHTML =
      '<div class="bee-detail-error">No bee specified. Add <code>?bee=BeeNameHere</code> to the URL.</div>';
    return;
  }
  try {
    const res = await fetch("data/bees.json");
    if (!res.ok) throw new Error("Failed to load bees.json");
    const beeData = await res.json();

    const bee = Array.isArray(beeData)
      ? beeData.find((b) => b.name === beeName)
      : beeData[beeName];

    if (!bee) {
      root.innerHTML = `<div class="bee-detail-error">Bee "${escHtml(beeName)}" not found.</div>`;
      return;
    }

    document.title = `${bee.name} - The Majestic Bees`;
    root.innerHTML = `<div class="bee-detail-shell">${buildPage(bee)}</div>`;
    bindAbilityClicks(root, bee);
    renderAllBeesList(beeData, bee.name);
  } catch {
    root.innerHTML =
      '<div class="bee-detail-error">Failed to load bee data.</div>';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadBeeDetail();
});
