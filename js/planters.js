function formatGrowTime(seconds) {
  if (seconds >= 3600) {
    const h = seconds / 3600;
    return h === Math.floor(h) ? `${h}h` : `${h.toFixed(1)}h`;
  }
  const m = seconds / 60;
  return `${m}m`;
}

function buildPlanterCard(planter) {
  const rarityClass = `planter-rarity-tag--${planter.rarity}`;
  return `
    <a class="planter-card" href="planter.html?planter=${encodeURIComponent(planter.id)}">
      <div class="planter-card-img">
        <img
          src="${escHtml(planter.icon)}"
          alt="${escHtml(planter.name)}"
          loading="lazy"
          onerror="this.onerror=null;this.src='images/ui/site-logo.png';"
        />
      </div>
      <div class="planter-card-body">
        <div class="planter-card-header">
          <div class="planter-card-name">${escHtml(planter.name)}</div>
          <span class="planter-rarity-tag ${rarityClass}">${escHtml(planter.rarity)}</span>
        </div>
        <p class="planter-card-desc">${escHtml(planter.desc)}</p>
        <div class="planter-card-meta">
          <span class="planter-meta-tag planter-meta-tag--time">⏱ ${formatGrowTime(planter.growTime)}</span>
          <span class="planter-meta-tag planter-meta-tag--tokens">${planter.tokens} Tokens</span>
        </div>
        <div class="planter-card-link">View details →</div>
      </div>
    </a>`;
}

async function loadPlanters() {
  const container = document.getElementById("planters-list");
  if (!container) return;
  try {
    const res = await fetch("data/planters.json");
    if (!res.ok) throw new Error();
    const planters = await res.json();
    container.innerHTML = planters.map(buildPlanterCard).join("");
  } catch {
    container.innerHTML =
      '<p style="text-align:center;color:var(--gold-dim);">Failed to load planter data.</p>';
  }
}

document.addEventListener("DOMContentLoaded", loadPlanters);
