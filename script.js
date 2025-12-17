const products = [
  {
    key: "iphone",
    name: "iPhone 15 Pro",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/IPhone_15_Pro.png/300px-IPhone_15_Pro.png",
    stores: [
      { name: "Amazon", price: 4299, link: "https://amazon.ae" },
      { name: "Noon", price: 4250, link: "https://noon.com" },
      { name: "Carrefour", price: 4399, link: "https://carrefouruae.com" }
    ]
  },
  {
    key: "airfryer",
    name: "Air Fryer",
    image: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Air_fryer.jpg",
    stores: [
      { name: "Amazon", price: 399, link: "https://amazon.ae" },
      { name: "Noon", price: 379, link: "https://noon.com" },
      { name: "Carrefour", price: 420, link: "https://carrefouruae.com" }
    ]
  },
  {
    key: "creatine",
    name: "Creatine Monohydrate",
    image: "https://upload.wikimedia.org/wikipedia/commons/5/5b/Creatine.png",
    stores: [
      { name: "Amazon", price: 119, link: "https://amazon.ae" },
      { name: "Noon", price: 115, link: "https://noon.com" },
      { name: "Carrefour", price: 129, link: "https://carrefouruae.com" }
    ]
  }
];

function handleSearch() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const suggestions = document.getElementById("suggestions");
  const results = document.getElementById("results");

  suggestions.innerHTML = "";
  results.innerHTML = "";

  if (!input) {
    suggestions.style.display = "none";
    return;
  }

  const matches = products.filter(p =>
    p.name.toLowerCase().includes(input)
  );

  matches.forEach(p => {
    const div = document.createElement("div");
    div.textContent = p.name;
    div.onclick = () => showProduct(p);
    suggestions.appendChild(div);
  });

  suggestions.style.display = matches.length ? "block" : "none";
}

function showProduct(product) {
  document.getElementById("suggestions").style.display = "none";

  let html = `
    <div class="product-card">
      <h2>${product.name}</h2>
      <img src="${product.image}">
  `;

  product.stores.forEach(store => {
    html += `
      <div class="store-row">
        <span>${store.name}: <strong>${store.price} AED</strong></span>
        <button onclick="window.open('${store.link}', '_blank')">
          Buy
        </button>
      </div>
    `;
  });

  html += `<p style="font-size:12px;color:#666;margin-top:10px">
    Cashback points earned on eligible purchases
  </p></div>`;

  document.getElementById("results").innerHTML = html;
}

function openDeal(key) {
  const product = products.find(p => p.key === key);
  if (product) showProduct(product);
}

function openRewards() {
  document.getElementById("rewardsModal").style.display = "block";
}

function closeRewards() {
  document.getElementById("rewardsModal").style.display = "none";
}
