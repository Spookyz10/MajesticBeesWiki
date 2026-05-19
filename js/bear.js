function escHtml(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function fmt(n) {
  return Number(n).toLocaleString("en-US");
}

function formatRequirement(req) {
  switch (req.type) {
    case "gather_field":
      return `Gather <b>${fmt(req.amount)}</b> pollen from <b>${escHtml(req.field)}</b>`;
    case "gather_pollen":
      return req.color
        ? `Gather <b>${fmt(req.amount)}</b> <b>${escHtml(req.color)}</b> pollen`
        : `Gather <b>${fmt(req.amount)}</b> pollen`;
    case "convert":
      return `Convert <b>${fmt(req.amount)}</b> ${escHtml(req.resource || "Honey")}`;
    case "collect_token":
      return `Collect <b>${fmt(req.amount)}</b> ${escHtml(req.token || "Token")}`;
    case "collect_sticker":
      return `Collect ${escHtml(req.sticker || "Sticker Token")}`;
    case "defeat_mob":
      return `Defeat <b>${fmt(req.amount)}</b> ${escHtml(req.mob || "mob")}`;
    case "use_ability":
      return `Use <b>${escHtml(req.ability || "Ability")}</b> × ${fmt(req.amount)}`;
    default:
      return escHtml(JSON.stringify(req));
  }
}

const SPECIAL_ITEMS = new Set([
  "Silver Egg",
  "Gold Egg",
  "Diamond Egg",
  "Basic Egg",
  "Starflower",
  "Bamboo Flask",
  "Ticket",
]);

function isSpecialReward(itemName) {
  return SPECIAL_ITEMS.has(itemName) || /egg/i.test(itemName);
}

function buildQuestCard(quest, index) {
  const num = quest.number ?? index + 1;
  const name = escHtml(quest.name || `Quest ${num}`);
  const reqs = Array.isArray(quest.requirements) ? quest.requirements : [];
  const rewards = Array.isArray(quest.rewards) ? quest.rewards : [];

  const reqRows = reqs
    .map(
      (r) => `
      <div class="bear-req-row">
        <span class="bear-req-icon">▸</span>
        <span>${formatRequirement(r)}</span>
      </div>
    `,
    )
    .join("");

  const rewardRows = rewards
    .map((r) => {
      const special = isSpecialReward(r.item || "");
      return `
      <div class="bear-reward-row${special ? " bear-reward-row--special" : ""}">
        <span class="bear-reward-amt">×${fmt(r.amount ?? 1)}</span>
        <span class="bear-reward-name">${escHtml(r.item || "Unknown")}</span>
      </div>
    `;
    })
    .join("");

  return `
    <div class="bear-quest-card" id="quest-${num}">
      <div class="bear-quest-header" role="button" tabindex="0" aria-expanded="false">
        <span class="bear-quest-num">#${escHtml(String(num))}</span>
        <span class="bear-quest-name">${name}</span>
        <span class="bear-quest-chevron">▼</span>
      </div>
      <div class="bear-quest-body">
        <div class="bear-quest-columns">
          <div>
            <div class="bear-quest-col-title">Requirements</div>
            ${reqRows || "<p style='color:var(--gold-dim);font-size:.85rem'>None listed.</p>"}
          </div>
          <div>
            <div class="bear-quest-col-title">Rewards</div>
            ${rewardRows || "<p style='color:var(--gold-dim);font-size:.85rem'>None listed.</p>"}
          </div>
        </div>
      </div>
    </div>
  `;
}

function buildIntobox(bear) {
  const questCount = Array.isArray(bear.quests) ? bear.quests.length : 0;
  const image = escHtml(bear.image || "images/ui/site-logo.png");
  const aura = escHtml(bear.aura || "None");
  const location = escHtml(bear.location || "Unknown");

  return `
    <div class="bear-infobox">
      <div class="bear-infobox-header">
        <div class="bear-infobox-label">Bear Info</div>
      </div>
      <div class="bear-infobox-image">
        <img src="${image}" alt="${escHtml(bear.name)}" onerror="this.onerror=null;this.src='images/ui/site-logo.png';" />
      </div>
      <div class="bear-infobox-stats">
        <div class="bear-infobox-stat">
          <span class="bear-infobox-stat-label">Zone</span>
          <span class="bear-infobox-stat-value">${location}</span>
        </div>
        <div class="bear-infobox-stat">
          <span class="bear-infobox-stat-label">Quests</span>
          <span class="bear-infobox-stat-value">${questCount}</span>
        </div>
        <div class="bear-infobox-stat">
          <span class="bear-infobox-stat-label">Aura</span>
          <span class="bear-infobox-stat-value">${aura}</span>
        </div>
      </div>
    </div>
  `;
}

function buildAuraInline(bear) {
  const buff = bear.aura_buff;
  const auraName = escHtml(bear.aura || "");
  if (!auraName) return "";

  const STAT_LABELS = {
    Pollen: "Pollen",
    "Capacity Bonus": "Hive Capacity",
    "Tool Pollen": "Tool Pollen",
    "Energy Bonus": "Energy",
    "Honey Bonus": "Honey",
  };

  let buffDesc = "";
  if (buff) {
    const label = STAT_LABELS[buff.stat] || escHtml(buff.stat);
    const pct = (buff.per_stack * 100).toFixed(0);
    const questCount = Array.isArray(bear.quests) ? bear.quests.length : 0;
    const maxPct = (buff.per_stack * questCount * 100).toFixed(0);
    buffDesc = `Each stack of <b>${auraName}</b> permanently adds <b>+${pct}% ${label}</b>. With all ${questCount} quests completed, that's <b>+${maxPct}% ${label}</b> total.`;
  }

  return `<p class="bear-aura-inline">${buffDesc || `Aura: <b>${auraName}</b>`}</p>`;
}

function buildAllBearsSection(bears, currentId) {
  const cards = bears
    .map((b) => {
      const isCurrent = b.id === currentId;
      const href = `bear.html?bear=${encodeURIComponent(b.id)}`;
      const name = escHtml(b.name || b.id);
      const img = escHtml(b.image || "images/ui/site-logo.png");
      return `
        <a class="bear-mini-link" href="${href}" aria-label="${name}">
          <div class="bear-mini-card${isCurrent ? " bear-mini-card--current" : ""}">
            <div class="bear-mini-img">
              <img src="${img}" alt="${name}" onerror="this.onerror=null;this.src='images/ui/site-logo.png';" />
            </div>
            <div class="bear-mini-name">${name}</div>
          </div>
        </a>
      `;
    })
    .join("");

  return `
    <div class="bear-section">
      <div class="bear-section-heading">
        <span class="bear-section-deco"></span>
        All Bears
        <span class="bear-section-deco"></span>
      </div>
      <div class="bear-all-grid">${cards}</div>
    </div>
  `;
}

function buildPage(bear, allBears) {
  const quests = Array.isArray(bear.quests) ? bear.quests : [];
  const questCards = quests.map(buildQuestCard).join("");

  return `
    <div class="bear-detail-shell">
      <div class="bear-detail-hero">
        <div class="bear-detail-left">
          <div class="bear-detail-title">
            <div class="bear-detail-name">${escHtml(bear.name)}</div>
            <span class="bear-detail-zone">${escHtml(bear.location || "Unknown Zone")}</span>
          </div>
          <div class="bear-detail-desc">${escHtml(bear.description || "")}</div>
          ${buildAuraInline(bear)}
        </div>
        ${buildIntobox(bear)}
      </div>

      <div class="bear-section">
        <div class="bear-section-heading">
          <span class="bear-section-deco"></span>
          Quests
          <span class="bear-section-deco"></span>
        </div>
        <div class="bear-quest-list">
          ${questCards || "<p style='color:var(--gold-dim)'>No quests available.</p>"}
        </div>
      </div>

      ${buildAllBearsSection(allBears, bear.id)}
    </div>
  `;
}

function bindQuestToggles(root) {
  root.querySelectorAll(".bear-quest-header").forEach((header) => {
    const toggle = () => {
      const card = header.closest(".bear-quest-card");
      const open = card.classList.toggle("open");
      header.setAttribute("aria-expanded", open ? "true" : "false");
    };
    header.addEventListener("click", toggle);
    header.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  });
}

async function loadBearDetail() {
  const root = document.getElementById("bear-detail-root");
  const params = new URLSearchParams(window.location.search);
  const bearId = params.get("bear");

  if (!bearId) {
    root.innerHTML =
      '<div class="bear-detail-error">No bear specified. Add <code>?bear=bear-id</code> to the URL.</div>';
    return;
  }

  try {
    const res = await fetch("data/bears.json");
    if (!res.ok) throw new Error("Failed to fetch bears.json");
    const bears = await res.json();

    const bear = bears.find((b) => b.id === bearId);

    if (!bear) {
      root.innerHTML = `<div class="bear-detail-error">Bear "${escHtml(bearId)}" not found.</div>`;
      return;
    }

    document.title = `${bear.name} - The Majestic Bees Wiki`;
    root.innerHTML = buildPage(bear, bears);
    bindQuestToggles(root);
  } catch (err) {
    root.innerHTML =
      '<div class="bear-detail-error">Failed to load bear data.</div>';
  }
}

document.addEventListener("DOMContentLoaded", loadBearDetail);
