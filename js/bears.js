const escHtml =
  window.escHtml ||
  ((v) =>
    String(v ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;"));

async function loadBears() {
  const container = document.getElementById("bears-list");
  if (!container) return;
  let bears;
  try {
    const res = await fetch("data/bears.json");
    if (!res.ok) throw new Error();
    bears = await res.json();
  } catch {
    container.innerHTML =
      '<p class="bears-loading" style="color:var(--red)">Failed to load bear data.</p>';
    return;
  }
  if (!bears.length) {
    container.innerHTML =
      '<p class="bears-loading">No bears available yet.</p>';
    return;
  }

  const fragment = document.createDocumentFragment();
  bears.forEach((bear) => {
    const el = document.createElement("a");
    el.className = "bear-card";
    el.href = `bear.html?bear=${encodeURIComponent(bear.id)}`;
    const questCount = Array.isArray(bear.quests) ? bear.quests.length : 0;
    const questTag = bear.cyclic
      ? `<span class="bear-meta-tag bear-meta-tag--quests bear-meta-tag--infinite">∞ Quest Cycle</span>`
      : questCount
        ? `<span class="bear-meta-tag bear-meta-tag--quests">${questCount} Quest${questCount !== 1 ? "s" : ""}</span>`
        : "";
    el.innerHTML = `
      <div class="bear-card-img">
        <img src="${escHtml(bear.image || "images/ui/site-logo.png")}" alt="${escHtml(bear.name || "")}"
          loading="lazy" onerror="this.onerror=null;this.src='images/ui/site-logo.png';" />
      </div>
      <div class="bear-card-body">
        <div class="bear-card-header">
          <div class="bear-card-name">${escHtml(bear.name || "Unknown Bear")}</div>
          <div class="bear-card-location">${escHtml(bear.location || "Unknown Zone")}</div>
        </div>
        <p class="bear-card-desc">${escHtml(bear.description || "No description available.")}</p>
        <div class="bear-card-meta">
          ${questTag}
        </div>
        <div class="bear-card-link">View quests →</div>
      </div>`;
    fragment.appendChild(el);
  });
  container.innerHTML = "";
  container.appendChild(fragment);
}

document.addEventListener("DOMContentLoaded", loadBears);
