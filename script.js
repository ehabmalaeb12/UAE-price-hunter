const products = [
  {
    name: "iPhone 14",
    image: "https://via.placeholder.com/300x200?text=iPhone+14",
    deals: [
      { store: "Noon", price: 3200, link: "https://www.noon.com" },
      { store: "Amazon", price: 3150, link: "https://www.amazon.ae" },
      { store: "Carrefour", price: 3300, link: "https://www.carrefouruae.com" }
    ],
    hot: true
  },
  {
    name: "Sony Headphones",
    image: "https://via.placeholder.com/300x200?text=Sony+Headphones",
    deals: [
      { store: "Carrefour", price: 200, link: "https://www.carrefouruae.com" },
      { store: "Amazon", price: 220, link: "https://www.amazon.ae" },
      { store: "Noon", price: 210, link: "https://www.noon.com" }
    ],
    hot: true
  },
  {
    name: "Creatine Monohydrate",
    image: "https://via.placeholder.com/300x200?text=Creatine",
    deals: [
      { store: "Amazon", price: 89, link: "https://www.amazon.ae" },
      { store: "Noon", price: 95, link: "https://www.noon.com" },
      { store: "Carrefour", price: 99, link: "https://www.carrefouruae.com" }
    ],
    hot: false
  }
];

const productGrid = document.getElementById("productGrid");
const hotDealsGrid = document.getElementById("hotDealsGrid");
const searchInput = document.getElementById("searchInput");

function renderProducts(list, container) {
  container.innerHTML = "";

  list.forEach(product => {
    const bestDeal = product.deals.reduce((a, b) =>
      a.price < b.price ? a : b
    );

    const card = document.createElement("div");
    card.className = "card";

    if (product.hot) {
      card.innerHTML += `<div class="badge">HOT</div>`;
    }

    card.innerHTML += `
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      ${product.deals.map(d =>
        `<div class="store ${d === bestDeal ? "best" : ""}">
          ${d.store}: AED ${d.price}
        </div>`
      ).join("")}
      <a class="btn" href="${bestDeal.link}" target="_blank">
        Best Price → ${bestDeal.store}
      </a>
    `;

    container.appendChild(card);
  });
}

renderProducts(products, productGrid);
renderProducts(products.filter(p => p.hot), hotDealsGrid);

searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(q)
  );
  renderProducts(filtered, productGrid);
});
