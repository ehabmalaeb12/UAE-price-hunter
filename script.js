const products = [
  {
    name: "iPhone 14",
    image: "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_SL1500_.jpg",
    deals: [
      { store: "Noon", price: 3200, link: "https://www.noon.com" },
      { store: "Amazon", price: 3150, link: "https://www.amazon.ae" },
      { store: "Carrefour", price: 3300, link: "https://www.carrefouruae.com" }
    ],
    hot: true
  },
  {
    name: "Sony Headphones",
    image: "https://m.media-amazon.com/images/I/71o8Q5XJS5L._AC_SL1500_.jpg",
    deals: [
      { store: "Carrefour", price: 200, link: "https://www.carrefouruae.com" },
      { store: "Amazon", price: 220, link: "https://www.amazon.ae" },
      { store: "Noon", price: 210, link: "https://www.noon.com" }
    ],
    hot: true
  },
  {
    name: "Creatine Monohydrate",
    image: "https://m.media-amazon.com/images/I/71Zf9uUp+GL._AC_SL1500_.jpg",
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
      const badge = document.createElement("div");
      badge.className = "badge";
      badge.textContent = "HOT";
      card.appendChild(badge);
    }

    card.innerHTML += `
      <img src="${product.image}" />
      <h3>${product.name}</h3>
      ${product.deals
        .map(
          d =>
            `<div class="store ${d === bestDeal ? "best" : ""}">
              ${d.store}: AED ${d.price}
            </div>`
        )
        .join("")}
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
