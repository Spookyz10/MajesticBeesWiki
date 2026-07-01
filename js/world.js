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

function buildMixerSection(
  recipes,
  title = "Mixer",
  introText = "The Mixer lets you craft items by combining ingredients. Each recipe produces one of the listed output items. You can find the Mixer in the Hydrant Shop.",
  introImage = "images/dispensers/Mixer.png",
  introAlt = "Mixer",
) {
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
      <div class="world-section-heading">${title}</div>
      <div class="mixer-intro">
        <div class="world-section-desc mixer-intro-text">${introText}</div>
        <div class="mixer-intro-image">
          <img src="${introImage}" alt="${introAlt}" width="120" height="120" loading="lazy" onerror="this.style.opacity='0.25';" />
        </div>
      </div>
      <div class="mixer-grid">${cards}</div>
    </div>
  `;
}

const WHEEL_SLOT_COUNT = 5;

const DONATE_ITEMS = [
  {
    name: "Silver Egg",
    points: 25,
  },
  {
    name: "Gold Egg",
    points: 50,
  },
  {
    name: "Shiny Silver Egg",

    points: 50,
  },
  {
    name: "Diamond Egg",

    points: 100,
  },
  {
    name: "Shiny Gold Egg",

    points: 100,
  },
  {
    name: "Shiny Diamond Egg",

    points: 200,
  },
  {
    name: "Mythic Egg",

    points: 300,
  },
  {
    name: "Shiny Egg",

    points: 300,
  },
  {
    name: "Shiny Mythic Egg",

    points: 600,
  },
];

function buildDonateTable() {
  const rows = DONATE_ITEMS.map((it) => {
    return `
      <tr class="donate-row">
        <td class="donate-td donate-name">${it.name}</td>

        <td class="donate-td donate-pts">${it.points} pts</td>
      </tr>
    `;
  }).join("");

  return `
    <div class="donate-table-wrap">
      <div class="donate-table-title">Sacrifice items to earn points</div>
      <div class="donate-table-scroll">
        <table class="donate-table">
          <thead>
            <tr>
              <th class="donate-th">Item</th>
              <th class="donate-th">Points</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

function formatPct(pct) {
  if (pct >= 1) return pct.toFixed(2);
  return pct.toFixed(3);
}

function wheelColor(index, total) {
  const hue = Math.round((index * 360) / total);
  const light = index % 2 === 0 ? 38 : 46;
  return `hsl(${hue}, 62%, ${light}%)`;
}

function pickWeighted(pool) {
  const total = pool.reduce((sum, it) => sum + it.weight, 0);
  const roll = Math.random() * total;
  let acc = 0;
  for (const it of pool) {
    acc += it.weight;
    if (roll <= acc) return it;
  }
  return pool[pool.length - 1];
}

function buildWheelSection(wheel) {
  if (!wheel || !wheel.items || !wheel.items.length) return "";

  return `
    <div class="world-section">
      <div class="world-section-heading">Lucky Wheel</div>
      <div class="world-section-desc">${wheel.desc || ""}</div>
      <div class="wheel-area">
        <div class="wheel-spin-col">
         <div class="wheel-stage">
              <div id="wheel-rotator" class="wheel-rotator">
                  <img id="wheel-disc" class="wheel-disc" src="images/wheel/wheel.png">
                  <div id="wheel-icons" class="wheel-icons"></div>
              </div>
              <img class="wheel-sprite-frame" src="images/wheel/frame.png">
              <img class="wheel-sprite-pointer" src="images/wheel/pointer.png">
          </div>
          <button class="wheel-spin-btn" id="wheel-spin-btn">Spin</button>
          <div class="wheel-result" id="wheel-result">&nbsp;</div>
        </div>
        <div class="wheel-bottom">
            ${buildDonateTable()}
            <div class="wheel-chance-list" id="wheel-chance-list"></div>
        </div>
      </div>
    </div>
  `;
}

function bindWheelSpin(wheel) {
  const rotator = document.getElementById("wheel-rotator");
  const disc = document.getElementById("wheel-disc");
  const btn = document.getElementById("wheel-spin-btn");
  const resultEl = document.getElementById("wheel-result");
  const listEl = document.getElementById("wheel-chance-list");
  const icons = document.getElementById("wheel-icons");
  if (!disc || !btn || !listEl || !wheel || !wheel.items || !wheel.items.length)
    return;

  const pool = wheel.items;
  let slots = Array.from({ length: WHEEL_SLOT_COUNT }, () =>
    pickWeighted(pool),
  );
  let currentRotation = 0;

  function renderWheel() {
    rotator.style.transform = `rotate(${currentRotation}deg)`;

    icons.querySelectorAll(".wheel-item-icon img").forEach((img) => {
      img.style.transform = `rotate(${-currentRotation}deg)`;
    });
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateWheel(targetRotation, duration, onComplete) {
    const startRotation = currentRotation;
    const startTime = performance.now();

    function frame(now) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);

      currentRotation =
        startRotation + (targetRotation - startRotation) * easeOutCubic(t);

      renderWheel();

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        currentRotation = targetRotation;
        renderWheel();
        onComplete();
      }
    }

    requestAnimationFrame(frame);
  }
  let spinning = false;
  const SLOT_COUNT = 5;
  const SLOT_ANGLE = 360 / SLOT_COUNT;

  const poolTotalWeight = pool.reduce((sum, it) => sum + it.weight, 0);
  const sortedPool = pool
    .map((it, i) => ({
      ...it,
      poolIndex: i,
      pct: (it.weight / poolTotalWeight) * 100,
    }))
    .sort((a, b) => b.weight - a.weight);

  function renderChanceList() {
    listEl.innerHTML = sortedPool
      .map(
        (s) => `
        <div class="wheel-chance-row" data-pool-index="${s.poolIndex}">
          ${localImg(s.image, 28, s.name)}
          <span class="wheel-chance-name">${s.name}${s.amount > 1 ? ` x${s.amount}` : ""}</span>
          <span class="wheel-chance-pct">${formatPct(s.pct)}%</span>
        </div>
      `,
      )
      .join("");
  }

  function renderIcons() {
    const radius = 20;

    icons.innerHTML = slots
      .map((item, i) => {
        const angle = ((i * SLOT_ANGLE + SLOT_ANGLE / 2 - 90) * Math.PI) / 180;

        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return `
       <div
            class="wheel-item-icon"
            style="
                left:calc(50% + ${x}%);
                top:calc(50% + ${y}%);
            "
        >
            <img src="${item.image}">
        </div>
        `;
      })
      .join("");
  }

  renderChanceList();
  renderIcons();
  renderWheel();

  btn.addEventListener("click", () => {
    if (spinning) return;
    spinning = true;
    btn.disabled = true;
    resultEl.textContent = "Spinning...";
    listEl
      .querySelectorAll(".wheel-chance-row")
      .forEach((r) => r.classList.remove("wheel-chance-row-hit"));

    const pickedIndex = Math.floor(Math.random() * SLOT_COUNT);

    const targetMod =
      (360 - (pickedIndex * SLOT_ANGLE + SLOT_ANGLE / 2) + 360) % 360;
    const currentMod = ((currentRotation % 360) + 360) % 360;
    const delta = (targetMod - currentMod + 360) % 360;
    const rotator = document.getElementById("wheel-rotator");

    const targetRotation = currentRotation + delta + 5 * 360;

    animateWheel(targetRotation, 4200, () => {
      const landedItem = slots[pickedIndex];

      resultEl.innerHTML = `You got: <strong style="color:var(--gold)">
        ${landedItem.name}
        ${landedItem.amount > 1 ? ` x${landedItem.amount}` : ""}
        </strong>`;

      slots = slots.slice();

      const newItem = pickWeighted(pool);
      slots[pickedIndex] = newItem;

      renderIcons();
      renderWheel();

      const newEntry = sortedPool.find(
        (s) => s.name === newItem.name && s.amount === newItem.amount,
      );

      if (newEntry) {
        const row = listEl.querySelector(
          `[data-pool-index="${newEntry.poolIndex}"]`,
        );

        if (row) row.classList.add("wheel-chance-row-hit");
      }

      resultEl.innerHTML += `<br><span style="color:var(--gold-dim)">
        Slot replaced with: ${newItem.name}
        ${newItem.amount > 1 ? ` x${newItem.amount}` : ""}
        </span>`;

      spinning = false;
      btn.disabled = false;
    });
  });
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
  const normalMixer = (data.mixer || []).filter((r) => !r.event);
  const summerMixer = (data.mixer || []).filter((r) => r.event === "summer");

  root.innerHTML =
    buildPipes(data.pipes) +
    buildFreeDispensers(data.freeDispensers) +
    buildPaidDispensers(data.paidDispensers) +
    buildMixerSection(normalMixer, "Mixer") +
    buildWheelSection(data.wheel) +
    (summerMixer.length
      ? buildMixerSection(
          summerMixer,
          "Limited Time",
          "Items only available while an in-game event is active. The Summer Mixer can be found in the Beach Shop.",
          "images/dispensers/SummerMixer.png",
          "Summer Mixer",
        )
      : "");

  bindSlotToggle();
  bindWheelSpin(data.wheel);
}

document.addEventListener("DOMContentLoaded", loadWorld);
