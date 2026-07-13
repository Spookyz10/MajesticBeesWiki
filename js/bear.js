const escHtml =
  window.escHtml ||
  ((v) =>
    String(v ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;"));

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
    case "collect_token": {
      const tokenName = req.token || "Token";
      const label = tokenName.toLowerCase().endsWith("tokens")
        ? tokenName
        : `${tokenName} Tokens`;
      return `Collect <b>${fmt(req.amount)}</b> ${escHtml(label)}`;
    }
    case "collect_sticker":
      return `Collect ${escHtml(req.sticker || "Sticker Token")}`;
    case "defeat":
    case "defeat_mob":
      return `Defeat <b>${fmt(req.amount)}</b> ${escHtml(req.mob || "mob")}`;
    case "use_ability":
      return req.ability
        ? `Activate <b>${escHtml(req.ability)}</b> <b>${fmt(req.amount)}</b> time${req.amount !== 1 ? "s" : ""}`
        : `Use an ability <b>${fmt(req.amount)}</b> time${req.amount !== 1 ? "s" : ""}`;
    case "craft":
      return `Craft <b>${fmt(req.amount)}</b> ${escHtml(req.item || "Item")}`;
    case "consume":
      return `Use <b>${fmt(req.amount)}</b> ${escHtml(req.item || "Item")}`;
    default:
      return escHtml(JSON.stringify(req));
  }
}

const SPECIAL_ITEMS = new Set([
  "Silver Egg",
  "Gold Egg",
  "Diamond Egg",
  "Basic Egg",
  "Legendary Starflower",
  "Mythic Starflower",
  "Bamboo Flask",
  "Ticket",
]);

const DIALOGUE_STAGE_LABELS = {
  take: "On Accepting",
  going: "While In Progress",
  finish: "On Completion",
};

function buildQuestDialogue(quest) {
  const dlg = quest.dialogue;
  if (!dlg || typeof dlg !== "object") return "";
  const stages = ["take", "going", "finish"].filter(
    (k) => Array.isArray(dlg[k]) && dlg[k].length,
  );
  if (!stages.length) return "";
  return `
    <div class="bear-quest-dialogue">
      <div class="bear-quest-col-title">Dialogue</div>
      <div class="bear-dialogue-stage-list">
        ${stages
          .map(
            (stage) => `
          <div class="bear-dialogue-stage">
            <div class="bear-dialogue-stage-header" role="button" tabindex="0" aria-expanded="false">
              <span class="bear-dialogue-stage-chevron">▶</span>
              <span class="bear-dialogue-stage-label">${escHtml(DIALOGUE_STAGE_LABELS[stage] || stage)}</span>
            </div>
            <div class="bear-dialogue-stage-body">
              ${dlg[stage].map((line) => `<p class="bear-dialogue-line">${escHtml(line)}</p>`).join("")}
            </div>
          </div>`,
          )
          .join("")}
      </div>
    </div>`;
}

function buildQuestCard(quest, index) {
  const num = quest.number ?? index + 1;
  const reqs = Array.isArray(quest.requirements) ? quest.requirements : [];
  const rewards = Array.isArray(quest.rewards) ? quest.rewards : [];
  const hasDialogue = Array.isArray(quest.requirements) || quest.dialogue;
  return `
    <div class="bear-quest-card" id="quest-${num}">
      <div class="bear-quest-header" role="button" tabindex="0" aria-expanded="false">
        <span class="bear-quest-num">#${escHtml(String(num))}</span>
        <span class="bear-quest-name">${escHtml(quest.name || `Quest ${num}`)}</span>
        <span class="bear-quest-chevron">▼</span>
      </div>
      <div class="bear-quest-body">
        <div class="bear-quest-columns">
          <div>
            <div class="bear-quest-col-title">Requirements</div>
            ${reqs.map((r) => `<div class="bear-req-row"><span class="bear-req-icon">▸</span><span>${formatRequirement(r)}</span></div>`).join("") || "<p style='color:var(--gold-dim);font-size:.85rem'>None listed.</p>"}
          </div>
          <div>
            <div class="bear-quest-col-title">Rewards</div>
            ${
              rewards
                .map((r) => {
                  const itemName = r.item || "";
                  const special =
                    SPECIAL_ITEMS.has(itemName) ||
                    /egg/i.test(itemName) ||
                    /bee$/i.test(itemName) ||
                    /(legendary|mythic) starflower/i.test(itemName);
                  return `<div class="bear-reward-row${special ? " bear-reward-row--special" : ""}"><span class="bear-reward-amt">×${fmt(r.amount ?? 1)}</span><span class="bear-reward-name">${escHtml(r.item || "Unknown")}</span></div>`;
                })
                .join("") ||
              "<p style='color:var(--gold-dim);font-size:.85rem'>None listed.</p>"
            }
          </div>
        </div>
        ${quest.dialogue ? buildQuestDialogue(quest) : ""}
      </div>
    </div>`;
}

function buildInfobox(bear) {
  const questCount = Array.isArray(bear.quests) ? bear.quests.length : 0;
  const questsValue = bear.cyclic
    ? `<span class="bear-infinity-badge" title="This bear's quests repeat forever in a fixed cycle">∞ <span class="bear-infinity-sub">(${questCount}-quest cycle)</span></span>`
    : questCount;
  return `
    <div class="bear-infobox">
      <div class="bear-infobox-header"><div class="bear-infobox-label">Bear Info</div></div>
      <div class="bear-infobox-image">
        <img src="${escHtml(bear.image || "images/ui/site-logo.png")}" alt="${escHtml(bear.name)}"
          onerror="this.onerror=null;this.src='images/ui/site-logo.png';" />
      </div>
      <div class="bear-infobox-stats">
        <div class="bear-infobox-stat">
          <span class="bear-infobox-stat-label">Location</span>
          <span class="bear-infobox-stat-value">${escHtml(bear.location || "Unknown")}</span>
        </div>
        <div class="bear-infobox-stat">
          <span class="bear-infobox-stat-label">Quests</span>
          <span class="bear-infobox-stat-value">${questsValue}</span>
        </div>
      </div>
    </div>`;
}

function buildAuraInline(bear) {
  const auraName = escHtml(bear.aura || "");
  if (!auraName) return "";

  const buffs = Array.isArray(bear.aura_buff)
    ? bear.aura_buff
    : bear.aura_buff
      ? [bear.aura_buff]
      : [];
  if (!buffs.length)
    return `<p class="bear-aura-inline">Aura: <b>${auraName}</b></p>`;

  const STAT_LABELS = {
    Pollen: "Pollen",
    "Capacity Bonus": "Hive Capacity",
    "Tool Pollen": "Tool Pollen",
    "Energy Bonus": "Energy",
    "Honey Bonus": "Honey",
    "Critical Power": "Critical Power",
    "Honey From Tokens": "Honey From Tokens",
    "Loot Luck": "Loot Luck",
  };

  const questCount = Array.isArray(bear.quests) ? bear.quests.length : 0;
  const trim = (n) => Number(n.toFixed(4)).toString();

  const lines = buffs.map((buff) => {
    const label = STAT_LABELS[buff.stat] || escHtml(buff.stat);
    const cap = buff.max_stack ?? questCount;

    if (buff.type === "mult") {
      const perStackVal = trim(1 + buff.per_stack);
      const maxVal = trim(1 + buff.per_stack * cap);
      return `Each stack of <b>${auraName}</b> multiplies <b>${label}</b> by <b>${perStackVal}×</b> (max <b>${cap}</b> stacks → <b>${maxVal}×</b>)`;
    }

    const perVal = trim(buff.per_stack);
    const maxVal = trim(buff.per_stack * cap);
    return `Each stack of <b>${auraName}</b> adds <b>+${perVal}% ${label}</b> (max <b>${cap}</b> stacks → <b>+${maxVal}% ${label}</b>)`;
  });

  return `<p class="bear-aura-inline">${lines.join("<br>")}</p>`;
}

function buildAllBearsSection(bears, currentId) {
  return `
    <div class="bear-section">
      <div class="bear-section-heading"><span class="bear-section-deco"></span>All Bears<span class="bear-section-deco"></span></div>
      <div class="bear-all-grid">
        ${bears
          .map(
            (b) => `
          <a class="bear-mini-link" href="bear.html?bear=${encodeURIComponent(b.id)}" aria-label="${escHtml(b.name || b.id)}">
            <div class="bear-mini-card${b.id === currentId ? " bear-mini-card--current" : ""}">
              <div class="bear-mini-img"><img src="${escHtml(b.image || "images/ui/site-logo.png")}" alt="${escHtml(b.name || "")}" loading="lazy" onerror="this.onerror=null;this.src='images/ui/site-logo.png';" /></div>
              <div class="bear-mini-name">${escHtml(b.name || b.id)}</div>
            </div>
          </a>`,
          )
          .join("")}
      </div>
    </div>`;
}

function buildNoQuestDialog(bear) {
  const lines = Array.isArray(bear.noquest_dialog) ? bear.noquest_dialog : [];
  if (!lines.length) return "";
  return `
    <div class="bear-noquest-box">
      <div class="bear-noquest-label">When you have no available quests, ${escHtml(bear.name || "this bear")} will say:</div>
      <div class="bear-noquest-lines">
        ${lines.map((line) => `<p class="bear-dialogue-line">${escHtml(line)}</p>`).join("")}
      </div>
    </div>`;
}

function buildCyclicNote(bear) {
  if (!bear.cyclic) return "";
  const len = Array.isArray(bear.quests) ? bear.quests.length : 0;
  return `<div class="bear-cycle-note"><span class="bear-cycle-note-icon">↻</span><span>This bear does not have a fixed quest line. Once quest <b>#${len}</b> is finished, the cycle loops back to <b>#1</b> and repeats forever, with the same requirements and rewards each time.</span></div>`;
}

function buildPage(bear, allBears) {
  const quests = Array.isArray(bear.quests) ? bear.quests : [];
  const sectionTitle = bear.cyclic ? "Quest Cycle" : "Quests";
  return `
    <div class="bear-detail-shell">
      <div class="bear-detail-hero">
        <div class="bear-detail-left">
          <div class="bear-detail-title"><div class="bear-detail-name">${escHtml(bear.name)}</div></div>
          <div class="bear-detail-desc">${escHtml(bear.description || "")}</div>
          ${buildAuraInline(bear)}
        </div>
        ${buildInfobox(bear)}
      </div>
      ${buildNoQuestDialog(bear)}
      <div class="bear-section">
        <div class="bear-section-heading"><span class="bear-section-deco"></span>${sectionTitle}<span class="bear-section-deco"></span></div>
        ${buildCyclicNote(bear)}
        <div class="bear-quest-list">
          ${quests.map(buildQuestCard).join("") || "<p style='color:var(--gold-dim)'>No quests available.</p>"}
        </div>
      </div>
      ${buildAllBearsSection(allBears, bear.id)}
    </div>`;
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

function bindDialogueStageToggles(root) {
  root.querySelectorAll(".bear-dialogue-stage-header").forEach((header) => {
    const toggle = () => {
      const stage = header.closest(".bear-dialogue-stage");
      const open = stage.classList.toggle("open");
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
  const bearId = new URLSearchParams(window.location.search).get("bear");
  if (!bearId) {
    root.innerHTML = '<div class="bear-detail-error">No bear specified.</div>';
    return;
  }
  try {
    const res = await fetch("data/bears.json");
    if (!res.ok) throw new Error();
    const bears = await res.json();
    const bear = bears.find((b) => b.id === bearId);
    if (!bear) {
      root.innerHTML = `<div class="bear-detail-error">Bear "${escHtml(bearId)}" not found.</div>`;
      return;
    }
    document.title = `${bear.name} - The Majestic Bees Wiki`;
    root.innerHTML = buildPage(bear, bears);
    bindQuestToggles(root);
    bindDialogueStageToggles(root);
  } catch {
    root.innerHTML =
      '<div class="bear-detail-error">Failed to load bear data.</div>';
  }
}

document.addEventListener("DOMContentLoaded", loadBearDetail);
