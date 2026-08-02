document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const itemID = urlParams.get("id");

  if (!itemID) return;

  const SOURCE_TYPE_LABELS = {
    mixer: "Mixer",
    dispenser: "Dispenser",
    quest: "Quest Reward",
    shop: "Shop",
    drop: "Drop",
    event: "Event",
  };

  function findItemByLooseName(itemsData, name) {
    const lower = name.trim().toLowerCase();
    return (
      itemsData.find((i) => i.name.toLowerCase() === lower) ||
      itemsData.find((i) => i.name.toLowerCase() + "s" === lower) ||
      null
    );
  }

  function categoryToUsageType(category) {
    if (category === "Consumables" || category === "Event") return "Consumable";
    if (category === "Planters") return "Planter";
    if (category === "Eggs") return "Egg";
    if (category === "Vines") return "Vine";
    if (category === "Starflowers") return "Starflower";
    return category;
  }

  function parseAmountValue(numStr, suffix) {
    let clean = numStr.replace(/,/g, "");
    if (!suffix && /\.\d{3}$/.test(clean)) {
      clean = clean.replace(/\./g, "");
    }
    let value = parseFloat(clean);
    if (suffix === "k") value *= 1e3;
    else if (suffix === "m") value *= 1e6;
    else if (suffix === "b") value *= 1e9;
    return Math.round(value);
  }

  function parseCostParts(costStr) {
    if (!costStr || typeof costStr !== "string") return [];
    return costStr
      .split("+")
      .map((part) => part.trim())
      .map((part) => {
        const match = part.match(/^([\d.,]+)\s*(k|m|b)?\s+(.+)$/i);
        if (!match) return null;
        const amount = parseAmountValue(
          match[1],
          (match[2] || "").toLowerCase(),
        );
        const name = match[3].trim();
        return { amount, name };
      })
      .filter(Boolean);
  }

  try {
    const [itemsRes, worldRes, shopRes] = await Promise.all([
      fetch("data/items.json"),
      fetch("data/world.json"),
      fetch("data/shops.json"),
    ]);
    const items = await itemsRes.json();
    const item = items.find((i) => i.id === itemID);

    if (!item) return;

    const MIXER_RECIPES = {};
    const usageIndex = new Map();

    function addUsage(ingredientName, consumerName, consumerType, amount) {
      const key = ingredientName.trim().toLowerCase();
      if (!usageIndex.has(key)) usageIndex.set(key, []);
      const list = usageIndex.get(key);
      if (
        !list.some((u) => u.name === consumerName && u.type === consumerType)
      ) {
        list.push({ name: consumerName, type: consumerType, amount });
      }
    }

    try {
      const worldData = await worldRes.json();
      for (const recipe of worldData.mixer || []) {
        MIXER_RECIPES[recipe.name.toLowerCase()] = recipe.recipe;

        const consumerItem = findItemByLooseName(items, recipe.name);
        const consumerType = consumerItem
          ? categoryToUsageType(consumerItem.category)
          : "Consumable";

        for (const ing of recipe.recipe) {
          if (ing.item === "Honey") continue;
          addUsage(ing.item, recipe.name, consumerType, ing.amount);
        }
      }
    } catch (e) {
      console.warn("world.json não pôde ser carregado.");
    }

    for (const it of items) {
      if (!it.cost || it.cost.length === 0) continue;
      const costList = Array.isArray(it.cost) ? it.cost : [it.cost];
      for (const costStr of costList) {
        for (const part of parseCostParts(costStr)) {
          if (part.name === "Honey") continue;
          addUsage(
            part.name,
            it.name,
            categoryToUsageType(it.category),
            part.amount,
          );
        }
      }
    }

    try {
      const shopData = await shopRes.json();
      for (const shop of shopData.shops || []) {
        for (const section of shop.sections || []) {
          for (const shopItem of section.items || []) {
            if (!shopItem.cost) continue;
            const isBee = (shopItem.image || "").includes("/bees/");
            const isPlanter = shopItem.name.toLowerCase().includes("planter");
            let consumerType = "Equipment";
            if (isBee) consumerType = "Bees";
            else if (isPlanter) consumerType = "Planter";

            for (const part of parseCostParts(shopItem.cost)) {
              if (
                part.name === "Honey" ||
                part.name === "Tickets" ||
                part.name === "Ticket"
              ) {
                if (part.name !== "Honey") {
                  addUsage(part.name, shopItem.name, consumerType, part.amount);
                }
                continue;
              }
              const matched = findItemByLooseName(items, part.name);
              if (!matched) continue;
              addUsage(matched.name, shopItem.name, consumerType, part.amount);
            }
          }
        }
      }
    } catch (e) {
      console.warn("shops.json não pôde ser carregado.");
    }

    document.title = `${item.name} - The Majestic Bees Wiki`;
    document.getElementById("item-main-title").innerText = item.name;
    document.getElementById("item-description-text").innerHTML =
      `<b>${item.name}</b> ${item.desc}`;

    document.getElementById("infobox-title").innerText = item.name;
    document.getElementById("infobox-img").src = item.image;
    document.getElementById("infobox-img").alt = item.name;
    document.getElementById("infobox-category").innerText = item.category;

    const rarityElement = document.getElementById("infobox-rarity");
    rarityElement.innerText = item.rarity;
    rarityElement.classList.add(
      "item-rarity-tag--" + item.rarity.replace(/\s+/g, "-"),
    );

    if (item.sources && item.sources.length > 0) {
      const sourcesCard = item.sources
        .map((src, index) => {
          const hasMob = src.mob_list && src.mob_list.length > 0;
          const hasPlanter = src.planter_list && src.planter_list.length > 0;
          const hasPlanterDropRule =
            src.planter_droprule && src.planter_droprule.length > 0;
          const hasStarFlower =
            src.starFlower_list && src.starFlower_list.length > 0;
          const hasStarFlowerDropRule =
            src.starFlower_droprule && src.starFlower_droprule.length > 0;

          const isMixerType = src.type === "mixer";
          const recipeKey = (src.mixerName || item.name).toLowerCase();
          const recipe = isMixerType ? MIXER_RECIPES[recipeKey] : null;
          const hasMixer = isMixerType && recipe && recipe.length > 0;

          const isClickable = hasMob || hasPlanter || hasStarFlower || hasMixer;
          const sourceClass = isClickable
            ? "item-detail-source item-detail-source--clickable"
            : "item-detail-source";
          const clickAction = isClickable
            ? `onclick="toggleDropdown(${index})"`
            : "";
          const arrow = isClickable
            ? '<span class="item-detail-source-arrow">▼</span>'
            : "";
          const displayName =
            src.name ||
            src.mixerName ||
            SOURCE_TYPE_LABELS[src.type] ||
            src.type;

          let mixerBlockHTML = "";
          if (hasMixer) {
            const mixerItems = recipe
              .map((ing) => `<li>${ing.item} x${ing.amount}</li>`)
              .join("");
            mixerBlockHTML = `
              <div id="mixer-dropdown-${index}" class="item-detail-dropdown">
                <span class="item-detail-dropdown-title">Crafting Recipe:</span>
                <ul class="item-detail-dropdown-list">${mixerItems}</ul>
              </div>`;
          }

          let starFLowerBlockHTML = "";
          if (hasStarFlower) {
            const starFlowerItems = src.starFlower_list
              .map((s) => `<li>${s}</li>`)
              .join("");
            starFLowerBlockHTML = `
              <div id="starFlower-dropdown-${index}" class="item-detail-dropdown">
                <span class="item-detail-dropdown-title">Dropped by:</span>
                <ul class="item-detail-dropdown-list">${starFlowerItems}</ul>
              </div>`;
          }

          let starFlowerDropRuleHTML = "";
          if (hasStarFlowerDropRule) {
            const dropRule = src.starFlower_droprule
              .map((r) => `<li>${r}</li>`)
              .join("");
            starFlowerDropRuleHTML = `
              <div id="StarFlowersRules-dropdown-${index}" class="item-detail-rules">
                <span class="item-detail-rules-title">Rules:</span>
                <ul class="item-detail-rules-list">${dropRule}</ul>
              </div>`;
          }

          let planterBlockHTML = "";
          if (hasPlanter) {
            const planterItems = src.planter_list
              .map((p) => `<li>${p}</li>`)
              .join("");
            planterBlockHTML = `
              <div id="planters-dropdown-${index}" class="item-detail-dropdown">
                <span class="item-detail-dropdown-title">Dropped by:</span>
                <ul class="item-detail-dropdown-list">${planterItems}</ul>
              </div>`;
          }

          let mobBlockHTML = "";
          if (hasMob) {
            const mobItems = src.mob_list.map((m) => `<li>${m}</li>`).join("");
            mobBlockHTML = `
              <div id="mobs-dropdown-${index}" class="item-detail-dropdown">
                <span class="item-detail-dropdown-title">Dropped by:</span>
                <ul class="item-detail-dropdown-list">${mobItems}</ul>
              </div>`;
          }

          let planterDropRuleHTML = "";
          if (hasPlanterDropRule) {
            const dropRule = src.planter_droprule
              .map((r) => `<li>${r}</li>`)
              .join("");
            planterDropRuleHTML = `
              <div id="PlanterRules-dropdown-${index}" class="item-detail-rules">
                <span class="item-detail-rules-title">Rules:</span>
                <ul class="item-detail-rules-list">${dropRule}</ul>
              </div>`;
          }

          return `
            <div class="${sourceClass}" ${clickAction}>
              <div class="item-detail-source-name">${displayName}${arrow}</div>
              ${starFLowerBlockHTML}
              ${starFlowerDropRuleHTML}
              ${planterBlockHTML}
              ${mobBlockHTML}
              ${planterDropRuleHTML}
              ${mixerBlockHTML}
            </div>`;
        })
        .join("");

      document.getElementById("item-sources-container").innerHTML = `
        <div class="item-detail-panel">
          <h2 class="item-detail-panel-title">Ways to Obtain</h2>
          <div class="item-detail-sources">${sourcesCard}</div>
        </div>`;
    }

    const costRow = document.getElementById("infobox-cost-row");
    const costValue = document.getElementById("infobox-cost");

    if (item.cost && item.cost.length > 0) {
      costValue.innerText = Array.isArray(item.cost)
        ? item.cost.join(", ")
        : item.cost;
      costRow.classList.add("is-visible");
    } else {
      costRow.classList.remove("is-visible");
    }

    const usages = usageIndex.get(item.name.toLowerCase()) || [];

    if (usages.length > 0) {
      const equipmentItems = usages.filter((c) => c.type === "Equipment");
      const beesItems = usages.filter((c) => c.type === "Bees");
      const plantersItems = usages.filter((c) => c.type === "Planter");
      const ingridientsItems = usages.filter((c) => c.type === "Ingredients");
      const consumablesItems = usages.filter((c) => c.type === "Consumable");
      const otherItems = usages.filter(
        (c) =>
          ![
            "Equipment",
            "Bees",
            "Planter",
            "Ingredients",
            "Consumable",
          ].includes(c.type),
      );

      const makeCards = (list) =>
        list
          .map((craft) => {
            let URlLink = "";
            const elementId = craft.name.replace(/\s+/g, "-");

            if (craft.type === "Bees") {
              URlLink = `bee.html?bee=${encodeURIComponent(craft.name)}`;
            } else if (craft.type === "Planter" || craft.type === "Equipment") {
              const shopKeywordMap = {
                "starter-shop": [
                  "shovel",
                  "rake",
                  "hammer",
                  "magnet",
                  "scissors",
                  "satchel",
                  "jar",
                  "flask",
                  "backpack",
                  "worker's",
                ],
                "advanced-shop": [
                  "wasp",
                  "hive",
                  "cauldron",
                  "bouquet",
                  "pot",
                  "honey dipper",
                  "gold magnet",
                  "pickaxe",
                  "axe",
                  "scythe",
                ],
                "blue-shop": ["ice", "snow", "fridge"],
                "white-shop": ["windy"],
                "red-shop": ["fire", "flame", "burning", "furnance", "coal"],
                "bamboo-shop": ["bamboo", "aphid"],
                "hydrant-shop": ["hydrant"],
                greenhouse: [
                  "nature",
                  "blossom",
                  "cardboard",
                  "sticker planter",
                ],
              };
              const lowerName = craft.name.toLowerCase();
              let shopParam = "";
              for (const [shop, keywords] of Object.entries(shopKeywordMap)) {
                if (keywords.some((k) => lowerName.includes(k))) {
                  shopParam = shop;
                  break;
                }
              }
              URlLink = `shop.html?shop=${shopParam}#${elementId}`;
            }

            let nameContent = craft.name;
            if (URlLink) nameContent = `<a href="${URlLink}">${craft.name}</a>`;

            return `
              <div class="item-detail-craft-card">
                <span class="item-detail-craft-name">${nameContent}</span>
                <span class="item-detail-craft-qty">
                  ${craft.amount === "-" ? "-" : "x" + craft.amount.toLocaleString()}
                </span>
              </div>`;
          })
          .join("");

      const buildGroup = (title, list) => {
        if (list.length === 0) return "";
        return `
          <div class="item-detail-group">
            <h3 class="item-detail-group-title">→ ${title}</h3>
            <div class="item-detail-group-cards">${makeCards(list)}</div>
          </div>`;
      };

      document.getElementById("item-crafts-container").innerHTML = `
        <div class="item-detail-panel">
          <h2 class="item-detail-panel-title">Crafting Usage</h2>
          ${buildGroup("EQUIPMENT", equipmentItems)}
          ${buildGroup("PLANTERS", plantersItems)}
          ${buildGroup("BEES", beesItems)}
          ${buildGroup("INGREDIENTS", ingridientsItems)}
          ${buildGroup("CONSUMABLES", consumablesItems)}
          ${buildGroup("OTHER", otherItems)}
        </div>`;
    } else {
      document.getElementById("item-crafts-container").innerHTML = `
        <div class="item-detail-panel">
          <h2 class="item-detail-panel-title">Crafting Usage</h2>
          <p class="item-detail-panel-empty">This item is not required as an ingredient anywhere.</p>
        </div>`;
    }
  } catch (error) {
    console.error("Error loading item details:", error);
  }
});

window.toggleDropdown = function (index) {
  const mobDropdown = document.getElementById(`mobs-dropdown-${index}`);
  const planterDropdown = document.getElementById(`planters-dropdown-${index}`);
  const planterDropRule = document.getElementById(
    `PlanterRules-dropdown-${index}`,
  );
  const starFlowerDropdown = document.getElementById(
    `starFlower-dropdown-${index}`,
  );
  const starFlowerDropRule = document.getElementById(
    `StarFlowersRules-dropdown-${index}`,
  );
  const mixerDropdown = document.getElementById(`mixer-dropdown-${index}`);

  if (
    !mobDropdown &&
    !planterDropdown &&
    !planterDropRule &&
    !starFlowerDropdown &&
    !starFlowerDropRule &&
    !mixerDropdown
  ) {
    console.error(`containers for index ${index} not found`);
    return;
  }

  const toggle = (el) => {
    if (el) el.classList.toggle("is-open");
  };
  toggle(mobDropdown);
  toggle(planterDropdown);
  toggle(planterDropRule);
  toggle(starFlowerDropdown);
  toggle(starFlowerDropRule);
  toggle(mixerDropdown);
};
