/* ===============================
   CONFIG (AFFILIATE READY)
================================ */

const affiliateLinks = {
  amazon: "https://www.amazon.ae",     // replace later
  noon: "https://www.noon.com",
  carrefour: "https://www.carrefouruae.com"
};

const MIN_ORDER = 30;
const CASHBACK_RATE = 0.02;

/* ===============================
   STATE
================================ */

let points = 0;
const pointsEl = document.getElementById("points");

/* ===============================
   PRODUCT DATA (DEMO)
================================ */

const products = [
  {
    name: "Creatine Monohydrate",
    image: "https://via.placeholder.com/300x200?text=Creatine",
    hot: false,
    deals: [
      { store: "Amazon", price: 89, key: "amazon" },
      { store: "Noon", price: 95, key: "noon" },
      { store: "Carrefour", price: 99, key: "carrefour" }
    ]
  },
  {
    name: "iPhone 14",
    image: "https://via.placeholder.com/300x200?text=iPhone+14",
    hot: true,
    deals: [
      { store: "Amazon", price: 3150, key: "amazon" },
      { store: "Noon", price: 3200, key: "noon" },
      { store: "Carrefour", price: 3300, key: "carrefour" }
    ]
  }
];

/* ===============================
   RENDERING
================================ */

const productGrid = document.getElementById("productGrid");
const hotDealsGrid = document.getElementById("hotDealsGrid");
const searchInput = document.getElementById("searchInput");

function renderProducts(list, container) {
  container.innerHTML = "";

  list.forEach(product => {
    const bestDeal = product.deals.reduce((a, b) =>
      a.price < b.price ? a : b
    );

    const cashback =
      bestDeal.price >= MIN_ORDER
        ? (bestDeal.price * CASHBACK_RATE).toFixed(2)
        : "0.00";

    const card = document.createElement("div");
    card.className = "card";

    if (product.hot) {
      card.innerHTML += `<div class="badge">HOT</div>`;
    }

    card.innerHTML += `
      <img src="${product.image}">
      <h3>${product.name}</h3>

      ${product.deals.map(d =>
        `<div class="store ${d === bestDeal ? "best" : ""}">
          ${d.store}: AED ${d.price}
        </div>`
      ).join("")}

      <small>Earn up to AED ${cashback}</small>

      <a class="btn"
         href="#"
         onclick="handleAffiliateClick(
           '${product.name}',
           '${bestDeal.store}',
           ${bestDeal.price},
           '${affiliateLinks[bestDeal.key]}',
           ${cashback}
         )">
        Best Price → ${bestDeal.store}
      </a>
    `;

    container.appendChild(card);
  });
}

/* ===============================
   AFFILIATE CLICK LOGIC
================================ */

function handleAffiliateClick(product, store, price, url, cashback) {
  console.log("Affiliate Click:", {
    product,
    store,
    price,
    time: new Date().toISOString()
  });

  if (price >= MIN_ORDER) {
    points += parseFloat(cashback);
    pointsEl.textContent = points.toFixed(2);
    alert("Cashback added as pending. Will be confirmed after order.");
  } else {
    alert("Minimum order AED 30 required to earn cashback.");
  }

  window.open(url, "_blank");
}

/* ===============================
   SEARCH
================================ */

searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(q)
  );
  renderProducts(filtered, productGrid);
});

/* ===============================
   INIT
================================ */

renderProducts(products, productGrid);
renderProducts(products.filter(p => p.hot), hotDealsGrid);
