(() => {
  "use strict";
  document.querySelectorAll(".catalog-image").forEach((image) => {
    const hideMissing = () => { image.hidden = true; };
    image.addEventListener("error", hideMissing);
    if (image.complete && !image.naturalWidth) hideMissing();
  });
  const input = document.querySelector("[data-catalog-filter]");
  if (!input) return;
  const cards = [...document.querySelectorAll("[data-catalog-entry]")];
  const status = document.querySelector("[data-catalog-status]");
  const tabs = [...document.querySelectorAll('[data-sticker-tab]')];
  let rarity = 'all';
  function filter() {
    const query = input.value.trim().toLocaleLowerCase();
    let visible = 0;
    for (const card of cards) {
      card.hidden = (rarity !== 'all' && card.dataset.rarity !== rarity) || !card.textContent.toLocaleLowerCase().includes(query);
      if (!card.hidden) visible++;
    }
    status.textContent = `${visible} of ${cards.length} entries`;
  }
  function activate(tab) {
    rarity = tab.dataset.stickerTab;
    tabs.forEach(button => {
      button.setAttribute('aria-selected', String(button === tab));
      button.tabIndex = button === tab ? 0 : -1;
    });
    document.getElementById('sticker-results').setAttribute('aria-labelledby', tab.id);
    filter();
  }
  tabs.forEach((tab,index) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault(); tabs[next].focus(); activate(tabs[next]);
    });
  });
  function revealAnchor() {
    if (!tabs.length || !location.hash) return;
    let target;
    try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return; }
    if (target?.matches('[data-catalog-entry]')) {
      input.value = '';
      activate(tabs.find(tab => tab.dataset.stickerTab === target.dataset.rarity) || tabs[0]);
      target.scrollIntoView({block:'start'});
    }
  }
  input.addEventListener("input", filter);
  window.addEventListener('hashchange', revealAnchor);
  revealAnchor();
})();
