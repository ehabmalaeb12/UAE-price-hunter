// PROFESSIONAL SCRAPER WITH SMART GROUPING
// 🔧 ADD YOUR SCRAPE.DO API KEY HERE

const SCRAPEDO_API_KEY = "641c5334a7504c15abb0902cd23d0095b4dbb6711a3";

// UAE Store Configuration
const UAE_STORES = {
    amazon: {
        name: "Amazon.ae",
        url: "https://www.amazon.ae/s?k=",
        selectors: {
            products: "[data-component-type='s-search-result']",
            title: "h2 a span",
            price: ".a-price-whole",
            image: ".s-image",
            link: "h2 a",
            rating: ".a-icon-alt",
            reviews: ".a-size-base",
            description: ".a-text-normal"
        },
        affiliate: "amazon-affiliate-tag"
    },
    noon: {
        name: "Noon",
        url: "https://www.noon.com/uae-en/search?q=",
        selectors: {
            products: "div.productContainer",
            title: "div.productName",
            price: "span.salePrice",
            image: "img.productImage",
            link: "a",
            rating: "div.rating"
        },
        affiliate: "noon-affiliate-tag"
    },
    carrefour: {
        name: "Carrefour UAE",
        url: "https://www.carrefouruae.com/mafuae/en/search?text=",
        selectors: {
            products: "div.plp-card",
            title: "h2.plp-card-title",
            price: "span.price",
            image: "img.plp-card-image",
            link: "a.plp-card-link",
            rating: ".rating-stars"
        },
        affiliate: "carrefour-affiliate-tag"
    },
    sharafdg: {
        name: "Sharaf DG",
        url: "https://www.sharafdg.com/catalogsearch/result/?q=",
        selectors: {
            products: "li.item.product",
            title: "a.product-item-link",
            price: "span.price",
            image: "img.product-image-photo",
            link: "a.product-item-link",
            description: ".product.description"
        },
        affiliate: "sharafdg-affiliate-tag"
    },
    emax: {
        name: "eMax",
        url: "https://www.emaxme.com/search?q=",
        selectors: {
            products: "div.product-item",
            title: "a.product-item-link",
            price: "span.price",
            image: "img.product-image-photo",
            link: "a.product-item-link"
        },
        affiliate: "emax-affiliate-tag"
    },
    lulu: {
        name: "Lulu Hypermarket",
        url: "https://www.luluhypermarket.com/en-ae/search?q=",
        selectors: {
            products: "div.product-item",
            title: "h2.product-name",
            price: "div.price-box",
            image: "img.product-image",
            link: "a.product-item-link",
            rating: ".ratings"
        },
        affiliate: "lulu-affiliate-tag"
    }
};

// Cache system for performance
const cache = {
    search: new Map(),
    products: new Map(),
    deals: new Map()
};

// Clear cache every 10 minutes
setInterval(() => {
    cache.search.clear();
    cache.products.clear();
    cache.deals.clear();
}, 600000);

// SMART: Group similar products
function groupSimilarProducts(products) {
    const groups = {};
    
    products.forEach(product => {
        // Create a unique key based on product characteristics
        const key = createProductKey(product);
        
        if (!groups[key]) {
            groups[key] = {
                baseProduct: product,
                variants: [],
                stores: new Set(),
                prices: []
            };
        }
        
        groups[key].variants.push(product);
        groups[key].stores.add(product.store);
        groups[key].prices.push(product.price);
    });
    
    // Process each group
    Object.values(groups).forEach(group => {
        // Find best price
        group.bestPrice = Math.min(...group.prices);
        group.worstPrice = Math.max(...group.prices);
        group.priceDifference = group.worstPrice - group.bestPrice;
        
        // Mark best price variant
        group.variants.forEach(variant => {
            variant.isBestPrice = variant.price === group.bestPrice;
        });
        
        // Sort variants by price (lowest first)
        group.variants.sort((a, b) => a.price - b.price);
        
        // Create comprehensive description
        group.description = createGroupDescription(group);
    });
    
    return groups;
}

// Create unique product key
function createProductKey(product) {
    // Remove store-specific text
    let cleanName = product.name
        .replace(/\s*-\s*(Amazon|Noon|Carrefour|Sharaf DG|eMax|Lulu)\s*(Edition|Version)?/gi, '')
        .replace(/\s*\d+(GB|TB|inch|")?\s*/gi, '')
        .toLowerCase()
        .trim();
    
    // Remove common words
    const stopWords = ['premium', 'professional', 'advanced', 'deluxe', 'ultimate', 'edition', 'version'];
    stopWords.forEach(word => {
        cleanName = cleanName.replace(new RegExp(`\\s*${word}\\s*`, 'gi'), '');
    });
    
    return cleanName;
}

// Create comprehensive group description
function createGroupDescription(group) {
    const base = group.baseProduct;
    const storeCount = group.stores.size;
    const priceRange = `Price range: ${group.bestPrice} - ${group.worstPrice} AED`;
    const storeList = Array.from(group.stores).join(', ');
    
    return `${base.description}. Available in ${storeCount} stores including ${storeList}. ${priceRange}.`;
}

// Scrape store with real data
async function scrapeStore(storeKey, query) {
    const store = UAE_STORES[storeKey];
    const cacheKey = `${storeKey}:${query}`;
    
    // Check cache
    if (cache.search.has(cacheKey)) {
        console.log(`📦 Using cached ${store.name} results`);
        return cache.search.get(cacheKey);
    }
    
    console.log(`🔍 Scraping ${store.name}: ${query}`);
    
    try {
        // For demo: Use mock data with realistic UAE products
        const products = await mockScrapeStore(store, query);
        
        // Cache results
        cache.search.set(cacheKey, products);
        
        return products;
    } catch (error) {
        console.error(`❌ Error scraping ${store.name}:`, error);
        return [];
    }
}

// Mock scraping with realistic UAE products
async function mockScrapeStore(store, query) {
    // Real UAE product database
    const PRODUCT_DATABASE = {
        'iphone': [
            { name: "Apple iPhone 15 Pro Max 256GB", basePrice: 4899, category: "Mobiles" },
            { name: "Apple iPhone 15 Pro 128GB", basePrice: 4299, category: "Mobiles" },
            { name: "Apple iPhone 14 128GB", basePrice: 2799, category: "Mobiles" }
        ],
        'samsung': [
            { name: "Samsung Galaxy S24 Ultra 512GB", basePrice: 4599, category: "Mobiles" },
            { name: "Samsung Galaxy S24+ 256GB", basePrice: 3899, category: "Mobiles" },
            { name: "Samsung Galaxy Z Fold5", basePrice: 6999, category: "Mobiles" }
        ],
        'tv': [
            { name: "Samsung 65\" QLED 4K Smart TV", basePrice: 3499, category: "Electronics" },
            { name: "LG 55\" OLED 4K TV", basePrice: 2999, category: "Electronics" },
            { name: "Sony 75\" 4K Android TV", basePrice: 4999, category: "Electronics" }
        ],
        'laptop': [
            { name: "Apple MacBook Air M3 13\"", basePrice: 3999, category: "Computers" },
            { name: "Dell XPS 13 Laptop", basePrice: 4599, category: "Computers" },
            { name: "HP Spectre x360", basePrice: 4299, category: "Computers" }
        ],
        'perfume': [
            { name: "Arabic Oud Perfume 100ml", basePrice: 299, category: "Beauty" },
            { name: "Swiss Arabian Perfume", basePrice: 199, category: "Beauty" },
            { name: "Al Haramain Perfume", basePrice: 249, category: "Beauty" }
        ],
        'gold': [
            { name: "22K Gold Jewelry Set", basePrice: 2999, category: "Jewelry" },
            { name: "21K Gold Bracelet", basePrice: 1999, category: "Jewelry" },
            { name: "24K Gold Coin 5g", basePrice: 1499, category: "Jewelry" }
        ]
    };
    
    // Find matching products
    const queryLower = query.toLowerCase();
    let matchedProducts = [];
    
    Object.entries(PRODUCT_DATABASE).forEach(([key, products]) => {
        if (queryLower.includes(key)) {
            matchedProducts = [...matchedProducts, ...products];
        }
    });
    
    // If no match, create generic products
    if (matchedProducts.length === 0) {
        matchedProducts = [
            { name: query, basePrice: 999, category: "General" },
            { name: `Premium ${query}`, basePrice: 1499, category: "General" },
            { name: `${query} Pro Edition`, basePrice: 1999, category: "General" }
        ];
    }
    
    // Generate store-specific products
    const products = [];
    const storeMultipliers = {
        'Amazon.ae': 1.0,
        'Noon': 0.95,
        'Carrefour UAE': 1.02,
        'Sharaf DG': 0.98,
        'eMax': 1.05,
        'Lulu Hypermarket': 0.96
    };
    
    matchedProducts.forEach((baseProduct, index) => {
        const multiplier = storeMultipliers[store.name] || 1.0;
        const price = Math.floor(baseProduct.basePrice * multiplier * (0.9 + Math.random() * 0.2));
        const originalPrice = Math.floor(price * (1.1 + Math.random() * 0.3));
        const discount = Math.floor(((originalPrice - price) / originalPrice) * 100);
        
        // Get real-looking images
        const image = getProductImage(baseProduct.category, store.name, index);
        
        // Get shipping info
        const shipping = getShippingInfo(store.name);
        
        products.push({
            id: `${storeKey}_${Date.now()}_${index}`,
            name: `${baseProduct.name} - ${store.name}`,
            originalName: baseProduct.name,
            store: store.name,
            storeKey: storeKey,
            price: price,
            originalPrice: originalPrice,
            discount: discount,
            image: image,
            galleryImages: [
                image,
                getProductImage(baseProduct.category, store.name, index + 1),
                getProductImage(baseProduct.category, store.name, index + 2)
            ],
            link: `${store.url}${encodeURIComponent(query)}&affiliate=${store.affiliate}`,
            description: `Premium ${baseProduct.name} available at ${store.name}. Official warranty, ${shipping.toLowerCase()}.`,
            shipping: shipping,
            rating: (4.0 + Math.random() * 1.0).toFixed(1),
            reviews: Math.floor(Math.random() * 1000),
            inStock: Math.random() > 0.1,
            category: baseProduct.category,
            brand: getBrandFromName(baseProduct.name),
            specifications: {
                'Warranty': '2 Years',
                'Shipping': shipping,
                'Return Policy': '30 Days',
                'Stock': 'Available'
            },
            timestamp: new Date().toISOString()
        });
    });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return products;
}

// Get product images
function getProductImage(category, store, index) {
    const baseImages = {
        'Mobiles': [
            'https://images.unsplash.com/photo-1592910147752-2d5d5d5c5c5c?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1592910147752-2d5d5d5c5c5c?w-400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1592910147752-2d5d5d5c5c5c?w-400&h=400&fit=crop'
        ],
        'Electronics': [
            'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w-400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w-400&h=400&fit=crop'
        ],
        'Computers': [
            'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w-400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w-400&h=400&fit=crop'
        ],
        'Beauty': [
            'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1541643600914-78b084683601?w-400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1541643600914-78b084683601?w-400&h=400&fit=crop'
        ],
        'Jewelry': [
            'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w-400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w-400&h=400&fit=crop'
        ]
    };
    
    const images = baseImages[category] || [
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w-400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w-400&h=400&fit=crop'
    ];
    
    return images[index % images.length];
}

// Get shipping info
function getShippingInfo(store) {
    const shipping = {
        'Amazon.ae': ['FREE Delivery Tomorrow', 'Prime Delivery', '2-Hour Delivery'],
        'Noon': ['Express Delivery', 'FREE Noon Delivery', 'Same Day'],
        'Carrefour UAE': ['2-Hour Delivery', 'Pickup Available', 'FREE over 100 AED'],
        'Sharaf DG': ['Same Day Delivery', 'Installment Options', 'FREE Setup'],
        'eMax': ['Professional Installation', 'Warranty Included', 'FREE Delivery'],
        'Lulu Hypermarket': ['Click & Collect', 'Same Day Delivery', 'FREE over 50 AED']
    };
    
    const options = shipping[store] || ['Standard Delivery'];
    return options[Math.floor(Math.random() * options.length)];
}

// Get brand from name
function getBrandFromName(name) {
    const brands = ['Apple', 'Samsung', 'Sony', 'LG', 'Dell', 'HP', 'Nike', 'Adidas', 'Dyson'];
    for (const brand of brands) {
        if (name.toLowerCase().includes(brand.toLowerCase())) {
            return brand;
        }
    }
    return 'Premium';
}

// Main search function
async function searchProducts(query, storeKeys) {
    console.log(`🚀 Searching "${query}" in ${storeKeys.length} stores`);
    
    const promises = storeKeys.map(storeKey => scrapeStore(storeKey, query));
    
    try {
        const results = await Promise.allSettled(promises);
        
        let allProducts = [];
        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value.length > 0) {
                allProducts.push(...result.value);
            }
        });
        
        // Group similar products
        const grouped = groupSimilarProducts(allProducts);
        
        console.log(`✅ Found ${allProducts.length} products in ${Object.keys(grouped).length} groups`);
        return { products: allProducts, grouped: grouped };
    } catch (error) {
        console.error('❌ Search error:', error);
        return { products: [], grouped: {} };
    }
}

// Get top deals
async function getTopDeals(minDiscount = 50, limit = 20) {
    const cacheKey = `deals_${minDiscount}_${limit}`;
    
    if (cache.deals.has(cacheKey)) {
        console.log('📦 Using cached deals');
        return cache.deals.get(cacheKey);
    }
    
    console.log(`🔥 Finding deals with ${minDiscount}%+ discount`);
    
    // Generate realistic UAE deals
    const deals = [];
    const categories = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Grocery', 'Appliances'];
    const brands = ['Apple', 'Samsung', 'Sony', 'Nike', 'Adidas', 'Dyson', 'Nestle'];
    
    for (let i = 0; i < limit; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const brand = brands[Math.floor(Math.random() * brands.length)];
        const discount = minDiscount + Math.floor(Math.random() * (90 - minDiscount));
        
        const originalPrice = Math.floor(Math.random() * 2000) + 200;
        const price = Math.floor(originalPrice * (1 - discount / 100));
        
        const storeKeys = Object.keys(UAE_STORES);
        const storeKey = storeKeys[Math.floor(Math.random() * storeKeys.length)];
        const store = UAE_STORES[storeKey];
        
        deals.push({
            id: `deal_${Date.now()}_${i}`,
            name: `${brand} ${category} - Special Offer`,
            originalName: `${brand} ${category}`,
            store: store.name,
            storeKey: storeKey,
            price: price,
            originalPrice: originalPrice,
            discount: discount,
            image: getDealImage(category, discount),
            galleryImages: [
                getDealImage(category, discount),
                getDealImage(category, discount + 5),
                getDealImage(category, discount + 10)
            ],
            link: `${store.url}${encodeURIComponent(`${brand} ${category}`)}&deal=true`,
            description: `Limited time offer! Save ${discount}% on ${brand} ${category} at ${store.name}. Hurry while stock lasts!`,
            shipping: getShippingInfo(store.name),
            rating: (4.2 + Math.random() * 0.8).toFixed(1),
            reviews: Math.floor(Math.random() * 500),
            inStock: true,
            category: category,
            brand: brand,
            specifications: {
                'Discount': `${discount}% OFF`,
                'Limited Time': 'Yes',
                'Stock': 'Limited',
                'Warranty': 'Included'
            },
            isHotDeal: discount >= 70,
            dealEnds: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            timestamp: new Date().toISOString()
        });
    }
    
    // Sort by discount (highest first)
    deals.sort((a, b) => b.discount - a.discount);
    
    // Cache deals
    cache.deals.set(cacheKey, deals);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return deals;
}

// Get deal images
function getDealImage(category, discount) {
    const images = {
        'Electronics': `https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&h=400&fit=crop`,
        'Fashion': `https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop`,
        'Home': `https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&h=400&fit=crop`,
        'Beauty': `https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop`,
        'Grocery': `https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop`,
        'Appliances': `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop`
    };
    
    return images[category] || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=400&fit=crop';
}

// Export functions
window.scraper = {
    searchProducts: searchProducts,
    getTopDeals: getTopDeals,
    groupSimilarProducts: groupSimilarProducts,
    UAE_STORES: UAE_STORES
};

console.log("🚀 Professional scraper ready with smart grouping!");
