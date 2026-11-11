let EVENTS_DATA = null;

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}

function renderTable(t) {
  return `<h3>${esc(t.title)}</h3><table class="wikitable events-table"><thead><tr>${t.head
    .map((h) => `<th>${esc(h)}</th>`)
    .join("")}</tr></thead><tbody>${t.rows
    .map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`)
    .join("")}</tbody></table>`;
}

function renderLoot(items) {
  const luck = window.MajesticLootLuck ? window.MajesticLootLuck.get() : 0;
  const pool = window.MajesticDropPool;
  const stats = pool
    ? pool.computeDropStats(items, luck, false)
    : { entriesByIndex: [] };
  const rows = items
    .map((it, i) => {
      const s = stats.entriesByIndex[i] || { chance: 0, boosted: false };
      const badge = window.MajesticLootLuck
        ? window.MajesticLootLuck.badge(s.boosted)
        : "";
      const chance = pool ? pool.formatChance(s.chance) : "";
      return `<tr><td>${esc(it.name)}</td><td>${esc(it.qty)}</td><td>${chance} ${badge}</td></tr>`;
    })
    .join("");
  return `<h3>Loot (chance per roll)</h3><table class="wikitable events-table"><thead><tr><th>Drop</th><th>Amount</th><th>Chance</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function renderEvents() {
  const root = document.getElementById("events-root");
  if (!root || !EVENTS_DATA) return;
  root.innerHTML = EVENTS_DATA.events
    .map((e) => {
      const loot = e.loot ? renderLoot(EVENTS_DATA.loot[e.loot]) : "";
      const tables = (e.tables || []).map(renderTable).join("");
      const facts = (e.facts || []).map((f) => `<li>${esc(f)}</li>`).join("");
      return `<section class="events-card" id="${e.id}">
        <h2>${esc(e.title)}</h2>
        <p class="events-summary">${esc(e.summary)}</p>
        <p><b>Trigger:</b> ${esc(e.trigger)}</p>
        <p><b>Duration:</b> ${esc(e.duration)}</p>
        ${facts ? `<ul>${facts}</ul>` : ""}${tables}${loot}
      </section>`;
    })
    .join("");
}

document.addEventListener("DOMContentLoaded", async () => {
  const res = await WikiData.response("data/events.json");
  EVENTS_DATA = await res.json();
  renderEvents();
});

document.addEventListener("majestic-loot-luck-change", renderEvents);
