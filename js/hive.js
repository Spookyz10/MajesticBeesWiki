const RARITIES = ["common", "rare", "epic", "legendary", "special"];

const RARITY_COLORS = {
  common: {
    text: "#c8c8c8",
    border: "rgba(200,200,200,0.3)",
    bg: "rgba(200,200,200,0.08)",
  },
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
  special: {
    text: "#29FF82",
    border: "rgba(41,255,130,0.4)",
    bg: "rgba(41,255,130,0.08)",
  },
};

function buffText(buff) {
  if (buff.type === "Perc") return `+${buff.value}% ${buff.stat}`;
  if (buff.type === "Mult") return `x${buff.value} ${buff.stat}`;
  return `+${buff.value} ${buff.stat}`;
}

function buildHiveCard(item) {
  const rKey = item.rarity.toLowerCase();
  const col = RARITY_COLORS[rKey] || RARITY_COLORS.common;
  const buffsHtml = item.buffs.length
    ? item.buffs
        .map((b) => `<span class="hive-buff-tag">${buffText(b)}</span>`)
        .join("")
    : `<span class="hive-buff-none">No bonus</span>`;

  return `
    <div class="hive-card">
      <div class="hive-card-img-wrap">
        <img src="${item.image}" alt="${item.name}"
          onerror="this.onerror=null;this.src='images/ui/site-logo.png';" />
      </div>
      <div class="hive-card-info">
        <div class="hive-card-name">${item.name}</div>
        <div class="hive-card-desc">${item.desc}</div>
        <div class="hive-card-buffs">${buffsHtml}</div>
      </div>
    </div>`;
}

function renderSection(containerId, items) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const sorted = [...items].sort((a, b) => a.order - b.order);
  el.innerHTML = sorted.length
    ? sorted.map(buildHiveCard).join("")
    : `<p class="hive-empty">Nothing here yet.</p>`;
}

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
      "stickers-special",
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = `<p class="hive-empty">Failed to load data.</p>`;
    });
    return;
  }

  const skinGroups = {
    common: [],
    rare: [],
    epic: [],
    legendary: [],
    special: [],
  };
  const stickerGroups = {
    common: [],
    rare: [],
    epic: [],
    legendary: [],
    special: [],
  };

  data.skins.forEach((s) => {
    const r = s.rarity.toLowerCase();
    (skinGroups[r] || skinGroups.common).push(s);
  });
  data.stickers.forEach((s) => {
    const r = s.rarity.toLowerCase();
    (stickerGroups[r] || stickerGroups.common).push(s);
  });

  RARITIES.forEach((r) => {
    renderSection(`skins-${r}`, skinGroups[r]);
    renderSection(`stickers-${r}`, stickerGroups[r]);
  });
}

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
