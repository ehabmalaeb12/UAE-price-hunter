// UAE Price Hunter - Smart Product Display
// Shows grouped comparison the way you want

class ProductDisplay {
    constructor() {
        console.log("🎨 Initializing Smart Product Display...");
    }
    
    // Display grouped products
    displayGroupedResults(groups, containerId = 'searchResults') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error("❌ Container not found:", containerId);
            return;
        }
        
        if (!groups || groups.length === 0) {
            container.innerHTML = this.getEmptyState();
            return;
        }
        
        let html = '';
        
        // Header
        html += `
            <div class="results-header">
                <h2><i class="fas fa-chart-line"></i> Price Comparison</h2>
                <p class="results-count">${this.countTotalProducts(groups)} products in ${groups.length} groups</p>
            </div>
        `;
        
        // Each comparison group
        groups.forEach((group, groupIndex) => {
            html += this.renderComparisonGroup(group, groupIndex);
        });
        
        // Footer with summary
        html += this.renderSummary(groups);
        
        container.innerHTML = html;
        
        // Add event listeners
        this.addEventListeners();
    }
    
    // Render one comparison group (same product across stores)
    renderComparisonGroup(group, index) {
        const cheapest = group.cheapestProduct;
        const alternatives = group.products.filter(p => p !== cheapest);
        
        return `
            <div class="comparison-group" data-group-id="${group.groupId}">
                <!-- GROUP HEADER -->
                <div class="group-header">
                    <div class="group-title-section">
                        <h3 class="group-title">${group.groupName}</h3>
                        <div class="group-subtitle">
                            <span class="store-count">${group.storeCount} stores</span>
                            <span class="price-range">${group.priceRange}</span>
                            <span class="category-badge">${group.category}</span>
                        </div>
                    </div>
                    <div class="group-actions">
                        <button class="btn-outline" onclick="toggleGroupDetails('${group.groupId}')">
                            <i class="fas fa-expand-alt"></i> Details
                        </button>
                    </div>
                </div>
                
                <!-- BEST PRICE PRODUCT (HIGHLIGHTED) -->
                <div class="comparison-content">
                    <div class="best-price-section">
                        <div class="best-price-header">
                            <div class="best-price-badge">
                                <i class="fas fa-crown"></i> BEST PRICE
                            </div>
                            <div class="savings-amount">
                                Save up to ${group.products.length > 1 ? this.calculateMaxSavings(group.products) : '0'} AED
                            </div>
                        </div>
                        
                        <div class="best-price-card">
                            ${this.renderProductCard(cheapest, true)}
                        </div>
                    </div>
                    
                    <!-- ALTERNATIVE STORES -->
                    ${alternatives.length > 0 ? `
                        <div class="alternative-stores">
                            <h4 class="alternative-title">
                                <i class="fas fa-store-alt"></i> Also available at:
                            </h4>
                            <div class="alternatives-grid">
                                ${alternatives.map(product => this.renderAlternativeCard(product, cheapest.price)).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- PRODUCT SPECIFICATIONS -->
                    <div class="specifications-section">
                        <h4><i class="fas fa-list-alt"></i> Product Details</h4>
                        <div class="specs-grid">
                            <div class="spec-item">
                                <i class="fas fa-shipping-fast"></i>
                                <div>
                                    <strong>Fastest Delivery</strong>
                                    <p>${group.bestShipping || 'Standard Delivery'}</p>
                                </div>
                            </div>
                            <div class="spec-item">
                                <i class="fas fa-shield-alt"></i>
                                <div>
                                    <strong>Best Warranty</strong>
                                    <p>${group.bestWarranty || '1 Year Standard'}</p>
                                </div>
                            </div>
                            <div class="spec-item">
                                <i class="fas fa-star"></i>
                                <div>
                                    <strong>Average Rating</strong>
                                    <p>${group.averageRating} ⭐ (${group.totalReviews} reviews)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Render main product card
    renderProductCard(product, isBestPrice = false) {
        return `
            <div class="product-card ${isBestPrice ? 'best-price' : ''}">
                <div class="product-image-section">
                    <img src="${product.image}" 
                         alt="${product.name}"
                         class="product-image"
                         onerror="this.src='https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&fit=crop'">
                    
                    ${product.discount > 15 ? `
                        <div class="discount-badge-large">
                            ${product.discount}% OFF
                        </div>
                    ` : ''}
                    
                    ${product.isCheapest ? `
                        <div class="best-price-tag">
                            <i class="fas fa-crown"></i> Cheapest
                        </div>
                    ` : ''}
                </div>
                
                <div class="product-info-section">
                    <div class="product-store">
                        <img src="${this.getStoreIcon(product.store)}" 
                             alt="${product.store}"
                             class="store-icon">
                        <span class="store-name">${product.store}</span>
                    </div>
                    
                    <h4 class="product-title">${product.name}</h4>
                    
                    <p class="product-description">
                        ${product.description || 'Available with fast UAE delivery.'}
                    </p>
                    
                    <div class="product-pricing">
                        <div class="price-main">
                            <span class="current-price">${product.price} AED</span>
                            ${product.originalPrice > product.price ? `
                                <span class="original-price">${product.originalPrice} AED</span>
                            ` : ''}
                        </div>
                        
                        ${product.discount > 10 ? `
                            <div class="savings">
                                Save ${product.originalPrice - product.price} AED
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="product-meta">
                        <span class="rating">
                            <i class="fas fa-star"></i> ${product.rating}
                            <small>(${product.reviews})</small>
                        </span>
                        <span class="shipping">
                            <i class="fas fa-shipping-fast"></i> ${product.shipping}
                        </span>
                        <span class="stock ${product.inStock ? 'in-stock' : 'out-stock'}">
                            <i class="fas fa-${product.inStock ? 'check-circle' : 'times-circle'}"></i>
                            ${product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                    </div>
                    
                    <div class="product-actions">
                        <button class="btn btn-primary" 
                                onclick="addToBasket(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                            <i class="fas fa-cart-plus"></i> Add to Basket
                        </button>
                        <a href="${product.link}" 
                           target="_blank" 
                           class="btn btn-success"
                           onclick="trackAffiliateClick('${product.id}', '${product.store}')">
                            <i class="fas fa-external-link-alt"></i> Buy Now
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Render alternative store card
    renderAlternativeCard(product, cheapestPrice) {
        const priceDiff = product.price - cheapestPrice;
        
        return `
            <div class="alternative-card">
                <div class="alternative-store">
                    <img src="${this.getStoreIcon(product.store)}" 
                         alt="${product.store}"
                         class="store-icon-small">
                    <span>${product.store}</span>
                </div>
                
                <div class="alternative-pricing">
                    <div class="price">${product.price} AED</div>
                    ${priceDiff > 0 ? `
                        <div class="price-diff">
                            +${priceDiff} AED
                        </div>
                    ` : ''}
                </div>
                
                <div class="alternative-actions">
                    <a href="${product.link}" 
                       target="_blank" 
                       class="btn-outline-small"
                       onclick="trackAffiliateClick('${product.id}', '${product.store}')">
                        <i class="fas fa-external-link-alt"></i> View
                    </a>
                </div>
            </div>
        `;
    }
    
    // Helper methods
    getStoreIcon(storeName) {
        const icons = {
            'Amazon UAE': 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
            'Noon UAE': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Noon_%28company%29_logo.svg/2560px-Noon_%28company%29_logo.svg.png',
            'Carrefour UAE': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Carrefour_logo.svg/2560px-Carrefour_logo.svg.png',
            'Sharaf DG': 'https://www.sharafdg.com/static/version1712821587/frontend/Sdg/default/en_US/images/logo.svg',
            'EMAX': 'https://www.emaxme.com/pub/static/version1704199543/frontend/Emax/default/en_US/images/logo.svg'
        };
        
        return icons[storeName] || 'https://cdn-icons-png.flaticon.com/512/891/891419.png';
    }
    
    calculateMaxSavings(products) {
        const prices = products.map(p => p.price);
        return Math.max(...prices) - Math.min(...prices);
    }
    
    countTotalProducts(groups) {
        return groups.reduce((total, group) => total + group.products.length, 0);
    }
    
    renderSummary(groups) {
        const totalProducts = this.countTotalProducts(groups);
        const totalStores = new Set(groups.flatMap(g => Array.from(g.stores))).size;
        const totalSavings = groups.reduce((sum, group) => {
            return sum + this.calculateMaxSavings(group.products);
        }, 0);
        
        return `
            <div class="comparison-summary">
                <div class="summary-card">
                    <i class="fas fa-chart-pie"></i>
                    <div class="summary-content">
                        <h4>Comparison Complete</h4>
                        <p>Compared ${totalProducts} products across ${totalStores} UAE stores</p>
                        <p class="summary-note">
                            <i class="fas fa-lightbulb"></i>
                            Potential savings: <strong>${totalSavings} AED</strong>
                        </p>
                        <p class="timestamp">Prices updated: ${new Date().toLocaleTimeString()}</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    getEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-illustration">
                    <i class="fas fa-search"></i>
                </div>
                <h3>No products found</h3>
                <p>Try a different search term or check more stores</p>
                <div class="empty-actions">
                    <button class="btn-primary" onclick="simpleSearch('iPhone 15')">
                        Search iPhone
                    </button>
                    <button class="btn-secondary" onclick="simpleSearch('Samsung TV')">
                        Search TV
                    </button>
                </div>
            </div>
        `;
    }
    
    addEventListeners() {
        // Add any dynamic interactivity here
    }
}

// Global function to toggle group details
window.toggleGroupDetails = function(groupId) {
    const group = document.querySelector(`[data-group-id="${groupId}"]`);
    if (group) {
        const content = group.querySelector('.comparison-content');
        if (content) {
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
        }
    }
};

// Export to global
window.ProductDisplay = ProductDisplay;
console.log("✅ Smart Product Display Ready!");
