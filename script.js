const products = [
  {
    name: "iPhone 15 Pro",
    image: "https://via.placeholder.com/300x200?text=iPhone+15+Pro",
    prices: { amazon: 4299, noon: 4250, carrefour: 4399 },
    links: { amazon: "#", noon: "#", carrefour: "#" }
  },
  {
    name: "Samsung Galaxy S23",
    image: "https://via.placeholder.com/300x200?text=Galaxy+S23",
    prices: { amazon: 3099, noon: 3050, carrefour: 3150 },
    links: { amazon: "#", noon: "#", carrefour: "#" }
  },
  {
    name: "AirPods Pro",
    image: "https://via.placeholder.com/300x200?text=AirPods+Pro",
    prices: { amazon: 899, noon: 879, carrefour: 929 },
    links: { amazon: "#", noon: "#", carrefour: "#" }
  },
  {
    name: "Creatine Monohydrate",
    image: "https://via.placeholder.com/300x200?text=Creatine",
    prices: { amazon: 119, noon: 115, carrefour: 129 },
    links: { amazon: "#", noon: "#", carrefour: "#" }
  },
  {
    name: "Whey Protein",
    image: "https://via.placeholder.com/300x200?text=Whey+Protein",
    prices: { amazon: 289, noon: 279, carrefour: 299 },
    links: { amazon: "#", noon: "#", carrefour: "#" }
  },
  {
    name: "Omega 3 Capsules",
    image: "https://via.placeholder.com/300x200?text=Omega+3",
    prices: { amazon: 79, noon: 75, carrefour: 85 },
    links: { amazon: "#", noon: "#", carrefour: "#" }
  },
  {
    name: "Philips Air Fryer",
    image: "https://via.placeholder.com/300x200?text=Air+Fryer",
    prices: { amazon: 499, noon: 479, carrefour: 529 },
    links: { amazon: "#", noon: "#", carrefour: "#" }
  },
  {
    name: "Xiaomi Power Bank",
    image: "https://via.placeholder.com/300x200?text=Power+Bank",
    prices: { amazon: 129, noon: 125, carrefour: 139 },
    links: { amazon: "#", noon: "#", carrefour: "#" }
  },
  {
    name: "Nespresso Capsules",
    image: "https://via.placeholder.com/300x200?text=Nespresso",
    prices: { amazon: 149, noon: 145, carrefour: 155 },
    links: { amazon: "#", noon: "#", carrefour: "#" }
  },
  {
    name: "Extra Virgin Olive Oil",
    image: "https://via.placeholder.com/300x200?text=Olive+Oil",
    prices: { amazon: 39, noon: 37, carrefour: 42 },
    links: { amazon: "#", noon: "#", carrefour: "#" }
  }
];

function renderProducts(list) {
  const container = document.getElementById("products");
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = "<p style='padding:16px;'>Product not found yet — we’re adding more daily.</p>";
    return;
  }

  list.forEach(product => {
    const bestStore = Object.keys(product.prices)
      .reduce((a, b) => product.prices[a] < product.prices[b] ? a : b);

    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img src="${product.image}">
      <h3>${product.name}</h3>
      <p><strong>${product.prices[bestStore]} AED</strong></p>
      <p class="store">Best store: ${bestStore.toUpperCase()}</p>
      <a href="${product.links[bestStore]}" class="buy-btn" target="_blank">
        Go to ${bestStore.toUpperCase()}
      </a>
      <div class="reward-hint">
        Earn reward points on eligible purchases
      </div>
    `;

    container.appendChild(card);
  });
}

function searchProducts() {
  const q = document.getElementById("searchInput").value.toLowerCase();
  const filtered = products.filter(p => p.name.toLowerCase().includes(q));
  renderProducts(filtered);
}

renderProducts(products);
