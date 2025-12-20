// --- CONFIGURATION ---
const SCRAPE_DO_TOKEN = '641c5334a7504c15abb0902cd23d0095b4dbb6711a3';
const REWARD_CONVERSION_RATE = 100; // 100 points = 1 AED

// --- NEW REWARDS LOGIC ---
let rewards = {
    pending: parseInt(localStorage.getItem("pendingPoints")) || 0,
    approved: parseInt(localStorage.getItem("approvedPoints")) || 0
};

// --- FIX: BASKET ENGINE ---
function openBasket() {
    const container = document.getElementById("basketItems");
    if (!container) return;
    
    container.innerHTML = ""; // Clear view
    const basket = JSON.parse(localStorage.getItem("basket")) || [];

    if (basket.length === 0) {
        container.innerHTML = "<div class='empty-basket'>Your desert is empty! 🏜️</div>";
    } else {
        basket.forEach((item, index) => {
            container.innerHTML += `
                <div class="glass-card basket-item">
                    <div style="display:flex; gap:10px; align-items:center;">
                        <img src="${item.img || ''}" style="width:40px; height:40px; border-radius:5px; object-fit:cover;">
                        <div><strong>${item.name}</strong><br><small>${item.store}</small></div>
                    </div>
                    <div>${item.price} AED <button onclick="removeFromBasket(${index})" class="remove-btn">×</button></div>
                </div>`;
        });
    }
    showPage("basketPage");
}

// --- SMART SEARCH & COMPARISON ---
async function handleSearch() {
    const query = document.getElementById("searchInput").value.trim();
    if (query.length < 3) {
        document.getElementById("suggestions").style.display = 'none';
        return;
    }

    const dropdown = document.getElementById("suggestions");
    dropdown.innerHTML = ""; // Clear previous suggestions
    dropdown.style.display = 'block'; // Show suggestions

    // Simulating an advanced search with a timeout
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(async () => {
        const stores = ['Amazon', 'Noon', 'Carrefour', 'Namshi', 'SharafDG', 'Jumbo'];
        const results = await Promise.all(stores.map(s => fetchStoreData(s, query)));

        // Gather unique results
        const uniqueResults = results.reduce((accum, result) => {
            return accumulateResults(accum, result);
        }, []);

        // Sort results by price
        const validResults = uniqueResults.filter(r => r.price > 0).sort((a, b) => a.price - b.price);
        renderResults(validResults);
    }, 300);
}

function accumulateResults(accum, result) {
    if (!result || !result.length) return accum;

    result.forEach(item => {
        const existing = accum.find(i => i.name === item.name);
        if (existing) {
            existing.store.push(item.store);
            existing.price = Math.min(existing.price, item.price); // Keep the best price
        } else {
            accum.push({...item, store: [item.store]});
        }
    });
    return accum;
}

function renderResults(results) {
    const grid = document.getElementById("trendingGrid");
    grid.innerHTML = "";
    const suggestions = document.getElementById("suggestions");
    suggestions.innerHTML = "";
    
    if (results.length === 0) {
        grid.innerHTML = "<p>No items found. Try a different keyword.</p>";
        return;
    }

    results.forEach((res, index) => {
        const isBestPrice = index === 0; // First in sorted list
        grid.innerHTML += `
            <div class="deal-card glass-card ${isBestPrice ? 'card-hot-deal' : ''}">
                ${isBestPrice ? '<div class="deal-badge">CHEAPEST</div>' : ''}
                <div class="store-name gold">${res.store.join(", ")}</div>
                <div class="price-tag">${res.price.toLocaleString()} AED</div>
                <p class="pts-preview">🪙 Earn ${Math.floor(res.price)} Points</p>
                <button class="buy-btn-2050" onclick="processReward(${res.price}, '${res.link}')">Shop Now</button>
            </div>`;
        
        // Add to suggestions
        suggestions.innerHTML += `<div style="padding: 8px; cursor: pointer;">${res.name} - ${res.price} AED</div>`
    });

    suggestions.style.display = 'block'; // Display suggestions
}

function toggleLanguage() {
    const langLabel = document.getElementById("langLabel");
    langLabel.innerHTML = langLabel.innerHTML === 'عربي' ? 'English' : 'عربي';
    document.body.classList.toggle('rtl');
}

// Other utility functions ...

// Show page utility
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.style.display = 'none');
    document.getElementById(pageId).style.display = 'block';
}

async function fetchStoreData(store, query) {
    // Mocking data fetch. Replace this with actual API calls.
    const dummyData = {
        "Amazon": [{name: query + ' Product A', price:Math.random()*100 + 50, store: 'Amazon', link: '#', img: 'https://via.placeholder.com/150'}],
        "Noon": [{name: query + ' Product B', price:Math.random()*100 + 50, store: 'Noon', link: '#', img: 'https://via.placeholder.com/150'}],
        // Add more mock data for other stores
    };

    return dummyData[store] || [];
}
