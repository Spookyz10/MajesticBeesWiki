(function () {
  "use strict";

  const STATIC_PAGES = [
    {
      title: "Bees",
      desc: "All bees, rarities, colors, hive slots, leveling and eggs.",
      tags: ["bees", "bee", "hive", "egg", "rarity"],
      href: "bees.html",
      icon: "images/icons/Icon-Bees.png",
      type: "page",
    },
    {
      title: "Shops",
      desc: "All in-game shops - tools, bags, gear, starter, advanced, red, blue.",
      tags: ["shop", "shops", "tools", "gear", "bags"],
      href: "shops.html",
      icon: "images/icons/Icon-Shops.png",
      type: "page",
    },
    {
      title: "Codes",
      desc: "Active and expired redeem codes for free rewards.",
      tags: ["codes", "code", "redeem"],
      href: "codes.html",
      icon: "images/icons/Icon-Codes.png",
      type: "page",
    },
    {
      title: "Store",
      desc: "Robux store - gamepasses, developer products, tickets, eggs.",
      tags: ["store", "robux", "gamepass", "tickets"],
      href: "store.html",
      icon: "images/icons/Icon-Store.png",
      type: "page",
    },
    {
      title: "Mobs",
      desc: "Hostile creatures: Caterpillar, Ladybug, Rhino Beetle, Spider.",
      tags: ["mobs", "mob", "enemy", "combat", "drops"],
      href: "mobs.html",
      icon: "images/icons/Icon-Mobs.png",
      type: "page",
    },
    {
      title: "Bears",
      desc: "NPC quest-givers - Black Bear, Brown Bear, Polar Bear and more.",
      tags: ["bears", "bear", "quests", "npc"],
      href: "bears.html",
      icon: "images/icons/Icon-Bears.png",
      type: "page",
    },
    {
      title: "Badges",
      desc: "Permanent bonuses earned by completing tasks in the game.",
      tags: ["badges", "badge", "bonus", "tier"],
      href: "badges.html",
      icon: "images/icons/Icon-Badges.png",
      type: "page",
    },
    {
      title: "Amulets",
      desc: "Equippable items with random buffs dropped by mobs.",
      tags: ["amulets", "amulet", "equip", "buff", "drop"],
      href: "amulets.html",
      icon: "images/icons/Icon-Amulets.png",
      type: "page",
    },
    {
      title: "Hive",
      desc: "Hive skins and stickers - cosmetics with stat bonuses.",
      tags: ["hive", "skin", "sticker", "cosmetic"],
      href: "hive.html",
      icon: "images/icons/Icon-Hive.png",
      type: "page",
    },
    {
      title: "Items",
      desc: "All collectible items: eggs, food, consumables, essences and more.",
      tags: ["items", "item", "consumable", "egg", "essence"],
      href: "items.html",
      icon: "images/icons/Icon-Items.png",
      type: "page",
    },
    {
      title: "Starflowers",
      desc: "Placeable field objects with tiered drops and spawn chances.",
      tags: ["starflowers", "starflower", "field", "drop"],
      href: "starflowers.html",
      icon: "images/icons/Icon-Starflowers.png",
      type: "page",
    },
    {
      title: "World",
      desc: "Pipes, free dispensers, paid dispensers, mixer recipes.",
      tags: ["world", "pipe", "dispenser", "mixer", "travel"],
      href: "world.html",
      icon: "images/icons/Icon-World.png",
      type: "page",
    },
  ];

  const DATA_FILES = [
    { url: "data/bees.json", type: "bees" },
    { url: "data/shops.json", type: "shops" },
    { url: "data/mobs.json", type: "mobs" },
    { url: "data/bears.json", type: "bears" },
    { url: "data/badges.json", type: "badges" },
    { url: "data/amulets.json", type: "amulets" },
    { url: "data/items.json", type: "items" },
  ];

  let INDEX = [...STATIC_PAGES];
  let indexed = false;
  let indexing = null;

  async function buildIndex() {
    if (indexed) return;
    if (indexing) return indexing;

    indexing = (async () => {
      const fetches = DATA_FILES.map((f) =>
        fetch(f.url)
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => ({ data, type: f.type }))
          .catch(() => null),
      );

      const results = await Promise.all(fetches);

      for (const result of results) {
        if (!result || !result.data) continue;
        const { data, type } = result;

        if (type === "bees") {
          const beesObj = Array.isArray(data) ? null : data;
          const entries = beesObj ? Object.values(beesObj) : data;
          for (const bee of entries) {
            if (!bee || !bee.name) continue;
            INDEX.push({
              title: bee.name,
              desc: bee.description ? bee.description.slice(0, 120) : "",
              tags: [
                "bee",
                (bee.rarity || "").toLowerCase(),
                (bee.color || "").toLowerCase(),
              ],
              href: `bee.html?bee=${encodeURIComponent(bee.name)}`,
              type: "bee",
              icon: bee.icon || bee.image || null,
            });
          }
        }

        if (type === "shops") {
          const shops = Array.isArray(data) ? data : data.shops || [];
          for (const shop of shops) {
            INDEX.push({
              title: shop.name || shop.title,
              desc: shop.about || shop.description || "",
              tags: ["shop", ...(shop.tags || [])],
              href: `shop.html?shop=${encodeURIComponent(shop.id)}`,
              type: "shop",
              icon: shop.image || null,
            });
            for (const section of shop.sections || []) {
              for (const item of section.items || []) {
                if (!item.name) continue;
                INDEX.push({
                  title: item.name,
                  desc: item.description || item.info || "",
                  tags: ["shop-item", (shop.name || "").toLowerCase()],
                  href: `shop.html?shop=${encodeURIComponent(shop.id)}`,
                  type: "item",
                  icon: item.image || null,
                  parent: shop.name,
                });
              }
            }
          }
        }

        if (type === "mobs") {
          for (const mob of data) {
            INDEX.push({
              title: mob.name,
              desc: mob.desc || "",
              tags: ["mob", "enemy", (mob.location || "").toLowerCase()],
              href: "mobs.html",
              type: "mob",
              icon: mob.image || null,
            });
          }
        }

        if (type === "bears") {
          for (const bear of data) {
            INDEX.push({
              title: bear.name,
              desc: bear.description || "",
              tags: [
                "bear",
                "quest",
                "npc",
                (bear.location || "").toLowerCase(),
              ],
              href: `bear.html?bear=${encodeURIComponent(bear.id)}`,
              type: "bear",
              icon: bear.image || null,
            });
            for (const quest of bear.quests || []) {
              if (!quest.name) continue;
              INDEX.push({
                title: quest.name,
                desc: `Quest #${quest.number} from ${bear.name}`,
                tags: ["quest", bear.id],
                href: `bear.html?bear=${encodeURIComponent(bear.id)}#quest-${quest.number}`,
                type: "quest",
                icon: bear.image || null,
                parent: bear.name,
              });
            }
          }
        }

        if (type === "badges") {
          for (const badge of data) {
            INDEX.push({
              title: badge.name + " Badge",
              desc: badge.desc || "",
              tags: ["badge", "bonus"],
              href: "badges.html",
              type: "badge",
              icon: null,
            });
          }
        }

        if (type === "amulets") {
          for (const amulet of data) {
            INDEX.push({
              title: amulet.name,
              desc: amulet.desc || "",
              tags: [
                "amulet",
                (amulet.rarity || "").toLowerCase(),
                "equip",
                "drop",
              ],
              href: "amulets.html",
              type: "amulet",
              icon: amulet.image || null,
            });
          }
        }

        if (type === "items") {
          for (const item of data) {
            INDEX.push({
              title: item.name,
              desc: item.desc || "",
              tags: [
                "item",
                (item.category || "").toLowerCase(),
                (item.rarity || "").toLowerCase(),
              ],
              href: "items.html",
              type: "item",
              icon: item.image || null,
            });
          }
        }
      }

      const seen = new Set();
      INDEX = INDEX.filter((e) => {
        const key = e.href + "||" + e.title;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      indexed = true;
    })();

    return indexing;
  }

  function tokenize(str) {
    return (str || "")
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, " ")
      .split(/\s+/)
      .filter(Boolean);
  }

  function score(entry, tokens) {
    const titleLower = (entry.title || "").toLowerCase();
    const haystack = [entry.title, entry.desc, ...(entry.tags || [])]
      .join(" ")
      .toLowerCase();
    let s = 0;
    for (const tok of tokens) {
      if (titleLower === tok) s += 10;
      else if (titleLower.startsWith(tok)) s += 6;
      else if (titleLower.includes(tok)) s += 4;
      else if (haystack.includes(tok)) s += 1;
    }
    return s;
  }

  function search(query, limit = 10) {
    const tokens = tokenize(query);
    if (!tokens.length) return [];
    return INDEX.map((e) => ({ entry: e, score: score(e, tokens) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((x) => x.entry);
  }

  const TYPE_COLOR = {
    bee: "#a78bfa",
    shop: "#e8c040",
    item: "#7ab860",
    mob: "#e07070",
    bear: "#c8a84e",
    badge: "#37daff",
    amulet: "#ce93d8",
    quest: "#82b8e8",
    page: "#c8a84e",
    bear: "#ffcf5b",
  };
  const TYPE_LABEL = {
    bee: "Bee",
    shop: "Shop",
    item: "Item",
    mob: "Mob",
    bear: "Bear",
    badge: "Badge",
    amulet: "Amulet",
    quest: "Quest",
    page: "Page",
  };

  const CSS = `
    .wsr-wrap { position: relative; font-family: "Nunito", Georgia, sans-serif; }
    .wsr-input-row { display: flex; align-items: center; gap: 0; }
    .wsr-input {
      width: 100%;
      background: linear-gradient(180deg, rgba(36,26,10,.92), rgba(36,26,10,.88));
      border: 1px solid rgba(232,192,64,.22);
      box-shadow: inset 0 1px 0 rgba(255,255,255,.03), 0 8px 20px rgba(0,0,0,.18);
      color: #e8c040;
      border-radius: 16px;
      font-family: inherit;
      font-size: .88rem;
      padding: 10px 42px 10px 16px;
      outline: none;
      transition: border-color .2s, box-shadow .2s;
      box-sizing: border-box;
    }
    .wsr-input::placeholder { color: rgba(200,168,78,.55); }
    .wsr-input:focus {
      border-color: rgba(232,192,64,.65);
      box-shadow: 0 0 0 3px rgba(232,192,64,.12), 0 10px 24px rgba(0,0,0,.2);
    }
    .wsr-clear {
      position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
      background: none; border: none; color: rgba(200,168,78,.6);
      font-size: 1.1rem; cursor: pointer; padding: 0; line-height: 1;
      display: none;
    }
    .wsr-clear:hover { color: #e8c040; }
    .wsr-results {
      position: absolute; top: calc(100% + 6px); left: 0; right: 0;
      background: rgba(26,18,0,.97);
      border: 1px solid rgba(58,40,0,.9);
      border-radius: 12px;
      box-shadow: 0 16px 40px rgba(0,0,0,.45);
      z-index: 9999;
      overflow: hidden;
      display: none;
      max-height: 460px;
      overflow-y: auto;
    }
    .wsr-results::-webkit-scrollbar { width: 5px; }
    .wsr-results::-webkit-scrollbar-track { background: transparent; }
    .wsr-results::-webkit-scrollbar-thumb { background: #3a2800; border-radius: 4px; }
    .wsr-results.open { display: block; }
    .wsr-result {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 16px;
      text-decoration: none;
      color: inherit;
      border-bottom: 1px solid rgba(58,40,0,.5);
      transition: background .15s;
    }
    .wsr-result:last-child { border-bottom: none; }
    .wsr-result:hover, .wsr-result.active { background: rgba(232,192,64,.08); }
    .wsr-result-icon {
      width: 36px; height: 36px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      background: rgba(18,12,0,.7); border-radius: 8px; overflow: hidden;
    }
    .wsr-result-icon img { width: 28px; height: 28px; object-fit: contain; image-rendering: pixelated; }
    .wsr-result-icon-placeholder { font-size: .95rem; color: rgba(200,168,78,.4); }
    .wsr-result-body { flex: 1; min-width: 0; }
    .wsr-result-title {
      font-family: "Fredoka One", Georgia, sans-serif;
      font-size: .95rem; color: #e8c040;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .wsr-result-desc {
      font-size: .78rem; color: #a88c3a;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      margin-top: 1px;
    }
    .wsr-badge {
      font-size: .68rem; font-weight: 700; letter-spacing: .05em;
      text-transform: uppercase; padding: 2px 7px;
      border-radius: 4px; flex-shrink: 0; border: 1px solid;
    }
    .wsr-parent { font-size: .7rem; color: #5a4820; margin-top: 1px; }
    .wsr-empty {
      padding: 18px 20px; text-align: center;
      font-size: .88rem; color: #5a4820; font-style: italic;
    }
    .wsr-loading {
      padding: 14px 20px; text-align: center;
      font-size: .82rem; color: #5a4820;
    }
  `;

  function injectStyle() {
    if (document.getElementById("wsr-style")) return;
    const s = document.createElement("style");
    s.id = "wsr-style";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function escHtml(s) {
    return String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  }

  function buildResultHTML(entry) {
    const color = TYPE_COLOR[entry.type] || "#c8a84e";
    const label = TYPE_LABEL[entry.type] || entry.type;
    const iconHTML = entry.icon
      ? `<img src="${entry.icon}" alt="" loading="lazy" onerror="this.style.display='none'">`
      : `<span class="wsr-result-icon-placeholder">🐝</span>`;
    const parentHTML = entry.parent
      ? `<div class="wsr-parent">in ${escHtml(entry.parent)}</div>`
      : "";
    const shortDesc =
      (entry.desc || "").slice(0, 90) +
      ((entry.desc || "").length > 90 ? "…" : "");

    return `
      <a class="wsr-result" href="${entry.href}">
        <div class="wsr-result-icon">${iconHTML}</div>
        <div class="wsr-result-body">
          <div class="wsr-result-title">${escHtml(entry.title || "")}</div>
          ${shortDesc ? `<div class="wsr-result-desc">${escHtml(shortDesc)}</div>` : ""}
          ${parentHTML}
        </div>
        <span class="wsr-badge" style="color:${color};border-color:${color}44;background:${color}18">${escHtml(label)}</span>
      </a>
    `;
  }

  function mount(container) {
    injectStyle();

    container.innerHTML = `
      <div class="wsr-wrap">
        <div class="wsr-input-row" style="position:relative;">
          <input class="wsr-input" type="search" placeholder="Search the wiki…"
            autocomplete="off" spellcheck="false" aria-label="Search wiki" />
          <button class="wsr-clear" aria-label="Clear search">✕</button>
        </div>
        <div class="wsr-results" role="listbox" aria-label="Search results"></div>
      </div>
    `;

    const input = container.querySelector(".wsr-input");
    const clearBtn = container.querySelector(".wsr-clear");
    const results = container.querySelector(".wsr-results");

    let debounce = null;
    let activeIdx = -1;

    function getLinks() {
      return Array.from(results.querySelectorAll(".wsr-result"));
    }

    function setActive(idx) {
      const links = getLinks();
      links.forEach((l) => l.classList.remove("active"));
      if (idx >= 0 && idx < links.length) {
        links[idx].classList.add("active");
        links[idx].scrollIntoView({ block: "nearest" });
      }
      activeIdx = idx;
    }

    async function runSearch(q) {
      if (!q.trim()) {
        results.classList.remove("open");
        clearBtn.style.display = "none";
        return;
      }
      clearBtn.style.display = "block";
      activeIdx = -1;

      const quickHits = search(q);
      if (quickHits.length) {
        results.innerHTML = quickHits.map(buildResultHTML).join("");
        results.classList.add("open");
      } else {
        results.innerHTML = `<div class="wsr-loading">Loading index…</div>`;
        results.classList.add("open");
      }

      if (!indexed) {
        await buildIndex();
      }

      const hits = search(q);
      if (!hits.length) {
        results.innerHTML = `<div class="wsr-empty">No results for "${escHtml(q)}"</div>`;
        return;
      }
      results.innerHTML = hits.map(buildResultHTML).join("");
    }

    input.addEventListener("input", (e) => {
      clearTimeout(debounce);
      debounce = setTimeout(() => runSearch(e.target.value), 150);
    });

    input.addEventListener("keydown", (e) => {
      const links = getLinks();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive(Math.min(activeIdx + 1, links.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive(Math.max(activeIdx - 1, 0));
      } else if (e.key === "Enter" && activeIdx >= 0 && links[activeIdx]) {
        links[activeIdx].click();
      } else if (e.key === "Escape") {
        results.classList.remove("open");
        input.blur();
      }
    });

    clearBtn.addEventListener("click", () => {
      input.value = "";
      clearBtn.style.display = "none";
      results.classList.remove("open");
      input.focus();
    });

    document.addEventListener("click", (e) => {
      if (!container.contains(e.target)) results.classList.remove("open");
    });

    input.addEventListener("focus", () => {
      if (input.value.trim()) runSearch(input.value);
    });

    buildIndex();
  }

  window.PagefindUI = function (opts) {
    const selector = opts && opts.element;
    if (!selector) return;
    const el = document.querySelector(selector);
    if (!el) return;
    mount(el);
  };
})();
