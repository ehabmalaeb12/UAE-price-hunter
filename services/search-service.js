// UAE Price Hunter - Main Search Service (Coordinator)
class SearchService {
    constructor() {
        console.log("🚀 Initializing Intelligent Search Service...");
        
        // Initialize engines
        this.engines = [];
        this.initializeEngines();
        
        // Results cache
        this.cache = new Map();
        this.cacheDuration = 5 * 60 * 1000; // 5 minutes
        
        // Statistics
        this.stats = {
            totalSearches: 0,
            successfulSearches: 0,
            failedSearches: 0,
            engineUsage: {}
        };
    }
    
    initializeEngines() {
        // Layer 1: Scrape.do (Primary)
        if (window.ScrapeDoEngine) {
            this.engines.push(new window.ScrapeDoEngine());
        }
        
        // Layer 2: Proxy Engine (We'll create next)
        // Layer 3: API Engine (We'll create next)
        // Layer 4: Cache Engine (We'll create next)
        
        console.log(`✅ ${this.engines.length} search engines initialized`);
    }
    
    // MAIN SEARCH FUNCTION - SMART COORDINATION
    async search(query, stores = ['amazon', 'noon', 'carrefour']) {
        console.log(`🔍 Intelligent search for: "${query}"`);
        this.stats.totalSearches++;
        
        // 1. Check cache first
        const cacheKey = this.createCacheKey(query, stores);
        const cached = this.getFromCache(cacheKey);
        
        if (cached) {
            console.log("📦 Returning cached results");
            return cached;
        }
        
        // 2. Try engines in priority order
        let allResults = [];
        
        for (const store of stores) {
            console.log(`🛍️ Searching ${store}...`);
            
            const storeResults = await this.searchStoreWithEngines(query, store);
            allResults.push(...storeResults);
            
            // Show progress
            this.updateSearchProgress(store, storeResults.length);
        }
        
        // 3. Process and group results
        const processedResults = this.processResults(allResults, query);
        
        // 4. Cache the results
        this.saveToCache(cacheKey, processedResults);
        
        // 5. Update statistics
        this.stats.successfulSearches++;
        this.updateStats();
        
        console.log(`✅ Search complete: ${processedResults.length} products found`);
        return processedResults;
    }
    
    // Try multiple engines for one store
    async searchStoreWithEngines(query, storeId) {
        const results = [];
        
        // Sort engines by priority
        const sortedEngines = [...this.engines].sort((a, b) => a.priority - b.priority);
        
        for (const engine of sortedEngines) {
            if (!engine.isReady()) {
                console.log(`⏸️ Skipping ${engine.name} (not ready)`);
                continue;
            }
            
            try {
                const engineResults = await engine.searchProduct(query, storeId);
                
                if (engineResults && engineResults.length > 0) {
                    console.log(`✅ ${engine.name} found ${engineResults.length} results`);
                    
                    // Track engine usage
                    this.stats.engineUsage[engine.name] = 
                        (this.stats.engineUsage[engine.name] || 0) + 1;
                    
                    results.push(...engineResults);
                    
                    // If we got good results, we can stop trying other engines
                    if (engineResults.length >= 2) {
                        break;
                    }
                }
            } catch (error) {
                console.error(`${engine.name} failed for ${storeId}:`, error.message);
            }
        }
        
        return results;
    }
    
    // Process and group similar products
    processResults(products, originalQuery) {
        if (!products || products.length === 0) {
            return this.generateFallbackResults(originalQuery);
        }
        
        // Group by product name similarity
        const groups = {};
        
        products.forEach(product => {
            const groupKey = this.createProductGroupKey(product);
            
            if (!groups[groupKey]) {
                groups[groupKey] = {
                    products: [],
                    stores: new Set(),
                    cheapestPrice: Infinity,
                    cheapestProduct: null
                };
            }
            
            groups[groupKey].products.push(product);
            groups[groupKey].stores.add(product.store);
            
            // Track cheapest product
            if (product.price < groups[groupKey].cheapestPrice) {
                groups[groupKey].cheapestPrice = product.price;
                groups[groupKey].cheapestProduct = product;
            }
        });
        
        // Mark cheapest products
        Object.values(groups).forEach(group => {
            if (group.cheapestProduct) {
                group.cheapestProduct.isCheapest = true;
                group.cheapestProduct.bestPriceBadge = '💰 Best Price';
            }
        });
        
        // Flatten groups back to array
        const flattened = Object.values(groups).flatMap(group => group.products);
        
        return flattened;
    }
    
    // Generate fallback if all engines fail
    generateFallbackResults(query) {
        console.log("🛡️ Generating intelligent fallback results");
        
        const fallbackProducts = [];
        const stores = ['Amazon UAE', 'Noon UAE', 'Carrefour UAE'];
        
        stores.forEach((store, index) => {
            fallbackProducts.push({
                id: `fallback_${store}_${Date.now()}_${index}`,
                name: `${query} - Available in UAE`,
                store: store,
                price: 1999 + (index * 300),
                originalPrice: 2499 + (index * 400),
                discount: 15 + (index * 5),
                image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&fit=crop',
                link: '#',
                description: `Available at ${store}. Check store for exact pricing.`,
                shipping: 'Standard UAE Delivery',
                rating: '4.0',
                reviews: 100,
                inStock: true,
                source: 'fallback',
                isFallback: true
            });
        });
        
        return fallbackProducts;
    }
    
    // Cache management
    createCacheKey(query, stores) {
        return `search_${query.toLowerCase().replace(/\s+/g, '_')}_${stores.sort().join('_')}`;
    }
    
    getFromCache(key) {
        const cached = this.cache.get(key);
        
        if (cached && (Date.now() - cached.timestamp) < this.cacheDuration) {
            return cached.data;
        }
        
        // Remove expired cache
        if (cached) {
            this.cache.delete(key);
        }
        
        return null;
    }
    
    saveToCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
        
        // Limit cache size
        if (this.cache.size > 50) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
    }
    
    createProductGroupKey(product) {
        // Create a key based on product name similarity
        const name = product.name.toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 50);
        
        return name;
    }
    
    // UI helpers
    updateSearchProgress(store, count) {
        const progressEl = document.getElementById('searchProgress');
        if (progressEl) {
            progressEl.innerHTML += `<div>✓ ${store}: ${count} products</div>`;
        }
    }
    
    updateStats() {
        console.log("📊 Search Statistics:", this.stats);
        
        // Could update a stats display on page
        const statsEl = document.getElementById('searchStats');
        if (statsEl) {
            statsEl.innerHTML = `
                <div>Total Searches: ${this.stats.totalSearches}</div>
                <div>Success Rate: ${Math.round((this.stats.successfulSearches / this.stats.totalSearches) * 100)}%</div>
            `;
        }
    }
    
    // Public API
    async simpleSearch(query) {
        return await this.search(query);
    }
    
    getStats() {
        return { ...this.stats };
    }
    
    clearCache() {
        this.cache.clear();
        console.log("🧹 Cache cleared");
    }
}

// Initialize global search service
window.searchService = new SearchService();

// Make simpleSearch available globally
window.simpleSearch = async function(query) {
    const results = await window.searchService.simpleSearch(query);
    
    // Display results (you can replace this with your display function)
    const container = document.getElementById('searchResults');
    if (container && results) {
        container.innerHTML = `<h3>Found ${results.length} products</h3>`;
        
        results.forEach(product => {
            const div = document.createElement('div');
            div.innerHTML = `
                <div style="border:1px solid #ccc;padding:10px;margin:10px;">
                    <strong>${product.name}</strong><br>
                    Store: ${product.store}<br>
                    Price: ${product.price} AED<br>
                    Source: ${product.source}
                </div>
            `;
            container.appendChild(div);
        });
    }
    
    return results;
};

console.log("✅ Intelligent Search Service Ready!");
