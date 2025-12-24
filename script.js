// script.js
// UAE Price Hunter — Stable Core Engine

console.log("✅ script.js loaded");

// -----------------------
// DOM ELEMENTS
// -----------------------
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const loadingEl = document.getElementById("loading");
const resultsEl = document.getElementById("searchResults");

// -----------------------
// SAFETY CHECK
// -----------------------
if (!window.SHOPPING_SOURCES) {
  resultsEl.innerHTML = "<p style='color:red'>Product data not loaded.</p>";
  throw new Error("SHOPPING_SOURCES missing");
}

// -----------------------
// EVENTS
// -----------------------
searchBtn.addEventListener("click", runSearch);
searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") runSearch();
});

// -----------------------
// SEARCH
// -----------------------
function runSearch() {
  const query = searchInput.value.trim().toLowerCase();

  resultsEl.innerHTML = "";
  loadingEl.style.display = "block";

  if (!query) {
    loadingEl.style.display = "none";
    resultsEl.innerHTML = "<p>Please enter a product name.</p>";
    return;
  }

  const matches = window.SHOPPING_SOURCES.filter(p =>
    p.name.toLowerCase().includes(query)
  );

  loadingEl.style.display = "none";

  if (matches.length === 0) {
    resultsEl.innerHTML = "<p>No products found.</p>";
    return;
  }

  renderResults(matches);
}

// -----------------------
// RENDER
// -----------------------
function renderResults(products) {
  products.forEach(product => {
    const cheapest = [...product.stores].sort((a, b) => a.price - b.price)[0];

    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <h2>${product.name}</h2>
      <img src="${product.image}" alt="${product.name}">
      <p><strong>Best Price:</strong> ${cheapest.price} AED (${cheapest.store})</p>

      <ul>
        ${product.stores.map(s =>
          `<li>${s.store}: ${s.price} AED</li>`
        ).join("")}
      </ul>
    `;

    resultsEl.appendChild(card);
  });
}

console.log("🚀 UAE Price Hunter engine ready");
