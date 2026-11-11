(() => {
  "use strict";

  function card(t) {
    const rarityCls = "item-rarity-tag--" + t.rarity.replace(/\s+/g, "-");
    const href = t.itemId
      ? `<a class="trinket-link" href="items-details.html?id=${encodeURIComponent(t.itemId)}">Item page</a>`
      : "";
    return `
    <div class="item-card trinket-card">
      <div class="item-card-main">
        <div class="item-card-img">
          <img src="${escHtml(t.image)}" alt="${escHtml(t.name)}" loading="lazy"
            onerror="this.onerror=null;this.src='images/ui/site-logo.png';" />
        </div>
        <div class="item-card-name">${escHtml(t.name)}</div>
        <div class="item-card-desc">${escHtml(t.desc)}</div>
        <div class="trinket-meta">
          <span><b>Cost:</b> ${Number(t.cost).toLocaleString()} ${escHtml(t.costType)}${t.costType === "Ticket" && t.cost !== 1 ? "s" : ""}</span>
          ${t.extra ? `<span class="trinket-extra">${escHtml(t.extra)}</span>` : ""}
          ${href}
        </div>
        <div class="item-card-footer">
          <span class="item-rarity-tag ${rarityCls}">${escHtml(t.rarity)}</span>
          <span class="item-category-tag">${escHtml(t.type)}</span>
        </div>
      </div>
    </div>`;
  }

  async function init() {
    const wrap = document.getElementById("trinkets-list");
    const consumables = document.getElementById("trinket-items-list");
    const beltBox = document.getElementById("trinket-belt");
    try {
      const res = await WikiData.response("data/trinkets.json");
      const data = await res.json();
      const equip = data.trinkets.filter((t) => t.type === "Trinket");
      const cons = data.trinkets.filter((t) => t.type !== "Trinket");
      wrap.innerHTML = equip.map(card).join("");
      consumables.innerHTML = cons.map(card).join("");
      const b = data.belt;
      const mats = Object.entries(b.materials)
        .map(([k, v]) => `<li>${escHtml(k)} x${v.toLocaleString()}</li>`)
        .join("");
      beltBox.innerHTML = `
        <p>The <b>${escHtml(b.name)}</b> has <b>${b.slots}</b> trinket slots. Buy it from the
        <b>${escHtml(b.obtain)}</b> for ${escHtml(b.cost)} plus:</p>
        <ul>${mats}</ul>`;
    } catch (err) {
      console.error("Failed to load trinkets:", err);
      wrap.innerHTML = "<p class=\"items-empty\">Failed to load trinkets.</p>";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
