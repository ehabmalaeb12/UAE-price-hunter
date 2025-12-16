const products = [
  {
    name: "Sony Headphones",
    store: "Carrefour",
    price: 200,
    discount: 70,
    image: "https://images.unsplash.com/photo-1585386959984-a41552231693"
  },
  {
    name: "iPhone 14",
    store: "Noon",
    price: 3200,
    discount: 50,
    image: "https://images.unsplash.com/photo-1664478546384-d57ffe04e31c"
  },
  {
    name: "Samsung Galaxy S23",
    store: "Amazon",
    price: 2800,
    discount: 60,
    image: "https://images.unsplash.com/photo-1675270714620-3c1cb99c8590"
  }
];

const productContainer = document.getElementById("products");
const searchInput = document.getElementById("search");

function renderProducts(list) {
  productContainer.innerHTML = "";

  list.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <div class="discount-badge">-${product.discount}%</div>
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p class="store">${product.store}</p>
      <p class="price">AED ${product.price}</p>
    `;

    productContainer.appendChild(card);
  });
}

renderProducts(products);

searchInput.addEventListener("input", e => {
  const value = e.target.value.toLowerCase();
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(value)
  );
  renderProducts(filtered);
});
