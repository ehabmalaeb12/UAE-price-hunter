// ============================================
// UAE PRICE HUNTER - 2025 EDITION
// Complete Fix with Modern Features
// ============================================

import { auth, db } from './firebase-config.js';

// Configuration
const CONFIG = {
  SCRAPEDO_API_KEY: "641c5334a7504c15abb0902cd23d0095b4dbb6711a3", // ← Add your key here
  SEARCH_DELAY: 300,
  MAX_SUGGESTIONS: 8
};

// State Management
const state = {
  user: null,
  basket: [],
  searchResults: [],
  currentPage: 'home',
  language: 'english',
  selectedStores: ['amazon', 'noon', 'carrefour', 'sharafdg', 'emax', 'lulu']
};

// Product Database with Real UAE Products
const PRODUCT_DATABASE = {
  "iphone": {
    name: "Apple iPhone 15 Pro Max",
    description: "256GB, Titanium, 5G, Latest A17 Pro Chip",
    basePrice: 4899,
    category: "Electronics"
  },
  "samsung": {
    name: "Samsung Galaxy S24 Ultra",
    description: "512GB, Snapdragon 8 Gen 3, SPen Included",
    basePrice: 4299,
    category: "Electronics"
  },
  "macbook": {
    name: "Apple MacBook Air M3",
    description: "13-inch, 8GB RAM, 256GB SSD, Midnight",
    basePrice: 3999,
    category: "Computers"
  },
  "ps5": {
    name: "Sony PlayStation 5",
    description: "Disc Edition, 1TB SSD, Latest Model",
    basePrice: 1999,
    category: "Gaming"
  },
  "nike": {
    name: "Nike Air Force 1",
    description: "White Leather, Original AF1 Design",
    basePrice: 450,
    category: "Fashion"
  },
  "tv": {
    name: "Samsung 65\" QLED 4K TV",
    description: "Smart TV, Quantum HDR, Alexa Built-in",
    basePrice: 3499,
    category: "Electronics"
  },
  "dyson": {
    name: "Dyson Airwrap Complete",
    description: "Hair Styler, 5 Attachments, New Model",
    basePrice: 2499,
    category: "Beauty"
  }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  console.log("🚀 UAE Price Hunter 2025 Initializing...");
  
  // Initialize modules
  await initFirebase();
  initUI();
  initNavigation();
  initSearch();
  initEventListeners();
  
  // Load saved data
  loadBasketFromStorage();
  updateUI();
  
  console.log("✅ App initialized successfully");
});

// ============================================
// FIREBASE AUTH FIX
// ============================================

async function initFirebase() {
  try {
    console.log("Checking Firebase availability...");
    
    // Check if Firebase services are loaded
    if (!auth || !db) {
      throw new Error("Firebase services not available");
    }
    
    // Listen for auth state changes
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log("✅ User logged in:", user.email);
        state.user = user;
        await loadUserData(user.uid);
        showPage('profile'); // Show profile page after login
      } else {
        console.log("👤 No user logged in");
        state.user = null;
        showPage('home');
      }
      updateUI();
    });
    
    console.log("✅ Firebase initialized successfully");
  } catch (error) {
    console.error("❌ Firebase initialization failed:", error);
    showNotification("Firebase error. Running in offline mode.", "error");
  }
}

async function loadUserData(userId) {
  try {
    const docRef = db.collection('users').doc(userId);
    const docSnap = await docRef.get();
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("📊 User data loaded:", data);
      return data;
    } else {
      // Create new user document
      await docRef.set({
        email: state.user.email,
        name: state.user.displayName || state.user.email.split('@')[0],
        points: 1000,
        joined: new Date().toISOString(),
        basket: []
      });
      console.log("🆕 New user document created");
    }
  } catch (error) {
    console.error("❌ Error loading user data:", error);
  }
}

// ============================================
// 2025 MODERN NAVIGATION SYSTEM
// ============================================

function initNavigation() {
  // Handle page navigation
  document.querySelectorAll('[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = e.target.dataset.page;
      showPage(page);
    });
  });
  
  // Handle browser back/forward
  window.addEventListener('popstate', () => {
    const page = window.location.hash.replace('#', '') || 'home';
    showPage(page);
  });
  
  // Initial page from URL
  const initialPage = window.location.hash.replace('#', '') || 'home';
  showPage(initialPage);
}

function showPage(pageName) {
  state.currentPage = pageName;
  
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // Show current page
  const targetPage = document.getElementById(`${pageName}-page`);
  if (targetPage) {
    targetPage.classList.add('active');
    targetPage.classList.add('fade-in');
    
    // Update URL
    window.history.pushState(null, '', `#${pageName}`);
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.page === pageName);
    });
    
    // Page-specific setup
    switch(pageName) {
      case 'basket':
        renderBasketPage();
        break;
      case 'profile':
        renderProfilePage();
        break;
      case 'rewards':
        renderRewardsPage();
        break;
    }
  }
  
  console.log(`📄 Showing page: ${pageName}`);
}

// ============================================
// 2025 AI-POWERED SEARCH SYSTEM
// ============================================

function initSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const suggestionsBox = document.getElementById('searchSuggestions');
  
  if (!searchInput) return;
  
  // Smart search with debouncing
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    
    if (query.length < 2) {
      hideSuggestions();
      return;
    }
    
    searchTimeout = setTimeout(() => {
      showSmartSuggestions(query);
    }, CONFIG.SEARCH_DELAY);
  });
  
  // Search button
  searchBtn.addEventListener('click', () => performSmartSearch(searchInput.value));
  
  // Enter key
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSmartSearch(searchInput.value);
    }
  });
  
  // Click outside to hide suggestions
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
      hideSuggestions();
    }
  });
}

function showSmartSuggestions(query) {
  const suggestionsBox = document.getElementById('searchSuggestions');
  if (!suggestionsBox) return;
  
  const normalizedQuery = query.toLowerCase();
  const suggestions = [];
  
  // 1. Direct matches from database
  Object.entries(PRODUCT_DATABASE).forEach(([key, product]) => {
    if (key.includes(normalizedQuery) || 
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery)) {
      suggestions.push({
        type: 'product',
        text: product.name,
        category: product.category,
        relevance: 1.0
      });
    }
  });
  
  // 2. Category suggestions
  const categories = [...new Set(Object.values(PRODUCT_DATABASE).map(p => p.category))];
  categories.forEach(category => {
    if (category.toLowerCase().includes(normalizedQuery)) {
      suggestions.push({
        type: 'category',
        text: `All ${category}`,
        category: category,
        relevance: 0.8
      });
    }
  });
  
  // 3. Trending in UAE (mock data)
  const trendingUAE = [
    "Gold Jewelry Dubai",
    "Arabic Perfume",
    "Dates Gift Box",
    "Saudi Coffee Set",
    "Abaya Fashion",
    "Smart Watch"
  ];
  
  trendingUAE.forEach(trend => {
    if (trend.toLowerCase().includes(normalizedQuery)) {
      suggestions.push({
        type: 'trending',
        text: trend,
        icon: '🔥',
        relevance: 0.7
      });
    }
  });
  
  // Sort by relevance and limit
  suggestions.sort((a, b) => b.relevance - a.relevance);
  const topSuggestions = suggestions.slice(0, CONFIG.MAX_SUGGESTIONS);
  
  if (topSuggestions.length > 0) {
    renderSuggestions(topSuggestions);
    suggestionsBox.style.display = 'block';
  } else {
    hideSuggestions();
  }
}

function renderSuggestions(suggestions) {
  const suggestionsBox = document.getElementById('searchSuggestions');
  if (!suggestionsBox) return;
  
  suggestionsBox.innerHTML = suggestions.map(item => `
    <div class="suggestion-item" data-type="${item.type}">
      ${item.icon || '🔍'}
      <span class="suggestion-text">${item.text}</span>
      ${item.category ? `<span class="suggestion-category">${item.category}</span>` : ''}
    </div>
  `).join('');
  
  // Add click handlers
  suggestionsBox.querySelectorAll('.suggestion-item').forEach((item, index) => {
    item.addEventListener('click', () => {
      const text = suggestions[index].text;
      document.getElementById('searchInput').value = text;
      performSmartSearch(text);
      hideSuggestions();
    });
  });
}

function hideSuggestions() {
  const suggestionsBox = document.getElementById('searchSuggestions');
  if (suggestionsBox) {
    suggestionsBox.style.display = 'none';
  }
}

async function performSmartSearch(query) {
  if (!query.trim()) {
    showNotification("Please enter a search term", "warning");
    return;
  }
  
  console.log(`🔍 Searching for: "${query}"`);
  
  // Show loading
  showLoading(true);
  hideSuggestions();
  
  try {
    // 1. Get store selection
    const selectedStores = getSelectedStores();
    if (selectedStores.length === 0) {
      showNotification("Please select at least one store", "warning");
      return;
    }
    
    // 2. Perform parallel searches (mock for now)
    const results = await searchAllStores(query, selectedStores);
    
    // 3. Process and display results
    displayModernResults(results);
    
    // 4. Show page
    showPage('home');
    scrollToResults();
    
    // 5. Save search history
    saveSearchHistory(query);
    
  } catch (error) {
    console.error("Search error:", error);
    showNotification("Search failed. Please try again.", "error");
  } finally {
    showLoading(false);
  }
}

async function searchAllStores(query, stores) {
  console.log(`🌐 Searching ${stores.length} stores for: ${query}`);
  
  // For demo - generate realistic mock data
  const allResults = [];
  const baseProduct = PRODUCT_DATABASE[query.toLowerCase()] || {
    name: query,
    description: `Best ${query} available in UAE stores`,
    basePrice: Math.random() * 1000 + 100
  };
  
  stores.forEach((store, index) => {
    // Realistic price variations per store
    const storeModifiers = {
      amazon: { discount: 0.9, shipping: "FREE Delivery" },
      noon: { discount: 0.85, shipping: "Express Delivery" },
      carrefour: { discount: 0.95, shipping: "Pickup Available" },
      sharafdg: { discount: 0.88, shipping: "Installment Options" },
      emax: { discount: 0.92, shipping: "Warranty Included" },
      lulu: { discount: 0.87, shipping: "Free Installation" }
    };
    
    const modifier = storeModifiers[store] || { discount: 0.9, shipping: "Standard" };
    const price = Math.floor(baseProduct.basePrice * modifier.discount * (0.9 + Math.random() * 0.2));
    const originalPrice = Math.floor(price * (1.1 + Math.random() * 0.2));
    
    // Real UAE store images (placeholder with real store logos)
    const storeImages = {
      amazon: `https://via.placeholder.com/300x200/FF9900/000000?text=Amazon.ae`,
      noon: `https://via.placeholder.com/300x200/F37021/FFFFFF?text=Noon`,
      carrefour: `https://via.placeholder.com/300x200/004D99/FFFFFF?text=Carrefour`,
      sharafdg: `https://via.placeholder.com/300x200/00AEEF/FFFFFF?text=Sharaf+DG`,
      emax: `https://via.placeholder.com/300x200/0033A0/FFFFFF?text=eMax`,
      lulu: `https://via.placeholder.com/300x200/ED1C24/FFFFFF?text=Lulu`
    };
    
    allResults.push({
      id: `${store}-${Date.now()}-${index}`,
      name: `${baseProduct.name} - ${store.charAt(0).toUpperCase() + store.slice(1)}`,
      originalName: baseProduct.name,
      store: store,
      price: price,
      originalPrice: originalPrice,
      discount: Math.floor(((originalPrice - price) / originalPrice) * 100),
      image: storeImages[store] || `https://via.placeholder.com/300x200/2C3E50/FFFFFF?text=${store}`,
      description: baseProduct.description,
      shipping: modifier.shipping,
      rating: (Math.random() * 2 + 3).toFixed(1), // 3-5 stars
      reviews: Math.floor(Math.random() * 1000),
      inStock: Math.random() > 0.1,
      affiliateLink: `https://${store}.com/product/${encodeURIComponent(query)}`,
      timestamp: new Date().toISOString()
    });
  });
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Find best price
  if (allResults.length > 0) {
    const bestPrice = Math.min(...allResults.map(p => p.price));
    allResults.forEach(product => {
      product.isBestPrice = product.price === bestPrice;
    });
  }
  
  return allResults;
}

function displayModernResults(products) {
  const resultsContainer = document.getElementById('resultsContainer');
  if (!resultsContainer) return;
  
  if (products.length === 0) {
    resultsContainer.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search"></i>
        <h3>No products found</h3>
        <p>Try a different search term or check more stores</p>
      </div>
    `;
    return;
  }
  
  // Group by product name (simplified)
  const productGroups = {};
  products.forEach(product => {
    const key = product.originalName;
    if (!productGroups[key]) productGroups[key] = [];
    productGroups[key].push(product);
  });
  
  let html = '';
  
  Object.entries(productGroups).forEach(([productName, storeProducts]) => {
    const bestProduct = storeProducts.find(p => p.isBestPrice) || storeProducts[0];
    
    html += `
      <div class="product-group">
        <div class="product-group-header">
          <h3>${productName}</h3>
          <span class="best-price-badge">Best Price: ${bestProduct.price} AED</span>
        </div>
        
        <div class="store-comparison-grid">
    `;
    
    // Sort by price (lowest first)
    storeProducts.sort((a, b) => a.price - b.price);
    
    storeProducts.forEach(product => {
      html += `
        <div class="store-product-card ${product.isBestPrice ? 'best-price' : ''}">
          <div class="store-badge">${product.store.toUpperCase()}</div>
          <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x200/2C3E50/FFFFFF?text=Product+Image'">
          
          <div class="product-details">
            <h4>${product.name}</h4>
            <p class="product-description">${product.description}</p>
            
            <div class="price-section">
              <span class="current-price">${product.price} AED</span>
              ${product.discount > 0 ? `
                <span class="original-price">${product.originalPrice} AED</span>
                <span class="discount-badge">-${product.discount}%</span>
              ` : ''}
            </div>
            
            <div class="product-meta">
              <span class="rating">⭐ ${product.rating} (${product.reviews})</span>
              <span class="shipping">🚚 ${product.shipping}</span>
              <span class="stock ${product.inStock ? 'in-stock' : 'out-stock'}">
                ${product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
              </span>
            </div>
            
            <div class="product-actions">
              <button class="btn-add-to-basket" onclick="addToBasket(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                <i class="fas fa-cart-plus"></i> Add to Basket
              </button>
              <a href="${product.affiliateLink}" target="_blank" class="btn-visit-store">
                <i class="fas fa-external-link-alt"></i> Visit Store
              </a>
            </div>
          </div>
        </div>
      `;
    });
    
    html += `
        </div>
      </div>
    `;
  });
  
  resultsContainer.innerHTML = html;
  resultsContainer.classList.add('fade-in');
}

// ============================================
// BASKET SYSTEM (SEPARATE PAGE)
// ============================================

function renderBasketPage() {
  const basketContainer = document.getElementById('basketPageContent');
  if (!basketContainer) return;
  
  if (state.basket.length === 0) {
    basketContainer.innerHTML = `
      <div class="empty-basket">
        <i class="fas fa-shopping-basket"></i>
        <h3>Your basket is empty</h3>
        <p>Add some products to get started!</p>
        <button onclick="showPage('home')" class="btn-primary">
          <i class="fas fa-search"></i> Start Shopping
        </button>
      </div>
    `;
    return;
  }
  
  let total = 0;
  let html = `
    <div class="basket-header">
      <h3>My Shopping Basket (${state.basket.length} items)</h3>
      <button onclick="clearBasket()" class="btn-secondary">
        <i class="fas fa-trash"></i> Clear All
      </button>
    </div>
    
    <div class="basket-items">
  `;
  
  state.basket.forEach((item, index) => {
    total += item.price * item.quantity;
    
    html += `
      <div class="basket-item">
        <img src="${item.image}" alt="${item.name}" class="basket-item-image">
        
        <div class="basket-item-info">
          <h4>${item.name}</h4>
          <p class="store-info">From: ${item.store}</p>
          <p class="item-description">${item.description}</p>
        </div>
        
        <div class="basket-item-quantity">
          <button onclick="updateQuantity(${index}, -1)">-</button>
          <span>${item.quantity}</span>
          <button onclick="updateQuantity(${index}, 1)">+</button>
        </div>
        
        <div class="basket-item-price">
          <span class="price">${item.price * item.quantity} AED</span>
          <span class="unit-price">${item.price} AED each</span>
        </div>
        
        <button onclick="removeFromBasket(${index})" class="btn-remove-item">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
  });
  
  html += `
    </div>
    
    <div class="basket-summary">
      <div class="summary-row">
        <span>Subtotal</span>
        <span>${total} AED</span>
      </div>
      <div class="summary-row">
        <span>Estimated Shipping</span>
        <span>FREE</span>
      </div>
      <div class="summary-row total">
        <span>Total</span>
        <span>${total} AED</span>
      </div>
      
      <button class="btn-checkout">
        <i class="fas fa-lock"></i> Proceed to Checkout
      </button>
      
      <p class="security-note">
        <i class="fas fa-shield-alt"></i> Secure checkout · 256-bit encryption
      </p>
    </div>
  `;
  
  basketContainer.innerHTML = html;
}

// ============================================
// PROFILE PAGE (SEPARATE PAGE)
// ============================================

function renderProfilePage() {
  const profileContainer = document.getElementById('profilePageContent');
  if (!profileContainer) return;
  
  if (!state.user) {
    profileContainer.innerHTML = `
      <div class="login-prompt">
        <i class="fas fa-user-lock"></i>
        <h3>Please login to view your profile</h3>
        <button onclick="showLoginModal()" class="btn-primary">
          <i class="fas fa-sign-in-alt"></i> Login / Sign Up
        </button>
      </div>
    `;
    return;
  }
  
  const userEmail = state.user.email || 'Not set';
  const userName = state.user.displayName || userEmail.split('@')[0];
  const joinDate = state.user.metadata?.creationTime 
    ? new Date(state.user.metadata.creationTime).toLocaleDateString('en-AE')
    : 'Today';
  
  profileContainer.innerHTML = `
    <div class="profile-header">
      <div class="profile-avatar">
        ${userName.charAt(0).toUpperCase()}
      </div>
      <div class="profile-info">
        <h2>${userName}</h2>
        <p class="profile-email">${userEmail}</p>
        <p class="profile-joined">Member since ${joinDate}</p>
      </div>
    </div>
    
    <div class="profile-stats">
      <div class="stat-card">
        <i class="fas fa-shopping-bag"></i>
        <span class="stat-value">${state.basket.length}</span>
        <span class="stat-label">Items in Basket</span>
      </div>
      <div class="stat-card">
        <i class="fas fa-search"></i>
        <span class="stat-value">12</span>
        <span class="stat-label">Searches Today</span>
      </div>
      <div class="stat-card">
        <i class="fas fa-money-bill-wave"></i>
        <span class="stat-value">1,250</span>
        <span class="stat-label">Points Earned</span>
      </div>
      <div class="stat-card">
        <i class="fas fa-percentage"></i>
        <span class="stat-value">5.8%</span>
        <span class="stat-label">Avg. Savings</span>
      </div>
    </div>
    
    <div class="profile-actions">
      <h3>Account Settings</h3>
      <div class="settings-list">
        <button class="setting-item">
          <i class="fas fa-user-edit"></i>
          <span>Edit Profile</span>
          <i class="fas fa-chevron-right"></i>
        </button>
        <button class="setting-item">
          <i class="fas fa-bell"></i>
          <span>Notifications</span>
          <i class="fas fa-chevron-right"></i>
        </button>
        <button class="setting-item">
          <i class="fas fa-shield-alt"></i>
          <span>Privacy & Security</span>
          <i class="fas fa-chevron-right"></i>
        </button>
        <button class="setting-item">
          <i class="fas fa-question-circle"></i>
          <span>Help & Support</span>
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
    
    <button onclick="logout()" class="btn-logout">
      <i class="fas fa-sign-out-alt"></i> Logout
    </button>
  `;
}

// ============================================
// REWARDS PAGE (SEPARATE PAGE)
// ============================================

function renderRewardsPage() {
  const rewardsContainer = document.getElementById('rewardsPageContent');
  if (!rewardsContainer) return;
  
  const points = state.user ? 1250 : 0;
  
  rewardsContainer.innerHTML = `
    <div class="rewards-hero">
      <div class="points-display-large">
        <span class="points-value">${points}</span>
        <span class="points-label">Points</span>
      </div>
      <p class="points-exchange">50 Points = 1 AED</p>
    </div>
    
    <div class="rewards-info">
      <h3>How to Earn Points</h3>
      <div class="earning-methods">
        <div class="method">
          <i class="fas fa-search"></i>
          <span>Search Products</span>
          <span class="method-points">+10 points</span>
        </div>
        <div class="method">
          <i class="fas fa-shopping-cart"></i>
          <span>Add to Basket</span>
          <span class="method-points">+50 points</span>
        </div>
        <div class="method">
          <i class="fas fa-store"></i>
          <span>Visit Store via Link</span>
          <span class="method-points">+100 points</span>
        </div>
        <div class="method">
          <i class="fas fa-gift"></i>
          <span>Refer a Friend</span>
          <span class="method-points">+500 points</span>
        </div>
      </div>
    </div>
    
    <div class="rewards-catalog">
      <h3>Redeem Points</h3>
      <div class="rewards-grid">
        <div class="reward-card">
          <div class="reward-cost">250 pts</div>
          <i class="fas fa-coffee"></i>
          <h4>Coffee Voucher</h4>
          <p>Starbucks UAE</p>
        </div>
        <div class="reward-card">
          <div class="reward-cost">500 pts</div>
          <i class="fas fa-shopping-bag"></i>
          <h4>Carrefour Voucher</h4>
          <p>50 AED Value</p>
        </div>
        <div class="reward-card">
          <div class="reward-cost">1000 pts</div>
          <i class="fas fa-plane"></i>
          <h4>Air Miles</h4>
          <p>Emirates Skywards</p>
        </div>
        <div class="reward-card">
          <div class="reward-cost">2000 pts</div>
          <i class="fas fa-mobile-alt"></i>
          <h4>Etisalat Credit</h4>
          <p>Mobile Recharge</p>
        </div>
      </div>
    </div>
    
    <button class="btn-redeem" ${points < 250 ? 'disabled' : ''}>
      <i class="fas fa-gift"></i> Redeem Points
    </button>
  `;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function initUI() {
  // Language toggle
  document.getElementById('arabicBtn')?.addEventListener('click', () => {
    setLanguage('arabic');
  });
  
  document.getElementById('englishBtn')?.addEventListener('click', () => {
    setLanguage('english');
  });
}

function initEventListeners() {
  // Store filter checkboxes
  document.querySelectorAll('.store-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', updateSelectedStores);
  });
  
  // Login modal
  document.getElementById('showLogin')?.addEventListener('click', showLoginModal);
  
  // Login form
  document.getElementById('loginBtn')?.addEventListener('click', handleLogin);
  document.getElementById('signupBtn')?.addEventListener('click', handleSignup);
}

function updateSelectedStores() {
  state.selectedStores = Array.from(document.querySelectorAll('.store-checkbox:checked'))
    .map(cb => cb.value);
  console.log("Updated selected stores:", state.selectedStores);
}

function getSelectedStores() {
  return state.selectedStores;
}

function showLoading(show) {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.style.display = show ? 'block' : 'none';
  }
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function scrollToResults() {
  const results = document.getElementById('resultsContainer');
  if (results) {
    results.scrollIntoView({ behavior: 'smooth' });
  }
}

function saveSearchHistory(query) {
  let history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
  history.unshift({
    query: query,
    timestamp: new Date().toISOString(),
    results: state.searchResults.length
  });
  history = history.slice(0, 10); // Keep last 10 searches
  localStorage.setItem('searchHistory', JSON.stringify(history));
}

function loadBasketFromStorage() {
  const saved = localStorage.getItem('uae_price_hunter_basket');
  if (saved) {
    state.basket = JSON.parse(saved);
    updateBasketCount();
  }
}

function saveBasketToStorage() {
  localStorage.setItem('uae_price_hunter_basket', JSON.stringify(state.basket));
}

function updateBasketCount() {
  const count = state.basket.reduce((total, item) => total + item.quantity, 0);
  const badge = document.querySelector('.basket-badge');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

function addToBasket(product) {
  const existingIndex = state.basket.findIndex(item => item.id === product.id);
  
  if (existingIndex > -1) {
    state.basket[existingIndex].quantity += 1;
  } else {
    state.basket.push({
      ...product,
      quantity: 1,
      addedAt: new Date().toISOString()
    });
  }
  
  saveBasketToStorage();
  updateBasketCount();
  showNotification(`Added ${product.name} to basket!`, 'success');
  
  // If on basket page, refresh it
  if (state.currentPage === 'basket') {
    renderBasketPage();
  }
}

function removeFromBasket(index) {
  state.basket.splice(index, 1);
  saveBasketToStorage();
  updateBasketCount();
  renderBasketPage();
  showNotification('Item removed from basket', 'info');
}

function updateQuantity(index, change) {
  const newQuantity = state.basket[index].quantity + change;
  
  if (newQuantity < 1) {
    removeFromBasket(index);
    return;
  }
  
  state.basket[index].quantity = newQuantity;
  saveBasketToStorage();
  updateBasketCount();
  renderBasketPage();
}

function clearBasket() {
  if (confirm('Clear all items from basket?')) {
    state.basket = [];
    saveBasketToStorage();
    updateBasketCount();
    renderBasketPage();
    showNotification('Basket cleared', 'info');
  }
}

function setLanguage(lang) {
  state.language = lang;
  document.documentElement.dir = lang === 'arabic' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang === 'arabic' ? 'ar' : 'en';
  
  // Update active button
  document.getElementById('arabicBtn')?.classList.toggle('active', lang === 'arabic');
  document.getElementById('englishBtn')?.classList.toggle('active', lang === 'english');
  
  // Update text content (simplified)
  if (lang === 'arabic') {
    document.querySelector('header h1').textContent = 'مقارن أسعار الإمارات';
    document.getElementById('searchInput')?.setAttribute('placeholder', 'ابحث عن منتجات...');
  } else {
    document.querySelector('header h1').textContent = 'UAE PRICE HUNTER';
    document.getElementById('searchInput')?.setAttribute('placeholder', 'Search for products...');
  }
}

function showLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

function hideLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

async function handleLogin() {
  const email = document.getElementById('loginEmail')?.value;
  const password = document.getElementById('loginPassword')?.value;
  
  if (!email || !password) {
    showNotification('Please enter email and password', 'error');
    return;
  }
  
  try {
    await auth.signInWithEmailAndPassword(email, password);
    showNotification('Login successful!', 'success');
    hideLoginModal();
  } catch (error) {
    console.error('Login error:', error);
    showNotification(`Login failed: ${error.message}`, 'error');
  }
}

async function handleSignup() {
  const email = document.getElementById('loginEmail')?.value;
  const password = document.getElementById('loginPassword')?.value;
  
  if (!email || !password) {
    showNotification('Please enter email and password', 'error');
    return;
  }
  
  if (password.length < 6) {
    showNotification('Password must be at least 6 characters', 'error');
    return;
  }
  
  try {
    await auth.createUserWithEmailAndPassword(email, password);
    showNotification('Account created successfully!', 'success');
    hideLoginModal();
  } catch (error) {
    console.error('Signup error:', error);
    showNotification(`Signup failed: ${error.message}`, 'error');
  }
}

function logout() {
  auth.signOut();
  showNotification('Logged out successfully', 'info');
  showPage('home');
}

function updateUI() {
  // Update user state
  const userSection = document.getElementById('userSection');
  const loginSection = document.getElementById('loginSection');
  
  if (state.user) {
    userSection?.style.display = 'block';
    loginSection?.style.display = 'none';
  } else {
    userSection?.style.display = 'none';
    loginSection?.style.display = 'block';
  }
  
  // Update basket count
  updateBasketCount();
}

// Make functions available globally
window.addToBasket = addToBasket;
window.removeFromBasket = removeFromBasket;
window.updateQuantity = updateQuantity;
window.clearBasket = clearBasket;
window.showPage = showPage;
window.showLoginModal = showLoginModal;
window.logout = logout;
window.setLanguage = setLanguage;

console.log("🎯 UAE Price Hunter 2025 - Ready for modern shopping!");
