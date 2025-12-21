// ============================================
// UAE PRICE HUNTER - MAIN APPLICATION
// ============================================
// 🔧 CONFIGURATION: Add your API keys below
// ============================================

// 🔧 REPLACE THIS WITH YOUR SCRAPE.DO API KEY
const SCRAPEDO_API_KEY = "641c5334a7504c15abb0902cd23d0095b4dbb6711a3"; // Get from: https://scrape.do

// Sample products for search suggestions
const SUGGESTION_PRODUCTS = [
    "iPhone 15 Pro Max", "Samsung Galaxy S24", "MacBook Air M3",
    "PlayStation 5", "Nike Air Force 1", "Adidas Ultraboost",
    "Samsung QLED TV 65", "Dyson Airwrap", "Apple Watch Series 9",
    "Nescafe Coffee Machine", "Chocolate Dates", "Arabic Perfume",
    "Gold Jewelry", "Car Accessories", "Baby Stroller"
];

// Store URLs for scraping
const STORE_URLS = {
    amazon: "https://www.amazon.ae/s?k=",
    noon: "https://www.noon.com/uae-en/search?q=",
    carrefour: "https://www.carrefouruae.com/mafuae/en/search?text=",
    sharafdg: "https://www.sharafdg.com/catalogsearch/result/?q=",
    emax: "https://www.emaxme.com/search?q=",
    lulu: "https://www.luluhypermarket.com/en-ae/search?q="
};

// DOM Elements
let currentUser = null;
let userData = null;
let basket = [];
let currentLanguage = 'english';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set up event listeners
    setupEventListeners();
    
    // Check Firebase auth state
    checkAuthState();
    
    // Load basket from localStorage as fallback
    loadBasketFromStorage();
}

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

function setupEventListeners() {
    // Search functionality
    document.getElementById('searchBtn').addEventListener('click', performSearch);
    document.getElementById('searchInput').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') performSearch();
        else showSearchSuggestions(this.value);
    });
    
    // Login/Signup
    document.getElementById('showLogin').addEventListener('click', showLoginModal);
    document.getElementById('loginBtn').addEventListener('click', loginUser);
    document.getElementById('signupBtn').addEventListener('click', signupUser);
    document.getElementById('logoutBtn').addEventListener('click', logoutUser);
    
    // Basket
    document.getElementById('openBasket').addEventListener('click', showBasketModal);
    document.getElementById('clearBasket').addEventListener('click', clearBasket);
    
    // Navigation
    document.getElementById('openProfile').addEventListener('click', showProfileSection);
    document.getElementById('openRewards').addEventListener('click', showRewardsSection);
    
    // Language toggle
    document.getElementById('arabicBtn').addEventListener('click', () => switchLanguage('arabic'));
    document.getElementById('englishBtn').addEventListener('click', () => switchLanguage('english'));
    
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
}

function checkAuthState() {
    firebaseAuth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            loadUserData(user.uid);
            showUserProfile();
        } else {
            currentUser = null;
            userData = null;
            showLoginButton();
        }
    });
}

async function loadUserData(userId) {
    try {
        const docRef = firebaseDb.collection('users').doc(userId);
        const docSnap = await docRef.get();
        
        if (docSnap.exists()) {
            userData = docSnap.data();
            updateProfileDisplay();
            updatePointsDisplay();
        } else {
            // Create new user document
            userData = {
                name: currentUser.displayName || currentUser.email.split('@')[0],
                email: currentUser.email,
                points: 100, // Welcome points
                joined: new Date().toISOString(),
                basket: []
            };
            await docRef.set(userData);
            updateProfileDisplay();
        }
    } catch (error) {
        console.error("Error loading user data:", error);
    }
}

// ============================================
// SEARCH FUNCTIONS
// ============================================

async function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) {
        alert("Please enter a search term");
        return;
    }
    
    const selectedStores = Array.from(document.querySelectorAll('.store-checkbox:checked'))
        .map(cb => cb.value);
    
    if (selectedStores.length === 0) {
        alert("Please select at least one store");
        return;
    }
    
    // Show loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('searchResults').innerHTML = '';
    
    try {
        // For demo purposes, we'll use mock data
        // In production, replace with actual scrape.do API calls
        const results = await mockSearch(query, selectedStores);
        displaySearchResults(results);
    } catch (error) {
        console.error("Search error:", error);
        document.getElementById('searchResults').innerHTML = `
            <div class="error-message">
                <p>Search failed. Please try again.</p>
                <p><small>Error: ${error.message}</small></p>
            </div>
        `;
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

// ============================================
// 🚀 ACTUAL SCRAPE.DO API INTEGRATION POINT
// ============================================
// Replace this function with real API calls to scrape.do
// ============================================

async function searchWithScrapeDo(query, store) {
    // 🔧 IMPLEMENT REAL SCRAPE.DO API CALL HERE
    // Example (uncomment and add your API key):
    /*
    const url = STORE_URLS[store] + encodeURIComponent(query);
    const response = await fetch(`https://api.scrape.do?token=${SCRAPEDO_API_KEY}&url=${encodeURIComponent(url)}`);
    const html = await response.text();
    
    // Parse HTML to extract product data
    // You'll need to write parsing logic for each store
    return parseStoreData(html, store);
    */
    
    // For now, return mock data
    return mockStoreData(query, store);
}

function mockSearch(query, stores) {
    // Generate mock product data for demo
    const products = [];
    const basePrice = Math.floor(Math.random() * 500) + 100;
    
    stores.forEach(store => {
        const priceVariation = Math.floor(Math.random() * 200) - 100;
        const price = basePrice + priceVariation;
        
        products.push({
            id: `${store}-${Date.now()}-${Math.random()}`,
            name: `${query} - ${store.toUpperCase()} Edition`,
            store: store,
            price: price,
            originalPrice: price + 50,
            image: `https://via.placeholder.com/150x150/2C3E50/FFFFFF?text=${store}`,
            description: `Premium ${query} available at ${store}. Best quality guaranteed.`,
            url: `https://${store}.com/product/${encodeURIComponent(query)}`,
            inStock: Math.random() > 0.2,
            rating: (Math.random() * 3 + 2).toFixed(1)
        });
    });
    
    // Add best price highlight
    if (products.length > 0) {
        const bestPrice = Math.min(...products.map(p => p.price));
        products.forEach(p => {
            p.isBestPrice = p.price === bestPrice;
        });
    }
    
    return products;
}

function mockStoreData(query, store) {
    const price = Math.floor(Math.random() * 1000) + 50;
    return {
        name: `${query} at ${store}`,
        price: price,
        url: `https://${store}.com/product/${encodeURIComponent(query)}`,
        image: `https://via.placeholder.com/150/2C3E50/FFFFFF?text=${store}`,
        inStock: true
    };
}

// ============================================
// DISPLAY FUNCTIONS
// ============================================

function displaySearchResults(products) {
    const container = document.getElementById('searchResults');
    
    if (products.length === 0) {
        container.innerHTML = '<p class="no-results">No products found. Try a different search.</p>';
        return;
    }
    
    // Group by product name (simplified grouping)
    const groupedProducts = {};
    products.forEach(product => {
        const key = product.name.split(' - ')[0];
        if (!groupedProducts[key]) groupedProducts[key] = [];
        groupedProducts[key].push(product);
    });
    
    let html = '';
    
    Object.values(groupedProducts).forEach(productGroup => {
        const bestProduct = productGroup.reduce((best, current) => 
            current.isBestPrice ? current : best, productGroup[0]);
        
        html += `
            <div class="product-group">
                <div class="product-header">
                    <h3>${bestProduct.name.split(' - ')[0]}</h3>
                    <span class="best-price-tag">Best Price: ${bestProduct.price} AED</span>
                </div>
                <div class="product-description">${bestProduct.description}</div>
                <div class="store-comparison">
        `;
        
        productGroup.forEach(product => {
            html += `
                <div class="store-product ${product.isBestPrice ? 'best-price' : ''}">
                    <img src="${product.image}" alt="${product.name}">
                    <div class="product-info">
                        <h4>${product.store.toUpperCase()}</h4>
                        <div class="price-info">
                            <span class="current-price">${product.price} AED</span>
                            ${product.originalPrice > product.price ? 
                                `<span class="original-price">${product.originalPrice} AED</span>` : ''}
                        </div>
                        <p class="stock-status ${product.inStock ? 'in-stock' : 'out-stock'}">
                            ${product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
                        </p>
                        <p class="rating">⭐ ${product.rating}/5</p>
                        <button class="btn-add-to-basket" onclick="addToBasket(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                            <i class="fas fa-cart-plus"></i> Add to Basket
                        </button>
                        <a href="${product.url}" target="_blank" class="btn-visit-store">
                            <i class="fas fa-external-link-alt"></i> Visit Store
                        </a>
                    </div>
                </div>
            `;
        });
        
        html += '</div></div>';
    });
    
    container.innerHTML = html;
}

function showSearchSuggestions(query) {
    const suggestionsBox = document.getElementById('searchSuggestions');
    
    if (!query || query.length < 2) {
        suggestionsBox.style.display = 'none';
        return;
    }
    
    const filtered = SUGGESTION_PRODUCTS.filter(product =>
        product.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
    
    if (filtered.length > 0) {
        suggestionsBox.innerHTML = filtered.map(product => 
            `<div class="suggestion-item" onclick="selectSuggestion('${product}')">${product}</div>`
        ).join('');
        suggestionsBox.style.display = 'block';
    } else {
        suggestionsBox.style.display = 'none';
    }
}

function selectSuggestion(product) {
    document.getElementById('searchInput').value = product;
    document.getElementById('searchSuggestions').style.display = 'none';
    performSearch();
}

// ============================================
// BASKET FUNCTIONS
// ============================================

function addToBasket(product) {
    basket.push({
        ...product,
        addedAt: new Date().toISOString(),
        quantity: 1
    });
    
    updateBasketDisplay();
    saveBasketToStorage();
    saveBasketToFirebase();
    
    // Show confirmation
    showNotification(`Added ${product.name} to basket!`);
}

function updateBasketDisplay() {
    const basketCount = document.getElementById('basketCount');
    const basketTotal = document.getElementById('basketTotal');
    
    // Update count
    basketCount.textContent = basket.length;
    
    // Calculate total
    const total = basket.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    basketTotal.textContent = `Total: ${total} AED`;
    
    // Update basket modal items
    const basketItems = document.getElementById('basketItems');
    if (basketItems) {
        if (basket.length === 0) {
            basketItems.innerHTML = '<p>Your basket is empty</p>';
        } else {
            basketItems.innerHTML = basket.map((item, index) => `
                <div class="basket-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="basket-item-info">
                        <h4>${item.name}</h4>
                        <p>${item.store} - ${item.price} AED × ${item.quantity}</p>
                    </div>
                    <button onclick="removeFromBasket(${index})" class="btn-remove">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
        }
    }
}

function removeFromBasket(index) {
    basket.splice(index, 1);
    updateBasketDisplay();
    saveBasketToStorage();
    saveBasketToFirebase();
}

function clearBasket() {
    if (confirm("Clear all items from basket?")) {
        basket = [];
        updateBasketDisplay();
        saveBasketToStorage();
        saveBasketToFirebase();
    }
}

function saveBasketToStorage() {
    localStorage.setItem('uae_price_hunter_basket', JSON.stringify(basket));
}

function loadBasketFromStorage() {
    const saved = localStorage.getItem('uae_price_hunter_basket');
    if (saved) {
        basket = JSON.parse(saved);
        updateBasketDisplay();
    }
}

async function saveBasketToFirebase() {
    if (currentUser && userData) {
        try {
            await firebaseDb.collection('users').doc(currentUser.uid).update({
                basket: basket,
                lastUpdated: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error saving basket to Firebase:", error);
        }
    }
}

// ============================================
// UI FUNCTIONS
// ============================================

function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function showBasketModal() {
    updateBasketDisplay();
    document.getElementById('basketModal').style.display = 'block';
}

function showProfileSection() {
    document.getElementById('profileSection').style.display = 'block';
    document.getElementById('rewardsSection').style.display = 'none';
}

function showRewardsSection() {
    document.getElementById('rewardsSection').style.display = 'block';
    document.getElementById('profileSection').style.display = 'none';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

function updateProfileDisplay() {
    if (userData) {
        document.getElementById('profileName').textContent = userData.name;
        document.getElementById('profileEmail').textContent = userData.email;
        document.getElementById('profilePoints').textContent = userData.points || 0;
        document.getElementById('memberSince').textContent = new Date(userData.joined).toLocaleDateString();
    }
}

function updatePointsDisplay() {
    if (userData) {
        document.getElementById('pointsValue').textContent = userData.points || 0;
        document.getElementById('approvedPoints').textContent = userData.points || 0;
        document.getElementById('pendingPoints').textContent = Math.floor((userData.points || 0) * 0.3);
    }
}

function showUserProfile() {
    document.getElementById('userPointsCard').style.display = 'block';
    document.getElementById('showLogin').style.display = 'none';
    document.getElementById('profileSection').style.display = 'block';
}

function showLoginButton() {
    document.getElementById('userPointsCard').style.display = 'none';
    document.getElementById('showLogin').style.display = 'block';
    document.getElementById('profileSection').style.display = 'none';
}

// ============================================
// LANGUAGE FUNCTIONS
// ============================================

function switchLanguage(lang) {
    currentLanguage = lang;
    
    // Update button states
    document.getElementById('arabicBtn').classList.toggle('active', lang === 'arabic');
    document.getElementById('englishBtn').classList.toggle('active', lang === 'english');
    
    // Update direction
    document.documentElement.dir = lang === 'arabic' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang === 'arabic' ? 'ar' : 'en';
    
    // Update text content
    updateLanguageContent(lang);
}

function updateLanguageContent(lang) {
    const translations = {
        english: {
            greeting: "Marhaba! 🇦🇪",
            subtitle: "Your AI Price Assistant is ready.",
            searchPlaceholder: "Search for products (iPhone, Samsung TV, Nike shoes...)",
            liveComparison: "Live Price Comparison",
            basket: "My Basket",
            rewards: "My Rewards",
            profile: "Your Profile",
            logout: "Logout"
        },
        arabic: {
            greeting: "مرحباً! 🇦🇪",
            subtitle: "مساعد الأسعار الذكي جاهز",
            searchPlaceholder: "ابحث عن المنتجات (آيفون، تلفزيون سامسونج، أحذية نايك...)",
            liveComparison: "مقارنة الأسعار المباشرة",
            basket: "سلة التسوق",
            rewards: "المكافآت",
            profile: "ملفك الشخصي",
            logout: "تسجيل الخروج"
        }
    };
    
    const t = translations[lang];
    
    // Update text elements
    document.getElementById('greeting').textContent = t.greeting;
    document.getElementById('subtitle').textContent = t.subtitle;
    document.getElementById('searchInput').placeholder = t.searchPlaceholder;
    document.querySelector('.results-section h2').innerHTML = `<i class="fas fa-fire"></i> ${t.liveComparison}`;
    
    // Update button texts
    document.querySelector('#openBasket span').textContent = t.basket;
    document.querySelector('#openRewards span').textContent = t.rewards;
    document.querySelector('#openProfile span').textContent = t.profile;
    document.querySelector('#logoutBtn').textContent = t.logout;
}

// ============================================
// AUTH FUNCTIONS
// ============================================

async function loginUser() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        await firebaseAuth.signInWithEmailAndPassword(email, password);
        closeAllModals();
        showNotification("Login successful!");
    } catch (error) {
        alert("Login error: " + error.message);
    }
}

async function signupUser() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (password.length < 6) {
        alert("Password must be at least 6 characters");
        return;
    }
    
    try {
        await firebaseAuth.createUserWithEmailAndPassword(email, password);
        closeAllModals();
        showNotification("Account created! Welcome to UAE Price Hunter!");
    } catch (error) {
        alert("Signup error: " + error.message);
    }
}

async function logoutUser() {
    try {
        await firebaseAuth.signOut();
        showNotification("Logged out successfully");
    } catch (error) {
        console.error("Logout error:", error);
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Make functions available globally
window.addToBasket = addToBasket;
window.removeFromBasket = removeFromBasket;
window.selectSuggestion = selectSuggestion;

console.log("UAE Price Hunter script loaded successfully!");
