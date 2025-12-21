// --- CONFIGURATION ---
const SCRAPE_DO_TOKEN = '641c5334a7504c15abb0902cd23d0095b4dbb6711a3'; // Your API token
const EMAIL_TO_SEND = "uae.price.hunter@gmail.com"; // Email endpoint

// Initialize rewards
let rewards = {
    pending: parseInt(localStorage.getItem("pendingPoints")) || 0,
    approved: parseInt(localStorage.getItem("approvedPoints")) || 0,
    saved: parseInt(localStorage.getItem("savedPoints")) || 0,
};

// Initialize basket
let basket = JSON.parse(localStorage.getItem("basket")) || [];

// Load saved points on profile page
function loadProfilePoints() {
    document.getElementById("savedPoints").innerText = rewards.saved;
}

// Functions to handle page navigation
function showHome() {
    document.querySelectorAll('.page').forEach(page => page.style.display = 'none');
    document.getElementById('mainContent').style.display = 'block';
    document.getElementById('trendingGrid').style.display = 'block';
}

function showRewards() {
    document.getElementById("approvedPoints").innerText = rewards.approved;
    document.getElementById("pendingPoints").innerText = rewards.pending;
    document.querySelector('.page').style.display = 'none';
    document.getElementById('rewardsPage').style.display = 'block';
}

function showProfile() {
    loadProfilePoints();
    document.querySelector('.page').style.display = 'none';
    document.getElementById('profilePage').style.display = 'block';
}

// Function to toggle language
function toggleLanguage() {
    const langLabel = document.getElementById("langLabel");
    const isArabic = langLabel.innerText === 'عربي';
    
    langLabel.innerText = isArabic ? 'English' : 'عربي';
    updateLanguage(isArabic);
}

// Function to update language based on setting
function updateLanguage(isArabic) {
    const elementsToTranslate = {
        "headerLogo": isArabic ? "صياد الأسعار" : "UAE PRICE HUNTER",
        "searchPlaceholder": isArabic ? "ابحث عن أي منتج في الإمارات ..." : "Search any product in UAE...",
        "welcomeTitle": isArabic ? "مرحبا! 🇦🇪" : "Marhaba! 🇦🇪",
        "trending": isArabic ? "🔥 مقارنة الأسعار المباشرة" : "🔥 Live Price Comparison"
    };

    document.querySelectorAll("[data-key]").forEach(element => {
        const key = element.getAttribute("data-key");
        if (elementsToTranslate[key]) {
            element.innerText = elementsToTranslate[key];
        }
    });
}

// --- BASKET ENGINE ---
function openBasket() {
    const container = document.getElementById("basketItems");
    const totalPriceElement = document.getElementById("basketTotalPrice");
    container.innerHTML = ""; // Clear view
    totalPriceElement.innerHTML = '0'; // Reset total price

    if (basket.length === 0) {
        container.innerHTML = "<div class='empty-basket'>Your desert is empty! 🏜️</div>";
    } else {
        let totalPrice = 0;
        basket.forEach((item, index) => {
            totalPrice += item.price;
            container.innerHTML += `
                <div class="glass-card basket-item">
                    <div style="display:flex; gap:10px; align-items:center;">
                        <img src="${item.img || ''}" style="width:40px; height:40px; border-radius:5px; object-fit:cover;">
                        <div><strong>${item.name}</strong><br><small>${item.store}</small></div>
                    </div>
                    <div>${item.price} AED 
                    <button onclick="removeFromBasket(${index})" class="remove-btn">×</button>
                    </div>
                </div>`;
        });
        totalPriceElement.innerHTML = totalPrice.toFixed(2); // Update total price
    }
    showPage("basketPage");
}

function proceedToCheckout() {
    alert('Proceeding to checkout');
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
    const dropdown = document.getElementById("suggestions");
    grid.innerHTML = "";
    dropdown.innerHTML = "";
    
    if (results.length === 0) {
        grid.innerHTML = "<p>No items found. Try a different keyword.</p>";
        return;
    }

    results.forEach((res, index) => {
        const isBestPrice = index === 0; // First in sorted list
        grid.innerHTML += `
            <div class="deal-card glass-card ${isBestPrice ? 'card-hot-deal' : ''}">
                ${isBestPrice ? '<div class="deal-badge">CHEAPEST</div>' : ''}
                <img src="${res.img}" alt="${res.name}">
                <div class="store-name gold">${res.store.join(", ")}</div>
                <div class="price-tag">${res.price.toLocaleString()} AED</div>
                <p class="pts-preview">🪙 Earn ${Math.floor(res.price)} Points</p>
                <button class="buy-btn-2050" onclick="addToBasket(${res.id})">Add to Basket</button>
            </div>`;

        // Add to suggestions
        dropdown.innerHTML += `<div style="padding: 8px; cursor: pointer;" onclick="selectSuggestion('${res.name}')">${res.name} - ${res.price} AED</div>`;
    });

    dropdown.style.display = 'block'; // Display suggestions
}

function selectSuggestion(name) {
    document.getElementById("searchInput").value = name;
    handleSearch(); // Trigger the search for selected suggestion
}

// Function to add items to the basket
function addToBasket(productId) {
    const product = { 
        id: productId, 
        name: `Product ${productId}`, // Replace with actual product name
        price: Math.random() * 100 + 50, // Replace with actual price fetching logic
        store: 'Store Name', // Replace with fetched store name
        img: 'https://via.placeholder.com/150' // Replace with actual image link
    };
    
    basket.push(product);
    localStorage.setItem("basket", JSON.stringify(basket));
    document.getElementById("basketCount").innerText = basket.length;

    alert(`${product.name} added to your basket!`);
}

// Mock function to fetch store data (replace with real API calls)
async function fetchStoreData(store, query) {
    const dummyData = {
        "Amazon": [{ id: 1, name: `${query} Product A`, price: Math.random() * 100 + 50, store: 'Amazon', link: '#', img: 'https://via.placeholder.com/150' }],
        "Noon": [{ id: 2, name: `${query} Product B`, price: Math.random() * 100 + 50, store: 'Noon', link: '#', img: 'https://via.placeholder.com/150' }],
        "Carrefour": [{ id: 3, name: `${query} Product C`, price: Math.random() * 100 + 50, store: 'Carrefour', link: '#', img: 'https://via.placeholder.com/150' }],
        "Namshi": [{ id: 4, name: `${query} Product D`, price: Math.random() * 100 + 50, store: 'Namshi', link: '#', img: 'https://via.placeholder.com/150' }],
        "SharafDG": [{ id: 5, name: `${query} Product E`, price: Math.random() * 100 + 50, store: 'SharafDG', link: '#', img: 'https://via.placeholder.com/150' }],
        "Jumbo": [{ id: 6, name: `${query} Product F`, price: Math.random() * 100 + 50, store: 'Jumbo', link: '#', img: 'https://via.placeholder.com/150' }],
    };

    return dummyData[store] || [];
}

// Sending Profile Information via Email
function sendProfile() {
    const profileData = {
        name: "Your Name", // Replace with actual value
        email: "Your Email", // Replace with actual value
        savedPoints: rewards.saved,
    };

    const emailBody = `Profile Information:\nName: ${profileData.name}\nEmail: ${profileData.email}\nSaved Points: ${profileData.savedPoints}`;
    const mailtoLink = `mailto:${EMAIL_TO_SEND}?subject=Profile Information&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink; // Opening mail client for sending
}

// Utility function to show the appropriate page
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.style.display = 'none');
    document.getElementById(pageId).style.display = 'block';
}
