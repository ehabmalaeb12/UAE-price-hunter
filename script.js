// script.js — UI ENGINE

async function performSearch() {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) return;

  const loading = document.getElementById("loading");
  const resultsDiv = document.getElementById("searchResults");

  loading.style.display = "block";
  resultsDiv.innerHTML = "";

  let results = [];

  try {
    results = await window.simpleSearch(query);
  } catch (err) {
    resultsDiv.innerHTML = "<p>Error loading results</p>";
  }

  loading.style.display = "none";

  if (!results.length) {
    resultsDiv.innerHTML = "<p>No results found</p>";
    return;
  }

  results.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img src="${p.image}">
      <h3>${p.name}</h3>
      <p><strong>Best:</strong> ${p.bestPrice} AED</p>
      <p>${p.bestStore}</p>

      <details>
        <summary>Compare stores</summary>
        ${p.offers.map(o => `
          <div class="offer">
            ${o.store} — ${o.price} AED
            <a href="${o.link}" target="_blank">Buy</a>
          </div>
        `).join("")}
      </details>
    `;

    resultsDiv.appendChild(card);
  });
}
