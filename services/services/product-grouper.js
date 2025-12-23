// UAE Price Hunter - Intelligent Product Grouper
// This finds SAME products across different stores

class ProductGrouper {
    constructor() {
        console.log("🤖 Initializing Intelligent Product Grouper...");
    }
    
    // MAIN FUNCTION: Group identical/similar products
    groupProducts(products, originalQuery) {
        console.log(`📊 Grouping ${products.length} products...`);
        
        if (!products || products.length === 0) {
            return this.generateFallbackGroup(originalQuery);
        }
        
        // Step 1: Clean and normalize product data
        const cleanedProducts = products.map(p => this.cleanProduct(p));
        
        // Step 2: Group by product identity
        const groups = this.groupByIdentity(cleanedProducts, originalQuery);
        
        // Step 3: Find cheapest in each group
        this.markCheapestProducts(groups);
        
        // Step 4: Generate comparison data
        const comparisonGroups = this.createComparisonGroups(groups);
        
        console.log(`✅ Created ${comparisonGroups.length} comparison groups`);
        return comparisonGroups;
    }
    
    // Clean and normalize product data
    cleanProduct(product) {
        // Extract key information
        const cleaned = {
            ...product,
            normalizedName: this.normalizeProductName(product.name),
            brand: this.extractBrand(product.name),
            model: this.extractModel(product.name),
            storage: this.extractStorage(product.name),
            color: this.extractColor(product.name),
            keyFeatures: this.extractFeatures(product.name, product.description)
        };
        
        return cleaned;
    }
    
    // Group products that are the same/similar
    groupByIdentity(products, originalQuery) {
        const groups = {};
        
        products.forEach(product => {
            // Create a unique group key based on product identity
            const groupKey = this.createGroupKey(product, originalQuery);
            
            if (!groups[groupKey]) {
                groups[groupKey] = {
                    groupId: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    products: [],
                    stores: new Set(),
                    cheapestPrice: Infinity,
                    cheapestProduct: null,
                    groupName: this.determineGroupName(product, originalQuery),
                    category: this.determineCategory(product, originalQuery)
                };
            }
            
            groups[groupKey].products.push(product);
            groups[groupKey].stores.add(product.store);
            
            // Update cheapest tracking
            if (product.price < groups[groupKey].cheapestPrice) {
                groups[groupKey].cheapestPrice = product.price;
                groups[groupKey].cheapestProduct = product;
            }
        });
        
        return groups;
    }
    
    // Create smart group key
    createGroupKey(product, originalQuery) {
        const keyParts = [];
        
        // 1. Brand
        if (product.brand) keyParts.push(product.brand.toLowerCase());
        
        // 2. Model (iPhone 15, Galaxy S24, etc.)
        if (product.model) keyParts.push(product.model.toLowerCase());
        
        // 3. Storage/RAM
        if (product.storage) keyParts.push(product.storage);
        
        // 4. Color (if available)
        if (product.color) keyParts.push(product.color.toLowerCase());
        
        // 5. Main product name from query
        const queryKey = this.extractMainProductName(originalQuery);
        if (queryKey) keyParts.push(queryKey);
        
        // If we don't have enough info, use normalized name
        if (keyParts.length < 2) {
            keyParts.push(product.normalizedName.substring(0, 30));
        }
        
        return keyParts.join('_').replace(/\s+/g, '_');
    }
    
    // Mark cheapest product in each group
    markCheapestProducts(groups) {
        Object.values(groups).forEach(group => {
            if (group.cheapestProduct && group.products.length > 1) {
                group.cheapestProduct.isCheapest = true;
                group.cheapestProduct.priceBadge = '💰 BEST PRICE';
                group.cheapestProduct.savings = this.calculateSavings(group);
            }
            
            // Mark others as alternatives
            group.products.forEach(product => {
                if (product !== group.cheapestProduct) {
                    product.isAlternative = true;
                    product.priceDifference = product.price - group.cheapestPrice;
                    product.priceComparison = `${product.priceDifference} AED more than ${group.cheapestProduct.store}`;
                }
            });
        });
    }
    
    // Create comparison groups for display
    createComparisonGroups(groups) {
        return Object.values(groups).map(group => ({
            ...group,
            storeCount: group.stores.size,
            priceRange: this.calculatePriceRange(group.products),
            averageRating: this.calculateAverageRating(group.products),
            totalReviews: this.calculateTotalReviews(group.products),
            bestShipping: this.findBestShipping(group.products),
            bestWarranty: this.findBestWarranty(group.products)
        }));
    }
    
    // HELPER FUNCTIONS FOR UAE MARKET
    normalizeProductName(name) {
        if (!name) return '';
        
        return name.toLowerCase()
            .replace(/[^a-z0-9\s]/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }
    
    extractBrand(name) {
        const uaeBrands = [
            'Apple', 'Samsung', 'Sony', 'LG', 'Dell', 'HP', 'Lenovo',
            'Xiaomi', 'OnePlus', 'Oppo', 'Vivo', 'Realme', 'Nokia',
            'Dyson', 'Philips', 'Panasonic', 'Toshiba', 'Sharp'
        ];
        
        const nameLower = name.toLowerCase();
        for (const brand of uaeBrands) {
            if (nameLower.includes(brand.toLowerCase())) {
                return brand;
            }
        }
        
        return null;
    }
    
    extractModel(name) {
        // Extract UAE common models
        const patterns = [
            /\b(iphone\s+\d+\s*(?:pro|max|plus)?)/i,
            /\b(galaxy\s+(?:s|note|z|a)\d+)/i,
            /\b(xiaomi\s+(?:redmi|mi|poco)\s+\w+)/i,
            /\b(macbook\s+(?:air|pro)\s+\w*)/i,
            /\b(ipad\s+(?:air|pro|mini)?)/i,
            /\b(watch\s+(?:series\s+\d+|ultra))/i,
            /\b(\d+["']?\s*(?:inch|")\s*(?:tv|television))/i
        ];
        
        for (const pattern of patterns) {
            const match = name.match(pattern);
            if (match) return match[1];
        }
        
        return null;
    }
    
    extractStorage(name) {
        const storageMatch = name.match(/\b(\d+)\s*(?:GB|TB|gb|tb)\b/i);
        return storageMatch ? storageMatch[1] + 'GB' : null;
    }
    
    extractColor(name) {
        const uaeColors = [
            'black', 'white', 'gold', 'silver', 'gray', 'blue', 'red',
            'green', 'purple', 'pink', 'midnight', 'starlight', 'graphite',
            'sierra blue', 'alpine green', 'deep purple', 'titanium'
        ];
        
        const nameLower = name.toLowerCase();
        for (const color of uaeColors) {
            if (nameLower.includes(color)) {
                return color.charAt(0).toUpperCase() + color.slice(1);
            }
        }
        
        return null;
    }
    
    extractMainProductName(query) {
        // Extract main product from search query
        const commonProducts = [
            'iphone', 'samsung', 'galaxy', 'tv', 'television', 'laptop',
            'macbook', 'ipad', 'watch', 'airpods', 'playstation', 'xbox',
            'perfume', 'oud', 'fragrance', 'gold', 'jewelry', 'necklace',
            'ring', 'bracelet', 'dyson', 'airwrap', 'vacuum', 'refrigerator',
            'washing machine', 'air conditioner'
        ];
        
        const queryLower = query.toLowerCase();
        for (const product of commonProducts) {
            if (queryLower.includes(product)) {
                return product;
            }
        }
        
        return queryLower.split(' ')[0] || 'product';
    }
    
    determineCategory(product, query) {
        const queryLower = query.toLowerCase();
        
        if (queryLower.includes('iphone') || queryLower.includes('samsung') || 
            queryLower.includes('mobile') || queryLower.includes('phone')) {
            return 'Smartphones';
        }
        if (queryLower.includes('tv') || queryLower.includes('television')) {
            return 'Televisions';
        }
        if (queryLower.includes('laptop') || queryLower.includes('macbook')) {
            return 'Laptops';
        }
        if (queryLower.includes('perfume') || queryLower.includes('oud')) {
            return 'Fragrances';
        }
        if (queryLower.includes('gold') || queryLower.includes('jewelry')) {
            return 'Jewelry';
        }
        if (queryLower.includes('watch')) {
            return 'Watches';
        }
        
        return 'Electronics';
    }
    
    // CALCULATION HELPERS
    calculateSavings(group) {
        if (group.products.length < 2) return 0;
        
        const prices = group.products.map(p => p.price).sort((a, b) => a - b);
        return prices[prices.length - 1] - prices[0];
    }
    
    calculatePriceRange(products) {
        if (products.length === 0) return 'N/A';
        
        const prices = products.map(p => p.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        
        return min === max ? `${min} AED` : `${min} - ${max} AED`;
    }
    
    calculateAverageRating(products) {
        if (products.length === 0) return 'N/A';
        
        const ratings = products
            .map(p => parseFloat(p.rating))
            .filter(r => !isNaN(r));
        
        if (ratings.length === 0) return 'N/A';
        
        const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
        return avg.toFixed(1);
    }
    
    calculateTotalReviews(products) {
        return products.reduce((sum, p) => sum + (parseInt(p.reviews) || 0), 0);
    }
    
    findBestShipping(products) {
        const shippingOptions = products.map(p => p.shipping);
        
        // Prioritize fast/free shipping
        for (const shipping of shippingOptions) {
            if (shipping.toLowerCase().includes('free') || 
                shipping.toLowerCase().includes('express') ||
                shipping.toLowerCase().includes('same day')) {
                return shipping;
            }
        }
        
        return shippingOptions[0] || 'Standard Delivery';
    }
    
    findBestWarranty(products) {
        // UAE prefers longer warranties
        const warranties = products.map(p => p.warranty || '');
        
        for (const warranty of warranties) {
            if (warranty.includes('2 year') || warranty.includes('24 month')) {
                return warranty;
            }
            if (warranty.includes('1 year') || warranty.includes('12 month')) {
                return warranty;
            }
        }
        
        return warranties[0] || 'Standard Warranty';
    }
    
    // FALLBACK FOR EMPTY RESULTS
    generateFallbackGroup(query) {
        console.log("🛡️ Creating fallback comparison group");
        
        const stores = ['Amazon UAE', 'Noon UAE', 'Carrefour UAE'];
        const products = stores.map((store, index) => ({
            id: `fallback_${store}_${Date.now()}_${index}`,
            name: `${query} - Available at ${store}`,
            store: store,
            price: 1999 + (index * 300),
            originalPrice: 2499 + (index * 400),
            discount: 15 + (index * 5),
            image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&fit=crop',
            description: `Searching for real prices... This is a placeholder for ${query}`,
            shipping: index === 0 ? 'FREE Delivery' : 'Standard Delivery',
            rating: '4.0',
            reviews: 100 + (index * 50),
            inStock: true,
            isCheapest: index === 0,
            priceBadge: index === 0 ? '💰 ESTIMATED PRICE' : '',
            source: 'fallback'
        }));
        
        return [{
            groupId: `fallback_group_${Date.now()}`,
            groupName: query,
            products: products,
            stores: new Set(stores),
            storeCount: stores.length,
            cheapestPrice: 1999,
            cheapestProduct: products[0],
            priceRange: '1999 - 2599 AED',
            category: 'General',
            isFallback: true
        }];
    }
}

// Export to global scope
window.ProductGrouper = ProductGrouper;
console.log("✅ Intelligent Product Grouper Ready!");
