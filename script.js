// --- 1. CONFIGURATION ---
const SCRAPE_DO_TOKEN = '641c5334a7504c15abb0902cd23d0095b4dbb6711a3';
const MY_ADMIN_EMAIL = "your-email@example.com"; // For redemption requests
const REWARD_CONVERSION_RATE = 100;

// --- 2. STATE & USER PROFILE ---
let basket = JSON.parse(localStorage.getItem("basket")) || [];
let rewards = {
    pending: parseInt(localStorage.getItem("pendingPoints")) || 0,
    approved: parseInt(localStorage.getItem("approvedPoints")) || 0
};
let userProfile = JSON.parse(localStorage.getItem("userProfile")) || {
    name: "Desert Hunter",
    email: "hunter@uae.ae",
    phone: "+971 50 000 0000"
};

// --- 3. THE 2050 PROFILE ENGINE ---
function openProfile() {
    const container = document.getElementById("profilePage");
    container.innerHTML = `
        <div class="page-header"><h2><i class="fa-solid fa-user-astronaut gold"></i> Identity</h2></div>
        <div class="glass-card profile-box">
            <div class="avatar-glow"><i class="fa-solid fa-user-ninja"></i></div>
            <div class="profile-form">
                <div class="input-group">
                    <label>Full Name</label>
                    <input type="text" id="editName" value="${userProfile.name}">
                </div>
                <div class="input-group">
                    <label>Email Address</label>
                    <input type="email" id="editEmail" value="${userProfile.email}">
                </div>
                <div class="input-group">
                    <label>Mobile Number</label>
                    <input type="tel" id="editPhone" value="${userProfile.phone}">
                </div>
                <button class="gold-btn save-btn" onclick="saveProfile()">Update DNA</button>
            </div>
        </div>
    `;
    showPage("profilePage");
}

function saveProfile() {
    userProfile = {
        name: document.getElementById("editName").value,
        email: document.getElementById("editEmail").value,
        phone: document.getElementById("editPhone").value
    };
    localStorage.setItem("userProfile", JSON.stringify(userProfile));
    alert("Profile Synced to Cloud 🚀");
}

// --- 4. REDEMPTION SYSTEM ---
function requestRedemption() {
    if (rewards.approved < 1000) {
        alert("Minimum 1,000 Approved Points required to cash out.");
        return;
    }
    
    const aedValue = (rewards.approved / REWARD_CONVERSION_RATE).toFixed(2);
    const subject = encodeURIComponent(`Redemption Request: ${userProfile.name}`);
    const body = encodeURIComponent(`Hello Admin,\n\nI want to redeem my points.\n\nUser: ${userProfile.name}\nEmail: ${userProfile.email}\nPhone: ${userProfile.phone}\nApproved Points: ${rewards.approved}\nValue: ${aedValue} AED\n\nPlease process my payout.`);
    
    // Opens user's email app with pre-filled request
    window.location.href = `mailto:${MY_ADMIN_EMAIL}?subject=${subject}&body=${body}`;
}

// --- 5. SEARCH & COMPARISON (6 STORES) ---
async function handleSearch() {
    const query = document.getElementById("searchInput").value;
    if (query.length < 3) return;

    const grid = document.getElementById("trendingGrid");
    grid.innerHTML = `<div class="loader-2050"><div class="scanner"></div><p>Scanning UAE Grid...</p></div>`;

    const stores = ['Amazon', 'Noon', 'Carrefour', 'Namshi', 'SharafDG', 'Jumbo'];
    const results = await Promise.all(stores.map(s => fetchStoreData(s, query)));
    const validResults = results.filter(r => r.price > 0).sort((a, b) => a.price - b.price);
    
    renderResults(validResults, query);
}

async function fetchStoreData(store, query) {
    let url = `https://www.google.com/search?q=${store}+UAE+${encodeURIComponent(query)}`; // Fallback logic
    if (store === 'Amazon') url = `https://www.amazon.ae/s?k=${encodeURIComponent(query)}`;
    if (store === 'Noon') url = `https://www.noon.com/uae-en/search/?q=${encodeURIComponent(query)}`;

    const apiCall = `https://api.scrape.do?token=${SCRAPE_DO_TOKEN}&url=${encodeURIComponent(url)}&render=true`;

    try {
        const resp = await fetch(apiCall);
        const text = await resp.text();
        const priceMatch = text.match(/(\d{1,3}(,\d{3})*(\.\d{2})?)\s*(AED|Dh)/i);
        const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0;
        const imgMatch = text.match(/https:\/\/[^"']+\.(jpg|png|webp)/);
        
        return { store, price, link: url, img: imgMatch ? imgMatch[0] : "" };
    } catch (e) {
        return { store, price: 0, link: url, img: "" };
    }
}

function renderResults(results, query) {
    const grid = document.getElementById("trendingGrid");
    grid.innerHTML = results.length ? "" : "<p>No data in current sector.</p>";
    
    results.forEach((res, index) => {
        const isBest = index === 0;
        grid.innerHTML += `
            <div class="deal-card glass-card ${isBest ? 'best-price-glow' : ''}">
                ${isBest ? '<span class="best-label">TOP DEAL</span>' : ''}
                <img src="${res.img || 'https://placehold.co/100x100?text=Product'}" class="prod-img">
                <div class="store-name gold">${res.store}</div>
                <div class="price-tag">${res.price.toLocaleString()} AED</div>
                <div class="action-btns">
                    <button class="buy-btn-2050" onclick="processReward(${res.price}, '${res.link}')">Visit</button>
                    <button class="add-btn-2050" onclick="addToBasket(this, '${query}','${res.store}',${res.price})">+</button>
                </div>
            </div>`;
    });
}

// --- 6. CORE UI HELPERS ---
function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById('mainContent').style.display = (id === 'home') ? 'block' : 'none';
    if(id !== 'home') document.getElementById(id).style.display = 'block';
    updateGlobalUI();
}

function updateGlobalUI() {
    document.getElementById("basketCount").textContent = basket.length;
    document.getElementById("meterPoints").textContent = rewards.pending;
    if (document.getElementById("pendingDisplay")) {
        document.getElementById("pendingDisplay").textContent = rewards.pending;
        document.getElementById("approvedDisplay").textContent = rewards.approved;
        document.getElementById("aedValue").textContent = (rewards.approved / REWARD_CONVERSION_RATE).toFixed(2);
    }
}

function processReward(price, link) {
    rewards.pending += Math.floor(price);
    localStorage.setItem("pendingPoints", rewards.pending);
    window.open(link, '_blank');
}

window.onload = updateGlobalUI;

