async function loadBears() {
  const container = document.getElementById("bears-list");
  if (!container) return;

  let bears;
  try {
    const res = await fetch("data/bears.json");
    if (!res.ok) throw new Error("Failed to fetch bears.json");
    bears = await res.json();
  } catch (err) {
    container.innerHTML =
      '<p class="bears-loading" style="color:var(--red)">Failed to load bear data.</p>';
    return;
  }

  if (!bears.length) {
    container.innerHTML =
      '<p class="bears-loading">No bears available yet.</p>';
    return;
  }

  container.innerHTML = bears.map(renderBearCard).join("");
}

function escHtml(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderBearCard(bear) {
  const href = `bear.html?bear=${encodeURIComponent(bear.id)}`;
  const name = escHtml(bear.name || "Unknown Bear");
  const image = escHtml(bear.image || "images/ui/site-logo.png");
  const location = escHtml(bear.location || "Unknown Zone");
  const description = escHtml(bear.description || "No description available.");
  const questCount = Array.isArray(bear.quests) ? bear.quests.length : 0;
  const aura = escHtml(bear.aura || "");

  return `
    <a class="bear-card" href="${href}">
      <div class="bear-card-img">
        <img
          src="${image}"
          alt="${name}"
          onerror="this.onerror=null;this.src='images/ui/site-logo.png';"
        />
      </div>

      <div class="bear-card-body">
        <div class="bear-card-header">
          <div class="bear-card-name">${name}</div>
          <div class="bear-card-location">${location}</div>
        </div>

        <p class="bear-card-desc">${description}</p>

        <div class="bear-card-meta">
          ${questCount ? `<span class="bear-meta-tag bear-meta-tag--quests">${questCount} Quest${questCount !== 1 ? "s" : ""}</span>` : ""}
        
        </div>

        <div class="bear-card-link">View quests →</div>
      </div>
    </a>
  `;
}

document.addEventListener("DOMContentLoaded", loadBears);
