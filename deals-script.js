// deals-script.js - UAE Price Hunter Deals Page

const DEALS_CONFIG = {
  DEALS_PER_PAGE: 12,
  DEALS_REFRESH_TIME: 3600000 // 1 hour in milliseconds
};

let allDeals = [];
let currentPage = 1;
let currentFilter = {
  minDiscount: 60,
  category: 'all'
};

// Initialize deals page
function initializeDealsPage() {
  console.log("🔥 Initializing deals page...");
  
  // Load deals
  loadDeals();
  
  // Set up filter listeners
  setupFilterListeners();
  
  // Update UI
  updateDealsUI();
  
  // Auto-refresh deals every hour
  setInterval(loadDeals, DEALS_CONFIG.DEALS_REFRESH_TIME);
}

// Setup filter event listeners
function setupFilterListeners() {
  // Discount slider
  const discountSlider = document.getElementById('discountSlider');
  if (discountSlider) {
    discountSlider.addEventListener('input', function() {
      document.getElementById('currentDiscount').textContent = this.value;
      currentFilter.minDiscount = parseInt(this.value);
      filterDeals();
    });
  }
  
  // Quick filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      // Remove active class from all buttons
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      // Add active class to clicked button
      this.classList.add('active');
      
      // Get discount from button
      const discountText = this.querySelector('.deal-badge-small').textContent;
      const discount = parseInt(discountText);
      currentFilter.minDiscount = discount;
      
      // Update slider
      if (discountSlider) {
        discountSlider.value = discount;
        document.getElementById('currentDiscount').textContent = discount;
      }
      
      filterDeals();
    });
  });
  
  // Category tags
  document.querySelectorAll('.category-tag').forEach(tag => {
    tag.addEventListener('click', function() {
      // Remove active class from all tags
      document.querySelectorAll('.category-tag').forEach(t => t.classList.remove('active'));
      // Add active class to clicked tag
      this.classList.add('active');
      
      currentFilter.category = this.dataset.category;
      filterDeals();
    });
  });
}

// Load deals from scrape.do API
async function loadDeals() {
  const loadingEl = document.getElementById('dealsLoading');
  const dealsGrid = document.getElementById('dealsGrid');
  
  // Show loading
  if (loadingEl) loadingEl.style.display = 'flex';
  if (dealsGrid) dealsGrid.innerHTML = '';
  
  try {
    console.log("🔄 Loading deals from scrape.do...");
    
    // Check if scrape.do is available
    if (window.scrapeDoEnhanced && window.scrapeDoEnhanced.findBestDeals) {
      // Get deals from scrape.do API
      allDeals = await window.scrapeDoEnhanced.findBestDeals(currentFilter.minDiscount, 50);
      console.log(`✅ Loaded ${allDeals.length} deals from API`);
    } else {
      // Fallback to mock deals if API not available
      console.warn("⚠️ scrape.do API not available, using mock data");
      allDeals = generateMockDeals(50, currentFilter.minDiscount);
    }
    
    // Display first page of deals
    displayDeals(allDeals.slice(0, DEALS_CONFIG.DEALS_PER_PAGE));
    
    // Update deals count
    updateDealsCount(allDeals.length);
    
  } catch (error) {
    console.error('❌ Error loading deals:', error);
    
    // Show error state
    if (dealsGrid) {
      dealsGrid.innerHTML = `
        <div class="error-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
          <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #F39C12; margin-bottom: 1rem;"></i>
          <h3>Failed to load deals</h3>
          <p>${error.message || 'Please check your internet connection and try again.'}</p>
          <button class="btn-primary" onclick="loadDeals()" style="margin-top: 1rem;">
            <i class="fas fa-sync"></i> Retry
          </button>
        </div>
      `;
    }
    
    // Show notification
    if (window.showNotification) {
      window.showNotification('Could not load deals. Showing demo data.', 'warning');
    }
    
    // Load mock data as fallback
    allDeals = generateMockDeals(20, currentFilter.minDiscount);
    displayDeals(allDeals);
    
  } finally {
    // Hide loading
    if (loadingEl) loadingEl.style.display = 'none';
  }
}

// Generate mock deals for fallback
function generateMockDeals(count, minDiscount) {
  const deals = [];
  const categories = ['electronics', 'fashion', 'home', 'beauty', 'grocery', 'appliances'];
  const stores = ['Amazon.ae', 'Noon', 'Carrefour', 'Sharaf DG', 'eMax', 'Lulu Hypermarket'];
  const brands = ['Apple', 'Samsung', 'Sony', 'Nike', 'Adidas', 'Dyson', 'Nestle', 'P&G'];
  
  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const store = stores[Math.floor(Math.random() * stores.length)];
    
    // Ensure discount meets minimum
    const discount = minDiscount + Math.floor(Math.random() * (90 - minDiscount));
    const originalPrice = Math.floor(Math.random() * 2000) + 200;
    const price = Math.floor(originalPrice * (1 - discount / 100));
    
    deals.push({
      id: `deal_${Date.now()}_${i}`,
      name: `${brand} ${category.charAt(0).toUpperCase() + category.slice(1)} - Special Offer`,
      store: store,
      price: price,
      originalPrice: originalPrice,
      discount: discount,
      image: getDealImage(category),
      description: `Limited time offer! Save ${discount}% on ${brand} ${category} at ${store}. Hurry while stock lasts!`,
      category: category,
      brand: brand,
      dealEnds: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      isHotDeal: discount >= 70,
      shipping: getShippingInfo(store),
      rating: (4.0 + Math.random() * 1.0).toFixed(1),
      reviews: Math.floor(Math.random() * 500),
      inStock: true,
      timestamp: new Date().toISOString()
    });
  }
  
  // Sort by discount (highest first)
  return deals.sort((a, b) => b.discount - a.discount);
}

// Get deal image based on category
function getDealImage(category) {
  const images = {
    'electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop&auto=format',
    'fashion': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop&auto=format',
    'home': 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&h=300&fit=crop&auto=format',
    'beauty': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=300&fit=crop&auto=format',
    'grocery': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop&auto=format',
    'appliances': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&auto=format'
  };
  
  return images[category] || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=300&fit=crop&auto=format';
}

// Get shipping info based on store
function getShippingInfo(store) {
  const shippingOptions = {
    'Amazon.ae': ['FREE Delivery Tomorrow', 'Prime Delivery'],
    'Noon': ['Express Delivery', 'FREE Noon Delivery'],
    'Carrefour': ['2-Hour Delivery', 'Pickup Available'],
    'Sharaf DG': ['Same Day Delivery', 'FREE Setup'],
    'eMax': ['Professional Installation', 'FREE Delivery'],
    'Lulu Hypermarket': ['Click & Collect', 'Same Day Delivery']
  };
  
  const options = shippingOptions[store] || ['Standard Delivery'];
  return options[Math.floor(Math.random() * options.length)];
}

// Display deals in the grid
function displayDeals(deals) {
  const dealsGrid = document.getElementById('dealsGrid');
  if (!dealsGrid) return;
  
  if (!deals || deals.length === 0) {
    dealsGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-illustration">
          <i class="fas fa-percentage"></i>
        </div>
        <h3>No deals found</h3>
        <p>Try adjusting your filters or check back later</p>
        <div class="empty-actions">
          <button class="btn-primary" onclick="currentFilter.minDiscount = 50; filterDeals();">
            <i class="fas fa-filter"></i> Reset Filters
          </button>
          <button class="btn-secondary" onclick="loadDeals()">
            <i class="fas fa-sync"></i> Refresh
          </button>
        </div>
      </div>
    `;
    return;
  }
  
  // Clear existing deals
  dealsGrid.innerHTML = '';
  
  // Add each deal to the grid
  deals.forEach(deal => {
    const dealCard = document.createElement('div');
    dealCard.className = 'deal-card';
    if (deal.isHotDeal) {
      dealCard.classList.add('hot-deal');
    }
    
    // Calculate time remaining
    const endsDate = new Date(deal.dealEnds);
    const now = new Date();
    const hoursLeft = Math.max(0, Math.floor((endsDate - now) / (1000 * 60 * 60)));
    
    dealCard.innerHTML = `
      <div class="deal-badge">${deal.discount}% OFF</div>
      <img src="${deal.image}" alt="${deal.name}" class="deal-image" 
           onerror="this.src='https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=300&fit=crop'">
      
      <div class="deal-content">
        <div class="deal-store">${deal.store}</div>
        <h3 class="deal-title">${deal.name}</h3>
        <div class="deal-category">
          <i class="fas fa-tag"></i> ${deal.category.charAt(0).toUpperCase() + deal.category.slice(1)}
        </div>
        
        <div class="deal-pricing">
          <div class="original-price-large">${deal.originalPrice} AED</div>
          <div class="current-price-large">${deal.price} AED</div>
          <div class="savings-large">Save ${deal.originalPrice - deal.price} AED</div>
        </div>
        
        ${hoursLeft > 0 ? `
          <div class="deal-timer">
            <i class="fas fa-clock"></i>
            <span>Ends in ${hoursLeft} hours</span>
          </div>
        ` : ''}
        
        <div class="deal-actions">
          <button class="btn-primary" onclick="addDealToBasket(${JSON.stringify(deal).replace(/"/g, '&quot;')})">
            <i class="fas fa-cart-plus"></i> Add to Basket
          </button>
          <a href="${deal.link || '#'}" target="_blank" class="btn-secondary">
            <i class="fas fa-external-link-alt"></i> View Deal
          </a>
        </div>
        
        <div class="deal-stats">
          <span>⭐ ${deal.rating}</span>
          <span>🔄 ${deal.reviews} reviews</span>
          <span>🚚 ${deal.shipping}</span>
        </div>
      </div>
    `;
    
    dealsGrid.appendChild(dealCard);
  });
}

// Filter deals based on current criteria
function filterDeals() {
  let filtered = [...allDeals];
  
  // Apply discount filter
  filtered = filtered.filter(deal => deal.discount >= currentFilter.minDiscount);
  
  // Apply category filter
  if (currentFilter.category !== 'all') {
    filtered = filtered.filter(deal => deal.category === currentFilter.category);
  }
  
  // Display filtered deals (first page)
  displayDeals(filtered.slice(0, DEALS_CONFIG.DEALS_PER_PAGE));
  
  // Update count
  updateDealsCount(filtered.length);
  
  // Reset to first page
  currentPage = 1;
}

// Update deals count display
function updateDealsCount(count) {
  const dealsCount = document.getElementById('dealsCount');
  if (dealsCount) {
    dealsCount.textContent = `${count} amazing deals found`;
  }
}

// Load more deals (pagination)
function loadMoreDeals() {
  const startIndex = currentPage * DEALS_CONFIG.DEALS_PER_PAGE;
  const moreDeals = allDeals.slice(startIndex, startIndex + DEALS_CONFIG.DEALS_PER_PAGE);
  
  if (moreDeals.length > 0) {
    const dealsGrid = document.getElementById('dealsGrid');
    
    moreDeals.forEach(deal => {
      const dealCard = document.createElement('div');
      dealCard.className = 'deal-card';
      if (deal.isHotDeal) {
        dealCard.classList.add('hot-deal');
      }
      
      // (Same deal card HTML as in displayDeals function)
      dealCard.innerHTML = `
        <div class="deal-badge">${deal.discount}% OFF</div>
        <img src="${deal.image}" alt="${deal.name}" class="deal-image">
        <div class="deal-content">
          <div class="deal-store">${deal.store}</div>
          <h3 class="deal-title">${deal.name}</h3>
          <div class="deal-pricing">
            <div class="original-price-large">${deal.originalPrice} AED</div>
            <div class="current-price-large">${deal.price} AED</div>
          </div>
          <div class="deal-actions">
            <button class="btn-primary" onclick="addDealToBasket(${JSON.stringify(deal).replace(/"/g, '&quot;')})">
              <i class="fas fa-cart-plus"></i> Add to Basket
            </button>
          </div>
        </div>
      `;
      
      dealsGrid.appendChild(dealCard);
    });
    
    currentPage++;
    
    // Show notification if no more deals
    if (startIndex + DEALS_CONFIG.DEALS_PER_PAGE >= allDeals.length) {
      if (window.showNotification) {
        window.showNotification('All deals loaded!', 'info');
      }
    }
  } else {
    if (window.showNotification) {
      window.showNotification('No more deals to load', 'info');
    }
  }
}

// Add deal to basket
function addDealToBasket(deal) {
  // Use the addToBasket function from main script if available
  if (window.addToBasket) {
    window.addToBasket(deal);
  } else {
    // Fallback implementation
    alert(`Added ${deal.name} to basket!`);
    if (window.showNotification) {
      window.showNotification(`Added ${deal.name} to basket!`, 'success');
    }
  }
}

// Update UI elements
function updateDealsUI() {
  // Update active filter display
  const currentDiscountEl = document.getElementById('currentDiscount');
  if (currentDiscountEl) {
    currentDiscountEl.textContent = currentFilter.minDiscount;
  }
  
  const discountSlider = document.getElementById('discountSlider');
  if (discountSlider) {
    discountSlider.value = currentFilter.minDiscount;
  }
  
  // Update active category tag
  document.querySelectorAll('.category-tag').forEach(tag => {
    if (tag.dataset.category === currentFilter.category) {
      tag.classList.add('active');
    } else {
      tag.classList.remove('active');
    }
  });
  
  // Update active filter button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    const discountText = btn.querySelector('.deal-badge-small')?.textContent;
    if (discountText) {
      const discount = parseInt(discountText);
      if (discount === currentFilter.minDiscount) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  });
}

// Refresh deals
function refreshDeals() {
  loadDeals();
  if (window.showNotification) {
    window.showNotification('Refreshing deals...', 'info');
  }
}

// === EXPORT FUNCTIONS TO WINDOW ===

window.initializeDealsPage = initializeDealsPage;
window.loadDeals = loadDeals;
window.filterDeals = filterDeals;
window.filterDealsByCriteria = filterDeals;
window.loadMoreDeals = loadMoreDeals;
window.loadMoreDealsFromAPI = loadMoreDeals;
window.refreshDeals = refreshDeals;
window.addDealToBasket = addDealToBasket;

console.log("🔥 UAE Price Hunter deals script loaded");
