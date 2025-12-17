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

function showSuggestions() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const box = document.getElementById("suggestions");
  box.innerHTML = "";

  if (!input) {
    box.style.display = "none";
    return;
  }

  const matches = products.filter(p => p.name.toLowerCase().includes(input));

  matches.forEach(p => {
    const div = document.createElement("div");
    div.textContent = p.name;
    div.onclick = () => showProduct(p);
    box.appendChild(div);
  });

  box.style.display = matches.length ? "block" : "none";
}

function showProduct(product) {
  document.getElementById("suggestions").style.display = "none";

  let html = `
    <div class="product">
      <h2>${product.name}</h2>
      <img src="${product.image}" width="100%">
  `;

  product.stores.forEach(s => {
    html += `
      <div class="store-row">
        <span>${s.name}: <strong>${s.price} AED</strong></span>
        <button onclick="window.open('${s.link}', '_blank')">
          Go to store
        </button>
      </div>
    `;
  });

  html += `<p style="font-size:12px;color:#666;">Earn reward points on eligible purchases</p></div>`;

  document.getElementById("result").innerHTML = html;
}

function openDeal(key) {
  const product = products.find(p => p.key === key);
  if (product) showProduct(product);
}
