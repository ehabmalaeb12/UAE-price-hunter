const products = [
  {
    name: "iPhone 14",
    store: "Noon",
    price: 3200,
    discount: 50,
    url: "https://www.noon.com",
    img: "https://upload.wikimedia.org/wikipedia/commons/f/fa/IPhone_14_Pro.png"
  },
  {
    name: "Creatine Monohydrate",
    store: "Amazon",
    price: 89,
    discount: 35,
    url: "https://www.amazon.ae",
    img: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Creatine_powder.jpg"
  },
  {
    name: "Sony Headphones",
    store: "Carrefour",
    price: 200,
    discount: 70,
    url: "https://www.carrefouruae.com",
    img: "https://upload.wikimedia.org/wikipedia/commons/2/21/Headphones_3.jpg"
  }
];

let pending = 0;
let available = 0;

const bigDeals = document.getElementById("big-deals");
const results = document.getElementById("results");
const searchInput = document.getElementById("searchInput");

/* BIG DEALS */
products
  .filter(p => p.discount >= 50)
  .sort((a,b) => b.discount - a.discount)
  .forEach(p => renderCard(p, bigDeals));

/* SEARCH */
searchInput.addEventListener("input", () => {
  results.innerHTML = "";
  const query = searchInput.value.toLowerCase();

  const matches = products
    .filter(p => p.name.toLowerCase().includes(query))
    .sort((a,b) => a.price - b.price);

  matches.forEach((p, index) => renderCard(p, results, index === 0));
});

/* CARD RENDER */
function renderCard(product, container, highlight=false) {
  const card = document.createElement("div");
  card.className = "card" + (highlight ? " highlight" : "");

  card.innerHTML = `
    <span class="discount">-${product.discount}%</span>
    <img src="${product.img}">
    <div class="card-content">
      <h3>${product.name}</h3>
      <div class="store">${product.store}</div>
      <div class="price">AED ${product.price}</div>
    </div>
  `;

  card.onclick = () => {
    pending += 5;
    document.getElementById("pending").textContent = pending;
    window.open(product.url, "_blank");
  };

  container.appendChild(card);
}
