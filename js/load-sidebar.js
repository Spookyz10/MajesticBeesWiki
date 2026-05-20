function getBasePath() {
  const { pathname } = window.location;

  if (pathname.endsWith("/")) {
    return pathname;
  }

  const lastSegment = pathname.split("/").pop();

  if (lastSegment.endsWith(".html") || lastSegment.endsWith(".htm")) {
    return pathname.slice(0, pathname.lastIndexOf("/") + 1);
  }

  return `${pathname}/`;
}

function loadSidebar() {
  const container = document.getElementById("sidebar-container");
  if (!container) return;

  const basePath = getBasePath();

  const sidebarHTML = `
    <div class="sidebar" data-pagefind-ignore>
      <a class="sidebar-logo" href="${basePath}index.html">
        <img src="${basePath}images/ui/site-logo.png" alt="" decoding="async" />
      </a>
      <a href="${basePath}index.html">Home</a>
      <a href="${basePath}badges.html">Badges</a>
      <a href="${basePath}bees.html">Bees</a>
      <a href="${basePath}bears.html">Bears</a>
      <a href="${basePath}codes.html">Codes</a>
      <a href="${basePath}store.html">Store</a>
      <a href="${basePath}shops.html">Shops</a>
    </div>
  `;

  container.innerHTML = sidebarHTML;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadSidebar);
} else {
  loadSidebar();
}
