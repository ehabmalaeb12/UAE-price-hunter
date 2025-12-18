// --- CONFIGURATION ---
const REWARD_CONFIG = {
    pointsPerAED: 1,
    aedPerPoint: 0.0153, // 65 Points = 1 AED
    minRedeemAED: 30
};

const products = [
    {key:"iphone", name:"iPhone 15 Pro", image:"images/iphone.jpg", stores:[
        {n:"Amazon", p:4299, l:"https://www.amazon.ae/dp/example", local:false},
        {n:"Noon", p:4250, l:"https://www.noon.com/uae-en/iphone", local:true},
        {n:"Carrefour", p:4399, l:"https://www.carrefouruae.com/iphone", local:true}
    ]},
    {key:"airfryer", name:"Philips Air Fryer", image:"images/airfryer.jpg", stores:[
        {n:"Amazon", p:399, l:"https://www.amazon.ae/dp/example", local:true},
        {n:"Noon", p:379, l:"https://www.noon.com/uae-en/fryer", local:true},
        {n:"Carrefour", p:420, l:"https://www.carrefouruae.com/fryer", local:true}
    ]},
    {key:"creatine", name:"Optimum Creatine", image:"images/creatine.jpg", stores:[
        {n:"Amazon", p:119, l:"https://www.amazon.ae/dp/example", local:true},
        {n:"Noon", p:115, l:"https://www.noon.com/uae-en/creatine", local:true},
        {n:"Carrefour", p:129, l:"https://www.carrefouruae.com/creatine", local:true}
    ]}
];

let basket = JSON.parse(localStorage.getItem("basket")) || [];
let confirmedPoints = parseInt(localStorage.getItem("confirmedPoints")) || 0;
let pendingPoints = parseInt(localStorage.getItem("pendingPoints")) || 0;

// Initialize UI
document.getElementById("basketCount").textContent = basket.length;
document.getElementById("meterPoints").textContent = confirmedPoints + pendingPoints;

// --- NAVIGATION ---
function showPage(id){
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    document.getElementById("hotDeals").style.display = id ? "none" : "block";
    if(id) document.getElementById(id).style.display = "block";
    document.getElementById("results").innerHTML = "";
    
    // Update Nav Icons
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    if(!id) document.getElementById('navHome').classList.add('active');
}

function showHome(){ showPage(null); }
function showProfile(){ showPage("profilePage"); }

// --- SEARCH ---
function handleSearch(){
    const q = document.getElementById("searchInput").value.toLowerCase();
    const sug = document.getElementById("suggestions");
    const hot = document.getElementById("hotDeals");
    sug.innerHTML = "";
    hot.style.display = q ? "none" : "block";
    if(!q) return;

    products.filter(p => p.name.toLowerCase().includes(q)).forEach(p => {
        const d = document.createElement("div");
        d.className = "sug-item";
        d.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i> ${p.name}`;
        d.onclick = () => { document.getElementById("searchInput").value = p.name; sug.innerHTML = ""; openProduct(p.key); };
        sug.appendChild(d);
    });
}

// --- PRODUCT VIEW ---
function openProduct(key){
    const p = products.find(x => x.key === key);
    const results = document.getElementById("results");
    const minPrice = Math.min(...p.stores.map(s => s.p));
    const today = new Date().toLocaleDateString('en-AE', {day:'numeric', month:'short'});

    let html = `
        <div class="glass-card product-view">
            <div class="product-info">
                <img src="${p.image}">
                <h3>${p.name}</h3>
                <span class="update-tag"><i class="fa-solid fa-clock"></i> Verified Today, ${today}</span>
            </div>
            <div class="store-list">`;

    p.stores.forEach(s => {
        const isBest = s.p === minPrice;
        html += `
            <div class="store-row ${isBest ? 'highlight' : ''}">
                <div class="store-meta">
                    <span class="store-name">${s.n}</span>
                    <span class="store-badge">${s.local ? '🇦🇪 Local Stock' : '🚚 Global'}</span>
                </div>
                <div class="price-action">
                    <span class="price">${s.p} <small>AED</small></span>
                    <div class="actions">
                        <button class="buy-btn" onclick="processReward(${s.p}, '${s.n}', '${s.l}')">Buy</button>
                        <button class="add-btn" onclick="addToBasket('${p.key}', '${s.n}', ${s.p})"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </div>
            </div>`;
    });

    html += `</div></div>`;
    results.innerHTML = html;
}

// --- REWARDS ---
function processReward(price, store, link) {
    const btn = event.target;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;
    setTimeout(() => {
        const points = Math.floor(price * REWARD_CONFIG.pointsPerAED);
        pendingPoints += points;
        localStorage.setItem("pendingPoints", pendingPoints);
        window.open(link, '_blank');
        btn.innerHTML = "Buy";
        updateMeter();
    }, 800);
}

function showRewards(){
    showPage("rewardsPage");
    const val = (confirmedPoints * REWARD_CONFIG.aedPerPoint).toFixed(2);
    document.getElementById("rewardsPage").innerHTML = `
        <div class="page-header"><h2>Rewards Dashboard</h2></div>
        <div class="glass-card reward-main">
            <label>Available to Redeem</label>
            <div class="balance">AED ${val}</div>
            <p>${confirmedPoints} Confirmed Points</p>
        </div>
        <div class="pending-box">
            <span><i class="fa-solid fa-hourglass-half"></i> Pending: ${pendingPoints} pts</span>
            <small>Verified 30 days after purchase</small>
        </div>
        <button class="gold-btn" ${val < 30 ? 'disabled' : ''} onclick="redeem()">
            ${val < 30 ? `Need AED ${(30-val).toFixed(2)} more` : 'Redeem Now'}
        </button>
    `;
    document.getElementById('navGift').classList.add('active');
}

// --- BASKET ---
function addToBasket(key, store, price){
    basket.push({key, store, price});
    localStorage.setItem("basket", JSON.stringify(basket));
    document.getElementById("basketCount").textContent = basket.length;
    alert("Added to list!");
}

function openBasket(){
    showPage("basketPage");
    const container = document.getElementById("basketItems");
    container.innerHTML = "";

    if(basket.length === 0) {
        container.innerHTML = `<div class="empty-state"><p>Your basket is empty</p></div>`;
        return;
    }

    const groups = basket.reduce((acc, item) => {
        acc[item.store] = acc[item.store] || [];
        acc[item.store].push(item);
        return acc;
    }, {});

    for (const [store, items] of Object.entries(groups)) {
        let storeTotal = 0;
        let html = `
            <div class="glass-card basket-group">
                <div class="group-header"><h4><i class="fa-solid fa-store"></i> ${store} Items</h4></div>
                <div class="basket-items-list">`;

        items.forEach((item) => {
            storeTotal += item.price;
            const globalIdx = basket.indexOf(item);
            html += `
                <div class="basket-row">
                    <span>${item.key}</span>
                    <div class="item-right">
                        <strong>${item.price} AED</strong>
                        <button class="remove-btn" onclick="removeItem(${globalIdx})">✕</button>
                    </div>
                </div>`;
        });

        html += `
                </div>
                <div class="group-footer">
                    <div class="total-info"><span>Subtotal:</span> <strong>${storeTotal} AED</strong></div>
                    <p class="delivery-warning">* Delivery fees and VAT to be specified by ${store} at checkout.</p>
                    <button class="store-redirect-btn" onclick="redirectToStore('${store}')">Finish Order on ${store}</button>
                </div>
            </div>`;
        container.innerHTML += html;
    }
}

function redirectToStore(store) {
    let url = store === "Amazon" ? "https://www.amazon.ae" : (store === "Noon" ? "https://www.noon.com" : "https://www.carrefouruae.com");
    window.open(url, "_blank");
}

function removeItem(idx) {
    basket.splice(idx, 1);
    localStorage.setItem("basket", JSON.stringify(basket));
    document.getElementById("basketCount").textContent = basket.length;
    openBasket();
}

function saveProfile(){
    const name = document.getElementById("nameInput").value;
    const phone = document.getElementById("phoneInput").value;
    localStorage.setItem("profile", JSON.stringify({name, phone}));
    alert("Profile Saved!");
}

function updateMeter() {
    document.getElementById("meterPoints").textContent = confirmedPoints + pendingPoints;
}

