const SLOT_TABLE = [
  ["6", "1.25k"],
  ["7", "4.8k"],
  ["8", "9.6k"],
  ["9", "23.5k"],
  ["10", "51.2k"],
  ["11", "108.4k"],
  ["12", "245.6k"],
  ["13", "492k"],
  ["14", "785.4k"],
  ["15", "1.12m"],
  ["16", "2.24m"],
  ["17", "4.18m"],
  ["18", "7.34m"],
  ["19", "10.65m"],
  ["20", "15.42m"],
  ["21", "22.18m"],
  ["22", "31.45m"],
  ["23", "46.8m"],
  ["24", "62.15m"],
  ["25", "84.6m"],
  ["26", "104.4m"],
  ["27", "142.7m"],
  ["28", "195.5m"],
  ["29", "268.8m"],
  ["30", "365.2m"],
  ["31", "498.4m"],
  ["32", "662.1m"],
  ["33", "874.5m"],
  ["34", "1.16b"],
  ["35", "1.62b"],
  ["36", "2.38b"],
  ["37", "3.64b"],
  ["38", "5.81b"],
  ["39", "9.24b"],
  ["40", "14.45b"],
  ["41", "24.84b"],
  ["42", "46.35b"],
  ["43", "82.12b"],
  ["44", "148.45b"],
  ["45", "264.2b"],
  ["46", "422.45b"],
  ["47", "614.6b"],
  ["48", "821.8b"],
  ["49", "985.4b"],
  ["50", "1.25t"],
];

function localImg(src, size, alt) {
  return `<img src="${src}" alt="${alt}" width="${size}" height="${size}" loading="lazy" onerror="this.style.opacity='0.25';" />`;
}

function buildPipes(pipes) {
  const cards = pipes
    .map(
      (p) => `
    <div class="pipe-card" style="border-color:${p.colorBorder};background:${p.colorBg}">
      <div class="pipe-img-wrap" style="background:${p.colorBg};border:1px solid ${p.colorBorder}">
        ${localImg(p.image, 160, p.name)}
      </div>
      <div class="pipe-info">
        <div class="pipe-name" style="color:${p.color}">${p.name}</div>
        <div class="pipe-dest">Teleports to ${p.destination}</div>
      </div>
    </div>
  `,
    )
    .join("");

  return `
    <div class="world-section">
      <div class="world-section-heading">Pipes</div>
      <div class="world-section-desc">Interact with a pipe to instantly travel to a different zone.</div>
      <div class="pipes-grid">${cards}</div>
    </div>
  `;
}

function buildFreeDispensers(dispensers) {
  const cards = dispensers
    .map(
      (d) => `
    <div class="free-disp-card">
      <div class="free-disp-img">
        ${localImg(d.image, 192, d.name)}
      </div>
      <div class="free-disp-name">${d.name}</div>
      <div class="free-disp-zone">${d.zone}</div>
      <div class="free-disp-desc">${d.desc}</div>
    </div>
  `,
    )
    .join("");

  return `
    <div class="world-section">
      <div class="world-section-heading">Free Dispensers</div>
      <div class="world-section-desc">These dispensers give out items at no cost. Interact to collect.</div>
      <div class="free-dispensers-grid">${cards}</div>
    </div>
  `;
}

function buildSlotRows(expanded) {
  const visible = expanded ? SLOT_TABLE : SLOT_TABLE.slice(0, 5);
  return visible
    .map(
      ([slot, cost]) => `
    <div class="slot-row">
      <span class="slot-row-num">Slot ${slot}</span>
      <span class="slot-row-cost">${cost} Honey</span>
    </div>
  `,
    )
    .join("");
}

function buildPaidDispensers(dispensers) {
  const cards = dispensers
    .map((d) => {
      const imgEl = d.itemImage
        ? `<div class="paid-disp-img">${localImg(d.itemImage, 184, d.itemName)}</div>`
        : `<div class="paid-disp-img paid-disp-img-empty"></div>`;

      const costIconEl = `<img src="${d.costImage}" alt="${d.costType}" width="40" height="40" loading="lazy" onerror="this.style.display='none';" />`;

      const scaleEl = d.scaleNote
        ? `<div class="paid-disp-scale">${d.scaleNote}</div>`
        : "";

      let offersEl = "";
      if (d.slotTable) {
        offersEl = `
        <div class="slot-table-inner">
          <div class="slot-rows" id="slot-rows">${buildSlotRows(false)}</div>
          <button class="slot-table-toggle" id="slot-toggle">Show all 45 slots</button>
        </div>
      `;
      } else if (d.offers.length > 0) {
        const offerCards = d.offers
          .map((o) => {
            const costLine = o.fixedCost
              ? o.fixedCost
              : `Scales with purchases`;
            return `
          <div class="paid-disp-offer">
            <div class="paid-disp-offer-qty">${o.label}</div>
            <div class="paid-disp-offer-cost">${costLine}</div>
          </div>
        `;
          })
          .join("");
        offersEl = `<div class="paid-disp-offers">${offerCards}</div>`;
      }

      return `
      <div class="paid-disp-card">
        <div class="paid-disp-header">
          ${imgEl}
          <div class="paid-disp-meta">
            <div class="paid-disp-name">${d.name}</div>
            <div class="paid-disp-zone">${d.zone}</div>
            <div class="paid-disp-desc">${d.desc}</div>
            ${scaleEl}
            <div class="paid-disp-cost-type">${costIconEl} Costs ${d.costType}</div>
          </div>
        </div>
        ${offersEl ? `<div class="paid-disp-body">${offersEl}</div>` : ""}
      </div>
    `;
    })
    .join("");

  return `
    <div class="world-section">
      <div class="world-section-heading">Paid Dispensers</div>
      <div class="world-section-desc">These dispensers require Honey or Tickets. Some prices scale up with each purchase.</div>
      <div class="paid-dispensers-list">${cards}</div>
    </div>
  `;
}

function buildMixer(recipes) {
  const cards = recipes
    .map((r) => {
      const ingredientList = r.recipe
        .map(
          (ing) => `
        <div class="mixer-ingredient">
          <div class="mixer-ing-img">
            <img src="${ing.image}" alt="${ing.item}" width="40" height="40" loading="lazy" onerror="this.style.opacity='0.25';" />
          </div>
          <div class="mixer-ing-info">
            <div class="mixer-ing-name">${ing.item}</div>
            <div class="mixer-ing-amount">x${ing.amount.toLocaleString()}</div>
          </div>
        </div>
      `,
        )
        .join("");

      return `
      <div class="mixer-card">
        <div class="mixer-card-header">
          <div class="mixer-output-img">
            <img src="${r.image}" alt="${r.name}" width="64" height="64" loading="lazy" onerror="this.style.opacity='0.25';" />
          </div>
          <div class="mixer-output-name">${r.name}</div>
        </div>
        <div class="mixer-arrow">▼</div>
        <div class="mixer-ingredients">${ingredientList}</div>
      </div>
    `;
    })
    .join("");

  return `
    <div class="world-section">
      <div class="world-section-heading">Mixer</div>
      <div class="mixer-intro">
        <div class="world-section-desc mixer-intro-text">The Mixer lets you craft items by combining ingredients. Each recipe produces one of the listed output items. You can find the Mixer in the Hydrant Shop.</div>
        <div class="mixer-intro-image">
          <img src="images/dispensers/mixer.png" alt="Mixer" width="120" height="120" loading="lazy" onerror="this.style.opacity='0.25';" />
        </div>
      </div>
      <div class="mixer-grid">${cards}</div>
    </div>
  `;
}

function bindSlotToggle() {
  const btn = document.getElementById("slot-toggle");
  const rows = document.getElementById("slot-rows");
  if (!btn || !rows) return;

  let expanded = false;
  btn.addEventListener("click", () => {
    expanded = !expanded;
    rows.innerHTML = buildSlotRows(expanded);
    btn.textContent = expanded ? "Show fewer" : "Show all 45 slots";
  });
}

async function loadWorld() {
  const root = document.getElementById("world-root");
  if (!root) return;

  let data;
  try {
    const res = await fetch("data/world.json");
    if (!res.ok) throw new Error();
    data = await res.json();
  } catch {
    root.innerHTML =
      '<p style="text-align:center;color:var(--gold-dim)">Failed to load world data.</p>';
    return;
  }

  root.className = "world-root";
  root.innerHTML =
    buildPipes(data.pipes) +
    buildFreeDispensers(data.freeDispensers) +
    buildPaidDispensers(data.paidDispensers) +
    buildMixer(data.mixer);

  bindSlotToggle();
}

document.addEventListener("DOMContentLoaded", loadWorld);
