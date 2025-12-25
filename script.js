// UAE Price Hunter — REAL SEARCH CONNECTOR (STEP 2)

console.log("✅ script.js loaded");

// ---------------- DOM ----------------
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const loadingEl = document.getElementById("loading");
const resultsEl = document.getElementById("searchResults");

// ---------------- CONFIG ----------------
const WORKER_URL = "https://uae-price-proxy.ehabmalaeb2.workers.dev";

// ---------------- EVENTS ----------------
searchBtn.addEventListener("click", runSearch);
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") runSearch();
});

// ---------------- SEARCH ----------------
async function runSearch() {
  const query = searchInput.value.trim();

  resultsEl.innerHTML = "";
  loadingEl.style.display = "block";

  if (!query) {
    loadingEl.style.display = "none";
    resultsEl.innerHTML = "<p>Please enter a product name.</p>";
    return;
  }

  try {
    const url = `${WORKER_URL}/?q=${encodeURIComponent(query)}`;
    console.log("🔍 Fetching:", url);

    const response = await fetch(url);
    const data = await response.json();

    loadingEl.style.display = "none";

    if (!data || !data.results || data.results.length === 0) {
      resultsEl.innerHTML = "<p>No products found.</p>";
      return;
    }

    renderResults(data.results);

  } catch (err) {
    loadingEl.style.display = "none";
    console.error("❌ Search failed:", err);
    resultsEl.innerHTML = "<p>Search failed. Try again.</p>";
  }
}

// ---------------- RENDER ----------------
function renderResults(products) {
  resultsEl.innerHTML = "";

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <h3>${product.title || product.name || "Product"}</h3>

      ${product.image ? `
        <img src="${product.image}" 
             alt="${product.title || ""}" 
             style="max-width:180px;margin:10px 0;">
      ` : ""}

      <p><strong>Price:</strong> ${product.price || "N/A"} AED</p>

      ${product.store ? `<p>Store: ${product.store}</p>` : ""}

      ${product.link ? `
        <a href="${product.link}" target="_blank">
          Buy from store
        </a>
      ` : ""}
    `;

    resultsEl.appendChild(card);
  });
}

console.log("🚀 Frontend ready and connected");
