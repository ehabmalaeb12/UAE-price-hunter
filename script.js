// UAE PRICE HUNTER — GROUPED REAL SEARCH
alert("script.js loaded");
let appState = {
  basket: [],
  points: 0
};

function initializeApp() {
  console.log("App ready");
}

async function performSearch() {
  const input = document.getElementById("searchInput");
  const query = input.value.trim();

  if (!query) {
    alert("Enter a product name");
    return;
  }

  showLoading(true);

  const products = await window.shoppingSearch(query);

  renderGrouped(products);

  showLoading(false);
}

function renderGrouped(products) {
  const container = document.getElementById("searchResults");
  container.innerHTML = "";

  if (!products.length) {
    container.innerHTML = "<p>No results found</p>";
    return;
  }

  const groups = {};

  products.forEach(p => {
    if (!groups[p.groupKey]) groups[p.groupKey] = [];
    groups[p.groupKey].push(p);
  });

  Object.values(groups).forEach(group => {
    group.sort((a, b) => a.price - b.price);
    const best = group[0];

    const groupDiv = document.createElement("div");
    groupDiv.className = "comparison-group";

    groupDiv.innerHTML = `
      <div class="group-header">
        <h3>${best.title}</h3>
        <strong>Best: ${best.price} AED</strong>
      </div>
      <div class="comparison-content">
        ${group.map(p => `
          <div class="product-card ${p === best ? 'best-price' : ''}">
            <img class="product-image" src="${p.image}">
            <h4>${p.store}</h4>
            <p>${p.price} AED</p>
          </div>
        `).join("")}
      </div>
    `;

    container.appendChild(groupDiv);
  });
}

function showLoading(state) {
  document.getElementById("loading").style.display =
    state ? "block" : "none";
}
