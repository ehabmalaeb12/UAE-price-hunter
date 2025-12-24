// script.js
console.log("🚀 script.js loaded");

async function performSearch() {
  const input = document.getElementById("searchInput");
  const query = input.value.trim();

  const container = document.getElementById("searchResults");
  container.innerHTML = "";

  if (!query) {
    container.innerHTML = "<p>Please enter a product name.</p>";
    return;
  }

  try {
    const products = await fetchShoppingResults(query);

    if (!products.length) {
      container.innerHTML = "<p>No results found.</p>";
      return;
    }

    displayResults(products);
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Error loading results.</p>";
  }
}

function displayResults(products) {
  const container = document.getElementById("searchResults");
  container.innerHTML = "";

  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img src="${p.image}" alt="${p.title}">
      <span class="store">${p.store}</span>
      <h3>${p.title}</h3>
      <div class="price">${p.price} AED</div>
      ${p.oldPrice ? `<div class="old-price">${p.oldPrice} AED</div>` : ""}
      <div class="meta">⭐ ${p.rating} · ${p.shipping}</div>
      <div class="actions">
        <a href="${p.link}" target="_blank">Buy</a>
      </div>
    `;

    container.appendChild(card);
  });
}
