// ---------------- script.js ----------------
console.log("✅ script.js loaded");

// Main search function
async function performSearch() {
  const input = document.getElementById("searchInput");
  const query = input?.value.trim();

  if (!query) {
    alert("Please enter a product name");
    return;
  }

  const resultsContainer = document.getElementById("searchResults");
  resultsContainer.innerHTML = `
    <div class="loading-box">
      <div class="loader"></div>
      <p>Searching UAE stores...</p>
    </div>
  `;

  try {
    const results = await window.deepSearchProducts(query);
    renderResults(results);
  } catch (err) {
    console.error(err);
    resultsContainer.innerHTML = `<p class='error'>Failed to fetch results.</p>`;
  }
}

// Render results
function renderResults(products) {
  const container = document.getElementById("searchResults");
  container.innerHTML = "";

  if (!products || products.length === 0) {
    container.innerHTML = `<p>No products found.</p>`;
    return;
  }

  products.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/300x200'">
      <div class="product-info">
        <h3>${p.name}</h3>
        <p class="store">${p.store}</p>
        <p class="price">
          <strong>${p.price} AED</strong>
          <span class="old">${p.originalPrice} AED</span>
        </p>
        <a href="${p.link}" class="deal-btn" target="_blank">View Deal</a>
      </div>
    `;
    container.appendChild(card);
  });
}

window.performSearch = performSearch;
