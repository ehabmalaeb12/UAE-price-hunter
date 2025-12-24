// UAE PRICE HUNTER — UI-ALIGNED STABLE VERSION

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
    alert('Enter a product name');
    return;
  }

  awardPoints(APP_CONFIG.POINTS_PER_SEARCH);

  let response;

  if (window.simpleSearch) {
    response = await window.simpleSearch(query);
  } else {
    response = {
      products: generateDemoResults(query)
    };
  }

  displayResults(response.products || []);
}

/* ---------------- FALLBACK DATA ---------------- */

function generateDemoResults(query) {
  return [
    {
      id: 'amazon-1',
      title: `${query} (128GB)`,
      store: 'Amazon UAE',
      price: 999,
      originalPrice: 1299,
      image: 'https://m.media-amazon.com/images/I/71TPda7cwUL._AC_SL1500_.jpg',
      link: 'https://amazon.ae',
      rating: 4.5,
      delivery: 'Free Tomorrow'
    },
    {
      id: 'noon-1',
      title: `${query} (128GB)`,
      store: 'Noon UAE',
      price: 1049,
      originalPrice: 1199,
      image: 'https://cdn.nooncdn.com/products/tr:n-t_240/v165.jpg',
      link: 'https://noon.com',
      rating: 4.3,
      delivery: 'Same Day'
    }
  ];
}

/* ---------------- DISPLAY ---------------- */

function displayResults(products) {
  const container = document.getElementById('searchResults');
  container.innerHTML = '';

  if (!products.length) {
    container.innerHTML = `<p style="color:#E3C58E;text-align:center;">No results found</p>`;
    return;
  }

  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'compact-product-card';

    card.innerHTML = `
      <img 
        src="${p.image}" 
        class="compact-product-image"
        onerror="this.src='https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400'"
      />

      <span class="product-store-tag">${p.store}</span>

      <div class="compact-product-title">${p.title}</div>

      <div class="compact-price">${p.price} AED</div>

      ${p.originalPrice ? `<div class="compact-original-price">${p.originalPrice} AED</div>` : ''}

      <div class="compact-product-meta">
        <span>⭐ ${p.rating || '—'}</span>
        <span>${p.delivery || ''}</span>
      </div>

      <div class="compact-actions">
        <button class="btn btn-outline" onclick='addToBasket(${JSON.stringify(p).replace(/"/g, '&quot;')})'>
          Add
        </button>
        <a class="btn btn-primary" href="${p.link}" target="_blank">
          Buy
        </a>
      </div>
    `;

    container.appendChild(card);
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

/* ---------------- EXPORT ---------------- */

window.performSearch = performSearch;
window.addToBasket = addToBasket;
window.initializeApp = initializeApp;

console.log('🚀 script.js loaded — compact UI aligned');
