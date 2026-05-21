const RARITY_CLASS = {
  common: "bee-common",
  rare: "bee-rare",
  epic: "bee-epic",
  legendary: "bee-golden",
  special: "bee-boss",
  boss: "bee-boss",
};

let TOKEN_MAP = {};

function buildInfobox(bee) {
  const rarityKey = (bee.rarity || "").toLowerCase();
  const rarityClass = RARITY_CLASS[rarityKey] || "bee-common";
  const abilityCount = Array.isArray(bee.abilities) ? bee.abilities.length : 0;

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

function buildAbilities(abilities) {
  if (!abilities || !abilities.length) return "";
  const cards = abilities
    .map((ab, index) => {
      const unlockLabel =
        (ab.unlock_level || 1) <= 1
          ? "Available at Level 1"
          : `Unlocks at Level ${ab.unlock_level}`;
      const isLocked = (ab.unlock_level || 1) > 1;
      const tokenId = ab.tokens && ab.tokens.length ? ab.tokens[0] : null;
      const token = tokenId && TOKEN_MAP[tokenId] ? TOKEN_MAP[tokenId] : null;
      const iconSrc = token && token.icon ? token.icon : "";
      const desc =
        token && token.description ? token.description : ab.description || "";
      const iconInner = iconSrc
        ? `<img src="${escHtml(iconSrc)}" alt="${escHtml(ab.name)}" onerror="this.onerror=null;this.src='images/ui/site-logo.png';" />`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>`;
      return `
      <div class="ab-card" style="animation-delay:${index * 0.07}s">
        <div class="ab-media-top">
          <div class="ab-media-frame">
            <div class="ab-media-layer ab-media-layer--icon">${iconInner}</div>
          </div>
        </div>
        <div class="ab-body">
          <div class="ab-top-row">
            <span class="ab-name">${escHtml(ab.name)}</span>
            <span class="ab-badge ${isLocked ? "ab-badge--locked" : ""}">${escHtml(unlockLabel)}</span>
          </div>
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
        <div class="bee-detail-desc">${escHtml(bee.description)}</div>
        ${buildObtain(bee)}
      </div>
      ${buildInfobox(bee)}
    </div>
    ${buildAbilities(bee.abilities)}
    <div class="bee-section bee-section--all">
      <div class="bee-section-heading">
        <span class="bee-section-heading-deco"></span>All Bees<span class="bee-section-heading-deco"></span>
      </div>
      <div id="all-bees-list" class="bee-all-list"></div>
    </div>
    ${buildTrivia(bee.trivia)}`;
}

function openTokenModal(tokenId) {
  const token = TOKEN_MAP[tokenId];
  if (!token) return;
  document.getElementById("token-modal-title").textContent = token.name;
  const visual = document.getElementById("token-modal-visual");
  visual.innerHTML = token.icon
    ? `<img src="${escHtml(token.icon)}" alt="${escHtml(token.name)}" onerror="this.onerror=null;this.src='images/ui/site-logo.png';" />`
    : `<span class="token-no-gif">No preview available.</span>`;
  document.getElementById("token-modal-desc").textContent =
    token.description || "";
  const stats = document.getElementById("token-modal-stats");
  const rows = [];
  if (token.effect) rows.push({ label: "Effect", value: token.effect });
  if (token.cooldown) rows.push({ label: "Cooldown", value: token.cooldown });
  stats.innerHTML = rows
    .map(
      (r) => `
    <div class="token-modal-stat">
      <span class="token-modal-stat-label">${escHtml(r.label)}</span>
      <span class="token-modal-stat-value">${escHtml(r.value)}</span>
    </div>`,
    )
    .join("");
  document.getElementById("token-modal-overlay").classList.add("open");
}

function closeTokenModal() {
  document.getElementById("token-modal-overlay").classList.remove("open");
}

function bindTokenEvents(root) {
  root.querySelectorAll(".token-card").forEach((card) => {
    card.addEventListener("click", () => {
      if (card.dataset.tokenId) openTokenModal(card.dataset.tokenId);
    });
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
    .map((bee) => {
      const name = escHtml(bee.name || "Unknown Bee");
      const icon = escHtml(bee.icon || "images/ui/site-logo.png");
      const href = `bee.html?bee=${encodeURIComponent(bee.name || "")}`;
      const isCurrent = (bee.name || "") === (currentBeeName || "");
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
    const [beeRes, tokenRes] = await Promise.all([
      fetch("data/bees.json"),
      fetch("data/ability-tokens.json"),
    ]);
    if (!beeRes.ok || !tokenRes.ok)
      throw new Error("Failed to load data files.");
    const beeData = await beeRes.json();
    const tokenData = await tokenRes.json();
    TOKEN_MAP = {};
    (tokenData.tokens || []).forEach((t) => {
      TOKEN_MAP[t.id] = t;
    });
    const bee = Array.isArray(beeData)
      ? beeData.find((b) => b.name === beeName)
      : beeData[beeName];
    if (!bee) {
      root.innerHTML = `<div class="bee-detail-error">Bee "${escHtml(beeName)}" not found.</div>`;
      return;
    }
    document.title = `${bee.name} - The Majestic Bees`;
    root.innerHTML = `<div class="bee-detail-shell">${buildPage(bee)}</div>`;
    bindTokenEvents(root);
    renderAllBeesList(beeData, bee.name);
  } catch {
    root.innerHTML =
      '<div class="bee-detail-error">Failed to load bee data.</div>';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadBeeDetail();

  const tokenClose = document.getElementById("token-modal-close");
  const tokenOverlay = document.getElementById("token-modal-overlay");
  if (tokenClose) tokenClose.addEventListener("click", closeTokenModal);
  if (tokenOverlay)
    tokenOverlay.addEventListener("click", (e) => {
      if (e.target === e.currentTarget) closeTokenModal();
    });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeTokenModal();
  });
});
