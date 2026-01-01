function getDomain() {
  const params = new URLSearchParams(window.location.search);
  const domainFromUrl = params.get("domain");

  if (domainFromUrl) {
    localStorage.setItem("customDomain", domainFromUrl);
    return domainFromUrl;
  }

  return localStorage.getItem("customDomain") || "domain";
}

function replaceDomainInNode(node, domain) {
  if (node.nodeType === Node.TEXT_NODE) {
    node.textContent = node.textContent.replace(/domain/g, domain);
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    // 🔹 проходим по всем атрибутам элемента
    for (const attr of node.attributes) {
      if (attr.value.includes("domain")) {
        attr.value = attr.value.replace(/domain/g, domain);
      }
    }

    // 🔹 рекурсивно обходим дочерние узлы
    node.childNodes.forEach((child) => replaceDomainInNode(child, domain));
  }
}

function applyReplacement() {
  const domain = getDomain();
  replaceDomainInNode(document.body, domain);
}

window.addEventListener("DOMContentLoaded", applyReplacement);
document.addEventListener("astro:page-load", applyReplacement);
