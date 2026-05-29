async function loadBees() {
  const res = await fetch("data/bees.json");
  const data = await res.json();

  const grouped = {
    common: [],
    rare: [],
    epic: [],
    legendary: [],
    special: [],
    limited: [],
  };

  const beesArray = Array.isArray(data) ? data : Object.values(data);

  beesArray.forEach((b) => {
    const r = (b.rarity || "").toLowerCase();
    if (grouped[r]) grouped[r].push(b);
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
    colorless: "rgba(255, 255, 255, 0.95)",
  };
  return glows[(color || "").toLowerCase()] || glows.colorless;
}

function renderTab(id, bees) {
  const tab = document.getElementById(id);
  if (!tab) return;

  if (!bees.length) {
    tab.innerHTML = "<p><em>No bees registered yet.</em></p>";
    return;
  }

  const hoverCapable = window.matchMedia(
    "(hover: hover) and (pointer: fine)",
  ).matches;
  const fragment = document.createDocumentFragment();

  bees.forEach((bee) => {
    const card = document.createElement("a");
    card.href = `bee.html?bee=${encodeURIComponent(bee.name)}`;
    card.className = "bee-card";
    card.dataset.name = bee.name;
    card.setAttribute("aria-label", bee.name);
    card.style.setProperty("--bee-glow", getBeeGlow(bee.color));

    const img = document.createElement("img");
    img.src = bee.icon || bee.image || "images/ui/site-logo.png";
    img.alt = bee.name;
    img.loading = "lazy";
    img.onerror = () => {
      img.onerror = null;
      img.src = "images/ui/site-logo.png";
    };
    card.appendChild(img);

    const showDescription = () => {
      document
        .querySelectorAll(".bee-card")
        .forEach((el) => el.classList.remove("selected"));
      card.classList.add("selected");
      const panel = document.querySelector(".bee-desc-panel");
      if (!panel) return;
      panel.classList.remove("empty");
      panel.innerHTML = `<div class="bee-desc-panel-name">${bee.name}</div><div class="bee-desc-panel-text">${bee.description || bee.desc || ""}</div>`;
    };

    const clearDescription = () => {
      if (!card.matches(":focus")) {
        card.classList.remove("selected");
        const panel = document.querySelector(".bee-desc-panel");
        if (!panel) return;
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

    fragment.appendChild(card);
  });

  tab.appendChild(fragment);
}

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

document.addEventListener("DOMContentLoaded", () => {
  loadBees();
  initSlotTableToggle();

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
      if (tab) tab.style.display = "flex";
    });
  });
});
