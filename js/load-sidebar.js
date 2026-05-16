/**
 * Determines the base path for navigating to root resources
 * Works for files at root level and nested directories
 */
function getBasePath() {
  const path = window.location.pathname;
  // Count how many directory levels deep we are
  const parts = path.split("/").filter((p) => p && p !== "index.html");

  // The last part might be an .html file, so we exclude it from count
  let depth = 0;
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].includes(".html")) {
      depth = i;
      break;
    }
    depth = i + 1;
  }

  // Root level files have depth 0, files in store/ have depth 1
  return depth > 0 ? "../".repeat(depth) : "";
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
