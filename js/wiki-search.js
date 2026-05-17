(function () {
  "use strict";

  const DATA_FILES = [
    { url: "data/bees.json", type: "bees" },
    { url: "data/shops.json", type: "shops" },
    { url: "data/codes.json", type: "codes" },
  ];

  let INDEX = [];
  let indexed = false;

  async function buildIndex() {
    if (indexed) return;
    indexed = true;

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
        }
      }
    }

    INDEX.push(
      {
        title: "Bees",
        desc: "All bees, rarities, hive slots, leveling.",
        tags: ["bees"],
        href: "bees.html",
        type: "page",
        icon: "images/icons/Icon-Bees.png",
      },
      {
        title: "Shops",
        desc: "All in-game shops, items, tools, bags, gear.",
        tags: ["shops"],
        href: "shops.html",
        type: "page",
        icon: "images/icons/Icon-Shops.png",
      },
      {
        title: "Codes",
        desc: "Active and expired codes.",
        tags: ["codes"],
        href: "codes.html",
        type: "page",
        icon: "images/icons/Icon-Codes.png",
      },
      {
        title: "Store",
        desc: "Robux store, find gamepasses and developer products here.",
        tags: ["store"],
        href: "store.html",
        type: "page",
        icon: "images/icons/Icon-Store.png",
      },
    );
  }

  function tokenize(str) {
    return (str || "")
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, " ")
      .split(/\s+/)
      .filter(Boolean);
  }

  function score(entry, tokens) {
    const haystack = [entry.title, entry.desc, ...(entry.tags || [])]
      .join(" ")
      .toLowerCase();
    let s = 0;
    for (const tok of tokens) {
      if (entry.title.toLowerCase().includes(tok)) s += 3;
      else if (haystack.includes(tok)) s += 1;
    }
    return s;
  }

  function search(query, limit = 8) {
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
    code: "#64b5f6",
    page: "#c8a84e",
  };
  const TYPE_LABEL = {
    bee: "Bee",
    shop: "Shop",
    item: "Item",
    code: "Code",
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
      max-height: 420px;
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
    .wsr-result:hover, .wsr-result.active {
      background: rgba(232,192,64,.08);
    }
    .wsr-result-icon {
      width: 36px; height: 36px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      background: rgba(18,12,0,.7); border-radius: 8px;
      overflow: hidden;
    }
    .wsr-result-icon img { width: 28px; height: 28px; object-fit: contain; image-rendering: pixelated; }
    .wsr-result-icon-placeholder {
      font-size: .95rem; color: rgba(200,168,78,.4);
    }
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
      border-radius: 4px; flex-shrink: 0;
      border: 1px solid;
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

  function buildResultHTML(entry) {
    const color = TYPE_COLOR[entry.type] || "#c8a84e";
    const label = TYPE_LABEL[entry.type] || entry.type;

    const iconHTML = entry.icon
      ? `<img src="${entry.icon}" alt="" onerror="this.style.display='none'">`
      : `<span class="wsr-result-icon-placeholder">🐝</span>`;

    const parentHTML = entry.parent
      ? `<div class="wsr-parent">in ${entry.parent}</div>`
      : "";

    const shortDesc =
      (entry.desc || "").slice(0, 90) + (entry.desc?.length > 90 ? "…" : "");

    return `
      <a class="wsr-result" href="${entry.href}">
        <div class="wsr-result-icon">${iconHTML}</div>
        <div class="wsr-result-body">
          <div class="wsr-result-title">${escHtml(entry.title)}</div>
          ${shortDesc ? `<div class="wsr-result-desc">${escHtml(shortDesc)}</div>` : ""}
          ${parentHTML}
        </div>
        <span class="wsr-badge" style="color:${color};border-color:${color}44;background:${color}18">${label}</span>
      </a>
    `;
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

  function mount(container) {
    injectStyle();

    container.innerHTML = `
      <div class="wsr-wrap">
        <div class="wsr-input-row">
          <input class="wsr-input" type="search" placeholder="Search the wiki…" autocomplete="off" spellcheck="false" />
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
      results.innerHTML = `<div class="wsr-loading">Searching…</div>`;
      results.classList.add("open");
      activeIdx = -1;

      if (!indexed) {
        results.innerHTML = `<div class="wsr-loading">Loading index…</div>`;
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
      debounce = setTimeout(() => runSearch(e.target.value), 180);
    });

    input.addEventListener("keydown", (e) => {
      const links = getLinks();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive(Math.min(activeIdx + 1, links.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive(Math.max(activeIdx - 1, 0));
      } else if (e.key === "Enter") {
        if (activeIdx >= 0 && links[activeIdx]) {
          links[activeIdx].click();
        }
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
      if (!container.contains(e.target)) {
        results.classList.remove("open");
      }
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
