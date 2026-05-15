async function loadBees() {

    const res = await fetch("data/bees.json");
    const data = await res.json();

    ["common", "rare", "epic", "legendary"].forEach(rarity => {
        renderTab(rarity, data[rarity] || []);
    });

}

function renderTab(id, bees) {

    const tab = document.getElementById(id);

    if (!tab) {
        return;
    }

    if (!bees.length) {
        tab.innerHTML = "<p><em>No bees registered yet.</em></p>";
        return;
    }

    bees.forEach(bee => {

        const card = document.createElement("button");

        card.type = "button";
        card.className = "bee-card";
        card.dataset.name = bee.name;
        card.dataset.desc = bee.desc;
        card.dataset.color = bee.color || "";
        card.setAttribute("aria-label", bee.name);

        card.innerHTML = `
            <img src="${bee.image}" alt="${bee.name}" loading="lazy">
            <div class="bee-card-name">${bee.name}</div>
        `;

        const image = card.querySelector("img");
        if (image) {
            image.onerror = () => {
                image.onerror = null;
                image.src = "images/ui/site-logo.png";
            };
        }

        const showDescription = () => {

            document.querySelectorAll(".bee-card")
                .forEach(el => el.classList.remove("selected"));

            card.classList.add("selected");

            const panel = document.querySelector(".bee-desc-panel");

            if (!panel) {
                return;
            }

            panel.classList.remove("empty");

            panel.innerHTML = `
                <div class="bee-desc-panel-name">${bee.name}</div>
                <div class="bee-desc-panel-text">${bee.desc}</div>
            `;

        };

        const clearDescription = () => {
            if (!card.matches(":focus")) {
                card.classList.remove("selected");

                const panel = document.querySelector(".bee-desc-panel");

                if (!panel) {
                    return;
                }

                panel.classList.add("empty");
                panel.innerHTML = "Hover over a bee to see its description.";
            }
        };

        card.addEventListener("mouseenter", showDescription);
        card.addEventListener("focus", showDescription);
        card.addEventListener("click", showDescription);
        card.addEventListener("mouseleave", clearDescription);
        card.addEventListener("blur", clearDescription);

        tab.appendChild(card);

    });

}

document.querySelectorAll(".bee-tab-btn").forEach(btn => {

    btn.addEventListener("click", () => {

        document.querySelectorAll(".bee-tab-btn")
            .forEach(el => el.classList.remove("active"));

        btn.classList.add("active");

        document.querySelectorAll(".bee-tab-content")
            .forEach(el => el.style.display = "none");

        const tab = document.getElementById(btn.dataset.tab);

        if (tab) {
            tab.style.display = "flex";
        }

    });

});

loadBees();