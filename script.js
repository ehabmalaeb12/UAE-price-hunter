
// --- DATABASE & STATE ---
const comparisonProducts = [
    {key:"iphone", name:"iPhone 15 Pro", stores:[{n:"Amazon", p:4299, l:"#"}, {n:"Noon", p:4250, l:"#"}, {n:"Carrefour", p:4399, l:"#"}]},
    {key:"s24", name:"Samsung S24 Ultra", stores:[{n:"Amazon", p:3850, l:"#"}, {n:"Noon", p:3800, l:"#"}, {n:"Carrefour", p:3999, l:"#"}]},
    {key:"dyson", name:"Dyson V15 Detect", stores:[{n:"Amazon", p:2399, l:"#"}, {n:"Noon", p:2299, l:"#"}, {n:"Carrefour", p:2450, l:"#"}]},
    {key:"sony", name:"Sony XM5 Headphones", stores:[{n:"Amazon", p:1199, l:"#"}, {n:"Noon", p:1250, l:"#"}, {n:"Carrefour", p:1299, l:"#"}]},
    {key:"nespresso", name:"Nespresso Vertuo", stores:[{n:"Amazon", p:650, l:"#"}, {n:"Noon", p:599, l:"#"}, {n:"Carrefour", p:620, l:"#"}]},
    {key:"airfryer", name:"Philips Air Fryer XXL", stores:[{n:"Amazon", p:550, l:"#"}, {n:"Noon", p:519, l:"#"}, {n:"Carrefour", p:580, l:"#"}]},
    {key:"ipad", name:"iPad Air M2", stores:[{n:"Amazon", p:2499, l:"#"}, {n:"Noon", p:2450, l:"#"}, {n:"Carrefour", p:2599, l:"#"}]},
    {key:"macbook", name:"MacBook Air M3", stores:[{n:"Amazon", p:4199, l:"#"}, {n:"Noon", p:4099, l:"#"}, {n:"Carrefour", p:4250, l:"#"}]},
    {key:"sauvage", name:"Dior Sauvage 100ml", stores:[{n:"Amazon", p:399, l:"#"}, {n:"Noon", p:385, l:"#"}, {n:"Carrefour", p:420, l:"#"}]},
    {key:"creed", name:"Creed Aventus", stores:[{n:"Amazon", p:999, l:"#"}, {n:"Noon", p:950, l:"#"}, {n:"Carrefour", p:1100, l:"#"}]},
    {key:"whey", name:"Optimum Whey 5lb", stores:[{n:"Amazon", p:245, l:"#"}, {n:"Noon", p:255, l:"#"}, {n:"Carrefour", p:265, l:"#"}]},
    {key:"watch9", name:"Apple Watch Series 9", stores:[{n:"Amazon", p:1450, l:"#"}, {n:"Noon", p:1400, l:"#"}, {n:"Carrefour", p:1499, l:"#"}]},
    {key:"nutribullet", name:"Nutribullet 1200", stores:[{n:"Amazon", p:349, l:"#"}, {n:"Noon", p:329, l:"#"}, {n:"Carrefour", p:380, l:"#"}]},
    {key:"kindle", name:"Kindle Paperwhite", stores:[{n:"Amazon", p:499, l:"#"}, {n:"Noon", p:520, l:"#"}, {n:"Carrefour", p:550, l:"#"}]},
    {key:"stanley", name:"Stanley Quencher", stores:[{n:"Amazon", p:175, l:"#"}, {n:"Noon", p:185, l:"#"}, {n:"Carrefour", p:199, l:"#"}]}
];

const megaDeals = [
    {key:"buds", name:"Wireless Buds Pro", original: 899, p: 179, disc: 80, store: "Noon"},
    {key:"cable", name:"Fast Charge Pack", original: 150, p: 29, disc: 81, store: "Amazon"},
    {key:"watch6", name:"Galaxy Watch 6", original: 1299, p: 389, disc: 70, store: "Amazon"},
    {key:"oud", name:"Oud Intense 100ml", original: 450, p: 135, disc: 70, store: "Noon"},
    {key:"coffee-sale", name:"Vertuo Pop", original: 1499, p: 599, disc: 60, store: "Carrefour"},
    {key:"mat", name:"Manduka PRO Mat", original: 550, p: 275, disc: 50, store: "Noon"},
    {key:"anker", name:"Anker 20k Power", original: 299, p: 149, disc: 50, store: "Amazon"}
];

let basket = JSON.parse(localStorage.getItem("basket")) || [];
let userProfile = JSON.parse(localStorage.getItem("userProfile")) || { name: "Habibi", phone: "" };

// --- NAVIGATION ---
function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById('mainContent').style.display = 'none';
    
    if(!id || id === 'home') {
        document.getElementById('mainContent').style.display = 'block';
        filterMegaDeals();
    } else {
        document.getElementById(id).style.display = 'block';
        if(id === 'profilePage') renderProfile();
    }

    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    if(id === 'home' || !id) document.getElementById('navHome').classList.add('active');
    else if(id === 'rewardsPage') document.getElementById('navGift').classList.add('active');
    else if(id === 'profilePage') document.getElementById('navUser').classList.add('active');
}

// --- PROFILE LOGIC ---
function renderProfile() {
    const page = document.getElementById('profilePage');
    page.innerHTML = `
        <div class="page-header"><h2>My Profile</h2></div>
        <div class="profile-card glass-card">
            <div class="user-avatar"><i class="fa-solid fa-user-ninja"></i></div>
            <h3 id="displayName">${userProfile.name}</h3>
            <p id="displayPhone">${userProfile.phone || 'No phone added'}</p>
        </div>
        <div class="glass-card settings-list">
            <div class="setting-item">
                <label>Update Name</label>
                <input type="text" id="nameInput" value="${userProfile.name}">
            </div>
            <div class="setting-item">
                <label>Mobile Number</label>
                <input type="tel" id="phoneInput" value="${userProfile.phone}" placeholder="05x-xxx-xxxx">
            </div>
            <button class="gold-btn" onclick="saveProfile()">Save Profile Details</button>
        </div>
        <div class="glass-card stats-grid">
            <div class="stat-box"><strong>12</strong><p>Searches</p></div>
            <div class="stat-box"><strong>0</strong><p>Orders</p></div>
        </div>
    `;
}

function saveProfile() {
    userProfile.name = document.getElementById('nameInput').value;
    userProfile.phone = document.getElementById('phoneInput').value;
    localStorage.setItem("userProfile", JSON.stringify(userProfile));
    alert("Profile Updated!");
    renderProfile();
}

// --- CORE FUNCTIONALITY ---
function handleSearch() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const suggestions = document.getElementById("suggestions");
    if (query.length < 2) { suggestions.style.display = "none"; return; }
    const matches = comparisonProducts.filter(p => p.name.toLowerCase().includes(query));
    suggestions.innerHTML = matches.map(p => `<div onclick="openProduct('${p.key}', false)">${p.name}</div>`).join('');
    suggestions.style.display = matches.length ? "block" : "none";
}

function filterMegaDeals() {
    const min = document.getElementById("discountFilter").value;
    const grid = document.getElementById("megaDealsGrid");
    grid.innerHTML = "";
    megaDeals.filter(d => d.disc >= min).forEach(d => {
        grid.innerHTML += `<div class="deal-card mega-border" onclick="openProduct('${d.key}', true)">
            <div class="smart-tag">${d.disc}% OFF</div>
            <img src="images/${d.key}.jpg" onerror="this.src='https://placehold.co/100x100?text=${d.store}'">
            <p>${d.name}</p>
            <span class="old-price">AED ${d.original}</span><span class="new-price">AED ${d.p}</span>
        </div>`;
    });
}

function openProduct(key, isMega) {
    const p = isMega ? megaDeals.find(x => x.key === key) : comparisonProducts.find(x => x.key === key);
    const page = document.getElementById("productPage");
    document.getElementById("suggestions").style.display = "none";
    document.getElementById("searchInput").value = "";
    
    let html = `<div class="glass-card"><button onclick="showHome()" class="back-link">← Back</button><h3 style="margin-top:15px">${p.name}</h3>`;
    const stores = isMega ? [{n: p.store, p: p.p, l: "#"}] : p.stores;
    
    stores.forEach(s => {
        html += `<div class="store-row"><span>${s.n}</span><strong>${s.p} AED</strong>
            <div class="action-btns">
                <button class="buy-btn" onclick="window.open('${s.l}')">Buy Now</button>
                <button class="add-btn" onclick="addToBasket('${p.name}','${s.n}',${s.p})">+</button>
            </div></div>`;
    });
    page.innerHTML = html + `</div>`;
    showPage("productPage");
}

function addToBasket(name, store, price) {
    basket.push({name, store, price});
    localStorage.setItem("basket", JSON.stringify(basket));
    document.getElementById("basketCount").textContent = basket.length;
    alert("Added to Basket!");
}

function openBasket() {
    const container = document.getElementById("basketItems");
    container.innerHTML = "";
    if(basket.length === 0) { container.innerHTML = "<p style='padding:20px; text-align:center'>Basket is empty</p>"; }
    const groups = basket.reduce((acc, i) => { acc[i.store] = acc[i.store] || []; acc[i.store].push(i); return acc; }, {});
    for (const [s, items] of Object.entries(groups)) {
        let total = items.reduce((sum, i) => sum + i.price, 0);
        container.innerHTML += `<div class="glass-card"><h4>${s} Store</h4>
            ${items.map(i => `<p>${i.name}: ${i.price} AED</p>`).join('')}
            <button class="gold-btn" style="margin-top:10px" onclick="window.open('#')">Checkout on ${s} (AED ${total})</button></div>`;
    }
    showPage("basketPage");
}

function showHome() { showPage('home'); }
function showRewards() { 
    const page = document.getElementById('rewardsPage');
    page.innerHTML = `<div class="page-header"><h2>My Rewards</h2></div><div class="glass-card" style="text-align:center"><h4>0 Points</h4><p>Shop at Amazon or Noon to earn!</p></div>`;
    showPage('rewardsPage'); 
}
function showProfile() { showPage('profilePage'); }

// Init
window.onload = () => {
    filterMegaDeals();
    const grid = document.getElementById("trendingGrid");
    comparisonProducts.slice(0,6).forEach(p => {
        grid.innerHTML += `<div class="deal-card" onclick="openProduct('${p.key}', false)">
            <img src="images/${p.key}.jpg" onerror="this.src='https://placehold.co/100x100?text=Compare'">
            <p>${p.name}</p><span>${p.stores[0].p} AED</span>
        </div>`;
    });
};

// --- AUTO UPDATE SERVICE WORKER ---
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(reg => {
        reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    window.location.reload();
                }
            };
        };
    });
}
