// --- 1. CONFIGURATION ---
const SCRAPE_DO_TOKEN = '641c5334a7504c15abb0902cd23d0095b4dbb6711a3'; 
let currentLang = 'en';

// --- 2. STATE MANAGEMENT ---
let basket = JSON.parse(localStorage.getItem("basket")) || [];
let pendingPoints = parseInt(localStorage.getItem("pendingPoints")) || 0;

// --- 3. LIVE SEARCH ENGINE (SCRAPE.DO) ---
let searchTimer;
function handleSearch() {
    clearTimeout(searchTimer);
    const query = document.getElementById("searchInput").value;
    
    if (query.length < 3) return;

    // Wait for user to stop typing (Debounce)
    searchTimer = setTimeout(async () => {
        const grid = document.getElementById("trendingGrid");
        grid.innerHTML = `<div class="glass-card" style="grid-column: span 2; color: #d4af37;">Searching UAE stores...</div>`;

        const stores = ['Amazon', 'Noon', 'Carrefour'];
        const results = await Promise.all(stores.map(s => fetchStoreData(s, query)));
        
        renderLiveResults(results);
    }, 800);
}

async function fetchStoreData(store, query) {
    let url = "";
    if (store === 'Amazon') url = `https://www.amazon.ae/s?k=${encodeURIComponent(query)}`;
    if (store === 'Noon') url = `https://www.noon.com/uae-en/search/?q=${encodeURIComponent(query)}`;
    if (store === 'Carrefour') url = `https://www.carrefouruae.com/mafuae/en/v4/search?q=${encodeURIComponent(query)}`;

    const apiCall = `https://api.scrape.do?token=${SCRAPE_DO_TOKEN}&url=${encodeURIComponent(url)}&render=true`;

    try {
        const resp = await fetch(apiCall);
        const text = await resp.text();
        const priceMatch = text.match(/(\d{1,3}(,\d{3})*(\.\d{2})?)\s*AED/i);
        const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0;

        return { store, price, link: url, query };
    } catch (e) {
        return { store, price: 0, link: url, query };
    }
}

function renderLiveResults(results) {
    const grid = document.getElementById("trendingGrid");
    grid.innerHTML = "";
    
    results.forEach(res => {
        if (res.price === 0) return;
        grid.innerHTML += `
            <div class="deal-card glass-card">
                <div class="store-name gold">${res.store}</div>
                <div class="price-tag">${res.price} AED</div>
                <div class="action-btns">
                    <button class="buy-btn-2050" onclick="processReward(${res.price}, '${res.link}')">Shop</button>
                    <button class="add-btn-2050" onclick="addToBasket(this, '${res.query}','${res.store}',${res.price})">+</button>
                </div>
            </div>`;
    });
}

// --- 4. CORE FEATURES (BASKET, POINTS, NAV) ---
function processReward(price, link) {
    pendingPoints += Math.floor(price * 0.05); // 5% back in points
    localStorage.setItem("pendingPoints", pendingPoints);
    updateUI();
    window.open(link, '_blank');
}

function addToBasket(btn, name, store, price) {
    basket.push({name, store, price});
    localStorage.setItem("basket", JSON.stringify(basket));
    updateUI();
    btn.innerHTML = `<i class="fa-solid fa-check"></i>`;
    setTimeout(() => btn.innerHTML = "+", 2000);
}

function updateUI() {
    document.getElementById("meterPoints").textContent = pendingPoints;
    document.getElementById("basketCount").textContent = basket.length;
    if(document.getElementById("totalPointsDisplay")) {
        document.getElementById("totalPointsDisplay").textContent = pendingPoints;
    }
}

// Navigation helpers (Keeping your exact structure)
function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById('mainContent').style.display = (id === 'home') ? 'block' : 'none';
    if(id !== 'home') document.getElementById(id).style.display = 'block';
    
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    const navMap = { home: 'navHome', rewardsPage: 'navGift', profilePage: 'navUser' };
    if(navMap[id]) document.getElementById(navMap[id]).classList.add('active');
}

function showHome() { showPage('home'); }
function showRewards() { showPage('rewardsPage'); updateUI(); }
function showProfile() { showPage('profilePage'); }

window.onload = updateUI;

