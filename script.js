/* ======================
   GLOBAL DATA
====================== */

let basket = JSON.parse(localStorage.getItem("basket")) || [];

let profile = JSON.parse(localStorage.getItem("profile")) || {
  name: "",
  email: "",
  phone: ""
};

/* ======================
   PAGE CONTROL
====================== */

function showPage(page) {
  const pages = ["homePage", "rewardsPage", "profilePage", "basketPage"];
  pages.forEach(p => {
    const el = document.getElementById(p);
    if (el) el.style.display = "none";
  });

  const active = document.getElementById(page);
  if (active) active.style.display = "block";
}

/* ======================
   BASKET LOGIC
====================== */

function addToBasket(product, store) {
  basket.push({
    id: Date.now(),
    name: product.name,
    price: product.prices[store],
    store: store,
    image: product.image
  });

  localStorage.setItem("basket", JSON.stringify(basket));
  alert("Added to basket 🥰");
}

function removeFromBasket(id) {
  basket = basket.filter(item => item.id !== id);
  localStorage.setItem("basket", JSON.stringify(basket));
  renderBasket();
}

function renderBasket() {
  const container = document.getElementById("basketItems");
  if (!container) return;

  container.innerHTML = "";

  if (basket.length === 0) {
    container.innerHTML = "<p>Your basket is empty</p>";
    return;
  }

  const grouped = {};
  basket.forEach(item => {
    if (!grouped[item.store]) grouped[item.store] = [];
    grouped[item.store].push(item);
  });

  let grandTotal = 0;

  Object.keys(grouped).forEach(store => {
    let storeTotal = 0;

    const storeDiv = document.createElement("div");
    storeDiv.className = "basket-store";
    storeDiv.innerHTML = `<h3>${store}</h3>`;

    grouped[store].forEach(item => {
      storeTotal += item.price;
      grandTotal += item.price;

      storeDiv.innerHTML += `
        <div class="basket-item">
          <img src="${item.image}">
          <span>${item.name}</span>
          <span>${item.price} AED</span>
          <button onclick="removeFromBasket(${item.id})">❌</button>
        </div>
      `;
    });

    storeDiv.innerHTML += `<strong>Subtotal: ${storeTotal} AED</strong>`;
    container.appendChild(storeDiv);
  });

  container.innerHTML += `<h2>Total: ${grandTotal} AED</h2>`;
}

/* ======================
   PROFILE
====================== */

function saveProfile() {
  profile.name = document.getElementById("profileName").value;
  profile.email = document.getElementById("profileEmail").value;
  profile.phone = document.getElementById("profilePhone").value;

  localStorage.setItem("profile", JSON.stringify(profile));
  alert("Profile saved ✅");
}

function loadProfile() {
  if (!profile) return;

  document.getElementById("profileName").value = profile.name;
  document.getElementById("profileEmail").value = profile.email;
  document.getElementById("profilePhone").value = profile.phone;
}

/* ======================
   INIT
====================== */

document.addEventListener("DOMContentLoaded", () => {
  showPage("homePage");
  renderBasket();
  loadProfile();
});
