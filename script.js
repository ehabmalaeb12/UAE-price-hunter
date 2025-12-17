/* =========================
   GLOBAL STATE
========================= */

let currentPage = "home";

let basket = JSON.parse(localStorage.getItem("basket")) || [];

let userProfile = JSON.parse(localStorage.getItem("profile")) || {
  name: "",
  email: "",
  phone: ""
};

/* =========================
   PAGE NAVIGATION (SAFE)
========================= */

function showPage(pageId) {
  const pages = ["homePage", "rewardsPage", "profilePage", "basketPage"];

  pages.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });

  const activePage = document.getElementById(pageId);
  if (activePage) activePage.style.display = "block";

  currentPage = pageId;
}

/* =========================
   BASKET LOGIC
========================= */

function addToBasket(product, store) {
  basket.push({
    id: Date.now(),
    name: product.name,
    price: product.prices[store],
    store: store,
    image: product.image
  });

  localStorage.setItem("basket", JSON.stringify(basket));

  // happy feedback
  alert("Added to basket 🥰");
}

function removeFromBasket(id) {
  basket = basket.filter(item => item.id !== id);
  localStorage.setItem("basket", JSON.stringify(basket));
  renderBasket();
}

function renderBasket() {
  const basketContainer = document.getElementById("basketItems");
  if (!basketContainer) return;

  basketContainer.innerHTML = "";

  if (basket.length === 0) {
    basketContainer.innerHTML = "<p>Your basket is empty</p>";
    return;
  }

  const grouped = {};

  basket.forEach(item => {
    if (!grouped[item.store]) grouped[item.store] = [];
    grouped[item.store].push(item);
  });

  let grandTotal = 0;

  for (const store in grouped) {
    let storeTotal = 0;

    const storeDiv = document.createElement("div");
    storeDiv.className = "basket-store";

    storeDiv.innerHTML = `<h3>${store}</h3>`;

    grouped[store].forEach(item => {
      storeTotal += item.price;
      grandTotal += item.price;

      storeDiv.innerHTML += `
        <div class="basket-item">
          <img src="${item.image}" />
          <span>${item.name}</span>
          <span>${item.price} AED</span>
          <button onclick="removeFromBasket(${item.id})">❌</button>
        </div>
      `;
    });

    storeDiv.innerHTML += `<strong>Subtotal: ${storeTotal} AED</strong>`;
    basketContainer.appendChild(storeDiv);
  }

  const totalDiv = document.createElement("div");
  totalDiv.className = "basket-total";
  totalDiv.innerHTML = `<h2>Total: ${grandTotal} AED</h2>`;

  basketContainer.appendChild(totalDiv);
}

/* =========================
   PROFILE SAVE (PERSISTENT)
========================= */

function saveProfile() {
  userProfile.name = document.getElementById("profileName").value;
  userProfile.email = document.getElementById("profileEmail").value;
  userProfile.phone = document.getElementById("profilePhone").value;

  localStorage.setItem("profile", JSON.stringify(userProfile));

  alert("Profile saved ✅");
}

function loadProfile() {
  if (!userProfile) return;

  document.getElementById("profileName").value = userProfile.name || "";
  document.getElementById("profileEmail").value = userProfile.email || "";
  document.getElementById("profilePhone").value = userProfile.phone || "";
}

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  showPage("homePage");
  renderBasket();
  loadProfile();
});
