const RARITY_CLASS = {
  Common: "bee-common",
  Rare: "bee-rare",
  Epic: "bee-epic",
  Legendary: "bee-golden",
  Special: "bee-boss",
};

let TOKEN_MAP = {};

function escHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);
}

function buildInfobox(bee) {
  const rarityClass = RARITY_CLASS[bee.rarity] || "bee-common";

  return `
    <div class="bee-infobox">
      <div class="bee-infobox-header">
        <div class="bee-infobox-label">${escHtml(bee.name)}</div>
        <div class="bee-view-toggle">
          <button class="bee-view-btn active" data-view="icon">Icon</button>
          <button class="bee-view-btn" data-view="model">Model</button>
        </div>
      </div>
      <div class="bee-infobox-image">
        <img id="infobox-img-icon" src="${escHtml(bee.icon)}" alt="${escHtml(bee.name)}" onerror="this.onerror=null;this.src='images/ui/site-logo.png';" />
        <img id="infobox-img-model" src="${escHtml(bee.model || bee.icon)}" alt="${escHtml(bee.name)} model" class="hidden" onerror="this.onerror=null;this.src='images/ui/site-logo.png';" />
      </div>
      <div class="bee-infobox-stats">
        <div class="bee-infobox-stat">
          <span class="bee-infobox-stat-label">Rarity</span>
          <span class="bee-infobox-stat-value"><span class="${rarityClass}">${escHtml(bee.rarity)}</span></span>
        </div>
        <div class="bee-infobox-stat">
          <span class="bee-infobox-stat-label">Color</span>
          <span class="bee-infobox-stat-value bee-color-${escHtml(bee.color)}">${escHtml(bee.color.charAt(0).toUpperCase() + bee.color.slice(1))}</span>
        </div>
        <div class="bee-infobox-stat">
          <span class="bee-infobox-stat-label">Abilities</span>
          <span class="bee-infobox-stat-value">${bee.abilities ? bee.abilities.length : 0}</span>
        </div>
      </div>
    </div>
  `;
}

function buildObtain(bee) {
  if (!bee.obtain || !bee.obtain.length) return "";

  const items = bee.obtain.map(o => `
    <div class="bee-obtain-item">
      <span class="bee-obtain-method">${escHtml(o.method)}</span>
      <span class="bee-obtain-detail">${escHtml(o.detail)}</span>
    </div>
  `).join("");

  return `
    <div class="bee-obtain-box">
      <div class="bee-obtain-title">How to Obtain</div>
      <div class="bee-obtain-list">${items}</div>
    </div>
  `;
}

function buildTokenCard(tokenId) {
  const token = TOKEN_MAP[tokenId];
  if (!token) return "";

  const icon = token.icon
    ? `<img src="${escHtml(token.icon)}" alt="${escHtml(token.name)}" onerror="this.onerror=null;this.src='images/ui/site-logo.png';" />`
    : "";

  return `
    <div class="token-card" data-token-id="${escHtml(tokenId)}">
      <div class="token-card-icon">${icon}</div>
      <div class="token-card-name">${escHtml(token.name)}</div>
    </div>
  `;
}

function buildAbilities(abilities) {
  if (!abilities || !abilities.length) return "";

  const cards = abilities.map(ab => {
    const unlockLabel = ab.unlock_level <= 1
      ? "Available at Level 1"
      : `Unlocks at Level ${ab.unlock_level}`;

    const unlockClass = ab.unlock_level <= 1 ? "" : "locked";

    const iconHtml = ab.icon
      ? `<img src="${escHtml(ab.icon)}" alt="${escHtml(ab.name)}" onerror="this.onerror=null;this.src='images/ui/site-logo.png';" />`
      : "";

    const tokensHtml = ab.tokens && ab.tokens.length
      ? `<div class="bee-ability-tokens">${ab.tokens.map(buildTokenCard).join("")}</div>`
      : "";

    return `
      <div class="bee-ability-card">
        <div class="bee-ability-icon-wrap">${iconHtml}</div>
        <div class="bee-ability-body">
          <div class="bee-ability-header">
            <div class="bee-ability-name">${escHtml(ab.name)}</div>
            <span class="bee-ability-type ${escHtml(ab.type)}">${escHtml(ab.type)}</span>
            <span class="bee-ability-unlock ${unlockClass}">${unlockLabel}</span>
          </div>
          <div class="bee-ability-desc">${escHtml(ab.description)}</div>
          ${tokensHtml}
        </div>
      </div>
    `;
  }).join("");

  return `
    <div class="bee-section">
      <div class="bee-section-heading">Abilities</div>
      <div class="bee-abilities-list">${cards}</div>
    </div>
  `;
}

function buildTrivia(trivia) {
  if (!trivia || !trivia.length) return "";

  const items = trivia.map(t => `
    <div class="bee-trivia-item">${escHtml(t)}</div>
  `).join("");

  return `
    <div class="bee-section">
      <div class="bee-section-heading">Trivia</div>
      <div class="bee-trivia-list">${items}</div>
    </div>
  `;
}

function buildPage(bee) {
  const rarityClass = RARITY_CLASS[bee.rarity] || "bee-common";

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
    ${buildTrivia(bee.trivia)}
  `;
}

function openTokenModal(tokenId) {
  const token = TOKEN_MAP[tokenId];
  if (!token) return;

  document.getElementById("token-modal-title").textContent = token.name;

  const visual = document.getElementById("token-modal-visual");
  if (token.gif) {
    visual.innerHTML = `<img src="${escHtml(token.gif)}" alt="${escHtml(token.name)}" onerror="this.onerror=null;this.src='images/ui/site-logo.png';" />`;
  } else if (token.icon) {
    visual.innerHTML = `<img src="${escHtml(token.icon)}" alt="${escHtml(token.name)}" onerror="this.onerror=null;this.src='images/ui/site-logo.png';" />`;
  } else {
    visual.innerHTML = `<span class="token-no-gif">No preview available.</span>`;
  }

  document.getElementById("token-modal-desc").textContent = token.description || "";

  const stats = document.getElementById("token-modal-stats");
  const rows = [];
  if (token.effect) rows.push({ label: "Effect", value: token.effect });
  if (token.cooldown) rows.push({ label: "Cooldown", value: token.cooldown });

  stats.innerHTML = rows.map(r => `
    <div class="token-modal-stat">
      <span class="token-modal-stat-label">${escHtml(r.label)}</span>
      <span class="token-modal-stat-value">${escHtml(r.value)}</span>
    </div>
  `).join("");

  document.getElementById("token-modal-overlay").classList.add("open");
}

function closeTokenModal() {
  document.getElementById("token-modal-overlay").classList.remove("open");
}

function bindTokenEvents(root) {
  root.querySelectorAll(".token-card").forEach(card => {
    card.addEventListener("click", () => {
      openTokenModal(card.dataset.tokenId);
    });
  });
}

function bindInforboxToggle(root) {
  root.querySelectorAll(".bee-view-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      root.querySelectorAll(".bee-view-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const view = btn.dataset.view;
      const iconImg = document.getElementById("infobox-img-icon");
      const modelImg = document.getElementById("infobox-img-model");

      if (view === "icon") {
        iconImg.classList.remove("hidden");
        modelImg.classList.add("hidden");
      } else {
        iconImg.classList.add("hidden");
        modelImg.classList.remove("hidden");
      }
    });
  });
}

async function loadBeeDetail() {
  const root = document.getElementById("bee-detail-root");
  const params = new URLSearchParams(window.location.search);
  const beeName = params.get("bee");

  if (!beeName) {
    root.innerHTML = `<div class="bee-detail-error">No bee specified. Add <code>?bee=BeeNameHere</code> to the URL.</div>`;
    return;
  }

  try {
    const [beeRes, tokenRes] = await Promise.all([
      fetch("data/bee-details.json"),
      fetch("data/ability-tokens.json"),
    ]);

    if (!beeRes.ok || !tokenRes.ok) {
      throw new Error("Failed to load data files.");
    }

    const beeData = await beeRes.json();
    const tokenData = await tokenRes.json();

    (tokenData.tokens || []).forEach(t => {
      TOKEN_MAP[t.id] = t;
    });

    const bee = beeData[beeName];

    if (!bee) {
      root.innerHTML = `<div class="bee-detail-error">Bee "${escHtml(beeName)}" not found.</div>`;
      return;
    }

    document.title = `${bee.name} – The Majestic Bees`;
    root.innerHTML = `<div class="bee-detail-shell">${buildPage(bee)}</div>`;

    bindInforboxToggle(root);
    bindTokenEvents(root);
  } catch (err) {
    root.innerHTML = `<div class="bee-detail-error">Failed to load bee data.</div>`;
  }
}

document.getElementById("token-modal-close").addEventListener("click", closeTokenModal);
document.getElementById("token-modal-overlay").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeTokenModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeTokenModal();
});

document.addEventListener("DOMContentLoaded", loadBeeDetail);
