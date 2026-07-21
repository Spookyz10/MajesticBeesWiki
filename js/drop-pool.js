const POOL_CONFIG = {
  otherPoolWeight: 10000,

  flowersPerRoll: 12000,

  lootLuckThreshold: 5,
};

function sumWeight(items) {
  return items.reduce((sum, i) => sum + (Number(i.weight) || 0), 0);
}

function getTotalPoolWeight(items, includeOtherPool = true) {
  return (
    sumWeight(items) + (includeOtherPool ? POOL_CONFIG.otherPoolWeight : 0)
  );
}

function baseChance(weight, totalWeight) {
  if (!weight || !totalWeight) return 0;
  return (weight / totalWeight) * 100;
}

function isLootLuckEligible(weight, totalWeight) {
  return baseChance(weight, totalWeight) < POOL_CONFIG.lootLuckThreshold;
}

function computeDropStats(items, lootLuckPercent = 0, includeOtherPool = true) {
  const multiplier = 1 + (Number(lootLuckPercent) || 0) / 100;
  const baseTotal = getTotalPoolWeight(items, includeOtherPool);

  const boosted = items.map((item) => {
    const w = Number(item.weight) || 0;
    const eligible = isLootLuckEligible(w, baseTotal);
    const boostedWeight = eligible ? w * multiplier : w;
    return {
      name: item.name,
      baseWeight: w,
      weight: boostedWeight,
      boosted: eligible,
    };
  });

  const newTotal =
    sumWeight(boosted) + (includeOtherPool ? POOL_CONFIG.otherPoolWeight : 0);

  const result = new Map();
  boosted.forEach((item) => {
    const chance = item.weight > 0 ? (item.weight / newTotal) * 100 : 0;
    const perFlower =
      item.weight > 0
        ? (POOL_CONFIG.flowersPerRoll * newTotal) / item.weight
        : Infinity;
    result.set(item.name, {
      weight: item.weight,
      baseWeight: item.baseWeight,
      chance,
      perFlower,
      boosted: item.boosted,
    });
  });
  return result;
}

function formatChance(value) {
  const n = Number(value);
  if (isNaN(n)) return `${value}%`;
  return `${parseFloat(n.toFixed(4))}%`;
}

function formatPerFlower(n) {
  if (!isFinite(n)) return "—";
  if (n >= 1_000_000)
    return `1 in ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `1 in ${Math.round(n).toLocaleString()}`;
  return `1 in ${Math.round(n)}`;
}

window.MajesticDropPool = {
  config: POOL_CONFIG,
  sumWeight,
  getTotalPoolWeight,
  baseChance,
  isLootLuckEligible,
  computeDropStats,
  formatChance,
  formatPerFlower,
};
