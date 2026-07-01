let mobsData = null;

async function loadMobs() {
  const container = document.getElementById("mobs-list");
  if (!container) return;

  try {
    const res = await fetch("data/mobs.json");
    mobsData = await res.json();
  } catch (err) {
    container.innerHTML =
      '<p style="text-align:center; color: var(--gold-dim);">Failed to load mob data.</p>';
    return;
  }

  renderMobs();
}

function renderMobs() {
  const container = document.getElementById("mobs-list");
  if (!container || !mobsData) return;

  container.innerHTML = "";

  mobsData.forEach((mob) => {
    const wrapper = document.createElement("div");
    wrapper.className = "mob-card-placeholder";
    wrapper.style.minHeight = "180px";
    wrapper.dataset.mobId = mob.id;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          obs.unobserve(entry.target);
          entry.target.outerHTML = buildMobCard(mob);
        });
      },
      { rootMargin: "200px" },
    );

    container.appendChild(wrapper);
    observer.observe(wrapper);
  });
}

function buildDropTag(drop) {
  const { chance, boosted, base } = window.MajesticLootLuck.apply(
    drop.chance,
    drop.lootLuck,
  );
  const luckBadge = window.MajesticLootLuck.badge(boosted);
  const qty =
    drop.qty > 1 ? `<span class="mob-drop-qty">×${drop.qty}</span>` : "";
  const tierClass =
    base >= 10
      ? "mob-drop-tag--common"
      : base >= 5
        ? "mob-drop-tag--uncommon"
        : base >= 2
          ? "mob-drop-tag--rare"
          : "mob-drop-tag--very-rare";
  return `<div class="mob-drop-tag ${tierClass}">
    <span class="mob-drop-name">${drop.name}</span>
    ${qty}
    <span class="mob-drop-chance">${window.MajesticLootLuck.formatChance(chance)}${luckBadge}</span>
  </div>`;
}

function buildMobCard(mob) {
  const drops = mob.drops.map(buildDropTag).join("");

  return `
    <div class="mob-card" id="mob-${mob.id}" data-mob-id="${mob.id}">
      <div class="mob-card-body">
        <div class="mob-card-header">
          <div class="mob-card-title-row">
            <div class="mob-image-wrap">
              <img
                src="${mob.image}"
                alt="${mob.name}"
                loading="lazy"
                decoding="async"
                onerror="this.onerror=null; this.src='images/ui/site-logo.png';"
              />
            </div>
            <div class="mob-card-title-block">
              <span class="mob-name">${mob.name}</span>
              <span class="mob-location">${mob.location}</span>
              <div class="mob-stats-row">
                <div class="mob-stat">
                  <span class="mob-stat-label">Respawn</span>
                  <span class="mob-stat-value">${mob.respawn}</span>
                </div>
              </div>
              <p class="mob-desc">${mob.desc}</p>
            </div>
          </div>
        </div>
        <div class="mob-drops">
          <div class="mob-drops-label">Possible Drops</div>
          <div class="mob-drops-list">${drops}</div>
        </div>
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", loadMobs);
document.addEventListener("majestic-loot-luck-change", () => {
  const container = document.getElementById("mobs-list");
  if (!container || !mobsData) return;
  container.querySelectorAll(".mob-card[data-mob-id]").forEach((card) => {
    const mob = mobsData.find((m) => m.id === card.dataset.mobId);
    if (!mob) return;
    const dropsList = card.querySelector(".mob-drops-list");
    if (dropsList) dropsList.innerHTML = mob.drops.map(buildDropTag).join("");
  });
});
