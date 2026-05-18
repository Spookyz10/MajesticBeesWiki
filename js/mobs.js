async function loadMobs() {
  const container = document.getElementById("mobs-list");
  if (!container) return;

  let mobs;
  try {
    const res = await fetch("data/mobs.json");
    mobs = await res.json();
  } catch (err) {
    container.innerHTML =
      '<p style="text-align:center; color: var(--gold-dim);">Failed to load mob data.</p>';
    return;
  }

  container.innerHTML = mobs.map((mob) => buildMobCard(mob)).join("");
}

function buildMobCard(mob) {
  const drops = mob.drops
    .map((drop) => `<span class="mob-drop-tag">${drop}</span>`)
    .join("");

  return `
    <div class="mob-card">
      <div class="mob-card-left">
        <div class="mob-image-wrap">
          <img
            src="${mob.image}"
            alt="${mob.name}"
            onerror="this.onerror=null; this.src='images/ui/site-logo.png';"
          />
        </div>
      </div>
      <div class="mob-card-body">
        <div class="mob-card-header">
          <span class="mob-name">${mob.name}</span>
          <span class="mob-location">${mob.location}</span>
        </div>
        <p class="mob-desc">${mob.desc}</p>
        <div class="mob-drops">
          <div class="mob-drops-label">Possible Drops</div>
          <div class="mob-drops-list">${drops}</div>
        </div>
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", loadMobs);
