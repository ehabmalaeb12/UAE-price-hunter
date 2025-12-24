// script.js
// UAE Price Hunter — STABLE CORE ENGINE (GitHub Pages Safe)

console.log("✅ script.js loaded");

// -----------------------
// DOM ELEMENTS
// -----------------------
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const resultsEl = document.getElementById("searchResults");
const loadingEl = document.getElementById("loading"); // may be null

// -----------------------
// SAFETY CHECKS
// -----------------------
if (!window.SHOPPING_SOURCES) {
  console.error("❌ SHOPPING_SOURCES not found");
  if (resultsEl) {
    resultsEl.innerHTML = "<p style='color:red'>Data source failed to load.</p>";
  }
}

if (!searchBtn || !searchInput || !resultsEl) {
  console.error("❌ Missing critical DOM elements");
}

// -----------------------
// EVENT LISTENERS
// -----------------------
if (searchBtn) {
  searchBtn.addEventListener("click", runSearch);
}

if (searchInput) {
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") runSearch();
  });
}

// -----------------------
// MAIN SEARCH FUNCTION
// -----------------------
function runSearch() {
  const query = searchInput.value.trim().toLowerCase();

  resultsEl.innerHTML = "";

  if (loadingEl) loadingEl.style.display = "block";

  console.log("🔍 Searching for:", query);

  if (!query) {
    if (loadingEl) loadingEl.style.display = "none";
    resultsEl.innerHTML = "<p>Please enter a product name.</p>";
    return;
  }

  const matches = window.SHOPPING_SOURCES.filter(product =>
    product.name.toLowerCase().includes(query)
  );

  console.log("📦 Matches found:", matches.length);

  if (loadingEl) loadingEl.style.display = "none";

  if (matches.length === 0) {
    resultsEl.innerHTML = "<p>No products found.</p>";
    return;
  }

  renderResults(matches);
}

// -----------------------
// RENDER RESULTS
// -----------------------
function renderResults(products) {
  products.forEach(product => {
    const card = document.createElement("div");
    card.style.border = "1px solid #ccc";
    card.style.padding = "15px";
    card.style.marginBottom = "20px";
    card.style.borderRadius = "8px";

    const cheapest = [...product.stores].sort((a, b) => a.price - b.price)[0];

    card.innerHTML = `
      <h2>${product.name}</h2>
      <img src="${product.image}" style="max-width:200px;display:block;margin-bottom:10px;">
      <p><strong>Best Price:</strong> ${cheapest.price} AED (${cheapest.store})</p>
      <h4>Available Stores:</h4>
      <ul>
        ${product.stores.map(s =>
          `<li>${s.store}: ${s.price} AED</li>`
        ).join("")}
      </ul>
    `;

    resultsEl.appendChild(card);
  });
}

console.log("🚀 UAE Price Hunter ready");
