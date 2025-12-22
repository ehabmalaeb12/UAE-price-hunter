// UAE PRICE HUNTER - ENHANCED VERSION
// With real images, account creation, and best deals

const APP_CONFIG = {
  POINTS_PER_SEARCH: 15,
  POINTS_PER_DEAL_FOUND: 25,
  POINTS_PER_ADD_TO_BASKET: 50,
  DEFAULT_DISCOUNT_THRESHOLD: 60
};

let appState = {
  user: null,
  basket: [],
  points: 0,
  searchHistory: [],
  currentDeals: [],
  discountThreshold: APP_CONFIG.DEFAULT_DISCOUNT_THRESHOLD
};

// Initialize enhanced app
function initializeEnhancedApp() {
  console.log("🚀 Initializing Enhanced UAE Price Hunter...");
  
  loadAppState();
  setupFirebaseAuth();
  setupEventListeners();
  updateUI();
  
  // Check URL for auth callback
  checkAuthCallback();
  
  console.log("✅ Enhanced app ready");
}

// Setup Firebase auth with Google
function setupFirebaseAuth() {
  if (typeof firebase === 'undefined') {
    console.warn("Firebase not loaded - demo mode");
    return;
  }
  
  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      appState.user = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL,
        provider: user.providerData[0]?.providerId,
        joined: user.metadata.creationTime
      };
      
      console.log("✅ User authenticated:", appState.user.email);
      
      // Load user data from Firestore
      await loadUserData(user.uid);
      
      // Award welcome points
      if (isNewUser(user.metadata.creationTime)) {
        awardPoints(200, "Welcome bonus!");
      }
      
    } else {
      appState.user = null;
      console.log("👤 User signed out");
    }
    
    saveAppState();
    updateUI();
  });
}

// Enhanced signup with validation
async function signupUser() {
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirm = document.getElementById('signupConfirm').value;
  
  // Validation
  if (!name || !email || !password || !confirm) {
    showNotification('Please fill all fields', 'warning');
    return;
  }
  
  if (password.length < 6) {
    showNotification('Password must be at least 6 characters', 'warning');
    return;
  }
  
  if (password !== confirm) {
    showNotification('Passwords do not match', 'warning');
    return;
  }
  
  if (!validateEmail(email)) {
    showNotification('Please enter a valid email', 'warning');
    return;
  }
  
  try {
    // Create user in Firebase
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
    
    // Update display name
    await userCredential.user.updateProfile({
      displayName: name
    });
    
    // Create user document in Firestore
    await firebase.firestore().collection('users').doc(userCredential.user.uid).set({
      name: name,
      email: email,
      points: 200, // Welcome bonus
      joined: firebase.firestore.FieldValue.serverTimestamp(),
      settings: {
        language: 'en',
        currency: 'AED',
        notifications: true
      },
      preferences: {
        favoriteStores: ['amazon', 'noon', 'carrefour'],
        categories: []
      }
    });
    
    showNotification('🎉 Account created successfully! Welcome!', 'success');
    closeModal('authModal');
    
  } catch (error) {
    console.error('Signup error:', error);
    
    let message = 'Signup failed. ';
    if (error.code === 'auth/email-already-in-use') {
      message += 'Email already registered. Try logging in.';
    } else if (error.code === 'auth/invalid-email') {
      message += 'Invalid email format.';
    } else if (error.code === 'auth/weak-password') {
      message += 'Password is too weak.';
    } else {
      message += error.message;
    }
    
    showNotification(message, 'error');
  }
}

// Enhanced login
async function loginUser() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  
  if (!email || !password) {
    showNotification('Please enter email and password', 'warning');
    return;
  }
  
  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
    showNotification('Login successful!', 'success');
    closeModal('authModal');
  } catch (error) {
    console.error('Login error:', error);
    
    let message = 'Login failed. ';
    if (error.code === 'auth/user-not-found') {
      message += 'No account found with this email.';
    } else if (error.code === 'auth/wrong-password') {
      message += 'Incorrect password.';
    } else if (error.code === 'auth/invalid-email') {
      message += 'Invalid email format.';
    } else {
      message += error.message;
    }
    
    showNotification(message, 'error');
  }
}

// Load user data from Firestore
async function loadUserData(userId) {
  try {
    const doc = await firebase.firestore().collection('users').doc(userId).get();
    if (doc.exists) {
      const data = doc.data();
      appState.points = data.points || 0;
      appState.basket = data.basket || [];
      
      // Update local storage
      saveAppState();
      updateUI();
    }
  } catch (error) {
    console.error('Error loading user data:', error);
  }
}

// ENHANCED: Perform search with real images
async function performSearch() {
  const query = document.getElementById('searchInput').value.trim();
  
  if (!query) {
    showNotification('Please enter a product name', 'warning');
    return;
  }
  
  const selectedStores = getSelectedStores();
  if (selectedStores.length === 0) {
    showNotification('Please select at least one store', 'warning');
    return;
  }
  
  console.log(`🔍 Searching for "${query}" in ${selectedStores.length} stores`);
  
  // Show loading
  showLoading(true, 'searchResults');
  
  try {
    // Use enhanced scraping with real images
    const results = await window.scrapeDoEnhanced.searchAllStoresReal(query, selectedStores);
    
    // Display results with real images
    displayEnhancedResults(results, query);
    
    // Award points
    awardPoints(APP_CONFIG.POINTS_PER_SEARCH, `Search: ${query}`);
    
    // Save to history
    saveSearchHistory(query, results.length);
    
    // Scroll to results
    setTimeout(() => {
      document.getElementById('searchResults').scrollIntoView({ behavior: 'smooth' });
    }, 300);
    
  } catch (error) {
    console.error('Search error:', error);
    showNotification('Search failed. Please try again.', 'error');
  } finally {
    showLoading(false, 'searchResults');
  }
}

// NEW: Load best deals
async function loadBestDeals() {
  const discountThreshold = parseInt(document.getElementById('discountSlider').value);
  appState.discountThreshold = discountThreshold;
  
  console.log(`🔥 Loading deals with discount >= ${discountThreshold}%`);
  
  // Show loading
  showLoading(true, 'bestDeals');
  
  try {
    // Find best deals using enhanced system
    const deals = await window.scrapeDoEnhanced.findBestDeals(discountThreshold, 12);
    appState.currentDeals = deals;
    
    // Display deals
    displayBestDeals(deals);
    
    // Award points for finding deals
    if (deals.length > 0) {
      awardPoints(APP_CONFIG.POINTS_PER_DEAL_FOUND, `Found ${deals.length} hot deals!`);
    }
    
  } catch (error) {
    console.error('Error loading deals:', error);
    showNotification('Error loading deals. Please try again.', 'error');
  } finally {
    showLoading(false, 'bestDeals');
  }
}

// Display enhanced results with real images
function displayEnhancedResults(products, query) {
  const container = document.getElementById('searchResults');
  
  if (products.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-search"></i>
        <h3>No products found for "${query}"</h3>
        <p>Try a different search term or check more stores</p>
      </div>
    `;
    return;
  }
  
  // Find best price
  const bestPrice = Math.min(...products.map(p => p.price));
  
  let html = '';
  
  products.forEach((product, index) => {
    const isBestPrice = product.price === bestPrice;
    const hasGallery = product.galleryImages && product.galleryImages.length > 0;
    const galleryImages = hasGallery ? product.galleryImages : [product.image];
    
    html += `
      <div class="product-card ${isBestPrice ? 'best-price' : ''}">
        <div class="product-header">
          <div class="store-badge">
            <img src="${getStoreLogo(product.storeKey)}" alt="${product.store}">
            <span>${product.store}</span>
          </div>
          ${product.discount > 30 ? `
            <div class="discount-badge-large">
              ${product.discount}% OFF
            </div>
          ` : ''}
        </div>
        
        <!-- Image Gallery -->
        <div class="gallery-container">
          <img src="${galleryImages[0]}" 
               alt="${product.name}" 
               class="gallery-main"
               data-index="0"
               onclick="showImageGallery(${index}, 'search')">
          
          ${hasGallery && galleryImages.length > 1 ? `
            <div class="gallery-thumbnails">
              ${galleryImages.slice(0, 4).map((img, imgIndex) => `
                <img src="${img}" 
                     alt="Thumb ${imgIndex + 1}"
                     class="gallery-thumb ${imgIndex === 0 ? 'active' : ''}"
                     onclick="switchGalleryImage(${index}, ${imgIndex}, 'search')">
              `).join('')}
              ${galleryImages.length > 4 ? `
                <div class="more-images">+${galleryImages.length - 4}</div>
              ` : ''}
            </div>
          ` : ''}
        </div>
        
        <div class="product-info">
          <h3 class="product-title">${product.name}</h3>
          <p class="product-description">${product.description}</p>
          
          <!-- Price Section -->
          <div class="price-section">
            <div class="price-display">
              <span class="current-price">${product.price} AED</span>
              ${product.originalPrice > product.price ? `
                <span class="original-price">${product.originalPrice} AED</span>
              ` : ''}
              ${isBestPrice ? `
                <span class="best-price-tag">
                  <i class="fas fa-crown"></i> Best Price
                </span>
              ` : ''}
            </div>
            
            <div class="price-savings">
              ${product.discount > 0 ? `
                <span class="savings">Save ${Math.floor(product.originalPrice - product.price)} AED</span>
              ` : ''}
            </div>
          </div>
          
          <!-- Product Options -->
          ${product.options && product.options.length > 0 ? `
            <div class="product-options">
              ${product.options.slice(0, 3).map(opt => `
                <span class="option-chip ${opt.type}" 
                      style="${opt.type === 'color' ? `background-color: ${getColorHex(opt.value)}` : ''}">
                  ${opt.type === 'color' ? '' : opt.value}
                </span>
              `).join('')}
              ${product.options.length > 3 ? `
                <span class="option-chip">+${product.options.length - 3} more</span>
              ` : ''}
            </div>
          ` : ''}
          
          <!-- Product Details -->
          <div class="product-details">
            <div class="detail-item">
              <i class="fas fa-shipping-fast"></i>
              <span>${product.shipping}</span>
            </div>
            <div class="detail-item">
              <i class="fas fa-star"></i>
              <span>${product.rating} (${product.reviews})</span>
            </div>
            <div class="detail-item ${product.inStock ? 'in-stock' : 'out-stock'}">
              <i class="fas ${product.inStock ? 'fa-check-circle' : 'fa-times-circle'}"></i>
              <span>${product.inStock ? 'In Stock' : 'Out of Stock'}</span>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="product-actions">
            <button class="btn btn-primary" 
                    onclick="addToBasket(${JSON.stringify(product).replace(/"/g, '&quot;')})">
              <i class="fas fa-cart-plus"></i> Add to Basket
            </button>
            <a href="${product.link}" 
               target="_blank" 
               class="btn btn-secondary"
               onclick="trackStoreVisit('${product.store}', '${product.id}')">
              <i class="fas fa-external-link-alt"></i> Visit Store
            </a>
            <button class="btn btn-outline" 
                    onclick="showProductDetails(${JSON.stringify(product).replace(/"/g, '&quot;')})">
              <i class="fas fa-info-circle"></i> Details
            </button>
          </div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// Display best deals
function displayBestDeals(deals) {
  const container = document.getElementById('bestDeals');
  
  if (deals.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-percentage"></i>
        <h3>No deals found with ${appState.discountThreshold}%+ discount</h3>
        <p>Try lowering the discount threshold</p>
      </div>
    `;
    return;
  }
  
  let html = '';
  
  deals.forEach((deal, index) => {
    const isHotDeal = deal.discount >= 70;
    
    html += `
      <div class="deal-card ${isHotDeal ? 'hot-deal' : ''}">
        <div class="deal-header">
          <div class="deal-store">${deal.store}</div>
          <div class="deal-badge-large">
            ${deal.discount}% OFF
            ${isHotDeal ? '🔥' : ''}
          </div>
        </div>
        
        <img src="${deal.image}" alt="${deal.name}" class="deal-image">
        
        <div class="deal-info">
          <h3 class="deal-title">${deal.name}</h3>
          <p class="deal-category">
            <i class="fas fa-tag"></i> ${deal.category} • ${deal.brand}
          </p>
          
          <div class="deal-pricing">
            <div class="original-price-large">
              <del>${deal.originalPrice} AED</del>
            </div>
            <div class="current-price-large">
              ${deal.price} AED
              <span class="savings-large">Save ${deal.discount}%</span>
            </div>
          </div>
          
          <div class="deal-timer">
            <i class="fas fa-clock"></i>
            <span>Deal ends: ${formatTimeRemaining(deal.dealEnds)}</span>
          </div>
          
          <div class="deal-actions">
            <button class="btn btn-primary" 
                    onclick="addToBasket(${JSON.stringify(deal).replace(/"/g, '&quot;')})">
              <i class="fas fa-bolt"></i> Grab Deal
            </button>
            <button class="btn btn-secondary" 
                    onclick="compareThisDeal('${deal.category}', '${deal.brand}')">
              <i class="fas fa-balance-scale"></i> Compare
            </button>
          </div>
          
          <div class="deal-stats">
            <span><i class="fas fa-star"></i> ${deal.rating}</span>
            <span><i class="fas fa-truck"></i> ${deal.shipping}</span>
            <span class="in-stock"><i class="fas fa-check"></i> In Stock</span>
          </div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// Gallery functions
function showImageGallery(productIndex, type) {
  const products = type === 'search' ? appState.searchResults : appState.currentDeals;
  const product = products[productIndex];
  
  if (!product || !product.galleryImages || product.galleryImages.length === 0) return;
  
  const modal = document.createElement('div');
  modal.className = 'gallery-modal';
  modal.innerHTML = `
    <div class="gallery-modal-content">
      <span class="close-gallery" onclick="this.parentElement.parentElement.remove()">&times;</span>
      <h3>${product.name}</h3>
      <div class="gallery-main-view">
        <img src="${product.galleryImages[0]}" id="galleryMainImage">
        <button class="gallery-nav prev" onclick="navGallery(-1)">‹</button>
        <button class="gallery-nav next" onclick="navGallery(1)">›</button>
      </div>
      <div class="gallery-thumbnails-modal">
        ${product.galleryImages.map((img, index) => `
          <img src="${img}" 
               class="gallery-thumb-modal ${index === 0 ? 'active' : ''}"
               onclick="changeGalleryImage(${index})">
        `).join('')}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

function switchGalleryImage(productIndex, imageIndex, type) {
  const container = type === 'search' ? 
    document.querySelectorAll('.product-card')[productIndex] :
    document.querySelectorAll('.deal-card')[productIndex];
  
  if (!container) return;
  
  // Update main image
  const mainImg = container.querySelector('.gallery-main');
  const products = type === 'search' ? appState.searchResults : appState.currentDeals;
  const galleryImages = products[productIndex].galleryImages;
  
  if (mainImg && galleryImages[imageIndex]) {
    mainImg.src = galleryImages[imageIndex];
    mainImg.setAttribute('data-index', imageIndex);
  }
  
  // Update active thumbnail
  container.querySelectorAll('.gallery-thumb').forEach((thumb, idx) => {
    thumb.classList.toggle('active', idx === imageIndex);
  });
}

// Compare this deal function
function compareThisDeal(category, brand) {
  document.getElementById('searchInput').value = `${brand} ${category}`;
  performSearch();
  scrollToSection('search-section');
}

// Helper functions
function getStoreLogo(storeKey) {
  const logos = {
    amazon: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    noon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Noon_%28company%29_logo.svg/1200px-Noon_%28company%29_logo.svg.png',
    carrefour: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Carrefour_logo.svg/2560px-Carrefour_logo.svg.png',
    sharafdg: 'https://www.sharafdg.com/static/version1712821587/frontend/Sdg/default/en_US/images/logo.svg',
    emax: 'https://www.emaxme.com/pub/static/version1704199543/frontend/Emax/default/en_US/images/logo.svg',
    lulu: 'https://www.luluhypermarket.com/medias/Logo-Lulu-1-.png'
  };
  return logos[storeKey] || 'https://via.placeholder.com/40/2C3E50/FFFFFF?text=' + storeKey.charAt(0).toUpperCase();
}

function getColorHex(colorName) {
  const colors = {
    'red': '#E74C3C',
    'blue': '#3498DB',
    'green': '#2ECC71',
    'black': '#2C3E50',
    'white': '#ECF0F1',
    'gold': '#F39C12',
    'silver': '#BDC3C7'
  };
  return colors[colorName.toLowerCase()] || '#3498DB';
}

function formatTimeRemaining(endTime) {
  const end = new Date(endTime);
  const now = new Date();
  const diff = end - now;
  
  if (diff <= 0) return 'Ended';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

function showLoading(show, containerId) {
  const container = document.getElementById(containerId);
  const loadingId = containerId === 'bestDeals' ? 'dealsLoading' : 'loading';
  const loading = document.getElementById(loadingId);
  
  if (loading) {
    loading.style.display = show ? 'flex' : 'none';
  }
  
  if (container && show) {
    container.innerHTML = '';
  }
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function isNewUser(creationTime) {
  const created = new Date(creationTime);
  const now = new Date();
  const diff = now - created;
  return diff < 5 * 60 * 1000; // Less than 5 minutes ago
}

// Export functions
window.initializeEnhancedApp = initializeEnhancedApp;
window.performSearch = performSearch;
window.loadBestDeals = loadBestDeals;
window.signupUser = signupUser;
window.loginUser = loginUser;
window.switchGalleryImage = switchGalleryImage;
window.compareThisDeal = compareThisDeal;

console.log("🎯 Enhanced UAE Price Hunter ready!");
