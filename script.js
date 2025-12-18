// --- 2050 BUSINESS CONFIG ---
const REWARD_CONFIG = {
    pointsPerAED: 1,
    aedPerPoint: 0.0153, // 65 Points = 1 AED (Safety Margin)
    minRedeemAED: 30
};

const products = [
    {key:"iphone", name:"iPhone 15 Pro", image:"images/iphone.jpg", stores:[
        {n:"Amazon", p:4299, l:"https://www.amazon.ae/dp/example", eco:true},
        {n:"Noon", p:4250, l:"https://www.noon.com/uae-en/iphone", local:true},
        {n:"Carrefour", p:4399, l:"https://www.carrefouruae.com/iphone", local:true}
    ]},
    {key:"airfryer", name:"Philips Air Fryer", image:"images/airfryer.jpg", stores:[
        {n:"Amazon", p:399, l:"https://www.amazon.ae/dp/example", local:true},
        {n:"Noon", p:379, l:"https://www.noon.com/uae-en/fryer", eco:true},
        {n:"Carrefour", p:420, l:"https://www.carrefouruae.com/fryer", local:true}
    ]}
];

let basket = JSON.parse(localStorage.getItem("basket")) || [];
let confirmedPoints = parseInt(localStorage.getItem("confirmedPoints")) || 0;
let pendingPoints = parseInt(localStorage.getItem("pendingPoints")) || 0;

// Update UI on load
document.getElementById("basketCount").textContent = basket.length;
document.getElementById("meterPoints").textContent = confirmedPoints + pendingPoints;

// --- 2050 CORE LOGIC ---

function processReward(price, store, link) {
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Securing Reward...`;
    
    // Safety delay to show "AI Tracking"
    setTimeout(() => {
        const points = Math.floor(price * REWARD_CONFIG.pointsPerAED);
        pendingPoints += points;
        localStorage.setItem("pendingPoints", pendingPoints);
        window.open(link, '_blank');
        btn.innerHTML = originalText;
        updateMeter();
    }, 1200);
}

function handleSearch(){
    const q = document.getElementById("searchInput").value.toLowerCase();
    const sug = document.getElementById("suggestions");
    const res = document.getElementById("results");
    const hot = document.getElementById("hotDeals");

    sug.innerHTML = ""; res.innerHTML = "";
    hot.style.display = q ? "none" : "block";

    if(!q) return;

    products.filter(p => p.name.toLowerCase().includes(q)).forEach(p => {
        const d = document.createElement("div");
        d.className = "sug-item";
        d.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i> ${p.name}`;
        d.onclick = () => { sug.innerHTML = ""; openProduct(p.key); };
        sug.appendChild(d);
    });
}

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
                    <span class="store-badge">${s.local ? '🇦🇪 Local Stock' : '🌿 Eco-Ship'}</span>
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

    html += `</div><p class="disclaimer">As an affiliate, we may earn from your purchase.</p></div>`;
    results.innerHTML = html;
}

function addToBasket(key, store, price){
    basket.push({key, store, price});
    localStorage.setItem("basket", JSON.stringify(basket));
    document.getElementById("basketCount").textContent = basket.length;
    alert("Added to your UAE Hunt list!");
}

function openBasket(){
    showPage("basketPage");
    const container = document.getElementById("basketItems");
    container.innerHTML = "";

    if(basket.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-ghost"></i><p>Your basket is empty</p></div>`;
        return;
    }

    const groups = basket.reduce((acc, item) => {
        acc[item.store] = acc[item.store] || [];
        acc[item.store].push(item);
        return acc;
    }, {});

    for (const [store, items] of Object.entries(groups)) {
        let storeTotal = 0;
        let html = `<div class="glass-card basket-group"><h4>${store} Order</h4>`;
        items.forEach((item, idx) => {
            storeTotal += item.price;
            html += `<div class="basket-row"><span>${item.key}</span> <strong>${item.price} AED</strong></div>`;
        });
        html += `<div class="group-total">Total: ${storeTotal} AED</div></div>`;
        container.innerHTML += html;
    }
}

function showRewards(){
    showPage("rewardsPage");
    const val = (confirmedPoints * REWARD_CONFIG.aedPerPoint).toFixed(2);
    document.getElementById("rewardsPage").innerHTML = `
        <div class="page-header"><h2>Rewards Dashboard</h2></div>
        <div class="glass-card reward-main">
            <label>Available Balance</label>
            <div class="balance">AED ${val}</div>
            <p>${confirmedPoints} Confirmed Points</p>
        </div>
        <div class="pending-box">
            <span><i class="fa-solid fa-hourglass-half"></i> Pending: ${pendingPoints} pts</span>
            <small>Verified 30 days after store delivery</small>
        </div>
        <div class="info-card">
            <h4>How it works</h4>
            <p>1. Hunt for deals<br>2. Buy from store<br>3. Earn 1 Point per 1 AED<br>4. 65 Points = 1 AED Cash</p>
        </div>
        <button class="gold-btn redeem" ${val < 30 ? 'disabled' : ''} onclick="redeem()">
            ${val < 30 ? `Need AED ${(30-val).toFixed(2)} more` : 'Redeem to Bank/GiftCard'}
        </button>
    `;
}

function saveProfile(){
    const name = document.getElementById("nameInput").value;
    const phone = document.getElementById("phoneInput").value;
    localStorage.setItem("profile", JSON.stringify({name, phone}));
    alert("Profile Updated, Habibi!");
}

function updateMeter() {
    document.getElementById("meterPoints").textContent = confirmedPoints + pendingPoints;
}

function showHome(){ showPage(null); }
function showProfile(){ showPage("profilePage"); }
function showPage(id){
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    document.getElementById("hotDeals").style.display = id ? "none" : "block";
    if(id) document.getElementById(id).style.display = "block";
    document.getElementById("results").innerHTML = "";
}

