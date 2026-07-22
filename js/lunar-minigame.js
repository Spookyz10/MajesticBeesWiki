function fmtAmount(n) {
  if (n >= 1e12) return (n / 1e12).toFixed(2).replace(/\.?0+$/, "") + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(2).replace(/\.?0+$/, "") + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.?0+$/, "") + "k";
  return n.toLocaleString("en");
}

async function loadLunarTasks() {
  const res = await fetch("data/lunar-tasks.json");
  const tasks = await res.json();
  renderTaskTable(tasks);
}

let lunarRewardsData = [];
let lunarBaseTotalWeight = 0;

async function loadLunarRewards() {
  const res = await fetch("data/lunar-rewards.json");
  lunarRewardsData = await res.json();
  lunarRewardsData.sort((a, b) => b.weight - a.weight);
  lunarBaseTotalWeight = lunarRewardsData.reduce((sum, r) => sum + r.weight, 0);
  renderRewardTable(0);
}

const LUNAR_SHARD_NAME = "Lunar Shard";
const LUNAR_SHARD_UNLOCK_TASKS = 20;
const LUNAR_SHARD_CHANCE_CAP = 5;

function weightedPool(tasksCompleted) {
  const totalWeightLuck = tasksCompleted * 100;

  return lunarRewardsData
    .filter(
      (r) =>
        r.name !== LUNAR_SHARD_NAME ||
        tasksCompleted >= LUNAR_SHARD_UNLOCK_TASKS,
    )
    .map((r) => {
      if (r.name !== LUNAR_SHARD_NAME) {
        return { ...r, rollWeight: r.weight };
      }

      const luckPercent = totalWeightLuck / 10;
      const baseChance = (r.weight / lunarBaseTotalWeight) * 100;
      let adjustedChance = baseChance * (1 + luckPercent / 100);
      if (adjustedChance > LUNAR_SHARD_CHANCE_CAP)
        adjustedChance = LUNAR_SHARD_CHANCE_CAP;

      const rollWeight = (adjustedChance / 100) * lunarBaseTotalWeight;
      return { ...r, rollWeight };
    });
}

function renderRewardTable(tasksCompleted) {
  const tbody = document.getElementById("lunar-reward-tbody");
  if (!tbody) return;

  const pool = weightedPool(tasksCompleted);
  const totalWeight = pool.reduce((sum, r) => sum + r.rollWeight, 0);

  const rollsLabel = document.getElementById("lunar-rolls-count");
  if (rollsLabel) rollsLabel.textContent = tasksCompleted + 5;

  tbody.innerHTML = "";
  pool.forEach((reward) => {
    const tr = document.createElement("tr");

    const nameTd = document.createElement("td");
    nameTd.innerHTML = `<b>${reward.name}</b>`;

    const amountTd = document.createElement("td");
    amountTd.textContent =
      reward.min === reward.max
        ? fmtAmount(reward.min)
        : `${fmtAmount(reward.min)} – ${fmtAmount(reward.max)}`;

    const chanceTd = document.createElement("td");
    chanceTd.textContent = `${((reward.rollWeight / totalWeight) * 100).toFixed(2)}%`;

    tr.appendChild(nameTd);
    tr.appendChild(amountTd);
    tr.appendChild(chanceTd);
    tbody.appendChild(tr);
  });
}

function setupChanceControl() {
  const input = document.getElementById("lunar-tasks-input");
  if (!input) return;

  input.addEventListener("input", () => {
    const tasksCompleted = Math.max(0, parseInt(input.value, 10) || 0);
    renderRewardTable(tasksCompleted);
  });
}

function renderTaskTable(tasks) {
  const tbody = document.getElementById("lunar-task-tbody");
  if (!tbody) return;

  tasks.forEach((task) => {
    const tr = document.createElement("tr");

    const nameTd = document.createElement("td");
    nameTd.innerHTML = `<b>${task.label}</b>`;

    const rangeTd = document.createElement("td");
    const minAmt = task.base * task.min;
    const maxAmt = task.base * task.max;
    rangeTd.textContent =
      minAmt === maxAmt
        ? fmtAmount(minAmt)
        : `${fmtAmount(minAmt)} – ${fmtAmount(maxAmt)}`;

    tr.appendChild(nameTd);
    tr.appendChild(rangeTd);
    tbody.appendChild(tr);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadLunarTasks();
  // loadLunarRewards();
  setupChanceControl();
});
