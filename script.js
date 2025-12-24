// script.js
// UAE Price Hunter — STEP 2
// Frontend → Cloudflare Worker connection
// GitHub Pages safe, no demo data, no fake products

console.log("✅ script.js loaded (Step 2)");

/* -------------------------
   DOM ELEMENTS
-------------------------- */
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const loadingEl = document.getElementById("loading");
const resultsEl = document.getElementById("searchResults");

/* -------------------------
   CONFIG
-------------------------- */
const WORKER_URL = "https://uae-price-proxy.ehabmalaeb2.workers.dev";

/* -------------------------
   SAFETY CHECKS
-------------------------- */
if (!searchInput || !searchBtn || !resultsEl) {
  console.error("❌ Missing required DOM elements");
}

/* -------------------------
   EVENTS
-------------------------- */
searchBtn.addEventListener("click", runSearch);
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") runSearch();
});

/* -------------------------
   MAIN SEARCH FUNCTION
-------------------------- */
async function runSearch() {
  const query = searchInput.value.trim();

  resultsEl.innerHTML = "";
  loadingEl.style.display = "block";

  if (!query) {
    loadingEl.style.display = "none";
    resultsEl.innerHTML = "<p>Please enter a product name.</p>";
    return;
  }

  console.log("🔍 Searching for:", query);

  try {
    const response = await fetch(`${WORKER_URL}/?q=${encodeURIComponent(query)}`);
    const data = await response.json();

    console.log("📦 Worker response:", data);

    loadingEl.style.display = "none";

    if (!data || !Array.isArray(data.results) || data.results.length === 0) {
      resultsEl.innerHTML = `
        <p style="color:#888;">
          Fetching live prices from UAE stores…
        </p>
      `;
      return;
    }

    renderResults(data.results);

  } catch (err) {
    console.error("❌ Search failed:", err);
    loadingEl.style.display = "none";
    resultsEl.innerHTML = "<p>Something went wrong. Please try again.</p>";
  }
}

/* -------------------------
   RENDER RESULTS
-------------------------- */
function renderResults(products) {
  resultsEl.innerHTML = "";

  products.forEach(product => {
    const card = document.createElement("div");
    card.style.border = "1px solid #ddd";
    card.style.padding = "15px";
    card.style.marginBottom = "15px";
    card.style.borderRadius = "8px";

    card.innerHTML = `
      <h3>${product.name || "Product"}</h3>
      ${product.image ? `<img src="${product.image}" style="max-width:180px;margin:10px 0;">` : ""}
      <p><strong>Store:</strong> ${product.store || "-"}</p>
      <p><strong>Price:</strong> ${product.price ? product.price + " AED" : "-"}</p>
      ${product.link ? `<a href="${product.link}" target="_blank">Go to store</a>` : ""}
    `;

    resultsEl.appendChild(card);
  });
}

console.log("🚀 Step 2 frontend ready");
