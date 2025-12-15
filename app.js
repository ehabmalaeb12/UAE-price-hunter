// Sample data (replace with your Google Sheet JSON later)
const products = [
  {id:1, name:"Laptop", store:"Amazon", price:3500, discount:20, url:"#", img:"https://via.placeholder.com/150"},
  {id:2, name:"Phone", store:"Noon", price:1200, discount:50, url:"#", img:"https://via.placeholder.com/150"},
  {id:3, name:"Headphones", store:"Carrefour", price:200, discount:70, url:"#", img:"https://via.placeholder.com/150"},
];

// Rewards
let availableAED = 0;
let pendingAED = 0;

// Populate Big Deals
const bigDealsList = document.getElementById("big-deals-list");
products.filter(p => p.discount >= 50).forEach(p => {
  const div = document.createElement("div");
  div.className = "product-card";
  div.innerHTML = `<img src="${p.img}" alt="${p.name}"><h3>${p.name}</h3><p>${p.store}</p><p>Price: AED ${p.price}</p><p>Discount: ${p.discount}%</p>`;
  div.addEventListener("click", () => {
    pendingAED += 10; // Example reward per click
    document.getElementById("pending-aed").textContent = pendingAED;
    window.open(p.url, "_blank");
  });
  bigDealsList.appendChild(div);
});

// Search functionality
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");

searchInput.addEventListener("input", () => {
  searchResults.innerHTML = "";
  const query = searchInput.value.toLowerCase();
  products.filter(p => p.name.toLowerCase().includes(query))
          .sort((a,b)=>a.price-b.price)
          .forEach(p => {
            const div = document.createElement("div");
            div.className = "product-card";
            div.innerHTML = `<img src="${p.img}" alt="${p.name}"><h3>${p.name}</h3><p>${p.store}</p><p>Price: AED ${p.price}</p><p>Discount: ${p.discount}%</p>`;
            div.addEventListener("click", () => {
              pendingAED += 10;
              document.getElementById("pending-aed").textContent = pendingAED;
              window.open(p.url,"_blank");
            });
            searchResults.appendChild(div);
          });
});
