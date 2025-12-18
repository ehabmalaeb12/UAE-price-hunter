// --- 1. CONFIGURATION & LEGAL ---
let currentLang = 'en';
const legalContent = {
    privacy: `<h4>Privacy Policy</h4><p>We do not store financial data. Basket and points are saved locally.</p>`,
    terms: `<h4>Terms of Service</h4><p>Prices are updated daily. We are an affiliate partner.</p>`
};

const translations = {
    en: { megaDeals: "💎 Mega Deals", megaSub: "Live price drops from Amazon, Noon & Carrefour", welcomeTitle: "Marhaba! 🇦🇪", welcomeSub: "Your AI Price Assistant is ready.", points: "Points", trending: "🔥 Trending Comparisons", basketTitle: "My Basket", rewardsTitle: "My Rewards", pointsBalance: "Pending Points", howItWorks: "How to Earn:", step1: "Shop at Amazon, Noon, or Carrefour.", step2: "Earn 1 Point for every 1 AED.", step3: "Redeem 1000 Points for 10 AED.", buyBtn: "Buy Now", addBtn: "Add +" },
    ar: { megaDeals: "💎 صفقات كبرى", megaSub: "تخفيضات مباشرة من أمازون، نون وكارفور", welcomeTitle: "مرحباً! 🇦🇪", welcomeSub: "مساعد التسوق الذكي جاهز.", points: "نقاط", trending: "🔥 الأكثر طلباً", basketTitle: "سلة التسوق", rewardsTitle: "مكافآتي", pointsBalance: "النقاط المعلقة", howItWorks: "كيف تكسب النقاط:", step1: "تسوق من أمازون، نون أو كارفور.", step2: "اكسب نقطة واحدة لكل 1 درهم.", step3: "استبدل 1000 نقطة بقسيمة 10 دراهم.", buyBtn: "شراء الآن", addBtn: "أضف +" }
};

// --- 2. DATA ---
const comparisonProducts = [
    {key:"iphone", name:"iPhone 15 Pro", stores:[{n:"Amazon", p:4299, l:"https://www.amazon.ae"}, {n:"Noon", p:4250, l:"https://www.noon.com"}, {n:"Carrefour", p:4399, l:"https://www.carrefouruae.com"}]},
    {key:"s24", name:"Samsung S24 Ultra", stores:[{n:"Amazon", p:3850, l:"https://www.amazon.ae"}, {n:"Noon", p:3800, l:"https://www.noon.com"}, {n:"Carrefour", p:3999, l:"https://www.carrefouruae.com"}]},
    {key:"dyson", name:"Dyson V15 Detect", stores:[{n:"Amazon", p:2399, l:"https://www.amazon.ae"}, {n:"Noon", p:2299, l:"https://www.noon.com"}, {n:"Carrefour", p:2450, l:"https://www.carrefouruae.com"}]},
    {key:"sony", name:"Sony XM5 Headphones", stores:[{n:"Amazon", p:1199, l:"https://www.amazon.ae"}, {n:"Noon", p:1250, l:"https://www.noon.com"}, {n:"Carrefour", p:1299, l:"https://www.carrefouruae.com"}]},
    {key:"sauvage", name:"Dior Sauvage 100ml", stores:[{n:"Amazon", p:399, l:"https://www.amazon.ae"}, {n:"Noon", p:385, l:"https://www.noon.com"}, {n:"Carrefour", p:420, l:"https://www.carrefouruae.com"}]}
];

const megaDeals = [
    {key:"buds", name:"Wireless Buds Pro", original: 899, p: 179, disc: 80, store: "Noon", l:"https://www.noon.com"},
    {key:"cable", name:"Fast Charge Pack", original: 150, p: 29, disc: 81, store: "Amazon", l:"https://www.amazon.ae"},
    {key:"watch6", name:"Galaxy Watch 6", original: 1299, p: 389, disc: 70, store: "Amazon", l:"https://www.amazon.ae"}
];

let basket = JSON.parse(localStorage.getItem("basket")) || [];
let userProfile = JSON.parse(localStorage.getItem("userProfile")) || { name: "Habibi", email: "", phone: "" };
let pendingPoints = parseInt(localStorage.getItem("pendingPoints")) || 0;

// --- 3. STORE LINKS MAPPING (For Basket Checkout) ---
const storeLinks = {
    "Amazon": "https://www.amazon.ae/gp/cart/view.html",
    "Noon": "https://www.noon.com/uae-en/cart",
    "Carrefour": "https://www.carrefouruae.com/mafuae/en/cart"
};

// --- 4. BASKET ENGINE (GROUPED BY STORE) ---
function openBasket() {
    const container = document.getElementById("basketItems");
    container.innerHTML = "";
    if(basket.length === 0) { 
        container.innerHTML = "<div class='empty-basket'><i class='fa-solid fa-basket-shopping'></i><p>Basket is empty</p></div>"; 
        return;
    }

    // Grouping logic
    const groups = basket.reduce((acc, item, index) => {
        if (!acc[item.store]) acc[item.store] = [];
        acc[item.store].push({...item, originalIndex: index});
        return acc;
    }, {});

    for (const [store, items] of Object.entries(groups)) {
        let storeTotal = items.reduce((sum, i) => sum + i.price, 0);
        let storeHtml = `<div class="glass-card store-group">
            <div class="store-group-header">
                <h4>${store} Order</h4>
                <span class="gold">${storeTotal} AED</span>
            </div>`;
        
        items.forEach(item => {
            storeHtml += `
            <div class="basket-item-mini">
                <span>${item.name}</span>
                <div class="mini-price">
                    <small>${item.price} AED</small>
                    <button class="remove-btn-icon" onclick="removeFromBasket(${item.originalIndex})"><i class="fa-solid fa-xmark"></i></button>
                </div>
            </div>`;
        });

        storeHtml += `<button class="gold-btn" onclick="processReward(${storeTotal}, '${storeLinks[store]}')">
            Checkout on ${store} <i class="fa-solid fa-arrow-right"></i>
        </button></div>`;
        
        container.innerHTML += storeHtml;
    }
    showPage("basketPage");
}

// --- 5. PROFILE ENGINE (NAME, EMAIL, PHONE) ---
function renderProfile() {
    document.getElementById('profilePage').innerHTML = `
        <div class="page-header"><h2>My Profile</h2></div>
        <div class="profile-card glass-card">
            <div class="user-avatar"><i class="fa-solid fa-user-ninja"></i></div>
            <h3>${userProfile.name}</h3>
            <p>${userProfile.email || 'No email'}</p>
        </div>
        <div class="glass-card settings-list">
            <div class="input-box"><label>Full Name</label><input type="text" id="nameInput" value="${userProfile.name}"></div>
            <div class="input-box"><label>Email Address</label><input type="email" id="emailInput" value="${userProfile.email}" placeholder="your@email.com"></div>
            <div class="input-box"><label>Phone Number</label><input type="tel" id="phoneInput" value="${userProfile.phone}" placeholder="05x-xxx-xxxx"></div>
            <button class="gold-btn" onclick="saveProfile()">Update Profile</button>
        </div>`;
}

function saveProfile() {
    userProfile.name = document.getElementById('nameInput').value;
    userProfile.email = document.getElementById('emailInput').value;
    userProfile.phone = document.getElementById('phoneInput').value;
    localStorage.setItem("userProfile", JSON.stringify(userProfile));
    alert("Profile Updated Successfully!");
    renderProfile();
}

// --- 6. CORE APP FUNCTIONS (Keep Existing) ---
function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById('mainContent').style.display = 'none';
    if(!id || id === 'home') { document.getElementById('mainContent').style.display = 'block'; filterMegaDeals(); }
    else { document.getElementById(id).style.display = 'block'; if(id === 'profilePage') renderProfile(); if(id === 'rewardsPage') document.getElementById('totalPointsDisplay').textContent = pendingPoints; }
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    if(id === 'home' || !id) document.getElementById('navHome').classList.add('active');
    else if(id === 'rewardsPage') document.getElementById('navGift').classList.add('active');
    else if(id === 'profilePage') document.getElementById('navUser').classList.add('active');
}

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
    const grid = document.getElementById("megaDealsGrid"); grid.innerHTML = "";
    megaDeals.filter(d => d.disc >= min).forEach(d => {
        grid.innerHTML += `<div class="deal-card mega-border" onclick="openProduct('${d.key}', true)">
            <div class="smart-tag">${d.disc}% OFF</div>
            <img src="images/${d.key}.jpg" onerror="this.src='https://placehold.co/100x100?text=${d.store}'">
            <p>${d.name}</p>
            <span class="new-price">AED ${d.p}</span>
            <small class="store-badge">${d.store}</small>
        </div>`;
    });
}

function openProduct(key, isMega) {
    const p = isMega ? megaDeals.find(x => x.key === key) : comparisonProducts.find(x => x.key === key);
    const page = document.getElementById("productPage");
    document.getElementById("suggestions").style.display = "none";
    document.getElementById("searchInput").value = "";
    let html = `<div class="glass-card full-view"><button onclick="showHome()" class="back-link">← Back</button><h3>${p.name}</h3>`;
    const stores = isMega ? [{n: p.store, p: p.p, l: p.l}] : p.stores;
    stores.forEach(s => {
        html += `<div class="store-row"><div class="store-info"><span>${s.n}</span><strong>${s.p} AED</strong></div>
            <div class="action-btns">
                <button class="buy-btn-2050" onclick="processReward(${s.p}, '${s.l}')">Buy</button>
                <button class="add-btn-2050" onclick="addToBasket(this, '${p.name}','${s.n}',${s.p})">+</button>
            </div></div>`;
    });
    page.innerHTML = html + `</div>`; showPage("productPage");
}

function processReward(price, link) {
    pendingPoints += Math.floor(price); localStorage.setItem("pendingPoints", pendingPoints);
    document.getElementById("meterPoints").textContent = pendingPoints;
    window.open(link, '_blank');
}

function addToBasket(btnElement, name, store, price) {
    btnElement.innerHTML = `<i class="fa-solid fa-check"></i>`;
    basket.push({name, store, price}); localStorage.setItem("basket", JSON.stringify(basket));
    document.getElementById("basketCount").textContent = basket.length;
    setTimeout(() => { btnElement.innerHTML = `+`; }, 2000);
}

function removeFromBasket(index) { basket.splice(index, 1); localStorage.setItem("basket", JSON.stringify(basket)); document.getElementById("basketCount").textContent = basket.length; openBasket(); }
function toggleLanguage() { currentLang = currentLang === 'en' ? 'ar' : 'en'; document.body.classList.toggle('rtl'); renderUI(); }
function renderUI() { document.querySelectorAll('[data-key]').forEach(el => { const k = el.getAttribute('data-key'); el.textContent = translations[currentLang][k]; }); }
function showHome() { showPage('home'); }
function showRewards() { showPage('rewardsPage'); }
function showProfile() { showPage('profilePage'); }

window.onload = () => {
    filterMegaDeals();
    document.getElementById("meterPoints").textContent = pendingPoints;
    document.getElementById("basketCount").textContent = basket.length;
    const grid = document.getElementById("trendingGrid");
    comparisonProducts.slice(0,5).forEach(p => {
        grid.innerHTML += `<div class="deal-card" onclick="openProduct('${p.key}', false)"><p>${p.name}</p><span>${p.stores[0].p} AED</span></div>`;
    });
};

function openLegal(type) { document.getElementById('legalModal').style.display = 'flex'; document.getElementById('legalBody').innerHTML = legalContent[type]; }
function closeLegal() { document.getElementById('legalModal').style.display = 'none'; }

