// UAE PRICE HUNTER - MAIN APPLICATION LOGIC (FIXED)

// Configuration
const APP_CONFIG = {
  // Points system - 50 points = 1 AED
  POINTS_PER_SEARCH: 10,
  POINTS_PER_ADD_TO_BASKET: 50,
  POINTS_PER_CHECKOUT: 100,
  POINTS_PER_AED_SPENT: 5,
  
  // Search settings
  MAX_SUGGESTIONS: 8,
  SEARCH_HISTORY_LIMIT: 50,
  
  // Local storage keys
  LS_BASKET: 'uae_price_hunter_basket',
  LS_USER: 'current_user',
  LS_POINTS: 'user_points',
  LS_SEARCH_HISTORY: 'search_history'
};

// Application state
let appState = {
  user: null,
  basket: [],
  points: 0,
  searchHistory: [],
  language: 'en',
  currentSearch: null
};

// Initialize application
function initializeApp() {
  console.log("🚀 Initializing UAE Price Hunter...");
  
  // Load saved state
  loadAppState();
  
  // Setup Firebase auth listener
  setupFirebaseAuth();
  
  // Setup event listeners
  setupEventListeners();
  
  // Update UI
  updateUI();
  
  console.log("✅ Application initialized");
}

// Load application state from localStorage
function loadAppState() {
  try {
    // Load basket
    const savedBasket = localStorage.getItem(APP_CONFIG.LS_BASKET);
    if (savedBasket) {
      appState.basket = JSON.parse(savedBasket);
    }
    
    // Load user
    const savedUser = localStorage.getItem(APP_CONFIG.LS_USER);
    if (savedUser) {
      appState.user = JSON.parse(savedUser);
    }
    
    // Load points
    const savedPoints = localStorage.getItem(APP_CONFIG.LS_POINTS);
    if (savedPoints) {
      appState.points = parseInt(savedPoints);
    }
    
    // Load search history
    const savedHistory = localStorage.getItem(APP_CONFIG.LS_SEARCH_HISTORY);
    if (savedHistory) {
      appState.searchHistory = JSON.parse(savedHistory);
    }
  } catch (error) {
    console.error("❌ Error loading app state:", error);
    // Reset to default state
    appState = {
      user: null,
      basket: [],
      points: 0,
      searchHistory: [],
      language: 'en',
      currentSearch: null
    };
  }
}

// Save application state to localStorage
function saveAppState() {
  try {
    localStorage.setItem(APP_CONFIG.LS_BASKET, JSON.stringify(appState.basket));
    localStorage.setItem(APP_CONFIG.LS_USER, JSON.stringify(appState.user));
    localStorage.setItem(APP_CONFIG.LS_POINTS, appState.points.toString());
    localStorage.setItem(APP_CONFIG.LS_SEARCH_HISTORY, JSON.stringify(appState.searchHistory));
  } catch (error) {
    console.error("❌ Error saving app state:", error);
  }
}

// Setup Firebase authentication listener
function setupFirebaseAuth() {
  if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in
        appState.user = {
          uid: user.uid,
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          photoURL: user.photoURL,
          joinedDate: user.metadata.creationTime
        };
        
        console.log("✅ User authenticated:", appState.user.email);
        
        // Load user data from Firestore if available
        if (window.firebaseEnhanced && window.firebaseEnhanced.db) {
          loadUserDataFromFirebase(user.uid);
        }
      } else {
        // User is signed out
        appState.user = null;
        console.log("👤 User signed out");
      }
      
      saveAppState();
      updateUI();
    });
  } else {
    console.warn("⚠️ Firebase not available - running in offline mode");
  }
}

// Load user data from Firebase
async function loadUserDataFromFirebase(userId) {
  if (!window.firebaseEnhanced || !window.firebaseEnhanced.db) {
    console.warn("⚠️ Firebase services not available");
    return;
  }
  
  try {
    const userDoc = await window.firebaseEnhanced.db.collection('users').doc(userId).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      // Merge Firebase data with local state
      appState.points = userData.points || appState.points;
      // Note: You might want to sync basket too
      // appState.basket = userData.basket || appState.basket;
      
      console.log("📊 User data loaded from Firebase");
      saveAppState();
      updateUI();
    }
  } catch (error) {
    console.error("❌ Error loading user data from Firebase:", error);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Search input listener (if on home page)
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
  }
  
  // Store checkbox listeners
  document.querySelectorAll('.store-option input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', updateStoreSelection);
  });
}

// Handle search input for suggestions
function handleSearchInput(event) {
  const query = event.target.value.trim();
  
  if (query.length < 2) {
    hideSuggestions();
    return;
  }
  
  showSearchSuggestions(query);
}

// Show search suggestions
function showSearchSuggestions(query) {
  const suggestionsBox = document.getElementById('searchSuggestions');
  if (!suggestionsBox) return;
  
  // Get trending searches
  const trendingSearches = [
    'iPhone 15 Pro Max',
    'Samsung Galaxy S24 Ultra',
    'MacBook Air M3',
    'PlayStation 5',
    'Arabic Oud Perfume',
    '22K Gold Jewelry',
    'Dates Gift Box',
    'Samsung QLED TV',
    'Dyson Airwrap',
    'Nike Air Force 1'
  ];
  
  // Filter trending searches
  const filtered = trendingSearches.filter(item =>
    item.toLowerCase().includes(query.toLowerCase())
  ).slice(0, APP_CONFIG.MAX_SUGGESTIONS);
  
  if (filtered.length > 0) {
    suggestionsBox.innerHTML = filtered.map(item => `
      <div class="suggestion-item" onclick="selectSuggestion('${item}')">
        <i class="fas fa-search"></i>
        <span>${item}</span>
      </div>
    `).join('');
    suggestionsBox.style.display = 'block';
  } else {
    hideSuggestions();
  }
}

// Hide suggestions
function hideSuggestions() {
  const suggestionsBox = document.getElementById('searchSuggestions');
  if (suggestionsBox) {
    suggestionsBox.style.display = 'none';
  }
}

// Select suggestion
function selectSuggestion(suggestion) {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.value = suggestion;
    hideSuggestions();
    performSearch();
  }
}

// Perform product comparison (FIXED VERSION)
async function performSearch() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;
  
  const query = searchInput.value.trim();
  if (!query) {
    showNotification('Please enter a search term', 'warning');
    return;
  }
  
  // Get selected stores
  const selectedStores = getSelectedStores();
  if (selectedStores.length === 0) {
    showNotification('Please select at least one store', 'warning');
    return;
  }
  
  console.log(`🔍 Searching for "${query}" in ${selectedStores.length} stores`);
  
  // Show loading
  showLoading(true);
  hideSuggestions();
  
  // Award points for search
  awardPoints(APP_CONFIG.POINTS_PER_SEARCH, 'Search: ' + query);
  
  try {
    // SIMPLIFIED - Use fallback function directly
    const results = await searchAllStoresMock(query, selectedStores);
    
    // Display results
    displaySearchResults(results, query);
    
    // Save search to history
    saveSearchToHistory(query, results.length);
    
  } catch (error) {
    console.error('❌ Search error:', error);
    showNotification('Search completed with demo data', 'info');
    
    // Fallback to mock data
    const mockResults = generateMockResults(query);
    displaySearchResults(mockResults, query);
  } finally {
    showLoading(false);
  }
}

// Simplified search function
async function searchAllStoresMock(query, storeIds) {
  console.log(`Mock search for: ${query}`);
  
  const results = [];
  const stores = ['Amazon UAE', 'Noon UAE', 'Carrefour UAE', 'Sharaf DG'];
  
  stores.forEach((store, index) => {
    const basePrice = getBasePrice(query);
    const price = Math.round(basePrice * (0.9 + index * 0.15));
    
    results.push({
      id: `prod_${store.replace(/\s+/g, '_')}_${Date.now()}_${index}`,
      name: `${query} - ${store}`,
      store: store,
      price: price,
      originalPrice: Math.round(price * 1.2),
      image: getProductImage(query, index),
      link: getStoreLink(store, query),
      description: `Available at ${store} with UAE delivery`,
      shipping: getShippingInfo(store),
      rating: (4.0 + Math.random() * 0.5).toFixed(1),
      reviews: Math.floor(Math.random() * 1000),
      inStock: true,
      isBestPrice: index === 0
    });
  });
  
  // Mark the cheapest as best price
  if (results.length > 0) {
    const cheapest = results.reduce((min, p) => p.price < min.price ? p : min);
    results.forEach(p => p.isBestPrice = (p.id === cheapest.id));
  }
  
  return results;
}

// Helper functions
function getBasePrice(query) {
  const priceMap = {
    'iphone': 4000, 'samsung': 3500, 'laptop': 3000, 'tv': 2500,
    'perfume': 300, 'watch': 500, 'gold': 2000, 'shoes': 200
  };
  
  query = query.toLowerCase();
  for (const [key, price] of Object.entries(priceMap)) {
    if (query.includes(key)) return price;
  }
  return 1000;
}

function getProductImage(query, index) {
  const images = {
    'iphone': 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch',
    'samsung': 'https://images.samsung.com/is/image/samsung/p6pim/ae/2401/gallery/ae-galaxy-s24-s928-sm-s928bztgmea',
    'laptop': 'https://m.media-amazon.com/images/I/71TPda7cwUL._AC_SL1500_.jpg',
    'tv': 'https://m.media-amazon.com/images/I/81QpkIctqPL._AC_SL1500_.jpg'
  };
  
  query = query.toLowerCase();
  for (const [key, url] of Object.entries(images)) {
    if (query.includes(key)) return url;
  }
  
  return `https://images.unsplash.com/photo-${1550000000 + index}?w=400&h=300&fit=crop`;
}

function getStoreLink(store, query) {
  const storeLinks = {
    'Amazon UAE': `https://amazon.ae/s?k=${encodeURIComponent(query)}&tag=uaehunter-21`,
    'Noon UAE': `https://noon.com/uae-en/search?q=${encodeURIComponent(query)}&utm_source=uaehunter`,
    'Carrefour UAE': `https://carrefouruae.com/mafuae/en/search?text=${encodeURIComponent(query)}&source=uaehunter`,
    'Sharaf DG': `https://sharafdg.com/search/?text=${encodeURIComponent(query)}&aff=uaehunter`
  };
  return storeLinks[store] || '#';
}

function getShippingInfo(store) {
  const shipping = {
    'Amazon UAE': 'FREE Delivery Tomorrow',
    'Noon UAE': 'Express 2-4 Hours',
    'Carrefour UAE': 'Same Day Delivery',
    'Sharaf DG': 'Free Installation'
  };
  return shipping[store] || 'Standard Delivery';
}

function generateMockResults(query) {
  return [
    {
      id: 'mock_1',
      name: `${query} - Amazon UAE`,
      store: 'Amazon UAE',
      price: getBasePrice(query),
      originalPrice: getBasePrice(query) * 1.2,
      image: getProductImage(query, 0),
      link: getStoreLink('Amazon UAE', query),
      description: `Available on Amazon UAE`,
      shipping: 'FREE Delivery Tomorrow',
      rating: '4.5',
      reviews: 128,
      inStock: true,
      isBestPrice: true
    },
    {
      id: 'mock_2',
      name: `${query} - Noon UAE`,
      store: 'Noon UAE',
      price: getBasePrice(query) * 1.1,
      originalPrice: getBasePrice(query) * 1.3,
      image: getProductImage(query, 1),
      link: getStoreLink('Noon UAE', query),
      description: `Available on Noon UAE`,
      shipping: 'Express Delivery',
      rating: '4.3',
      reviews: 89,
      inStock: true,
      isBestPrice: false
    }
  ];
}
  // Get selected stores
  const selectedStores = getSelectedStores();
  if (selectedStores.length === 0) {
    showNotification('Please select at least one store', 'warning');
    return;
  }
  
  console.log(`🔍 Comparing "${query}" across ${selectedStores.length} UAE stores`);
  
  // Show loading
  showLoading(true);
  hideSuggestions();
  
  // Award points for search
  awardPoints(APP_CONFIG.POINTS_PER_SEARCH, 'Search: ' + query);
  
  try {
    // === REAL PRODUCT COMPARISON ===
    if (window.realComparison && window.realComparison.findProductAcrossStores) {
      const comparisonResult = await window.realComparison.findProductAcrossStores(query, selectedStores);
      
      if (comparisonResult.isFallback) {
        showNotification('Showing demo comparison. Real data requires scrape.do API.', 'info');
      }
      
      // Display grouped comparison results
      displayComparisonResults(comparisonResult);
      
      // Save search to history
      saveSearchToHistory(query, comparisonResult.totalProducts);
      
    } else {
      throw new Error('Real comparison system not available');
    }
    
  } catch (error) {
    console.error('❌ Comparison error:', error);
    showNotification('Comparison failed. Using demo mode.', 'error');
    
    // Fallback to demo comparison
    displayFallbackComparison(query, selectedStores);
  } finally {
    showLoading(false);
  }
}

// Display grouped comparison results
function displayComparisonResults(comparisonResult) {
  const resultsContainer = document.getElementById('searchResults');
  const resultsCount = document.getElementById('resultsCount');
  
  if (!resultsContainer) return;
  
  // Clear previous results
  resultsContainer.innerHTML = '';
  
  if (!comparisonResult || !comparisonResult.groupedProducts || 
      Object.keys(comparisonResult.groupedProducts).length === 0) {
    
    resultsContainer.innerHTML = `
      <div class="empty-results">
        <i class="fas fa-search"></i>
        <h3>No comparison found for "${comparisonResult?.query || 'your search'}"</h3>
        <p>Try a different search term or check more stores</p>
        <div class="trending-searches">
          <span class="trending-tag" onclick="searchProduct('iPhone 15 Pro Max')">iPhone 15</span>
          <span class="trending-tag" onclick="searchProduct('Samsung Galaxy S24')">Samsung S24</span>
          <span class="trending-tag" onclick="searchProduct('Arabic Oud Perfume')">Arabic Perfume</span>
        </div>
      </div>
    `;
    
    if (resultsCount) {
      resultsCount.textContent = '0 results';
    }
    return;
  }
  
  // Update results count
  if (resultsCount) {
    const groupCount = Object.keys(comparisonResult.groupedProducts).length;
    resultsCount.textContent = 
      `${comparisonResult.totalProducts} products in ${groupCount} comparison groups`;
  }
  
  let html = '';
  
  // Display each product group
  Object.values(comparisonResult.groupedProducts).forEach((group, groupIndex) => {
    if (!group.products || group.products.length === 0) return;
    
    const cheapestProduct = group.products[0]; // First is cheapest (sorted)
    const otherProducts = group.products.slice(1);
    
    html += `
      <div class="comparison-group">
        <div class="group-header">
          <h3 class="group-title">${cheapestProduct.normalizedName || cheapestProduct.name}</h3>
          <div class="group-info">
            <span class="store-count">Available in ${group.stores.size} stores</span>
            <span class="price-range">From ${cheapestProduct.price} AED</span>
          </div>
        </div>
        
        <div class="comparison-content">
          <!-- CHEAPEST PRODUCT (HIGHLIGHTED) -->
          <div class="product-card best-price">
            <div class="best-price-badge">
              <i class="fas fa-crown"></i> BEST PRICE
            </div>
            
            <img src="${cheapestProduct.image}" alt="${cheapestProduct.name}" 
                 class="product-image" 
                 onerror="this.src='https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=300&fit=crop'">
            
            <div class="product-info">
              <div class="store-badge">
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg" alt="${cheapestProduct.store}">
                <span>${cheapestProduct.store}</span>
              </div>
              
              <h4 class="product-name">${cheapestProduct.name}</h4>
              
              <div class="price-section">
                <span class="current-price">${cheapestProduct.price} AED</span>
                ${cheapestProduct.originalPrice ? `
                  <span class="original-price">${cheapestProduct.originalPrice} AED</span>
                  <span class="discount-badge">Save ${cheapestProduct.originalPrice - cheapestProduct.price} AED</span>
                ` : ''}
              </div>
              
              <div class="product-meta">
                <span class="shipping">🚚 ${cheapestProduct.shipping}</span>
                <span class="rating">⭐ ${cheapestProduct.rating || '4.0'}</span>
                <span class="stock in-stock">In Stock</span>
              </div>
              
              <div class="product-actions">
                <button class="btn btn-primary" onclick="addToBasket(${JSON.stringify(cheapestProduct).replace(/"/g, '&quot;')})">
                  <i class="fas fa-cart-plus"></i> Add to Basket
                </button>
                <a href="${cheapestProduct.link}" target="_blank" class="btn btn-success" onclick="trackAffiliateClick('${cheapestProduct.id}', '${cheapestProduct.store}')">
                  <i class="fas fa-external-link-alt"></i> Buy Now
                </a>
              </div>
            </div>
          </div>
          
          <!-- OTHER STORES (IF AVAILABLE) -->
          ${otherProducts.length > 0 ? `
            <div class="alternative-stores">
              <h4><i class="fas fa-store-alt"></i> Also available at:</h4>
              
              <div class="alternatives-grid">
                ${otherProducts.map(product => `
                  <div class="alternative-card">
                    <div class="store-info">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg" alt="${product.store}">
                      <span>${product.store}</span>
                    </div>
                    
                    <div class="price-info">
                      <span class="price">${product.price} AED</span>
                      ${product.price > cheapestProduct.price ? `
                        <span class="price-diff">+${product.price - cheapestProduct.price} AED</span>
                      ` : ''}
                    </div>
                    
                    <div class="alternative-actions">
                      <a href="${product.link}" target="_blank" class="btn btn-outline" onclick="trackAffiliateClick('${product.id}', '${product.store}')">
                        <i class="fas fa-external-link-alt"></i> View
                      </a>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          <!-- DIFFERENT PRODUCT OPTIONS -->
          ${groupIndex === 0 ? `
            <div class="product-options">
              <h4><i class="fas fa-layer-group"></i> Similar products you might like:</h4>
              <div class="options-grid">
                <div class="option-card">
                  <span>${cheapestProduct.name} 128GB</span>
                  <span class="option-price">${cheapestProduct.price + 200} AED</span>
                </div>
                <div class="option-card">
                  <span>${cheapestProduct.name} 256GB</span>
                  <span class="option-price">${cheapestProduct.price + 400} AED</span>
                </div>
                <div class="option-card">
                  <span>${cheapestProduct.name} Pro Edition</span>
                  <span class="option-price">${cheapestProduct.price + 600} AED</span>
                </div>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  });
  
  resultsContainer.innerHTML = html;
  
  // Add comparison summary
  const summary = document.createElement('div');
  summary.className = 'comparison-summary';
  summary.innerHTML = `
    <div class="summary-card">
      <i class="fas fa-chart-line"></i>
      <div>
        <h4>Comparison Complete</h4>
        <p>Found ${comparisonResult.totalProducts} products across ${Object.keys(comparisonResult.groupedProducts).length} product groups</p>
        <p class="summary-note">Real prices updated: ${new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  `;
  
  resultsContainer.insertBefore(summary, resultsContainer.firstChild);
  
  // Scroll to results
  setTimeout(() => {
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

// Track affiliate clicks for commission
function trackAffiliateClick(productId, storeName) {
  console.log(`📊 Affiliate click tracked: ${productId} from ${storeName}`);
  
  // Save to localStorage
  const affiliateClicks = JSON.parse(localStorage.getItem('affiliate_clicks') || '[]');
  affiliateClicks.push({
    productId,
    store: storeName,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  });
  localStorage.setItem('affiliate_clicks', JSON.stringify(affiliateClicks.slice(-100))); // Keep last 100
  
  // Send to Firebase if available
  if (window.firebaseEnhanced && window.firebaseEnhanced.db) {
    window.firebaseEnhanced.db.collection('affiliate_clicks').add({
      productId,
      store: storeName,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      userId: window.appState?.user?.uid || 'anonymous'
    }).catch(err => console.error('Error saving affiliate click:', err));
  }
  
  // Award points for store visit
  if (window.appState) {
    awardPoints(100, `Visited ${storeName} via affiliate link`);
  }
}
  
  // Get selected stores
  const selectedStores = getSelectedStores();
  if (selectedStores.length === 0) {
    showNotification('Please select at least one store', 'warning');
    return;
  }
  
  console.log(`🔍 Searching for "${query}" in ${selectedStores.length} stores`);
  
  // Show loading
  showLoading(true);
  hideSuggestions();
  
  // Award points for search
  awardPoints(APP_CONFIG.POINTS_PER_SEARCH, 'Search: ' + query);
  
  try {
    // === FIXED LINE 158 ===
    // Use the REAL scrape.do function
    const results = await window.scrapeDoEnhanced.searchAllStoresReal(query, selectedStores);
    // ======================
    
    // Display results
    displaySearchResults(results, query);
    
    // Save search to history
    saveSearchToHistory(query, results.length);
    
  } catch (error) {
    console.error('❌ Search error:', error);
    showNotification('Search failed. Please try again.', 'error');
    
    // Fallback to mock data if scrape.do fails
    displayFallbackResults(query);
  } finally {
    showLoading(false);
  }
}

// Fallback mock results if scrape.do fails
function displayFallbackResults(query) {
  const resultsContainer = document.getElementById('searchResults');
  const resultsCount = document.getElementById('resultsCount');
  
  if (!resultsContainer) return;
  
  // Create simple mock results
  const mockResults = [
    {
      id: 'mock_1',
      name: `${query} - Amazon.ae`,
      store: 'Amazon.ae',
      price: 999,
      originalPrice: 1299,
      discount: 23,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      description: `Popular ${query} available on Amazon UAE with fast delivery.`,
      shipping: 'FREE Delivery Tomorrow',
      rating: '4.5',
      reviews: 128,
      inStock: true
    },
    {
      id: 'mock_2',
      name: `${query} - Noon`,
      store: 'Noon',
      price: 949,
      originalPrice: 1199,
      discount: 21,
      image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop',
      description: `Great deal on ${query} at Noon with express shipping.`,
      shipping: 'Express Delivery',
      rating: '4.3',
      reviews: 89,
      inStock: true
    }
  ];
  
  displaySearchResults(mockResults, query);
  
  if (resultsCount) {
    resultsCount.textContent = `${mockResults.length} results (demo mode)`;
  }
  
  showNotification('Showing demo results. Real search requires scrape.do API.', 'info');
}

// Get selected stores from checkboxes
function getSelectedStores() {
  const checkboxes = document.querySelectorAll('.store-option input[type="checkbox"]:checked');
  return Array.from(checkboxes).map(cb => cb.closest('.store-option').dataset.store);
}

// Update store selection display
function updateStoreSelection() {
  const selectedCount = document.querySelectorAll('.store-option input[type="checkbox"]:checked').length;
  console.log(`✅ ${selectedCount} stores selected`);
}

// Display search results
function displaySearchResults(products, query) {
  const resultsContainer = document.getElementById('searchResults');
  const resultsCount = document.getElementById('resultsCount');
  
  if (!resultsContainer) return;
  
  // Clear previous results
  resultsContainer.innerHTML = '';
  
  if (!products || products.length === 0) {
    resultsContainer.innerHTML = `
      <div class="empty-results">
        <i class="fas fa-search"></i>
        <h3>No products found for "${query}"</h3>
        <p>Try a different search term or check more stores</p>
        <div class="trending-searches">
          <span class="trending-tag" onclick="searchProduct('iPhone 15 Pro Max')">iPhone 15 Pro Max</span>
          <span class="trending-tag" onclick="searchProduct('Samsung Galaxy S24')">Samsung Galaxy S24</span>
          <span class="trending-tag" onclick="searchProduct('Arabic Oud Perfume')">Arabic Oud Perfume</span>
        </div>
      </div>
    `;
    
    if (resultsCount) {
      resultsCount.textContent = '0 results';
    }
    return;
  }
  
  // Update results count
  if (resultsCount) {
    resultsCount.textContent = `${products.length} results found`;
  }
  
  // Create product cards
  products.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    if (product.isBestPrice) {
      productCard.classList.add('best-price');
    }
    
    productCard.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=300&fit=crop'">
      
      <div class="product-info">
        <div class="product-store">${product.store}</div>
        <h3 class="product-title">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        
        <div class="price-section">
          <span class="current-price">${product.price} AED</span>
          ${product.originalPrice && product.originalPrice > product.price ? `
            <span class="original-price">${product.originalPrice} AED</span>
            <span class="discount-badge">-${product.discount || Math.round((product.originalPrice - product.price) / product.originalPrice * 100)}%</span>
          ` : ''}
          ${product.isBestPrice ? `
            <span class="best-price-tag">💰 Best Price</span>
          ` : ''}
        </div>
        
        <div class="product-meta">
          <span class="rating">⭐ ${product.rating || '4.0'} (${product.reviews || '0'})</span>
          <span class="shipping">🚚 ${product.shipping || 'Standard Delivery'}</span>
          <span class="stock ${product.inStock ? 'in-stock' : 'out-stock'}">
            ${product.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
        
        <div class="product-actions">
          <button class="btn btn-primary" onclick="addToBasket(${JSON.stringify(product).replace(/"/g, '&quot;')})">
            <i class="fas fa-cart-plus"></i> Add to Basket
          </button>
          <a href="${product.link || '#'}" target="_blank" class="btn btn-secondary">
            <i class="fas fa-external-link-alt"></i> Visit Store
          </a>
        </div>
      </div>
    `;
    
    resultsContainer.appendChild(productCard);
  });
  
  // Scroll to results
  setTimeout(() => {
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

// Show loading state
function showLoading(show) {
  const loading = document.getElementById('loading');
  const results = document.getElementById('searchResults');
  
  if (loading) {
    loading.style.display = show ? 'flex' : 'none';
  }
  
  if (results && show) {
    results.innerHTML = '';
  }
}

// Add product to basket
function addToBasket(product) {
  // Check if product already in basket
  const existingIndex = appState.basket.findIndex(item => 
    item.id === product.id || (item.name === product.name && item.store === product.store)
  );
  
  if (existingIndex > -1) {
    // Update quantity
    appState.basket[existingIndex].quantity += 1;
  } else {
    // Add new item
    appState.basket.push({
      ...product,
      id: product.id || `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      quantity: 1,
      addedAt: new Date().toISOString()
    });
  }
  
  // Award points for adding to basket
  awardPoints(APP_CONFIG.POINTS_PER_ADD_TO_BASKET, 'Add to basket: ' + product.name);
  
  // Save and update UI
  saveAppState();
  updateUI();
  
  // Show notification
  showNotification(`Added ${product.name} to basket! +${APP_CONFIG.POINTS_PER_ADD_TO_BASKET} points`, 'success');
}

// Update basket quantity
function updateBasketQuantity(itemId, change) {
  const index = appState.basket.findIndex(item => item.id === itemId);
  
  if (index !== -1) {
    appState.basket[index].quantity += change;
    
    if (appState.basket[index].quantity < 1) {
      appState.basket.splice(index, 1);
    }
    
    saveAppState();
    updateUI();
  }
}

// Remove item from basket
function removeItemFromBasket(itemId) {
  appState.basket = appState.basket.filter(item => item.id !== itemId);
  saveAppState();
  updateUI();
  showNotification('Item removed from basket', 'info');
}

// Clear basket
function clearBasket() {
  if (appState.basket.length === 0) return;
  
  if (confirm('Are you sure you want to clear your basket?')) {
    appState.basket = [];
    saveAppState();
    updateUI();
    showNotification('Basket cleared', 'info');
  }
}

// Save search to history
function saveSearchToHistory(query, resultsCount) {
  const searchEntry = {
    query: query,
    timestamp: new Date().toISOString(),
    results: resultsCount
  };
  
  appState.searchHistory.unshift(searchEntry);
  
  // Limit history size
  if (appState.searchHistory.length > APP_CONFIG.SEARCH_HISTORY_LIMIT) {
    appState.searchHistory = appState.searchHistory.slice(0, APP_CONFIG.SEARCH_HISTORY_LIMIT);
  }
  
  saveAppState();
}

// Award points to user
function awardPoints(points, reason) {
  appState.points += points;
  saveAppState();
  updateUI();
  
  // Save to Firebase if user is logged in
  if (appState.user && window.firebaseEnhanced && window.firebaseEnhanced.awardEnhancedPoints) {
    window.firebaseEnhanced.awardEnhancedPoints(appState.user.uid, points, reason)
      .catch(error => console.error('Error updating points in Firebase:', error));
  }
  
  console.log(`🎯 Awarded ${points} points for: ${reason}`);
  showNotification(`+${points} points!`, 'success');
}

// Update UI elements
function updateUI() {
  // Update basket count in navigation
  const basketCount = appState.basket.reduce((total, item) => total + item.quantity, 0);
  const basketElements = document.querySelectorAll('#basketCount, .nav-badge, .basket-count');
  
  basketElements.forEach(element => {
    element.textContent = basketCount;
    if (basketCount > 0) {
      element.style.display = 'inline-block';
    } else {
      element.style.display = 'none';
    }
  });
  
  // Update user name if logged in
  if (appState.user) {
    const userNameElements = document.querySelectorAll('#userName, .user-name');
    userNameElements.forEach(element => {
      element.textContent = appState.user.name;
    });
  }
  
  // Update points display
  const pointsElements = document.querySelectorAll('.points-value, #totalPoints');
  pointsElements.forEach(element => {
    element.textContent = appState.points;
  });
}

// Update navigation active state
function updateNavigation() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Show notification
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#2ECC71' : type === 'error' ? '#E74C3C' : '#3498DB'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    animation: slideIn 0.3s ease;
  `;
  
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
    <span style="margin-left: 10px;">${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// === AUTHENTICATION FUNCTIONS (USING REAL FIREBASE) ===

// Login user with real Firebase
async function loginUser() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  if (!email || !password) {
    showNotification('Please enter email and password', 'warning');
    return;
  }
  
  try {
    // Use the REAL Firebase function from firebase-config.js
    if (window.firebaseEnhanced && window.firebaseEnhanced.enhancedLogin) {
      const result = await window.firebaseEnhanced.enhancedLogin(email, password);
      showNotification('Login successful!', 'success');
      closeModal();
      return result;
    } else {
      throw new Error('Firebase authentication not available');
    }
  } catch (error) {
    console.error('Login error:', error);
    showNotification(`Login failed: ${error.message}`, 'error');
    throw error;
  }
}

// Signup user with real Firebase
async function signupUser() {
  const email = document.getElementById('signupEmail')?.value || document.getElementById('loginEmail')?.value;
  const password = document.getElementById('signupPassword')?.value || document.getElementById('loginPassword')?.value;
  const name = document.getElementById('signupName')?.value || email.split('@')[0];
  
  if (!email || !password) {
    showNotification('Please enter email and password', 'warning');
    return;
  }
  
  if (password.length < 6) {
    showNotification('Password must be at least 6 characters', 'warning');
    return;
  }
  
  try {
    // Use the REAL Firebase function from firebase-config.js
    if (window.firebaseEnhanced && window.firebaseEnhanced.createUserAccount) {
      const result = await window.firebaseEnhanced.createUserAccount({
        email: email,
        password: password,
        name: name,
        location: 'UAE'
      });
      
      showNotification('Account created successfully! Welcome!', 'success');
      closeModal();
      return result;
    } else {
      throw new Error('Firebase authentication not available');
    }
  } catch (error) {
    console.error('Signup error:', error);
    showNotification(`Signup failed: ${error.message}`, 'error');
    throw error;
  }
}

// Logout user
async function logoutUser() {
  try {
    if (firebase.auth()) {
      await firebase.auth().signOut();
      appState.user = null;
      saveAppState();
      updateUI();
      showNotification('Logged out successfully', 'info');
    }
  } catch (error) {
    console.error('Logout error:', error);
    showNotification('Logout failed', 'error');
  }
}

// === EXPORT FUNCTIONS TO WINDOW ===

window.initializeApp = initializeApp;
window.performSearch = performSearch;
window.searchProduct = function(query) {
  document.getElementById('searchInput').value = query;
  performSearch();
};
window.addToBasket = addToBasket;
window.updateBasketQuantity = updateBasketQuantity;
window.removeItemFromBasket = removeItemFromBasket;
window.clearBasket = clearBasket;
window.loginUser = loginUser;
window.signupUser = signupUser;
window.logoutUser = logoutUser;
window.selectSuggestion = selectSuggestion;
window.showNotification = showNotification;

console.log("🎯 UAE Price Hunter main script loaded (FIXED VERSION)");
