// SCRAPE.DO API INTEGRATION - UAE PRICE HUNTER
// 🔧 ADD YOUR SCRAPE.DO API KEY HERE

const SCRAPEDO_API_KEY = "641c5334a7504c15abb0902cd23d0095b4dbb6711a3";

// Store configurations with real UAE store URLs
const STORE_CONFIGS = {
  amazon: {
    name: "Amazon.ae",
    baseUrl: "https://www.amazon.ae",
    searchUrl: "https://www.amazon.ae/s?k=",
    selectors: {
      container: "div.s-result-item[data-component-type='s-search-result']",
      title: "h2 a span",
      price: ".a-price-whole",
      image: "img.s-image",
      link: "h2 a",
      rating: ".a-icon-alt"
    }
  },
  noon: {
    name: "Noon",
    baseUrl: "https://www.noon.com",
    searchUrl: "https://www.noon.com/uae-en/search?q=",
    selectors: {
      container: "div.productContainer",
      title: "div.productName",
      price: "span.salePrice",
      image: "img.productImage",
      link: "a",
      rating: "div.rating"
    }
  },
  carrefour: {
    name: "Carrefour UAE",
    baseUrl: "https://www.carrefouruae.com",
    searchUrl: "https://www.carrefouruae.com/mafuae/en/search?text=",
    selectors: {
      container: "div.plp-card",
      title: "h2.plp-card-title",
      price: "span.price",
      image: "img.plp-card-image",
      link: "a.plp-card-link",
      rating: "div.rating"
    }
  },
  sharafdg: {
    name: "Sharaf DG",
    baseUrl: "https://www.sharafdg.com",
    searchUrl: "https://www.sharafdg.com/catalogsearch/result/?q=",
    selectors: {
      container: "li.item.product",
      title: "a.product-item-link",
      price: "span.price",
      image: "img.product-image-photo",
      link: "a.product-item-link",
      rating: "div.product-reviews-summary"
    }
  },
  emax: {
    name: "eMax",
    baseUrl: "https://www.emaxme.com",
    searchUrl: "https://www.emaxme.com/search?q=",
    selectors: {
      container: "div.product-item",
      title: "a.product-item-link",
      price: "span.price",
      image: "img.product-image-photo",
      link: "a.product-item-link",
      rating: "div.product-reviews-summary"
    }
  },
  lulu: {
    name: "Lulu Hypermarket",
    baseUrl: "https://www.luluhypermarket.com",
    searchUrl: "https://www.luluhypermarket.com/en-ae/search?q=",
    selectors: {
      container: "div.product-item",
      title: "h2.product-name",
      price: "div.price-box",
      image: "img.product-image",
      link: "a.product-item-link",
      rating: "div.ratings"
    }
  }
};

// Cache for search results (to avoid duplicate API calls)
const searchCache = new Map();

// Scrape product from a single store
async function scrapeStore(storeKey, query) {
  const store = STORE_CONFIGS[storeKey];
  if (!store) {
    console.error(`Store ${storeKey} not configured`);
    return [];
  }

  const cacheKey = `${storeKey}:${query}`;
  if (searchCache.has(cacheKey)) {
    console.log(`📦 Using cached results for ${store.name}: ${query}`);
    return searchCache.get(cacheKey);
  }

  console.log(`🔍 Scraping ${store.name} for: ${query}`);
  
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `${store.searchUrl}${encodedQuery}`;
    
    // For demo, we'll use mock data. Replace with real scrape.do API call:
    // const response = await fetch(`https://api.scrape.do?token=${SCRAPEDO_API_KEY}&url=${encodeURIComponent(url)}`);
    // const html = await response.text();
    // const products = parseHTML(html, store.selectors);
    
    // Mock data for demo
    const products = generateMockProducts(store, query);
    
    // Cache the results
    searchCache.set(cacheKey, products);
    setTimeout(() => searchCache.delete(cacheKey), 300000); // Clear cache after 5 minutes
    
    return products;
  } catch (error) {
    console.error(`❌ Error scraping ${store.name}:`, error);
    return [];
  }
}

// Parse HTML using selectors (for real scraping)
function parseHTML(html, selectors) {
  // This is a simplified parser. In production, use a proper HTML parser like jsdom or cheerio
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const products = [];
  const productElements = doc.querySelectorAll(selectors.container);
  
  productElements.forEach((element, index) => {
    if (index >= 10) return; // Limit to 10 products per store
    
    try {
      const titleEl = element.querySelector(selectors.title);
      const priceEl = element.querySelector(selectors.price);
      const imageEl = element.querySelector(selectors.image);
      const linkEl = element.querySelector(selectors.link);
      const ratingEl = element.querySelector(selectors.rating);
      
      if (titleEl && priceEl) {
        const product = {
          title: titleEl.textContent.trim(),
          price: extractPrice(priceEl.textContent),
          image: imageEl ? imageEl.src : getDefaultImage(),
          link: linkEl ? linkEl.href : '#',
          rating: ratingEl ? extractRating(ratingEl.textContent) : '4.0',
          store: store.name
        };
        
        products.push(product);
      }
    } catch (error) {
      console.error('Error parsing product:', error);
    }
  });
  
  return products;
}

// Generate mock products for demo
function generateMockProducts(store, query) {
  const products = [];
  const basePrice = Math.floor(Math.random() * 1000) + 100;
  
  // Generate 3-6 mock products per store
  const productCount = Math.floor(Math.random() * 4) + 3;
  
  for (let i = 0; i < productCount; i++) {
    const priceVariation = Math.floor(Math.random() * 200) - 100;
    const price = Math.max(50, basePrice + priceVariation);
    const originalPrice = price * (1 + Math.random() * 0.3);
    
    const product = {
      id: `${store.name.toLowerCase().replace(' ', '_')}_${Date.now()}_${i}`,
      name: `${query} - ${store.name} Edition ${i + 1}`,
      store: store.name.toLowerCase().replace('.', '').replace(' ', ''),
      price: price,
      originalPrice: Math.floor(originalPrice),
      discount: Math.floor(((originalPrice - price) / originalPrice) * 100),
      image: getStoreImage(store.name, i),
      description: `Premium ${query} available at ${store.name}. Best quality guaranteed with warranty.`,
      shipping: getRandomShipping(store.name),
      rating: (3.5 + Math.random() * 1.5).toFixed(1),
      reviews: Math.floor(Math.random() * 1000),
      inStock: Math.random() > 0.2,
      url: `${store.baseUrl}/product/${encodeURIComponent(query)}-${i}`,
      timestamp: new Date().toISOString()
    };
    
    products.push(product);
  }
  
  return products;
}

// Helper functions
function extractPrice(priceText) {
  const match = priceText.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

function extractRating(ratingText) {
  const match = ratingText.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 4.0;
}

function getDefaultImage() {
  return 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=200&fit=crop&auto=format&q=80';
}

function getStoreImage(storeName, index) {
  const storeImages = {
    'Amazon.ae': [
      'https://images.unsplash.com/photo-1546054451-aa224f6f0b9c?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&h=200&fit=crop'
    ],
    'Noon': [
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&h=200&fit=crop'
    ],
    'Carrefour UAE': [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=200&fit=crop'
    ],
    'Sharaf DG': [
      'https://images.unsplash.com/photo-1491336477066-31156b5e4f35?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=200&fit=crop'
    ],
    'eMax': [
      'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&h=200&fit=crop'
    ],
    'Lulu Hypermarket': [
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=300&h=200&fit=crop'
    ]
  };
  
  const images = storeImages[storeName] || [
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=200&fit=crop',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop',
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop'
  ];
  
  return images[index % images.length];
}

function getRandomShipping(storeName) {
  const shippingOptions = {
    'Amazon.ae': ['FREE Delivery Tomorrow', 'Prime Delivery Today', 'FREE Delivery by Amazon'],
    'Noon': ['Express Delivery', 'FREE Noon Delivery', 'Next Day Delivery'],
    'Carrefour UAE': ['2-Hour Delivery', 'Pickup Available', 'FREE Delivery over 100 AED'],
    'Sharaf DG': ['Same Day Delivery', 'Installment Options', 'FREE Installation'],
    'eMax': ['Professional Setup', 'Warranty Included', 'FREE Delivery'],
    'Lulu Hypermarket': ['Click & Collect', 'Same Day Delivery', 'FREE Delivery over 50 AED']
  };
  
  const options = shippingOptions[storeName] || ['Standard Delivery'];
  return options[Math.floor(Math.random() * options.length)];
}

// Main search function - searches all selected stores
async function searchAllStores(query, storeKeys) {
  console.log(`🚀 Starting search for "${query}" in ${storeKeys.length} stores`);
  
  const promises = storeKeys.map(storeKey => scrapeStore(storeKey, query));
  
  try {
    const results = await Promise.allSettled(promises);
    
    const allProducts = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        allProducts.push(...result.value);
      } else {
        console.warn(`⚠️ Store ${storeKeys[index]} returned no results`);
      }
    });
    
    // Group similar products and find best prices
    const processedProducts = processProducts(allProducts);
    
    console.log(`✅ Search complete: Found ${processedProducts.length} products`);
    return processedProducts;
  } catch (error) {
    console.error('❌ Error in searchAllStores:', error);
    return [];
  }
}

// Process and group products
function processProducts(products) {
  // Group by product name (simplified grouping)
  const productGroups = {};
  
  products.forEach(product => {
    const key = product.name.split(' - ')[0]; // Simple grouping by first part of name
    
    if (!productGroups[key]) {
      productGroups[key] = [];
    }
    
    productGroups[key].push(product);
  });
  
  // Find best price in each group
  Object.values(productGroups).forEach(group => {
    if (group.length > 0) {
      const bestPrice = Math.min(...group.map(p => p.price));
      group.forEach(product => {
        product.isBestPrice = product.price === bestPrice;
      });
    }
  });
  
  // Flatten the groups back to array
  return Object.values(productGroups).flat();
}

// Export functions
window.scrapeDo = {
  searchAllStores: searchAllStores,
  scrapeStore: scrapeStore,
  STORE_CONFIGS: STORE_CONFIGS
};

console.log("🚀 Scrape.do integration ready");
