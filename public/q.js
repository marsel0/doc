const CUSTOM_DOMAIN_STORAGE_KEY = "customDomain";

function normalizeOrigin(value) {
  if (!value) return null;

  const normalized = value.trim().replace(/\/+$/, "");
  if (!normalized) return null;

  try {
    return new URL(
      /^https?:\/\//.test(normalized) ? normalized : `https://${normalized}`,
    ).origin;
  } catch {
    return null;
  }
}

function getOrigin() {
  const params = new URLSearchParams(window.location.search);
  const originFromUrl = normalizeOrigin(params.get("domain"));

  if (originFromUrl) {
    try {
      localStorage.setItem(CUSTOM_DOMAIN_STORAGE_KEY, originFromUrl);
    } catch {
      // The replacement still works when storage is unavailable.
    }

    return originFromUrl;
  }

  try {
    return normalizeOrigin(localStorage.getItem(CUSTOM_DOMAIN_STORAGE_KEY));
  } catch {
    return null;
  }
}

function buildUrl(origin, path = "") {
  return `${origin}${path}`;
}

function buildReplacements(origin) {
  if (!origin) {
    return {
      "[[BASE_URL]]": "$BASE_URL",
    };
  }

  const domain = new URL(origin).host;
  return {
    "merchant.example": domain,
    "bank.example": domain,
    "[[DOMAIN]]": domain,
    "[[DOMAIN_URL]]": origin,
    "[[PROJECT_NAME]]": domain,
    "[[BASE_URL]]": buildUrl(origin, "/public/api/v1"),
    "$BASE_URL": buildUrl(origin, "/public/api/v1"),
    "[[LOGIN_URL]]": buildUrl(origin, "/login"),
    "[[APP_URL]]": origin,
    "[[CALLBACK_URL]]": buildUrl(origin, "/payments/callback"),
    "[[PAYOUT_CALLBACK_URL]]": buildUrl(origin, "/payouts/callback"),
    "[[RETURN_URL]]": buildUrl(origin, "/payments/return"),
    "[[SUCCESS_URL]]": buildUrl(origin, "/payments/success"),
    "[[FAIL_URL]]": buildUrl(origin, "/payments/fail"),
    "[[PAY_URL]]": origin,
    "[[STORAGE_URL]]": buildUrl(origin, "/storage"),
  };
}

function replacePlaceholders(text, replacements) {
  let result = text;

  for (const [token, value] of Object.entries(replacements)) {
    result = result.split(token).join(value);
  }

  return result;
}

function replaceNode(node, replacements) {
  if (node.nodeType === Node.TEXT_NODE) {
    node.textContent = replacePlaceholders(node.textContent, replacements);
    return;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return;
  }

  for (const attr of node.attributes) {
    attr.value = replacePlaceholders(attr.value, replacements);
  }

  node.childNodes.forEach((child) => replaceNode(child, replacements));
}

function applyReplacement() {
  const replacements = buildReplacements(getOrigin());

  document.title = replacePlaceholders(document.title, replacements);
  replaceNode(document.body, replacements);
}

window.addEventListener("DOMContentLoaded", applyReplacement);
document.addEventListener("astro:page-load", applyReplacement);
