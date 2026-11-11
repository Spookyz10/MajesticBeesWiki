// Mirrors Server["1 | LunarGame"], Server["1 | Actions"].LunarGame and Client Lib.LunarGame.
const LUNAR = {
  luckPerPoint: 100,
  requiredBase: 150,
  requiredScale: 750,
  baseRolls: 4,
  rollsPerPoint: 1,
  minMultiplier: 0.05,
  belowPower: 2,
  treatsPerPoint: 5,
  taskScaleCap: 7,
};

let lunarTasksData = [];
let lunarRewardsData = [];

function fmtAmount(n) {
  if (n >= 1e12) return (n / 1e12).toFixed(2).replace(/\.?0+$/, "") + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(2).replace(/\.?0+$/, "") + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.?0+$/, "") + "k";
  return n.toLocaleString("en");
}

function fmtRange(a, b) {
  return a === b ? fmtAmount(a) : `${fmtAmount(a)} – ${fmtAmount(b)}`;
}

function luckMultiplier(luck, weight) {
  const required = LUNAR.requiredBase + LUNAR.requiredScale / weight;
  if (luck >= required) return 1 + (luck - required) / 100;
  return Math.max(LUNAR.minMultiplier, Math.pow(luck / required, LUNAR.belowPower));
}

function weightedPool(tasksCompleted) {
  const points = tasksCompleted + 1;
  const luck = points * LUNAR.luckPerPoint;
  const pool = lunarRewardsData.map((r) => ({
    ...r,
    effWeight: r.weight * luckMultiplier(luck, r.weight),
  }));
  const total = pool.reduce((s, r) => s + r.effWeight, 0);
  return { pool, total, points, luck };
}

function taskRange(task, tasksCompleted) {
  const scale = Math.min(Math.pow(tasksCompleted + 1, 1.5), LUNAR.taskScaleCap);
  const lim = task.limit == null ? Infinity : task.limit;
  const calc = (m) => Math.round(Math.min(task.base * m * scale, lim));
  return [calc(task.min), calc(task.max)];
}

function renderTaskTable(tasksCompleted) {
  const tbody = document.getElementById("lunar-task-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  lunarTasksData.forEach((task) => {
    const [lo, hi] = taskRange(task, tasksCompleted);
    const tr = document.createElement("tr");
    tr.innerHTML = `<td><b>${task.label}</b></td><td>${fmtRange(lo, hi)}</td>`;
    tbody.appendChild(tr);
  });
}

function renderRewardTable(tasksCompleted) {
  const tbody = document.getElementById("lunar-reward-tbody");
  if (!tbody) return;
  const { pool, total, points, luck } = weightedPool(tasksCompleted);
  const rolls = LUNAR.baseRolls + points * LUNAR.rollsPerPoint;

  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  };
  set("lunar-points", points);
  set("lunar-luck", luck);
  set("lunar-rolls-count", rolls);
  set("lunar-treats", points * LUNAR.treatsPerPoint);

  tbody.innerHTML = "";
  pool
    .slice()
    .sort((a, b) => b.effWeight - a.effWeight)
    .forEach((r) => {
      const chance = r.effWeight / total;
      const tr = document.createElement("tr");
      tr.innerHTML =
        `<td><b>${r.name}</b></td><td>${fmtRange(r.min, r.max)}</td>` +
        `<td>${(chance * 100).toFixed(2)}%</td><td>${(rolls * chance).toFixed(2)}</td>`;
      tbody.appendChild(tr);
    });
}

function renderAll(tasksCompleted) {
  renderTaskTable(tasksCompleted);
  renderRewardTable(tasksCompleted);
}

async function loadLunarData() {
  const [tRes, rRes] = await Promise.all([
    WikiData.response("data/lunar-tasks.json"),
    WikiData.response("data/lunar-rewards.json"),
  ]);
  lunarTasksData = await tRes.json();
  lunarRewardsData = await rRes.json();
  const input = document.getElementById("lunar-tasks-input");
  renderAll(input ? Math.max(0, parseInt(input.value, 10) || 0) : 0);
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("lunar-tasks-input");
  if (input) {
    input.addEventListener("input", () =>
      renderAll(Math.max(0, parseInt(input.value, 10) || 0)),
    );
  }
  loadLunarData();
});
