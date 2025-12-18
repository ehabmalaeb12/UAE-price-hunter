// --- 1. CONFIGURATION & LEGAL TEXT ---
let currentLang = 'en';

const legalContent = {
    privacy: `<h4>Privacy Policy</h4>
    <p><strong>1. Data Collection:</strong> We do not store personal financial information. Your shopping basket and points are stored locally on your device.</p>
    <p><strong>2. Third-Party Links:</strong> When you click "Buy", you are redirected to Amazon, Noon, or Carrefour. Please review their privacy policies.</p>
    <p><strong>3. Cookies:</strong> We use local storage to save your preferences and rewards progress.</p>`,
    
    terms: `<h4>Terms of Service</h4>
    <p><strong>1. Accuracy:</strong> Prices are updated daily but subject to change by the retailer.</p>
    <p><strong>2. Affiliate Disclosure:</strong> We earn a commission when you purchase through our links at no extra cost to you.</p>
    <p><strong>3. Rewards:</strong> Points are pending until purchase verification. Fraudulent activity will void points.</p>`
};

const translations = {
    en: {
        megaDeals: "💎 Mega Deals",
        megaSub: "Live price drops from Amazon, Noon & Carrefour",
        welcomeTitle: "Marhaba! 🇦🇪",
        welcomeSub: "Your AI Price Assistant is ready.",
        points: "Points",
        trending: "🔥 Trending Comparisons",
        basketTitle: "My Basket",
        rewardsTitle: "My Rewards",
        pointsBalance: "Pending Points",
        howItWorks: "How to Earn:",
        step1: "Shop at Amazon, Noon, or Carrefour via our app.",
        step2: "Earn 1 Point for every 1 AED spent.",
        step3: "Redeem 1000 Points for a 10 AED Voucher.",
        buyBtn: "Buy Now",
        addBtn: "Add +"
    },
    ar: {
        megaDeals: "💎 صفقات كبرى",
        megaSub: "تخفيضات مباشرة من أمازون، نون وكارفور",
        welcomeTitle: "مرحباً! 🇦🇪",
        welcomeSub: "مساعد التسوق الذكي جاهز.",
        points: "نقاط",
        trending: "🔥 الأكثر طلباً",
        basketTitle: "سلة التسوق",
        rewardsTitle: "مكافآتي",
        pointsBalance: "النقاط المعلقة",
        howItWorks: "كيف تكسب النقاط:",
        step1: "تسوق من أمازون، نون أو كارفور عبر تطبيقنا.",
        step2: "اكسب نقطة واحدة لكل 1 درهم تنفقه.",
        step3: "استبدل 1000 نقطة بقسيمة 10 دراهم.",
        buyBtn: "شراء الآن",
        addBtn: "أضف +"
    }
};

// --- 2. DATA (Comparison + Mega Deals) ---
const comparisonProducts = [
    {key:"iphone", name:"iPhone 15 Pro", stores:[{n:"Amazon", p:4299, l:"https://www.amazon.ae"}, {n:"Noon", p:4250, l:"https://www.noon.com"}, {n:"Carrefour", p:4399, l:"https://www.carrefouruae.com"}]},
    {key:"s24", name:"Samsung S24 Ultra", stores:[{n:"Amazon", p:3850, l:"https://www.amazon.ae"}, {n:"Noon", p:3800, l:"https://www.noon.com"}, {n:"Carrefour", p:3999, l:"https://www.carrefouruae.com"}]},
    {key:"dyson", name:"Dyson V15 Detect", stores:[{n:"Amazon", p:2399, l:"https://www.amazon.ae"}, {n:"Noon", p:2299, l:"https://www.noon.com"}, {n:"Carrefour", p:2450, l:"https://www.carrefouruae.com"}]},
    {key:"sony", name:"Sony XM5 Headphones", stores:[{n:"Amazon", p:1199, l:"https://www.amazon.ae"}, {n:"Noon", p:1250, l:"https://www.noon.com"}, {n:"Carrefour", p:1299, l:"https://www.carrefouruae.com"}]},
    {key:"nespresso", name:"Nespresso Vertuo", stores:[{n:"Amazon", p:650, l:"https://www.amazon.ae"}, {n:"Noon", p:599, l:"https://www.noon.com"}, {n:"Carrefour", p:620, l:"https://www.carrefouruae.com"}]},
    {key:"airfryer", name:"Philips Air Fryer XXL", stores:[{n:"Amazon", p:550, l:"https://www.amazon.ae"}, {n:"Noon", p:519, l:"https://www.noon.com"}, {n:"Carrefour", p:580, l:"https://www.carrefouruae.com"}]},
    {key:"ipad", name:"iPad Air M2", stores:[{n:"Amazon", p:2499, l:"https://www.amazon.ae"}, {n:"Noon", p:2450, l:"https://www.noon.com"}, {n:"Carrefour", p:2599, l:"https://www.carrefouruae.com"}]},
    {key:"sauvage", name:"Dior Sauvage 100ml", stores:[{n:"Amazon", p:399, l:"https://www.amazon.ae"}, {n:"Noon", p:385, l:"https://www.noon.com"}, {n:"Carrefour", p:420, l:"https://www.carrefouruae.com"}]},
    {key:"whey", name:"Optimum Whey 5lb", stores:[{n:"Amazon", p:245, l:"https://www.amazon.ae"}, {n:"Noon", p:255, l:"https://www.noon.com"}, {n:"Carrefour", p:265, l:"https://www.carrefouruae.com"}]},
    {key:"kindle", name:"Kindle Paperwhite", stores:[{n:"Amazon", p:499, l:"https://www.amazon.ae"}, {n:"Noon", p:520, l:"https://www.noon.com"}, {n:"Carrefour", p:550, l:"https://www.carrefouruae.com"}]}
];

const megaDeals = [
    {key:"buds", name:"Wireless Buds Pro", original: 899, p: 179, disc: 80, store: "Noon", l:"https://www.noon.com"},
    {key:"cable", name:"Fast Charge Pack", original: 150, p: 29, disc: 81, store: "Amazon", l:"https://www.amazon.ae"},
    {key:"watch6", name:"Galaxy Watch 6", original: 1299, p: 389, disc: 70, store: "Amazon", l:"https://www.amazon.ae"},
    {key:"oud", name:"Oud Intense 100ml", original: 450, p: 135, disc: 70, store: "Noon", l:"https://www.noon.com"},
    {key:"coffee-sale", name:"Vertuo Pop", original: 1499, p: 599, disc: 60, store: "Carrefour", l:"https://www.carrefouruae.com"},
    {key:"anker", name:"Anker 20k Power", original: 299, p: 149, disc: 50, store: "Amazon", l:"https://www.amazon.ae"}
];

let basket = JSON.parse(localStorage.getItem("basket")) || [];
let userProfile = JSON.parse(localStorage.getItem("userProfile")) || { name: "Habibi", phone: "" };
let pendingPoints = parseInt(localStorage.getItem("pendingPoints")) || 0;

// --- 3. LANGUAGE TOGGLE ---
function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'ar' : 'en';
    const body = document.body;
    const label = document.getElementById("langLabel");
    
    if (currentLang === 'ar') {
        body.classList.add('rtl');
        label.textContent = "English";
    } else {
        body.classList.remove('rtl');
        label.textContent = "عربي";
    }

    document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.getAttribute('data-key');
        if (translations[currentLang][key]) {
            el.textContent = translations[currentLang][key];
        }
    });
}

// --- 4. LEGAL MODAL LOGIC ---
function openLegal(type) {
    const modal = document.getElementById('legalModal');
    const title = document.getElementById('legalTitle');
    const body = document.getElementById('legalBody');
    
    title.textContent = type === 'privacy' ? 'Privacy Policy' : 'Terms of Service';
    body.innerHTML = legalContent[type];
    modal.style.display = 'flex';
}

function closeLegal(event) {
    // Close if clicked on X or outside the modal card
    if (!event || event.target.id === 'legalModal') {
        document.getElementById('legalModal').style.display = 'none';
    }
}

// --- 5. CORE FUNCTIONS ---
function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById('mainContent').style.display = 'none';
    
    if(!id || id === 'home') {
        document.getElementById('mainContent').style.display = 'block';
        filterMegaDeals();
    } else {
        document.getElementById(id).style.display = 'block';
        if(id === 'profilePage') renderProfile();
        if(id === 'rewardsPage') document.getElementById('totalPointsDisplay').textContent = pendingPoints;
    }

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
    const grid = document.getElementById("megaDealsGrid");
    grid.innerHTML = "";
    megaDeals.filter(d => d.disc >= min).forEach(d => {
        grid.innerHTML += `<div class="deal-card mega-border" onclick="openProduct('${d.key}', true)">
            <div class="smart-tag">${d.disc}% OFF</div>
            <img src="images/${d.key}.jpg" onerror="this.src='https://placehold.co/100x100?text=${d.store}'">
            <p>${d.name}</p>
            <span class="old-price">AED ${d.original}</span><span class="new-price">AED ${d.p}</span>
            <small class="store-badge">${d.store}</small>
        </div>`;
    });
}

function openProduct(key, isMega) {
    const p = isMega ? megaDeals.find(x => x.key === key) : comparisonProducts.find(x => x.key === key);
    const page = document.getElementById("productPage");
    document.getElementById("suggestions").style.display = "none";
    document.getElementById("searchInput").value = "";
    
    let html = `<div class="glass-card full-view">
        <button onclick="showHome()" class="back-link">← Back</button>
        <img src="images/${p.key}.jpg" class="hero-img" onerror="this.src='https://placehold.co/200x200?text=Product'">
        <h3>${p.name}</h3>`;
    
    const stores = isMega ? [{n: p.store, p: p.p, l: p.l}] : p.stores;
    
    stores.forEach(s => {
        html += `<div class="store-row">
            <div class="store-info">
                <span class="store-name">${s.n}</span>
                <span class="price-tag">${s.p} AED</span>
            </div>
            <div class="action-btns">
                <button class="buy-btn-2050" onclick="processReward(${s.p}, '${s.l}')">
                    ${translations[currentLang].buyBtn} <i class="fa-solid fa-arrow-up-right-from-square"></i>
                </button>
                <button class="add-btn-2050" onclick="addToBasket(this, '${p.name}','${s.n}',${s.p})">
                    <i class="fa-solid fa-plus"></i>
                </button>
            </div>
        </div>`;
    });
    page.innerHTML = html + `</div>`;
    showPage("productPage");
}

function processReward(price, link) {
    pendingPoints += Math.floor(price);
    localStorage.setItem("pendingPoints", pendingPoints);
    document.getElementById("meterPoints").textContent = pendingPoints;
    window.open(link, '_blank');
}

function addToBasket(btnElement, name, store, price) {
    // 2050 Interactive Animation
    const originalContent = btnElement.innerHTML;
    btnElement.innerHTML = `<i class="fa-solid fa-check"></i>`;
    btnElement.style.background = "#22c55e"; // Success Green
    btnElement.style.color = "white";
    
    basket.push({name, store, price});
    localStorage.setItem("basket", JSON.stringify(basket));
    document.getElementById("basketCount").textContent = basket.length;
    
    setTimeout(() => {
        btnElement.innerHTML = `<i class="fa-solid fa-plus"></i>`;
        btnElement.style.background = ""; 
        btnElement.style.color = "";
    }, 2000);
}

function removeFromBasket(index) {
    basket.splice(index, 1);
    localStorage.setItem("basket", JSON.stringify(basket));
    document.getElementById("basketCount").textContent = basket.length;
    openBasket(); 
}

function openBasket() {
    const container = document.getElementById("basketItems");
    container.innerHTML = "";
    if(basket.length === 0) { 
        container.innerHTML = "<div class='empty-basket'><i class='fa-solid fa-basket-shopping'></i><p>Basket is empty</p></div>"; 
    }
    
    basket.forEach((item, index) => {
        container.innerHTML += `
        <div class="basket-item glass-card">
            <div class="item-details">
                <strong>${item.name}</strong>
                <small>${item.store}</small>
            </div>
            <div class="item-price">
                <span>${item.price} AED</span>
                <button class="remove-btn" onclick="removeFromBasket(${index})"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>`;
    });
    
    if(basket.length > 0) {
        let total = basket.reduce((sum, i) => sum + i.price, 0);
        container.innerHTML += `<div class="basket-total">Total Estimate: <span class="gold">${total} AED</span></div>`;
    }
    
    showPage("basketPage");
}

function renderProfile() {
    document.getElementById('profilePage').innerHTML = `
        <div class="page-header"><h2>My Profile</h2></div>
        <div class="profile-card glass-card">
            <div class="user-avatar"><i class="fa-solid fa-user-ninja"></i></div>
            <h3>${userProfile.name}</h3>
            <p>${userProfile.phone || 'No phone linked'}</p>
        </div>
        <div class="glass-card settings-list">
            <label>Update Name</label>
            <input type="text" id="nameInput" value="${userProfile.name}">
            <button class="gold-btn full-width" onclick="saveProfile()">Save Changes</button>
        </div>`;
}

function saveProfile() {
    userProfile.name = document.getElementById('nameInput').value;
    localStorage.setItem("userProfile", JSON.stringify(userProfile));
    alert("Profile Saved!");
    renderProfile();
}

function showHome() { showPage('home'); }
function showRewards() { showPage('rewardsPage'); }
function showProfile() { showPage('profilePage'); }

window.onload = () => {
    filterMegaDeals();
    document.getElementById("meterPoints").textContent = pendingPoints;
    document.getElementById("basketCount").textContent = basket.length;
    
    const grid = document.getElementById("trendingGrid");
    comparisonProducts.slice(0,6).forEach(p => {
        grid.innerHTML += `<div class="deal-card" onclick="openProduct('${p.key}', false)">
            <img src="images/${p.key}.jpg" onerror="this.src='https://placehold.co/100x100?text=Trending'">
            <p>${p.name}</p><span>${p.stores[0].p} AED</span>
        </div>`;
    });
};

// SERVICE WORKER REGISTRATION
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

