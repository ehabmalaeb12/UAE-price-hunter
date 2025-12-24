/* =====================================================
   UAE PRICE HUNTER – SHOPPING SOURCE (SAFE & STABLE)
   Uses Cloudflare Worker as Google Shopping proxy
   ===================================================== */

/*
  IMPORTANT:
  1. Replace WORKER_URL with your real Cloudflare Worker URL
  2. This file MUST be loaded before script.js
*/

const WORKER_URL = "https://uae-price-proxy.ehabmalaeb12.workers.dev";

/* -----------------------------------------------------
   MAIN SEARCH FUNCTION
----------------------------------------------------- */

async function googleShoppingSearch(query) {
  try {
    if (!query || query.length < 2) return [];

    const url = `${WORKER_URL}?q=${encodeURIComponent(query)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "text/html"
      }
    });

    if (!response.ok) {
      console.warn("Shopping proxy failed:", response.status);
      return [];
    }

    const html = await response.text();

    return parseGoogleShoppingHTML(html, query);

  } catch (err) {
    console.error("googleShoppingSearch error:", err);
    return [];
  }
}

/* -----------------------------------------------------
   HTML PARSER (DEFENSIVE)
----------------------------------------------------- */

function parseGoogleShoppingHTML(html, query) {
  const products = [];

  if (!html || html.length < 1000) return products;

  // Create DOM safely
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const cards = doc.querySelectorAll("img");

  cards.forEach(img => {
    const src = img.getAttribute("src");
    if (!src || !src.startsWith("http")) return;

    // Find price near image
    let parent = img.parentElement;
    let price = null;

    while (parent && !price) {
      const text = parent.innerText || "";
      const match = text.match(/AED\s?([\d,]+)/i);
      if (match) price = parseInt(match[1].replace(/,/g, ""));
      parent = parent.parentElement;
    }

    if (!price) return;

    products.push({
      id: crypto.randomUUID(),
      name: query,
      store: "UAE Store",
      price: price,
      currency: "AED",
      image: src,
      link: "#",
      rating: null,
      shipping: null
    });
  });

  return products.slice(0, 20);
}

/* -----------------------------------------------------
   PUBLIC EXPORT
----------------------------------------------------- */

window.googleShoppingSearch = googleShoppingSearch;

console.log("✅ shopping-source.js loaded");
