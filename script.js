// UAE PRICE HUNTER — CLEAN STABLE VERSION

const APP_CONFIG = {
  POINTS_PER_SEARCH: 10,
  POINTS_PER_ADD_TO_BASKET: 50,
  LS_BASKET: 'uae_price_hunter_basket',
  LS_POINTS: 'user_points'
};

let appState = {
  basket: [],
  points: 0
};

/* ---------------- INIT ---------------- */

function initializeApp() {
  loadState();
  setupEvents();
  updateUI();
  console.log('✅ App initialized');
}

function loadState() {
  appState.basket = JSON.parse(localStorage.getItem(APP_CONFIG.LS_BASKET) || '[]');
  appState.points = parseInt(localStorage.getItem(APP_CONFIG.LS_POINTS) || '0');
}

function saveState() {
  localStorage.setItem(APP_CONFIG.LS_BASKET, JSON.stringify(appState.basket));
  localStorage.setItem(APP_CONFIG.LS_POINTS, appState.points);
}

/* ---------------- SEARCH ---------------- */

async function performSearch() {
  const input = document.getElementById('searchInput');
  const query = input?.value.trim();

  if (!query) {
    showNotification('Enter a product name', 'warning');
    return;
  }

  showLoading(true);
  awardPoints(APP_CONFIG.POINTS_PER_SEARCH);

  let results;

  if (window.simpleSearch) {
    results = await window.simpleSearch(query);
  } else {
    results = generateDemoResults(query);
  }

  displayResults(results, query);
  showLoading(false);
}

function generateDemoResults(query) {
  return [
    {
      id: 'a1',
      name: `${query} - Amazon UAE`,
      store: 'Amazon UAE',
      price: 999,
      originalPrice: 1299,
      image: 'https://m.media-amazon.com/images/I/71TPda7cwUL._AC_SL1500_.jpg',
      link: 'https://amazon.ae',
      rating: '4.5',
      shipping: 'FREE Tomorrow'
    },
    {
      id: 'a2',
      name: `${query} - Noon UAE`,
      store: 'Noon UAE',
      price: 1049,
      image: 'https://cdn.nooncdn.com/products/tr:n-t_240/v165.jpg',
      link: 'https://noon.com',
      rating: '4.3',
      shipping: 'Same Day'
    }
  ];
}

/* ---------------- DISPLAY ---------------- */

function displayResults(products, query) {
  const container = document.getElementById('searchResults');
  container.innerHTML = '';

  products.forEach(p => {
    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `
      <img src="${p.image}" onerror="this.src='https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400'">
      <h3>${p.name}</h3>
      <p>${p.store}</p>
      <strong>${p.price} AED</strong>
      <div class="actions">
        <button onclick='addToBasket(${JSON.stringify(p).replace(/"/g, '&quot;')})'>Add</button>
        <a href="${p.link}" target="_blank">Buy</a>
      </div>
    `;
    container.appendChild(div);
  });

  container.scrollIntoView({ behavior: 'smooth' });
}

/* ---------------- BASKET ---------------- */

function addToBasket(product) {
  appState.basket.push({ ...product, qty: 1 });
  awardPoints(APP_CONFIG.POINTS_PER_ADD_TO_BASKET);
  saveState();
  updateUI();
}

/* ---------------- UI ---------------- */

function showLoading(state) {
  const el = document.getElementById('loading');
  if (el) el.style.display = state ? 'flex' : 'none';
}

function updateUI() {
  const count = document.getElementById('basketCount');
  if (count) count.textContent = appState.basket.length;

  const pts = document.getElementById('totalPoints');
  if (pts) pts.textContent = appState.points;
}

function awardPoints(p) {
  appState.points += p;
  saveState();
}

function showNotification(msg) {
  alert(msg);
}

/* ---------------- EXPORT ---------------- */

window.initializeApp = initializeApp;
window.performSearch = performSearch;
window.addToBasket = addToBasket;

console.log('🚀 script.js loaded cleanly');
