async function loadCodes() {
  const response = await fetch("data/codes.json");
  const codes = await response.json();

  const activeTarget = document.getElementById("active-codes");
  const expiredTarget = document.getElementById("expired-codes");
  if (!activeTarget || !expiredTarget) return;

  const activeCodes = [];
  const unknownExpiryCodes = [];
  const expiredCodes = [];

  codes.forEach((code) => {
    if (isExpired(code)) {
      expiredCodes.push(code);
    } else if (hasKnownExpiry(code)) {
      activeCodes.push(code);
    } else {
      unknownExpiryCodes.push(code);
    }
  });

  activeTarget.innerHTML = renderCodeList(activeCodes, false);
  expiredTarget.innerHTML = renderCodeList(
    [...unknownExpiryCodes, ...expiredCodes],
    true,
  );
}

function isExpired(code) {
  if (!code.expires || code.expires === "Unknown") return false;

  const ms = parseDate(code.expires);
  if (ms === null) return false;

  return Date.now() > ms;
}

function hasKnownExpiry(code) {
  return Boolean(code.expires && code.expires !== "Unknown");
}

function parseDate(value) {
  const match = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(value || "");
  if (!match) return null;
  return new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    23,
    59,
    59,
    999,
  ).getTime();
}

function renderRewardGroup(label, items) {
  if (!items || !items.length) return "";
  const body = items
    .map((item) => `<div class="code-reward-item">${escapeHtml(item)}</div>`)
    .join("");
  return `
    <div class="code-reward-group">
      <div class="code-reward-label">${label}</div>
      ${body}
    </div>
  `;
}

function renderCard(code, expired) {
  const limitedUses = code.limited_uses
    ? `<div class="code-uses">Limited: ${escapeHtml(code.limited_uses)} uses</div>`
    : "";

  const hasKnownExpiry = Boolean(code.expires && code.expires !== "Unknown");

  let expiryLabel;
  if (expired) {
    expiryLabel = hasKnownExpiry
      ? `Expired ${escapeHtml(code.expires)}`
      : "No expiry date is known, might or might not be expired.";
  } else {
    expiryLabel = hasKnownExpiry
      ? `Expires ${escapeHtml(code.expires)}`
      : "No expiry date is known, might or might not be expired.";
  }

  const rewardGroups = [
    renderRewardGroup("Items", code.items),
    renderRewardGroup("Skins", code.skins),
    renderRewardGroup("Stickers", code.stickers),
    renderRewardGroup("Boosts", code.boosts),
  ].join("");

  const rewards =
    rewardGroups ||
    `<div class="code-no-rewards">No reward information available.</div>`;

  return `
    <div class="code-card${expired ? " code-card-expired" : ""}">
      <div class="code-card-top">
        <div class="code-card-left">
          <div class="code-name">
            <code class="code-string">${escapeHtml(code.code)}</code>
            ${limitedUses}
          </div>
          ${code.note ? `<div class="code-note">${escapeHtml(code.note)}</div>` : ""}
        </div>
        <div class="code-expiry${expired ? " code-expiry-expired" : ""}${
          hasKnownExpiry ? "" : " code-expiry-unknown"
        }">${expiryLabel}</div>
      </div>
      <div class="code-rewards">${rewards}</div>
    </div>
  `;
}

function renderCodeList(items, expired) {
  if (!items.length) {
    return expired
      ? '<p class="codes-empty">No expired codes.</p>'
      : '<p class="codes-empty">No active codes at the moment.</p>';
  }
  return items.map((code) => renderCard(code, expired)).join("");
}

document.addEventListener("DOMContentLoaded", loadCodes);
