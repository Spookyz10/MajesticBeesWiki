async function loadBees() {
  const res = await fetch("data/bees.json");
  const data = await res.json();

  // Support multiple data shapes:
  // - { common: [...], rare: [...] }
  // - { "Bee Name": { ... }, ... }
  // - [ { ... }, ... ]

  let beesArray = [];

  if (Array.isArray(data)) {
    beesArray = data;
  } else {
    const categories = ["common", "rare", "epic", "legendary", "special"];
    const hasCategories = categories.some((c) =>
      Object.prototype.hasOwnProperty.call(data, c),
    );

    if (hasCategories) {
      categories.forEach((rarity) => renderTab(rarity, data[rarity] || []));
      return;
    }

    // assume object keyed by bee name
    beesArray = Object.values(data);
  }

  const grouped = {
    common: [],
    rare: [],
    epic: [],
    legendary: [],
    special: [],
  };

  beesArray.forEach((b) => {
    const r = (b.rarity || "").toLowerCase();
    if (r === "legendary") grouped.legendary.push(b);
    else if (r === "epic") grouped.epic.push(b);
    else if (r === "rare") grouped.rare.push(b);
    else if (r === "special") grouped.special.push(b);
    else grouped.common.push(b);
  });

  Object.keys(grouped).forEach((r) => renderTab(r, grouped[r]));
}

function getBeeGlow(color) {
  const glows = {
    blue: "rgba(100, 181, 246, 0.95)",
    red: "rgba(212, 96, 96, 0.95)",
    green: "rgba(122, 184, 96, 0.95)",
    purple: "rgba(206, 147, 216, 0.95)",
    colorless: "rgba(232, 192, 64, 0.95)",
  };

  const key = (color || "").toString().toLowerCase();
  return glows[key] || glows.colorless;
}

function renderTab(id, bees) {
  const tab = document.getElementById(id);

  if (!tab) {
    return;
  }

  if (!bees.length) {
    tab.innerHTML = "<p><em>No bees registered yet.</em></p>";
    return;
  }

  const hoverCapable = window.matchMedia(
    "(hover: hover) and (pointer: fine)",
  ).matches;

  bees.forEach((bee) => {
    const card = document.createElement("a");

    card.href = `bee.html?bee=${encodeURIComponent(bee.name)}`;
    card.className = "bee-card";
    card.dataset.name = bee.name;
    card.dataset.desc = bee.description || bee.desc || "";
    card.dataset.color = bee.color || "";
    card.setAttribute("aria-label", bee.name);
    card.style.setProperty("--bee-glow", getBeeGlow(bee.color));

    const imgSrc = bee.icon || bee.image || "images/ui/site-logo.png";

    card.innerHTML = `
        <img src="${imgSrc}" alt="${bee.name}" loading="lazy">
      `;

    const image = card.querySelector("img");
    if (image) {
      image.onerror = () => {
        image.onerror = null;
        image.src = "images/ui/site-logo.png";
      };
    }

    const showDescription = () => {
      document
        .querySelectorAll(".bee-card")
        .forEach((el) => el.classList.remove("selected"));

      card.classList.add("selected");

      const panel = document.querySelector(".bee-desc-panel");

      if (!panel) {
        return;
      }

      panel.classList.remove("empty");

      panel.innerHTML = `
                <div class="bee-desc-panel-name">${bee.name}</div>
                <div class="bee-desc-panel-text">${bee.description || bee.desc || ""}</div>
            `;
    };

    const clearDescription = () => {
      if (!card.matches(":focus")) {
        card.classList.remove("selected");

        const panel = document.querySelector(".bee-desc-panel");

        if (!panel) {
          return;
        }

        panel.classList.add("empty");
        panel.innerHTML = "Hover over a bee to see its description.";
      }
    };

    card.addEventListener("focus", showDescription);
    card.addEventListener("blur", clearDescription);
    if (hoverCapable) {
      card.addEventListener("mouseenter", showDescription);
      card.addEventListener("mouseleave", clearDescription);
    }

    tab.appendChild(card);
  });
}

document.querySelectorAll(".bee-tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".bee-tab-btn")
      .forEach((el) => el.classList.remove("active"));

    btn.classList.add("active");

    document
      .querySelectorAll(".bee-tab-content")
      .forEach((el) => (el.style.display = "none"));

    const tab = document.getElementById(btn.dataset.tab);

    if (tab) {
      tab.style.display = "flex";
    }
  });
});

function initSlotTableToggle() {
  const table = document.getElementById("slot-table");
  const toggle = document.getElementById("slot-table-toggle");
  if (!table || !toggle) return;

  toggle.addEventListener("click", () => {
    const expanded = table.classList.toggle("is-expanded");
    toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    toggle.textContent = expanded ? "Show fewer slots" : "Show all slot prices";
  });
}

loadBees();
initSlotTableToggle();
