const RARITY_CLASS = {
  common: "bee-common",
  rare: "bee-rare",
  epic: "bee-epic",
  legendary: "bee-golden",
  special: "bee-boss",
  boss: "bee-boss",
};

let TOKEN_MAP = {};

function escHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildInfobox(bee) {
  const rarityKey = (bee.rarity || "").toLowerCase();
  const rarityClass = RARITY_CLASS[rarityKey] || "bee-common";
  const icon = bee.icon || "images/ui/site-logo.png";
  const abilityCount = Array.isArray(bee.abilities) ? bee.abilities.length : 0;

  const rows = [
    {
      label: "Rarity",
      value: `<span class="${rarityClass}">${escHtml(bee.rarity || "Unknown")}</span>`,
    },
    { label: "Color", value: escHtml(bee.color || "Unknown") },
    { label: "Abilities", value: escHtml(String(abilityCount)) },
  ];

  const rowsHtml = rows
    .map(
      (r) => `
        <div class="bee-infobox-stat">
          <span class="bee-infobox-stat-label">${escHtml(r.label)}</span>
          <span class="bee-infobox-stat-value">${r.value}</span>
        </div>
      `,
    )
    .join("");

  return `
    <div class="bee-infobox">
      <div class="bee-infobox-header">
        <div class="bee-infobox-label">Bee Info</div>
      </div>
      <div class="bee-infobox-image">
        <img src="${escHtml(icon)}" alt="${escHtml(bee.name)} icon" onerror="this.onerror=null;this.src='images/ui/site-logo.png';" />
      </div>
      <div class="bee-infobox-stats">${rowsHtml}</div>
    </div>
  `;
}

function buildObtain(bee) {
  const obtain = Array.isArray(bee.obtain)
    ? bee.obtain
    : Array.isArray(bee.obtains)
      ? bee.obtains
      : [];

  if (!obtain.length) return "";

  const items = obtain
    .map((o) => {
      const method = escHtml(o.method || "Unknown");
      const detail = o.detail ? escHtml(o.detail) : "";
      return `
    <div class="bee-obtain-item">
      <span class="bee-obtain-method">${method}</span>
      ${detail ? `<span class="bee-obtain-detail">${detail}</span>` : ""}
    </div>
  `;
    })
    .join("");

  return `
    <div class="bee-obtain-box">
      <div class="bee-obtain-title">How to Obtain</div>
      <div class="bee-obtain-list">${items}</div>
    </div>
  `;
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
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40">
             <circle cx="12" cy="12" r="10"/>
             <path d="M12 8v4l3 3"/>
           </svg>`;

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
        </div>
      `;
    })
    .join("");

  return `
    <div class="bee-section bee-section--abilities">
      <div class="bee-section-heading">
        <span class="bee-section-heading-deco"></span>
        Abilities
        <span class="bee-section-heading-deco"></span>
      </div>
      <div class="ab-list">${cards}</div>
    </div>
  `;
}

function buildTrivia(trivia) {
  if (!trivia || !trivia.length) return "";

  const items = trivia
    .map(
      (t) => `
    <div class="bee-trivia-item">${escHtml(t)}</div>
  `,
    )
    .join("");

  return `
    <div class="bee-section">
      <div class="bee-section-heading">
        <span class="bee-section-heading-deco"></span>
        Trivia
        <span class="bee-section-heading-deco"></span>
      </div>
      <div class="bee-trivia-list">${items}</div>
    </div>
  `;
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
    ${buildAllBeesSection()}
    ${buildTrivia(bee.trivia)}
  `;
}

function buildAllBeesSection() {
  return `
    <div class="bee-section bee-section--all">
      <div class="bee-section-heading">
        <span class="bee-section-heading-deco"></span>
        All Bees
        <span class="bee-section-heading-deco"></span>
      </div>
      <div id="all-bees-list" class="bee-all-list"></div>
    </div>
  `;
}

function openTokenModal(tokenId) {
  const token = TOKEN_MAP[tokenId];
  if (!token) return;

  document.getElementById("token-modal-title").textContent = token.name;

  const visual = document.getElementById("token-modal-visual");
  if (token.icon) {
    visual.innerHTML = `<img src="${escHtml(token.icon)}" alt="${escHtml(token.name)}" onerror="this.onerror=null;this.src='images/ui/site-logo.png';" />`;
  } else {
    visual.innerHTML = `<span class="token-no-gif">No preview available.</span>`;
  }

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
    </div>
  `,
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
      const id = card.dataset.tokenId;
      if (id) openTokenModal(id);
    });
  });
}

async function loadBeeDetail() {
  const root = document.getElementById("bee-detail-root");
  const params = new URLSearchParams(window.location.search);
  const beeName = params.get("bee");

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

    if (!beeRes.ok || !tokenRes.ok) {
      throw new Error("Failed to load data files.");
    }

    const beeData = await beeRes.json();
    const tokenData = await tokenRes.json();

    TOKEN_MAP = {};
    (tokenData.tokens || []).forEach((t) => {
      TOKEN_MAP[t.id] = t;
    });

    let bee = beeData[beeName];

    if (!bee) {
      const categories = Object.values(beeData);
      for (const c of categories) {
        if (Array.isArray(c)) {
          const found = c.find((b) => b.name === beeName);
          if (found) {
            bee = found;
            break;
          }
        }
      }
    }

    if (!bee) {
      root.innerHTML = `<div class="bee-detail-error">Bee "${escHtml(beeName)}" not found.</div>`;
      return;
    }

    document.title = `${bee.name} - The Majestic Bees`;
    root.innerHTML = `<div class="bee-detail-shell">${buildPage(bee)}</div>`;

    bindTokenEvents(root);

    renderAllBeesList(beeData, bee.name);
  } catch (err) {
    root.innerHTML =
      '<div class="bee-detail-error">Failed to load bee data.</div>';
  }
}

function normalizeBeesObject(payload) {
  const entries = [];
  if (!payload) return entries;
  for (const key of Object.keys(payload)) {
    const v = payload[key];
    if (Array.isArray(v)) {
      for (const b of v) entries.push(b);
    } else if (v && v.name) {
      entries.push(v);
    }
  }
  return entries;
}

function renderBeeMini(bee, currentBeeName) {
  const name = escHtml(bee.name || "Unknown Bee");
  const icon = escHtml(bee.icon || "images/ui/site-logo.png");
  const href = `bee.html?bee=${encodeURIComponent(bee.name || "")}`;
  const isCurrent = (bee.name || "") === (currentBeeName || "");
  const cardClass = isCurrent
    ? "bee-mini-card bee-mini-card--current"
    : "bee-mini-card";

  return `
    <a class="bee-mini-link" href="${href}" aria-label="${name}">
      <div class="${cardClass}">
        <div class="bee-mini-img"><img src="${icon}" alt="${name}" onerror="this.onerror=null;this.src='images/ui/site-logo.png';"/></div>
        <div class="bee-mini-body">
          <div class="bee-mini-name">${name}</div>
        </div>
      </div>
    </a>
  `;
}

function renderAllBeesList(beePayload, currentBeeName) {
  const container = document.getElementById("all-bees-list");
  if (!container) return;
  try {
    const bees = normalizeBeesObject(beePayload);
    if (!bees.length) {
      container.innerHTML = '<p class="shops-empty">No bees available.</p>';
      return;
    }
    container.innerHTML = bees
      .map((bee) => renderBeeMini(bee, currentBeeName))
      .join("");
  } catch (e) {
    container.innerHTML =
      '<p class="shops-empty">Could not load bees list.</p>';
  }
}

const tokenClose = document.getElementById("token-modal-close");
if (tokenClose) {
  tokenClose.addEventListener("click", closeTokenModal);
}

const tokenOverlay = document.getElementById("token-modal-overlay");
if (tokenOverlay) {
  tokenOverlay.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeTokenModal();
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeTokenModal();
});

document.addEventListener("DOMContentLoaded", loadBeeDetail);
