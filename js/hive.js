const RARITIES = [
  "common",
  "rare",
  "epic",
  "legendary",
  "mythic",
  "special",
  "limited",
  "exclusive",
];

function buffText(buff) {
  if (buff.type === "Perc") return `+${buff.value}% ${buff.stat}`;
  if (buff.type === "Mult") return `x${buff.value} ${buff.stat}`;
  return `+${buff.value} ${buff.stat}`;
}

function buildDropChanceHtml(itemName, poolStats, stickerEgg, extraChances) {
  const tags = [];
  const stat = poolStats ? poolStats.get(itemName) : null;

  if (stat) {
    const badge = window.MajesticLootLuck
      ? window.MajesticLootLuck.badge(stat.boosted)
      : "";
    const chanceDisplay = window.MajesticDropPool.formatChance(stat.chance);
    const perFlowerDisplay = window.MajesticDropPool.formatPerFlower(
      stat.perFlower,
    );

    tags.push(`
      <span class="hive-drop-tag hive-drop-tag--pool" title="Chance within the Sticker Token pool">
        ${badge}${chanceDisplay} in pool
      </span>
      <span class="hive-drop-tag hive-drop-tag--flower" title="Overall chance per flower collected">
        ${perFlowerDisplay} per flower
      </span>
    `);
  }

  if (stickerEgg) {
    tags.push(`
      <span class="hive-drop-tag hive-drop-tag--egg" title="Chance from a Sticker Egg (not affected by Loot Luck)">
        ${stickerEgg}% from Sticker Egg
      </span>
    `);
  }

  if (extraChances) {
    extraChances.forEach(({ label, type }) => {
      tags.push(`
        <span class="hive-drop-tag hive-drop-tag--${type}" title="${label}">
          ${label}
        </span>
      `);
    });
  }

  return tags.length
    ? `<div class="hive-card-drop">${tags.join("")}</div>`
    : "";
}

function buildHiveCard(item, poolStats) {
  const rKey = item.rarity.toLowerCase();
  const buffsHtml = item.buffs.length
    ? item.buffs
        .map((b) => `<span class="hive-buff-tag">${buffText(b)}</span>`)
        .join("")
    : `<span class="hive-buff-none">No bonus</span>`;
  const dropHtml = buildDropChanceHtml(
    item.name,
    poolStats,
    item.stickerEgg,
    item.extraChances,
  );

  return `
    <div class="hive-card hive-card--${rKey}">
      <div class="hive-card-img-wrap">
        <img src="${item.image}" alt="${item.name}"
          onerror="this.onerror=null;this.src='images/ui/site-logo.png';" />
      </div>
      <div class="hive-card-info">
        <div class="hive-card-name">${item.name}</div>
        <div class="hive-card-desc">${item.desc}</div>
        <div class="hive-card-buffs">${buffsHtml}</div>
        ${dropHtml}
      </div>
    </div>`;
}

function renderSection(containerId, items, poolStats) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const sorted = [...items].sort((a, b) => a.order - b.order);
  el.innerHTML = sorted.length
    ? sorted.map((item) => buildHiveCard(item, poolStats)).join("")
    : `<p class="hive-empty">Nothing here yet.</p>`;
}

let HIVE_DATA = null;

async function loadHive() {
  let data;
  try {
    const res = await fetch("data/hive.json");
    data = await res.json();
  } catch {
    [
      "skins-common",
      "skins-rare",
      "skins-epic",
      "skins-legendary",
      "stickers-common",
      "stickers-rare",
      "stickers-epic",
      "stickers-legendary",
      "stickers-mythic",
      "stickers-special",
      "stickers-limited",
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = `<p class="hive-empty">Failed to load data.</p>`;
    });
    return;
  }

  HIVE_DATA = data;
  renderHive(data);
}

function buildPoolItems(data) {
  const all = [...data.skins, ...data.stickers];
  return all
    .filter((i) => i.weight)
    .map((i) => ({ name: i.name, weight: i.weight }));
}

function renderHive(data) {
  const skinGroups = {
    common: [],
    rare: [],
    epic: [],
    legendary: [],
    mythic: [],
    special: [],
    limited: [],
    exclusive: [],
  };
  const stickerGroups = {
    common: [],
    rare: [],
    epic: [],
    legendary: [],
    mythic: [],
    special: [],
    limited: [],
    exclusive: [],
  };

  data.skins.forEach((s) => {
    const r = s.rarity.toLowerCase();
    (skinGroups[r] || skinGroups.common).push(s);
  });
  data.stickers.forEach((s) => {
    const r = s.rarity.toLowerCase();
    (stickerGroups[r] || stickerGroups.common).push(s);
  });

  const lootLuck = window.MajesticLootLuck ? window.MajesticLootLuck.get() : 0;
  const poolItems = buildPoolItems(data);

  const poolStats = window.MajesticDropPool
    ? window.MajesticDropPool.computeDropStats(poolItems, lootLuck)
    : new Map();

  RARITIES.forEach((r) => {
    renderSection(`skins-${r}`, skinGroups[r], poolStats);
    renderSection(`stickers-${r}`, stickerGroups[r], poolStats);
  });
}

document.addEventListener("majestic-loot-luck-change", () => {
  if (HIVE_DATA) renderHive(HIVE_DATA);
});

function initTabs(groupPrefix) {
  const buttons = document.querySelectorAll(
    `[data-hive-tab^="${groupPrefix}-"]`,
  );
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.hiveTab;
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document
        .querySelectorAll(`[data-hive-panel^="${groupPrefix}-"]`)
        .forEach((p) => {
          p.style.display = p.dataset.hivePanel === target ? "" : "none";
        });
    });
  });
}

function initSlotToggle() {
  const table = document.getElementById("hive-slot-table");
  const toggle = document.getElementById("hive-slot-toggle");
  if (!table || !toggle) return;
  toggle.addEventListener("click", () => {
    const expanded = table.classList.toggle("is-expanded");
    toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    toggle.textContent = expanded ? "Show fewer slots" : "Show all slot prices";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadHive();
  initTabs("skins");
  initTabs("stickers");
  initSlotToggle();
});
