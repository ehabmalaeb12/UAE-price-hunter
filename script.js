// UAE PRICE HUNTER — SCRIPT.JS (GROUPED VERSION)

/* ---------------- STATE ---------------- */

let appState = {
  basket: [],
  points: 0
};

/* ---------------- INIT ---------------- */

function initializeApp() {
  console.log('✅ App initialized');
}

/* ---------------- SEARCH ---------------- */

async function performSearch() {
  const input = document.getElementById('searchInput');
  const query = input.value.trim();
  if (!query) return;

  showLoading(true);

  try {
    const results = await window.simpleSearch(query);
    renderGroupedResults(results);
  } catch (err) {
    console.error(err);
    alert('Search failed');
  }

  showLoading(false);
}

/* ---------------- RENDER ---------------- */

function renderGroupedResults(groups) {
  const container = document.getElementById('searchResults');
  container.innerHTML = '';

  if (!groups || groups.length === 0) {
    container.innerHTML = `<p style="color:white">No results found</p>`;
    return;
  }

  groups.forEach(group => {
    const card = document.createElement('div');
    card.className = 'product-card';

    card.innerHTML = `
      <img src="${group.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'}">
      <h3>${group.name}</h3>
      <p class="best">Best price: <strong>${group.bestPrice} AED</strong></p>
      <p class="store">From: ${group.bestStore}</p>
      <button onclick="toggleOffers(this)">Compare ${group.offerCount} stores</button>

      <div class="offers hidden">
        ${group.offers.map(o => `
          <div class="offer-row">
            <span>${o.store}</span>
            <strong>${o.price} AED</strong>
            <a href="${o.link}" target="_blank">Buy</a>
          </div>
        `).join('')}
      </div>
    `;

    container.appendChild(card);
  });

  container.scrollIntoView({ behavior: 'smooth' });
}

/* ---------------- UI HELPERS ---------------- */

function toggleOffers(btn) {
  const offers = btn.nextElementSibling;
  offers.classList.toggle('hidden');
}

function showLoading(state) {
  const el = document.getElementById('loading');
  if (el) el.style.display = state ? 'flex' : 'none';
}

/* ---------------- EXPORT ---------------- */

window.performSearch = performSearch;
window.initializeApp = initializeApp;

console.log('🚀 script.js loaded (GROUPED)');
