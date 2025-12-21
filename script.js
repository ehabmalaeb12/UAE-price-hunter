// UAE PRICE HUNTER - MAIN APPLICATION LOGIC

// Configuration
const APP_CONFIG = {
  // Points system
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
  LS_SEARCH_HISTORY: 'search_history',
  LS_POINTS_ACTIVITY: 'points_activity'
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
        
        // Load user data from Firestore
        loadUserDataFromFirebase(user.uid);
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
  if (!window.firebaseServices || !window.firebaseServices.getUserData) {
    console.warn("⚠️ Firebase services not available");
    return;
  }
  
  try {
    const userData = await window.firebaseServices.getUserData(userId);
    if (userData) {
      // Merge Firebase data with local state
      appState.points = userData.points || appState.points;
      appState.basket = userData.basket || appState.basket;
      
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

// Perform search
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
    // Use scrape.do to search all stores
    const results = await window.scrapeDo.searchAllStores(query, selectedStores);
    
    // Display results
    displaySearchResults(results, query);
    
    // Save search to history
    saveSearchToHistory(query, results.length);
    
  } catch (error) {
    console.error('❌ Search error:', error);
    showNotification('Search failed. Please try again.', 'error');
  } finally {
    showLoading(false);
  }
}

// Get selected stores from checkboxes
function getSelectedStores() {
  const checkboxes = document.querySelectorAll('.store-option input[type="checkbox"]:checked');
  return Array.from(checkboxes).map(cb => cb.dataset.store);
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
  
  if (products.length === 0) {
    resultsContainer.innerHTML = `
      <div class="empty-results">
        <i class="fas fa-search"></i>
        <h3>No products found for "${query}"</h3>
        <p>Try a different search term or check more stores</p>
        <div class="trending-searches">
          <span class="trending-tag" onclick="searchTrending('iPhone 15 Pro Max')">iPhone 15 Pro Max</span>
          <span class="trending-tag" onclick="searchTrending('Samsung Galaxy S24')">Samsung Galaxy S24</span>
          <span class="trending-tag" onclick="searchTrending('Arabic Oud Perfume')">Arabic Oud Perfume</span>
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
    resultsCount.textContent = `${products.length} results`;
  }
  
  // Group products by name for better organization
  const productGroups = {};
  products.forEach(product => {
    const baseName = product.name.split(' - ')[0];
    if (!productGroups[baseName]) {
      productGroups[baseName] = [];
    }
    productGroups[baseName].push(product);
  });
  
  let html = '';
  
  // Create product groups
  Object.values(productGroups).forEach(productGroup => {
    // Sort by price (lowest first)
    productGroup.sort((a, b) => a.price - b.price);
    
    const bestProduct = productGroup[0];
    const hasMultipleStores = productGroup.length > 1;
    
    html += `
      <div class="product-card ${bestProduct.isBestPrice ? 'best-price' : ''}">
        <img src="${bestProduct.image}" alt="${bestProduct.name}" class="product-image">
        
        <div class="product-info">
          <div class="product-store">${bestProduct.store.toUpperCase()}</div>
          <h3 class="product-title">${bestProduct.name}</h3>
          <p class="product-description">${bestProduct.description}</p>
          
          <div class="price-section">
            <span class="current-price">${bestProduct.price} AED</span>
            ${bestProduct.discount > 0 ? `
              <span class="original-price">${bestProduct.originalPrice} AED</span>
              <span class="discount-badge">-${bestProduct.discount}%</span>
            ` : ''}
            ${bestProduct.isBestPrice ? `
              <span class="best-price-tag">Best Price</span>
            ` : ''}
          </div>
          
          <div class="product-meta">
            <span class="rating">⭐ ${bestProduct.rating} (${bestProduct.reviews})</span>
            <span class="shipping">🚚 ${bestProduct.shipping}</span>
            <span class="stock ${bestProduct.inStock ? 'in-stock' : 'out-stock'}">
              ${bestProduct.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
          
          <div class="product-actions">
            <button class="btn btn-primary" onclick="addToBasket(${JSON.stringify(bestProduct).replace(/"/g, '&quot;')})">
              <i class="fas fa-cart-plus"></i> Add to Basket
            </button>
            <a href="${bestProduct.url}" target="_blank" class="btn btn-secondary">
              <i class="fas fa-external-link-alt"></i> Visit Store
            </a>
          </div>
        </div>
      </div>
    `;
    
    // Show other store prices for the same product
    if (hasMultipleStores && productGroup.length > 1) {
      html += `
        <div class="other-stores">
          <p><strong>Also available at:</strong></p>
          <div class="store-prices">
      `;
      
      productGroup.slice(1).forEach(product => {
        html += `
          <div class="store-price ${product.isBestPrice ? 'best' : ''}">
            <span>${product.store}:</span>
            <strong>${product.price} AED</strong>
            <button class="btn-small" onclick="addToBasket(${JSON.stringify(product).replace(/"/g, '&quot;')})">
              <i class="fas fa-cart-plus"></i>
            </button>
          </div>
        `;
      });
      
      html += `
          </div>
        </div>
      `;
    }
  });
  
  resultsContainer.innerHTML = html;
  
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
    loading.style.display = show ? 'block' : 'none';
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
  showNotification(`Added ${product.name} to basket!`, 'success');
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
  
  // Also save to Firebase if user is logged in
  if (appState.user && window.firebaseServices && window.firebaseServices.saveSearchHistory) {
    window.firebaseServices.saveSearchHistory(appState.user.uid, searchEntry)
      .catch(error => console.error('Error saving search to Firebase:', error));
  }
}

// Award points to user
function awardPoints(points, reason) {
  appState.points += points;
  saveAppState();
  updateUI();
  
  // Save to Firebase if user is logged in
  if (appState.user && window.firebaseServices && window.firebaseServices.updatePoints) {
    window.firebaseServices.updatePoints(appState.user.uid, points, reason)
      .catch(error => console.error('Error updating points in Firebase:', error));
  }
  
  console.log(`🎯 Awarded ${points} points for: ${reason}`);
}

// Update UI elements
function updateUI() {
  // Update basket count in navigation
  const basketCount = appState.basket.reduce((total, item) => total + item.quantity, 0);
  const basketElements = document.querySelectorAll('#navBasketCount, .basket-count');
  
  basketElements.forEach(element => {
    element.textContent = basketCount;
    element.style.display = basketCount > 0 ? 'inline-block' : 'none';
  });
  
  // Update user name
  const userNameElements = document.querySelectorAll('#userName, .user-name');
  userNameElements.forEach(element => {
    if (appState.user) {
      element.textContent = appState.user.name;
    } else {
      element.textContent = 'Guest';
    }
  });
  
  // Update points display
  const pointsElements = document.querySelectorAll('.points-value, #totalPoints, #availablePoints');
  pointsElements.forEach(element => {
    element.textContent = appState.points;
  });
}

// Update navigation
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

// Show modal
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
  }
}

// Close modal
function closeModal() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.style.display = 'none';
  });
}

// Login user
async function loginUser() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  if (!email || !password) {
    showNotification('Please enter email and password', 'warning');
    return;
  }
  
  try {
    let user;
    
    if (window.firebaseServices && window.firebaseServices.loginUser) {
      // Real Firebase login
      user = await window.firebaseServices.loginUser(email, password);
    } else {
      // Mock login for demo
      user = {
        uid: 'demo-user-' + Date.now(),
        email: email,
        displayName: email.split('@')[0],
        metadata: { creationTime: new Date().toISOString() }
      };
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    showNotification('Login successful!', 'success');
    closeModal();
    
  } catch (error) {
    console.error('Login error:', error);
    showNotification(`Login failed: ${error.message}`, 'error');
  }
}

// Signup user
async function signupUser() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  if (!email || !password) {
    showNotification('Please enter email and password', 'warning');
    return;
  }
  
  if (password.length < 6) {
    showNotification('Password must be at least 6 characters', 'warning');
    return;
  }
  
  try {
    let user;
    
    if (window.firebaseServices && window.firebaseServices.signupUser) {
      // Real Firebase signup
      user = await window.firebaseServices.signupUser(email, password);
    } else {
      // Mock signup for demo
      user = {
        uid: 'demo-user-' + Date.now(),
        email: email,
        displayName: email.split('@')[0],
        metadata: { creationTime: new Date().toISOString() }
      };
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    showNotification('Account created successfully! Welcome!', 'success');
    closeModal();
    
  } catch (error) {
    console.error('Signup error:', error);
    showNotification(`Signup failed: ${error.message}`, 'error');
  }
}

// Logout user
async function logoutUser() {
  try {
    if (window.firebaseServices && window.firebaseServices.logoutUser) {
      await window.firebaseServices.logoutUser();
    }
    
    appState.user = null;
    saveAppState();
    updateUI();
    
    showNotification('Logged out successfully', 'info');
    
  } catch (error) {
    console.error('Logout error:', error);
    showNotification('Logout failed', 'error');
  }
}

// Show notification
function showNotification(message, type = 'info') {
  // Remove existing notification
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  // Set icon based on type
  let icon = 'info-circle';
  if (type === 'success') icon = 'check-circle';
  if (type === 'error') icon = 'exclamation-circle';
  if (type === 'warning') icon = 'exclamation-triangle';
  
  notification.innerHTML = `
    <i class="fas fa-${icon}"></i>
    <span>${message}</span>
  `;
  
  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${getNotificationColor(type)};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    animation: slideInRight
