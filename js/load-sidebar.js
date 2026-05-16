/**
 * Determines the base path for navigating to root resources
 * Works for files at root level and nested directories
 */
function getBasePath() {
  return new URL(".", window.location.href).pathname;
}

/**
 * Loads the sidebar component dynamically
 */
function loadSidebar() {
  const container = document.getElementById("sidebar-container");
  if (!container) return;

  const basePath = getBasePath();

  const sidebarHTML = `
    <div class="sidebar" data-pagefind-ignore>
      <a class="sidebar-logo" href="${basePath}index.html">
        <img src="${basePath}images/ui/site-logo.png" alt="" />
      </a>
      <a href="${basePath}index.html">Home</a>
      <a href="${basePath}bees.html">Bees</a>
      <a href="${basePath}codes.html">Codes</a>
      <a href="${basePath}store.html">Store</a>
      <a href="${basePath}shops.html">Shops</a>
    </div>
  `;

  container.innerHTML = sidebarHTML;
}

// Load sidebar when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadSidebar);
} else {
  loadSidebar();
}
