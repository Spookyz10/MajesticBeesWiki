const HB_COLUMNS = [10, 10, 10, 10, 10];
const HB_TOTAL_SLOTS = HB_COLUMNS.reduce((a, b) => a + b, 0);

const HB_STICKER_GROUPS = {
  top: 3,
  bottom: 3,
  left: 7,
  right: 7,
};
const HB_STICKER_SLOTS =
  HB_STICKER_GROUPS.top +
  HB_STICKER_GROUPS.bottom +
  HB_STICKER_GROUPS.left +
  HB_STICKER_GROUPS.right;

const HB_RARITY_VAR = {
  common: "--r-common",
  rare: "--r-rare",
  epic: "--r-epic",
  legendary: "--r-legendary",
  mythic: "--r-mythic",
  special: "--r-special",
  limited: "--r-limited",
  exclusive: "--r-exclusive",
};

const HB_RARITY_RGB = {
  common: [168, 121, 79],
  rare: [196, 200, 212],
  epic: [232, 192, 64],
  legendary: [100, 181, 246],
  mythic: [206, 147, 216],
  special: [122, 184, 96],
  limited: [
    [80, 140, 245],
    [170, 90, 230],
  ],
  exclusive: [41, 217, 140],
};

function hbIsGradientRarity(rgb) {
  return Array.isArray(rgb[0]);
}

const HB_DARK_MIX = [28, 20, 0];

let hbBees = [];
let hbStickers = [];
let hbSlots = Array.from({ length: HB_TOTAL_SLOTS }, () => ({
  bee: null,
  shiny: false,
}));
let hbStickerSlots = Array.from({ length: HB_STICKER_SLOTS }, () => ({
  sticker: null,
}));
let hbSelectedBee = null;
let hbSelectedSticker = null;

function hbEsc(str) {
  if (typeof escHtml === "function") return escHtml(str);
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

function hbFaceIcon(bee) {
  const raw = bee.icon || bee.image || "";
  const base = raw.split("/").pop();
  return base ? `images/bee-faces/${base}` : "images/ui/site-logo.png";
}

function hbGetBee(name) {
  return hbBees.find((b) => b.name === name) || null;
}

function hbGetSticker(name) {
  return hbStickers.find((s) => s.name === name) || null;
}

async function hbLoadData() {
  const [beesRes, hiveRes] = await Promise.all([
    fetch("data/bees.json"),
    fetch("data/hive.json"),
  ]);
  const beesData = await beesRes.json();
  const hiveData = await hiveRes.json();

  hbBees = Array.isArray(beesData) ? beesData : Object.values(beesData);
  hbStickers = Array.isArray(hiveData.stickers) ? hiveData.stickers : [];
}

function hbApplyRarityStyle(card, rarity) {
  const rarityKey = (rarity || "").toLowerCase();
  const rgb = HB_RARITY_RGB[rarityKey] || HB_RARITY_RGB.common;

  if (hbIsGradientRarity(rgb)) {
    const c1bg = hbMixRgb(rgb[0], HB_DARK_MIX, 0.45);
    const c2bg = hbMixRgb(rgb[1], HB_DARK_MIX, 0.45);
    const c1border = hbMixRgb(rgb[0], HB_DARK_MIX, 0.7);
    const c2border = hbMixRgb(rgb[1], HB_DARK_MIX, 0.7);
    card.style.background = `linear-gradient(135deg, ${c1bg}, ${c2bg})`;
    card.style.borderColor = c2border;
    card.style.borderImage = `linear-gradient(135deg, ${c1border}, ${c2border}) 1`;
  } else {
    card.style.borderImage = "none";
    card.style.background = hbMixRgb(rgb, HB_DARK_MIX, 0.45);
    card.style.borderColor = hbMixRgb(rgb, HB_DARK_MIX, 0.7);
  }
}

function hbBuildPalettes() {
  const beeList = document.getElementById("hb-bee-list");
  beeList.innerHTML = "";
  hbBees.forEach((bee) => {
    const card = document.createElement("div");
    card.className = "hb-card";
    card.draggable = true;
    card.dataset.bee = bee.name;
    card.title = bee.name;
    hbApplyRarityStyle(card, bee.rarity);

    const img = document.createElement("img");
    img.src = bee.icon || "images/ui/site-logo.png";
    img.alt = bee.name;
    img.onerror = () => {
      img.onerror = null;
      img.src = "images/ui/site-logo.png";
    };
    const span = document.createElement("span");
    span.textContent = bee.name.replace(/\s*Bee$/, "");

    card.appendChild(img);
    card.appendChild(span);

    card.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("application/x-bee", bee.name);
      e.dataTransfer.effectAllowed = "copy";
    });

    card.addEventListener("click", () => {
      const isSame = hbSelectedBee === bee.name;
      document
        .querySelectorAll("#hb-bee-list .hb-card")
        .forEach((c) => c.classList.remove("hb-card-selected"));
      hbSelectedBee = isSame ? null : bee.name;
      if (hbSelectedBee) card.classList.add("hb-card-selected");
    });

    beeList.appendChild(card);
  });

  const stickerList = document.getElementById("hb-sticker-list");
  stickerList.innerHTML = "";
  hbStickers.forEach((sticker) => {
    const card = document.createElement("div");
    card.className = "hb-card";
    card.draggable = true;
    card.dataset.sticker = sticker.name;
    card.title = sticker.name;
    hbApplyRarityStyle(card, sticker.rarity);

    const img = document.createElement("img");
    img.src = sticker.image || "images/ui/site-logo.png";
    img.alt = sticker.name;
    img.onerror = () => {
      img.onerror = null;
      img.src = "images/ui/site-logo.png";
    };
    const span = document.createElement("span");
    span.textContent = sticker.name.replace(/\s*Sticker$/, "");

    card.appendChild(img);
    card.appendChild(span);

    card.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("application/x-sticker", sticker.name);
      e.dataTransfer.effectAllowed = "copy";
    });

    card.addEventListener("click", () => {
      const isSame = hbSelectedSticker === sticker.name;
      document
        .querySelectorAll("#hb-sticker-list .hb-card")
        .forEach((c) => c.classList.remove("hb-card-selected"));
      hbSelectedSticker = isSame ? null : sticker.name;
      if (hbSelectedSticker) card.classList.add("hb-card-selected");
    });

    stickerList.appendChild(card);
  });
}

const HB_HEX_POINTS = "25,0 75,0 100,50 75,100 25,100 0,50";
const SVG_NS = "http://www.w3.org/2000/svg";

function hbCreateHexSvg() {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "hb-hex-svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("preserveAspectRatio", "none");

  const poly = document.createElementNS(SVG_NS, "polygon");
  poly.setAttribute("class", "hb-hex-poly");
  poly.setAttribute("points", HB_HEX_POINTS);

  svg.appendChild(poly);
  return { svg, poly };
}

function hbBuildGrid() {
  const grid = document.getElementById("hb-hive-grid");
  grid.innerHTML = "";
  let index = 0;

  HB_COLUMNS.forEach((height, col) => {
    const colEl = document.createElement("div");
    colEl.className = "hb-hive-col";

    for (let row = 0; row < height; row++) {
      const slotIndex = index++;
      const hex = document.createElement("div");
      hex.className = "hb-hex hb-hex-empty";
      hex.dataset.index = String(slotIndex);
      hex.setAttribute("role", "button");
      hex.setAttribute("aria-label", `Hive slot ${slotIndex + 1}`);

      const { svg, poly } = hbCreateHexSvg();
      hex.appendChild(svg);

      poly.addEventListener("dragover", (e) => {
        e.preventDefault();
        hex.classList.add("hb-drop-hover");
      });
      poly.addEventListener("dragleave", () => {
        hex.classList.remove("hb-drop-hover");
      });
      poly.addEventListener("drop", (e) => {
        e.preventDefault();
        hex.classList.remove("hb-drop-hover");
        const beeName = e.dataTransfer.getData("application/x-bee");
        const moveFrom = e.dataTransfer.getData("application/x-hex-move");
        if (beeName) {
          hbSlots[slotIndex] = { bee: beeName, shiny: false };
          hbRenderGrid();
          hbRenderBonuses();
        } else if (moveFrom !== "") {
          const fromIndex = Number(moveFrom);
          if (fromIndex !== slotIndex) {
            const tmp = hbSlots[slotIndex];
            hbSlots[slotIndex] = hbSlots[fromIndex];
            hbSlots[fromIndex] = tmp;
            hbRenderGrid();
            hbRenderBonuses();
          }
        }
      });

      poly.addEventListener("click", () => {
        const slot = hbSlots[slotIndex];
        if (slot.bee) {
          slot.bee = null;
          slot.shiny = false;
        } else if (hbSelectedBee) {
          slot.bee = hbSelectedBee;
          slot.shiny = false;
        } else {
          return;
        }
        hbRenderGrid();
        hbRenderBonuses();
      });

      colEl.appendChild(hex);
    }
    grid.appendChild(colEl);
  });

  hbRenderGrid();
}

function hbRenderGrid() {
  const grid = document.getElementById("hb-hive-grid");
  const hexes = grid.querySelectorAll(".hb-hex");
  hexes.forEach((hex) => {
    const index = Number(hex.dataset.index);
    const slot = hbSlots[index];
    const poly = hex.querySelector(".hb-hex-poly");

    hex.classList.remove("hb-hex-shiny");
    hex.draggable = false;
    hex
      .querySelectorAll(".hb-hex-face, .hb-hex-star, .hb-hex-plus")
      .forEach((el) => el.remove());

    if (!slot.bee) {
      hex.classList.add("hb-hex-empty");
      hex.classList.remove("hb-hex-filled");
      poly.style.fill = "#2a2010";
      const plus = document.createElement("span");
      plus.className = "hb-hex-plus";
      plus.textContent = "+";
      hex.appendChild(plus);
      return;
    }

    hex.classList.remove("hb-hex-empty");
    hex.classList.add("hb-hex-filled");
    hex.draggable = true;

    hex.ondragstart = (e) => {
      e.dataTransfer.setData("application/x-hex-move", String(index));
      e.dataTransfer.effectAllowed = "move";
    };

    const bee = hbGetBee(slot.bee);
    if (!bee) return;

    const rarityKey = (bee.rarity || "").toLowerCase();
    const rgb = HB_RARITY_RGB[rarityKey] || HB_RARITY_RGB.common;
    if (hbIsGradientRarity(rgb)) {
      const c1 = hbMixRgb(rgb[0], HB_DARK_MIX, 0.9);
      const c2 = hbMixRgb(rgb[1], HB_DARK_MIX, 0.9);
      poly.style.fill = "url(#hb-grad-" + hex.dataset.index + ")";
      hbEnsurePolyGradient(hex, index, c1, c2);
    } else {
      poly.style.fill = hbMixRgb(rgb, HB_DARK_MIX, 0.9);
    }
    const img = document.createElement("img");
    img.className = "hb-hex-face";
    img.src = hbFaceIcon(bee);
    img.alt = bee.name;
    img.onerror = () => {
      img.onerror = null;
      img.src = "images/ui/site-logo.png";
    };
    hex.appendChild(img);

    const star = document.createElement("button");
    star.type = "button";
    star.className = "hb-hex-star" + (slot.shiny ? " hb-star-active" : "");
    star.innerHTML = "★";
    star.setAttribute("aria-label", "Toggle shiny");
    star.addEventListener("click", (e) => {
      e.stopPropagation();
      slot.shiny = !slot.shiny;
      hbRenderGrid();
      hbRenderBonuses();
    });
    hex.appendChild(star);

    if (slot.shiny) hex.classList.add("hb-hex-shiny");
  });

  hbUpdateCount();
}

function hbUpdateCount() {
  const filled = hbSlots.filter((s) => s.bee).length;
  document.getElementById("hb-count-value").textContent = String(filled);
  document.getElementById("hb-count-max").textContent = String(HB_TOTAL_SLOTS);
}

function hbStickerRanges() {
  const { top, bottom, left, right } = HB_STICKER_GROUPS;
  return {
    top: [0, top],
    bottom: [top, top + bottom],
    left: [top + bottom, top + bottom + left],
    right: [top + bottom + left, top + bottom + left + right],
  };
}

function hbBuildStickerSlot(index) {
  const el = document.createElement("div");
  el.className = "hb-sticker-slot";
  el.dataset.index = String(index);
  el.setAttribute("role", "button");
  el.setAttribute("aria-label", `Sticker slot ${index + 1}`);

  el.addEventListener("dragover", (e) => {
    e.preventDefault();
    el.classList.add("hb-drop-hover");
  });
  el.addEventListener("dragleave", () => el.classList.remove("hb-drop-hover"));
  el.addEventListener("drop", (e) => {
    e.preventDefault();
    el.classList.remove("hb-drop-hover");
    const name = e.dataTransfer.getData("application/x-sticker");
    const moveFrom = e.dataTransfer.getData("application/x-sticker-move");
    if (name) {
      hbStickerSlots[index] = { sticker: name };
      hbRenderStickerGrid();
      hbRenderBonuses();
    } else if (moveFrom !== "") {
      const fromIndex = Number(moveFrom);
      if (fromIndex !== index) {
        const tmp = hbStickerSlots[index];
        hbStickerSlots[index] = hbStickerSlots[fromIndex];
        hbStickerSlots[fromIndex] = tmp;
        hbRenderStickerGrid();
        hbRenderBonuses();
      }
    }
  });

  el.addEventListener("click", () => {
    const slot = hbStickerSlots[index];
    if (slot.sticker) {
      slot.sticker = null;
    } else if (hbSelectedSticker) {
      slot.sticker = hbSelectedSticker;
    } else {
      return;
    }
    hbRenderStickerGrid();
    hbRenderBonuses();
  });

  return el;
}

function hbBuildStickerFrame() {
  const ranges = hbStickerRanges();
  const groupEls = {
    top: document.getElementById("hb-sticker-top"),
    bottom: document.getElementById("hb-sticker-bottom"),
    left: document.getElementById("hb-sticker-left"),
    right: document.getElementById("hb-sticker-right"),
  };
  Object.keys(ranges).forEach((group) => {
    const [start, end] = ranges[group];
    groupEls[group].innerHTML = "";
    for (let i = start; i < end; i++) {
      groupEls[group].appendChild(hbBuildStickerSlot(i));
    }
  });
  document.getElementById("hb-sticker-max").textContent =
    String(HB_STICKER_SLOTS);
  hbRenderStickerGrid();
}

function hbRenderStickerGrid() {
  const slotsEls = document.querySelectorAll(".hb-sticker-slot");
  slotsEls.forEach((el) => {
    const index = Number(el.dataset.index);
    const slot = hbStickerSlots[index];
    el.innerHTML = "";
    el.draggable = false;
    el.classList.remove("hb-sticker-slot-filled");

    if (!slot.sticker) return;
    const sticker = hbGetSticker(slot.sticker);
    if (!sticker) return;

    el.classList.add("hb-sticker-slot-filled");
    el.draggable = true;
    el.ondragstart = (e) => {
      e.dataTransfer.setData("application/x-sticker-move", String(index));
      e.dataTransfer.effectAllowed = "move";
    };

    const img = document.createElement("img");
    img.src = sticker.image || "images/ui/site-logo.png";
    img.alt = sticker.name;
    img.onerror = () => {
      img.onerror = null;
      img.src = "images/ui/site-logo.png";
    };
    el.appendChild(img);
    el.title = sticker.name;
  });

  const filled = hbStickerSlots.filter((s) => s.sticker).length;
  document.getElementById("hb-sticker-count").textContent = String(filled);
}

function hbInitTrash() {
  const trash = document.getElementById("hb-trash");
  trash.addEventListener("dragover", (e) => {
    e.preventDefault();
    trash.classList.add("hb-trash-active");
  });
  trash.addEventListener("dragleave", () =>
    trash.classList.remove("hb-trash-active"),
  );
  trash.addEventListener("drop", (e) => {
    e.preventDefault();
    trash.classList.remove("hb-trash-active");
    const hexMove = e.dataTransfer.getData("application/x-hex-move");
    const stickerMove = e.dataTransfer.getData("application/x-sticker-move");
    if (hexMove !== "") {
      hbSlots[Number(hexMove)] = { bee: null, shiny: false };
      hbRenderGrid();
      hbRenderBonuses();
    } else if (stickerMove !== "") {
      hbStickerSlots[Number(stickerMove)] = { sticker: null };
      hbRenderStickerGrid();
      hbRenderBonuses();
    }
  });
}

function hbFormatBonus(type, value) {
  if (type === "Mult")
    return `x${Number(value).toFixed(2).replace(/\.00$/, "")}`;
  if (type === "Perc") return `+${value}%`;
  if (type === "Add") return `+${value}`;
  return String(value);
}

function hbAggregate(entries) {
  const map = new Map();
  entries.forEach(({ stat, type, value }) => {
    const key = `${stat}||${type}`;
    if (!map.has(key)) {
      map.set(key, { stat, type, value: type === "Mult" ? 1 : 0 });
    }
    const cur = map.get(key);
    if (type === "Mult") cur.value *= value;
    else cur.value += value;
  });
  return Array.from(map.values());
}

function hbGetGiftBonusEntries() {
  const seen = new Set();
  const entries = [];
  hbSlots.forEach((slot) => {
    if (!slot.bee || !slot.shiny) return;
    if (seen.has(slot.bee)) return;
    seen.add(slot.bee);
    const bee = hbGetBee(slot.bee);
    if (bee && bee.shinyBonus) entries.push({ ...bee.shinyBonus });
  });
  return hbAggregate(entries);
}

function hbGetStickerBonusEntries() {
  const seen = new Set();
  const entries = [];
  hbStickerSlots.forEach((slot) => {
    if (!slot.sticker) return;
    if (seen.has(slot.sticker)) return;
    seen.add(slot.sticker);
    const sticker = hbGetSticker(slot.sticker);
    if (sticker && Array.isArray(sticker.buffs)) {
      sticker.buffs.forEach((b) => entries.push({ ...b }));
    }
  });
  return hbAggregate(entries);
}

function hbRenderBonusTable(tbodyId, entries, emptyMsg) {
  const tbody = document.getElementById(tbodyId);
  if (!entries.length) {
    tbody.innerHTML = `<tr><td colspan="2" class="hb-bonus-empty">${hbEsc(emptyMsg)}</td></tr>`;
    return;
  }
  tbody.innerHTML = entries
    .map(
      (e) =>
        `<tr><td>${hbEsc(e.stat)}</td><td>${hbEsc(hbFormatBonus(e.type, e.value))}</td></tr>`,
    )
    .join("");
}

function hbRenderBonuses() {
  const giftEntries = hbGetGiftBonusEntries();
  const stickerEntries = hbGetStickerBonusEntries();
  const totalEntries = hbAggregate([...giftEntries, ...stickerEntries]);

  hbRenderBonusTable("hb-gift-tbody", giftEntries, "No shiny bees placed yet.");
  hbRenderBonusTable(
    "hb-sticker-tbody",
    stickerEntries,
    "No stickers placed yet.",
  );
  hbRenderBonusTable(
    "hb-total-tbody",
    totalEntries,
    "Nothing yet, place bees and stickers.",
  );
}

function hbInitCopyButtons() {
  document.querySelectorAll(".hb-copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const tableId = btn.dataset.copyTarget;
      const table = document.getElementById(tableId);
      const rows = Array.from(table.querySelectorAll("tbody tr"))
        .map((tr) => {
          const cells = Array.from(tr.querySelectorAll("td")).map((td) =>
            td.textContent.trim(),
          );
          return cells.join(": ");
        })
        .filter((line) => line && !line.includes("undefined"));

      const text = rows.join("\n");
      try {
        await navigator.clipboard.writeText(text);
        btn.classList.add("hb-copied");
        const original = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(() => {
          btn.classList.remove("hb-copied");
          btn.textContent = original;
        }, 1400);
      } catch {}
    });
  });
}

function hbHexPathAt(ctx, cx, cy, w, h) {
  const hw = w / 2;
  const hh = h / 2;
  ctx.beginPath();
  ctx.moveTo(cx - hw * 0.5, cy - hh);
  ctx.lineTo(cx + hw * 0.5, cy - hh);
  ctx.lineTo(cx + hw, cy);
  ctx.lineTo(cx + hw * 0.5, cy + hh);
  ctx.lineTo(cx - hw * 0.5, cy + hh);
  ctx.lineTo(cx - hw, cy);
  ctx.closePath();
}

function hbLoadImage(src) {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function hbRoundRectPath(ctx, x, y, w, h, r) {
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function hbMixRgb(rgb, dark, ratio) {
  const r = Math.round(rgb[0] * ratio + dark[0] * (1 - ratio));
  const g = Math.round(rgb[1] * ratio + dark[1] * (1 - ratio));
  const b = Math.round(rgb[2] * ratio + dark[2] * (1 - ratio));
  return `rgb(${r},${g},${b})`;
}

function hbMixRgb(rgb, dark, ratio) {
  const r = Math.round(rgb[0] * ratio + dark[0] * (1 - ratio));
  const g = Math.round(rgb[1] * ratio + dark[1] * (1 - ratio));
  const b = Math.round(rgb[2] * ratio + dark[2] * (1 - ratio));
  return `rgb(${r},${g},${b})`;
}

function hbEnsurePolyGradient(hex, index, c1, c2) {
  const svg = hex.querySelector(".hb-hex-svg");
  let defs = svg.querySelector("defs");
  if (!defs) {
    defs = document.createElementNS(SVG_NS, "defs");
    svg.insertBefore(defs, svg.firstChild);
  }
  const gradId = "hb-grad-" + index;
  let grad = defs.querySelector("#" + gradId);
  if (!grad) {
    grad = document.createElementNS(SVG_NS, "linearGradient");
    grad.setAttribute("id", gradId);
    grad.setAttribute("x1", "0%");
    grad.setAttribute("y1", "0%");
    grad.setAttribute("x2", "100%");
    grad.setAttribute("y2", "100%");
    const stop1 = document.createElementNS(SVG_NS, "stop");
    stop1.setAttribute("offset", "0%");
    const stop2 = document.createElementNS(SVG_NS, "stop");
    stop2.setAttribute("offset", "100%");
    grad.appendChild(stop1);
    grad.appendChild(stop2);
    defs.appendChild(grad);
  }
  grad.children[0].setAttribute("stop-color", c1);
  grad.children[1].setAttribute("stop-color", c2);
}

async function hbExportHive() {
  const hexW = 97;
  const hexH = 78;
  const gapX = hexW * 0.7826;
  const gapY = hexH + 6;
  const colOffset = gapY / 2;
  const strokeW = Math.max(3, hexW * 0.05);
  const maxCol = Math.max(...HB_COLUMNS);

  const hiveW = gapX * (HB_COLUMNS.length - 1) + hexW * 1.3;
  const hiveH = gapY * maxCol + colOffset;

  const stickerSize = 80;
  const stickerGap = 16;
  const ranges = hbStickerRanges();

  const topH = HB_STICKER_GROUPS.top ? stickerSize + 24 : 0;
  const bottomH = HB_STICKER_GROUPS.bottom ? stickerSize + 24 : 0;
  const leftW = HB_STICKER_GROUPS.left ? stickerSize + 24 : 0;
  const rightW = HB_STICKER_GROUPS.right ? stickerSize + 24 : 0;

  const outerPad = 36;
  const canvasW = outerPad * 2 + leftW + hiveW + rightW;
  const canvasH = outerPad * 2 + topH + hiveH + bottomH;

  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#1a1200";
  ctx.fillRect(0, 0, canvasW, canvasH);

  const hiveOriginX = outerPad + leftW;
  const hiveOriginY = outerPad + topH;

  const faceCache = {};
  const stickerCache = {};

  let index = 0;
  for (let col = 0; col < HB_COLUMNS.length; col++) {
    const height = HB_COLUMNS[col];
    const isEven = col % 2 === 0;
    const colOffsetY = isEven ? colOffset : 0;
    const colContentH = gapY * (height - 1);
    const startY =
      hiveOriginY + colOffsetY + (hiveH - colOffset - colContentH) / 2;

    for (let row = 0; row < height; row++) {
      const slot = hbSlots[index];
      const cx = hiveOriginX + hexW * 0.7 + col * gapX;
      const cyFinal = startY + row * gapY;

      hbHexPathAt(ctx, cx, cyFinal, hexW, hexH);

      const bee = slot.bee ? hbGetBee(slot.bee) : null;

      if (!slot.bee) {
        ctx.fillStyle = "#2a2010";
        ctx.fill();
      } else {
        const rarityKey = bee ? (bee.rarity || "").toLowerCase() : "common";
        const rgb = HB_RARITY_RGB[rarityKey] || HB_RARITY_RGB.common;
        if (hbIsGradientRarity(rgb)) {
          const bounds = {
            x: cx - hexW / 2,
            y: cyFinal - hexH / 2,
            w: hexW,
            h: hexH,
          };
          const grad = ctx.createLinearGradient(
            bounds.x,
            bounds.y,
            bounds.x + bounds.w,
            bounds.y + bounds.h,
          );
          grad.addColorStop(0, hbMixRgb(rgb[0], HB_DARK_MIX, 0.9));
          grad.addColorStop(1, hbMixRgb(rgb[1], HB_DARK_MIX, 0.9));
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = hbMixRgb(rgb, HB_DARK_MIX, 0.9);
        }
        ctx.fill();
      }

      ctx.save();
      if (slot.bee && slot.shiny) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = strokeW + 1;
        ctx.shadowColor = "rgba(255,255,255,0.9)";
        ctx.shadowBlur = 14;
      } else {
        ctx.strokeStyle = "#000";
        ctx.lineWidth = strokeW;
      }
      ctx.lineJoin = "round";
      ctx.stroke();
      ctx.restore();

      if (bee) {
        const src = hbFaceIcon(bee);
        if (!(src in faceCache)) faceCache[src] = await hbLoadImage(src);
        const img = faceCache[src];
        if (img) {
          const size = hexH * 0.62;
          ctx.drawImage(img, cx - size / 2, cyFinal - size / 2, size, size);
        }
      }
      index++;
    }
  }

  async function drawStickerAt(x, y, stickerName) {
    hbRoundRectPath(ctx, x, y, stickerSize, stickerSize, 10);
    ctx.fillStyle = "rgba(18,12,0,0.6)";
    ctx.fill();
    ctx.strokeStyle = "rgba(58,40,0,0.7)";
    ctx.lineWidth = 1;
    ctx.stroke();

    if (!stickerName) return;
    const sticker = hbGetSticker(stickerName);
    if (!sticker) return;
    const src = sticker.image || "";
    if (!(src in stickerCache)) stickerCache[src] = await hbLoadImage(src);
    const img = stickerCache[src];
    if (img) {
      const pad = stickerSize * 0.12;
      ctx.drawImage(
        img,
        x + pad,
        y + pad,
        stickerSize - pad * 2,
        stickerSize - pad * 2,
      );
    }
  }

  if (HB_STICKER_GROUPS.top) {
    const [start, end] = ranges.top;
    const count = end - start;
    const rowW = count * stickerSize + (count - 1) * stickerGap;
    let x = hiveOriginX + (hiveW - rowW) / 2;
    const y = outerPad + (topH - stickerSize) / 2;
    for (let i = start; i < end; i++) {
      await drawStickerAt(x, y, hbStickerSlots[i].sticker);
      x += stickerSize + stickerGap;
    }
  }

  if (HB_STICKER_GROUPS.bottom) {
    const [start, end] = ranges.bottom;
    const count = end - start;
    const rowW = count * stickerSize + (count - 1) * stickerGap;
    let x = hiveOriginX + (hiveW - rowW) / 2;
    const y = hiveOriginY + hiveH + (bottomH - stickerSize) / 2;
    for (let i = start; i < end; i++) {
      await drawStickerAt(x, y, hbStickerSlots[i].sticker);
      x += stickerSize + stickerGap;
    }
  }

  if (HB_STICKER_GROUPS.left) {
    const [start, end] = ranges.left;
    const count = end - start;
    const colH = count * stickerSize + (count - 1) * stickerGap;
    let y = hiveOriginY + (hiveH - colH) / 2;
    const x = outerPad + (leftW - stickerSize) / 2;
    for (let i = start; i < end; i++) {
      await drawStickerAt(x, y, hbStickerSlots[i].sticker);
      y += stickerSize + stickerGap;
    }
  }

  if (HB_STICKER_GROUPS.right) {
    const [start, end] = ranges.right;
    const count = end - start;
    const colH = count * stickerSize + (count - 1) * stickerGap;
    let y = hiveOriginY + (hiveH - colH) / 2;
    const x = hiveOriginX + hiveW + (rightW - stickerSize) / 2;
    for (let i = start; i < end; i++) {
      await drawStickerAt(x, y, hbStickerSlots[i].sticker);
      y += stickerSize + stickerGap;
    }
  }

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-hive.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, "image/png");
}

function hbInitTopline() {
  document.getElementById("hb-clear-btn").addEventListener("click", () => {
    hbSlots = Array.from({ length: HB_TOTAL_SLOTS }, () => ({
      bee: null,
      shiny: false,
    }));
    hbStickerSlots = Array.from({ length: HB_STICKER_SLOTS }, () => ({
      sticker: null,
    }));
    hbRenderGrid();
    hbRenderStickerGrid();
    hbRenderBonuses();
  });

  document
    .getElementById("hb-export-btn")
    .addEventListener("click", hbExportHive);
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await hbLoadData();
  } catch {
    return;
  }
  hbBuildPalettes();
  hbBuildGrid();
  hbBuildStickerFrame();
  hbRenderBonuses();
  hbInitTopline();
  hbInitTrash();
  hbInitCopyButtons();
});
