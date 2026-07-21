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

async function loadLunarRewards() {
  const res = await fetch("data/lunar-rewards.json");
  lunarRewardsData = await res.json();
  renderRewardTable(0);
}

function weightedPool(luck) {
  return lunarRewardsData
    .map((r) => {
      const weight = r.weight < 5 ? r.weight * (1 + luck) : r.weight;
      return { ...r, rollWeight: weight };
    })
    .sort((a, b) => b.rollWeight - a.rollWeight);
}

function renderRewardTable(tasksCompleted) {
  const tbody = document.getElementById("lunar-reward-tbody");
  if (!tbody) return;

  const luck = tasksCompleted * 0.2;
  const pool = weightedPool(luck);
  const totalWeight = pool.reduce((sum, r) => sum + r.rollWeight, 0);

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
    const tasksCompleted = Math.max(
      0,
      Math.min(15, parseInt(input.value, 10) || 0),
    );
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
  loadLunarRewards();
  setupChanceControl();
});
