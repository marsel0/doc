function normalizeDomain(value) {
  if (!value) return null;

  return value
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
}

function getDomain() {
  const params = new URLSearchParams(window.location.search);
  const domainFromUrl = normalizeDomain(params.get("domain"));

  if (domainFromUrl) {
    localStorage.setItem("customDomain", domainFromUrl);
    return domainFromUrl;
  }

  return normalizeDomain(localStorage.getItem("customDomain")) || "simple-pay.example";
}

function buildUrl(domain, path = "") {
  return `https://${domain}${path}`;
}

function buildReplacements(domain) {
  return {
    "[[DOMAIN]]": domain,
    "[[DOMAIN_URL]]": buildUrl(domain),
    "[[PROJECT_NAME]]": domain,
    "[[BASE_URL]]": buildUrl(domain, "/public/api/v1"),
    "[[LOGIN_URL]]": buildUrl(domain, "/login"),
    "[[APP_URL]]": buildUrl(domain),
    "[[CALLBACK_URL]]": buildUrl(domain, "/simple-pay/callback"),
    "[[PAYOUT_CALLBACK_URL]]": buildUrl(domain, "/simple-pay/payout-callback"),
    "[[RETURN_URL]]": buildUrl(domain, "/payments/return"),
    "[[SUCCESS_URL]]": buildUrl(domain, "/payments/success"),
    "[[FAIL_URL]]": buildUrl(domain, "/payments/fail"),
    "[[PAY_URL]]": buildUrl(domain),
    "[[STORAGE_URL]]": buildUrl(domain, "/storage"),
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
  const replacements = buildReplacements(getDomain());

  document.title = replacePlaceholders(document.title, replacements);
  replaceNode(document.body, replacements);
}

window.addEventListener("DOMContentLoaded", applyReplacement);
document.addEventListener("astro:page-load", applyReplacement);
