// UAE PRICE HUNTER — REAL DATA (GROUPED)

const APP_CONFIG = {
  LS_BASKET: 'uae_price_hunter_basket'
};

let appState = {
  basket: []
};

/* ---------------- INIT ---------------- */

function initializeApp() {
  appState.basket = JSON.parse(localStorage.getItem(APP_CONFIG.LS_BASKET) || '[]');
  updateUI();
}

/* ---------------- SEARCH ---------------- */

async function performSearch() {
  const q = document.getElementById('searchInput').value.trim();
  if (!q) return alert('Enter product name');

  showLoading(true);

  const raw = await window.googleShoppingSearch(q);
  const grouped = groupProducts(raw);

  displayGroupedResults(grouped);

  showLoading(false);
}

/* ---------------- GROUPING ---------------- */

function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\b(uae|amazon|noon|online|store)\b/g, '')
    .trim();
}

function groupProducts(products) {
  const map = {};

  products.forEach(p => {
    const key = normalizeName(p.name).split(' ').slice(0, 5).join(' ');
    if (!map[key]) map[key] = [];
    map[key].push(p);
  });

  return Object.entries(map).map(([key, items]) => {
    items.sort((a, b) => a.price - b.price);
    return {
      title: items[0].name,
      image: items[0].image,
      offers: items
    };
  });
}

/* ---------------- DISPLAY ---------------- */

function displayGroupedResults(groups) {
  const c = document.getElementById('searchResults');
  c.innerHTML = '';

  groups.forEach(g => {
    const card = document.createElement('div');
    card.className = 'product-card';

    card.innerHTML = `
      <img src="${g.image}" onerror="this.src='https://via.placeholder.com/300'">
      <h3>${g.title}</h3>
      <strong>From ${g.offers[0].price} AED</strong>
      <div class="offers">
        ${g.offers.map(o => `
          <div class="offer">
            <span>${o.price} AED</span>
            <button onclick='addToBasket(${JSON.stringify(o).replace(/"/g, '&quot;')})'>Add</button>
          </div>
        `).join('')}
      </div>
    `;

    c.appendChild(card);
  });
}

/* ---------------- BASKET ---------------- */

function addToBasket(p) {
  appState.basket.push(p);
  localStorage.setItem(APP_CONFIG.LS_BASKET, JSON.stringify(appState.basket));
  updateUI();
}

function updateUI() {
  const el = document.getElementById('basketCount');
  if (el) el.textContent = appState.basket.length;
}

function showLoading(s) {
  const l = document.getElementById('loading');
  if (l) l.style.display = s ? 'flex' : 'none';
}

/* ---------------- EXPORT ---------------- */

window.initializeApp = initializeApp;
window.performSearch = performSearch;
window.addToBasket = addToBasket;
