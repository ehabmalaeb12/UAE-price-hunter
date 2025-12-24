// script.js — HARD RESET SAFE VERSION

console.log("✅ script.js loaded");

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const resultsEl = document.getElementById("searchResults");

if (!window.SHOPPING_SOURCES) {
  console.error("❌ SHOPPING_SOURCES missing");
}

searchBtn.addEventListener("click", runSearch);
searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") runSearch();
});

function runSearch() {
  const query = searchInput.value.trim().toLowerCase();
  resultsEl.innerHTML = "";

  console.log("🔍 Query:", query);

  if (!query) {
    resultsEl.innerHTML = "<p>Enter a product name</p>";
    return;
  }

  const matches = SHOPPING_SOURCES.filter(p =>
    p.name.toLowerCase().includes(query)
  );

  console.log("📦 Found:", matches.length);

  if (matches.length === 0) {
    resultsEl.innerHTML = "<p>No results found</p>";
    return;
  }

  matches.forEach(product => {
    const cheapest = [...product.stores].sort((a,b)=>a.price-b.price)[0];

    const card = document.createElement("div");
    card.style.border = "1px solid #ccc";
    card.style.padding = "15px";
    card.style.marginBottom = "20px";

    card.innerHTML = `
      <h2>${product.name}</h2>
      <img src="${product.image}" style="max-width:200px">
      <p><strong>Best Price:</strong> ${cheapest.price} AED (${cheapest.store})</p>
      <ul>
        ${product.stores.map(s => `<li>${s.store}: ${s.price} AED</li>`).join("")}
      </ul>
    `;

    resultsEl.appendChild(card);
  });
}

console.log("🚀 Ready");
