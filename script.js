// --- BUSINESS CONFIGURATION ---
const AFFILIATE_IDS = {
  amazon: "tracking-21",
  noon: "ref_123",
  carrefour: "c4_aff"
};

// --- DATA ---
const products = [
  {key:"iphone",name:"iPhone 15 Pro",image:"images/iphone.jpg",stores:[
    {n:"Amazon",p:4299,l:"https://www.amazon.ae/dp/example"},
    {n:"Noon",p:4250,l:"https://www.noon.com/uae-en/iphone"},
    {n:"Carrefour",p:4399,l:"https://www.carrefouruae.com/iphone"}
  ]},
  {key:"airfryer",name:"Philips Air Fryer",image:"images/airfryer.jpg",stores:[
    {n:"Amazon",p:399,l:"https://www.amazon.ae/dp/example"},
    {n:"Noon",p:379,l:"https://www.noon.com/uae-en/fryer"},
    {n:"Carrefour",p:420,l:"https://www.carrefouruae.com/fryer"}
  ]},
  {key:"creatine",name:"Creatine",image:"images/creatine.jpg",stores:[
    {n:"Amazon",p:119,l:"https://www.amazon.ae/dp/example"},
    {n:"Noon",p:115,l:"https://www.noon.com/uae-en/creatine"},
    {n:"Carrefour",p:129,l:"https://www.carrefouruae.com/creatine"}
  ]},
  {key:"tv",name:"Samsung Smart TV",image:"images/tv.jpg"},
  {key:"ps5",name:"PlayStation 5",image:"images/ps5.jpg"},
  {key:"ipad",name:"iPad Pro",image:"images/ipad.jpg"},
  {key:"watch",name:"Apple Watch",image:"images/watch.jpg"},
  {key:"laptop",name:"Gaming Laptop",image:"images/laptop.jpg"},
  {key:"headphones",name:"Sony Headphones",image:"images/headphones.jpg"},
  {key:"coffee",name:"Coffee Machine",image:"images/coffee.jpg"}
];

// --- APP STATE ---
let basket = JSON.parse(localStorage.getItem("basket")) || [];

// --- SELECTORS ---
const basketCount = document.getElementById("basketCount");
const searchInput = document.getElementById("searchInput");
const suggestions = document.getElementById("suggestions");
const results = document.getElementById("results");
const hotDeals = document.getElementById("hotDeals");
const basketItems = document.getElementById("basketItems");
const nameInput = document.getElementById("nameInput");
const emailInput = document.getElementById("emailInput");
const phoneInput = document.getElementById("phoneInput");
const profileSaved = document.getElementById("profileSaved");

// Initialize
if(basketCount) basketCount.textContent = basket.length;

// --- LINK GENERATOR ---
function getAffiliateLink(store, url) {
  if (store === "Amazon") return `${url}?tag=${AFFILIATE_IDS.amazon}`;
  if (store === "Noon") return `${url}?ref=${AFFILIATE_IDS.noon}`;
  return url;
}

// --- CORE FUNCTIONS ---
function handleSearch(){
  const q = searchInput.value.toLowerCase();
  suggestions.innerHTML = "";
  results.innerHTML = "";
  hotDeals.style.display = q ? "none" : "block";

  if(!q) return;

  products.filter(p=>p.name.toLowerCase().includes(q)).forEach(p=>{
    const d=document.createElement("div");
    d.textContent=p.name;
    d.onclick=()=>{ suggestions.innerHTML=""; openProduct(p.key); };
    suggestions.appendChild(d);
  });
}

function openProduct(key){
  const p = products.find(x=>x.key===key);
  if(!p.stores){
    results.innerHTML=`<div class="product-card"><img src="${p.image}"><h3>${p.name}</h3><p>Comparison coming soon</p></div>`;
    return;
  }

  const min = Math.min(...p.stores.map(s=>s.p));
  let html=`<div class="product-card"><img src="${p.image}"><h3>${p.name}</h3>`;

  p.stores.forEach(s=>{
    const finalLink = getAffiliateLink(s.n, s.l);
    html+=`
    <div class="store ${s.p===min?'best':''}">
      <span>${s.n}: ${s.p} AED ${s.p===min?'🏆':''}</span>
      <div>
        <button onclick="window.open('${finalLink}')">Buy</button>
        <button onclick="addToBasket('${p.key}','${s.n}',${s.p})">Add</button>
      </div>
    </div>`;
  });

  html+=`</div>`;
  results.innerHTML=html;
}

function addToBasket(key,store,price){
  basket.push({key,store,price});
  localStorage.setItem("basket",JSON.stringify(basket));
  basketCount.textContent=basket.length;
  // Visual Feedback
  const btn = event.target;
  const oldText = btn.textContent;
  btn.textContent = "✔";
  setTimeout(()=>btn.textContent=oldText, 1000);
}

// --- NEW BASKET LOGIC (GROUPING & TOTALS) ---
function openBasket(){
  showPage("basketPage");
  basketItems.innerHTML="";

  if(basket.length === 0) {
    basketItems.innerHTML = "<p style='text-align:center'>Your basket is empty.</p>";
    return;
  }

  // 1. Group items by Store
  const groups = basket.reduce((acc, item) => {
    if(!acc[item.store]) acc[item.store] = [];
    acc[item.store].push(item);
    return acc;
  }, {});

  let grandTotal = 0;

  // 2. Build HTML for each store group
  for (const [storeName, items] of Object.entries(groups)) {
    let storeTotal = 0;
    
    // Store Header
    let groupHtml = `<div class="basket-group"><h3>🛒 ${storeName} Order</h3>`;

    // Items in this store
    items.forEach((item, index) => {
      storeTotal += item.price;
      // We need to find the global index to delete correctly
      const globalIndex = basket.indexOf(item); 
      
      groupHtml += `
        <div class="basket-item">
          <span>${item.key}</span>
          <span>${item.price} AED</span>
          <button class="del-btn" onclick="removeItem(${globalIndex})">✕</button>
        </div>`;
    });

    // Store Total
    groupHtml += `<div class="store-total">Subtotal: <strong>${storeTotal} AED</strong></div></div>`;
    
    basketItems.innerHTML += groupHtml;
    grandTotal += storeTotal;
  }

  // 3. Grand Total at the bottom
  basketItems.innerHTML += `
    <div class="grand-total">
      <span>Total to Pay:</span>
      <span>${grandTotal} AED</span>
    </div>
    <button class="checkout-btn" onclick="alert('Checkout logic coming soon!')">Proceed to Checkout</button>
  `;
}

function removeItem(i){
  basket.splice(i,1);
  localStorage.setItem("basket",JSON.stringify(basket));
  openBasket(); // Refresh the basket view
  basketCount.textContent=basket.length;
}

function saveProfile(){
  localStorage.setItem("profile",JSON.stringify({
    name:nameInput.value,
    email:emailInput.value,
    phone:phoneInput.value
  }));
  profileSaved.textContent="Saved ✅";
}

// --- NAVIGATION ---
function showHome(){ showPage(null); }
function showRewards(){ showPage("rewardsPage"); }
function showProfile(){ showPage("profilePage"); }

function showPage(id){
  // Hide everything
  document.querySelectorAll(".page").forEach(p=>p.style.display="none");
  hotDeals.style.display="none";
  results.innerHTML=""; // Clear search results when switching pages
  
  // Logic to show specific page
  if(id) {
    document.getElementById(id).style.display="block";
  } else {
    // If Home, show Hot Deals
    hotDeals.style.display="block";
  }
}

