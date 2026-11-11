const POOL_CONFIG = {
  // Field sticker pool = FieldDrops.Stickers entries + the field's own sticker (weight 1500).
  otherPoolWeight: 1500,

  flowersPerRoll: 12024,

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

// Game rule (Random.GetRandom): boosted only when the RAW weight is < 5.
function isLootLuckEligible(weight) {
  return Number(weight) < POOL_CONFIG.lootLuckThreshold;
}

function computeDropStats(items, lootLuckPercent = 0, includeOtherPool = true) {
  // Input is BONUS loot luck; the game stat has a base of 100 -> (100 + bonus) / 100.
  const multiplier = (100 + (Number(lootLuckPercent) || 0)) / 100;

  const boosted = items.map((item) => {
    const w = Number(item.weight) || 0;
    const eligible = isLootLuckEligible(w);
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
  const entries = [];
  boosted.forEach((item) => {
    const chance = item.weight > 0 ? (item.weight / newTotal) * 100 : 0;
    const perFlower =
      item.weight > 0
        ? (POOL_CONFIG.flowersPerRoll * newTotal) / item.weight
        : Infinity;
    const entry = {
      weight: item.weight,
      baseWeight: item.baseWeight,
      chance,
      perFlower,
      boosted: item.boosted,
    };
    entries.push(entry);
    const previous = result.get(item.name);
    result.set(item.name, previous ? {
      weight: previous.weight + entry.weight,
      baseWeight: previous.baseWeight + entry.baseWeight,
      chance: previous.chance + entry.chance,
      perFlower: POOL_CONFIG.flowersPerRoll * newTotal / (previous.weight + entry.weight),
      boosted: previous.boosted || entry.boosted,
    } : entry);
  });
  result.entriesByIndex = entries;
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
