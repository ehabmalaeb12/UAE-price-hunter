// UAE Price Hunter - API Keys Configuration
// SAVE THIS FILE AS config/api-keys.js
// DO NOT COMMIT TO PUBLIC REPO!

const UAE_API_KEYS = {
    // Layer 1: Scrape.do
    SCRAPEDO_API_KEY: "641c5334a7504c15abb0902cd23d0095b4dbb6711a3",
    
    // Layer 3: RapidAPI Keys (Free tier - get yours at rapidapi.com)
    RAPIDAPI_KEY: "", // Leave empty for now
    RAPIDAPI_HOST_AMAZON: "amazon-data-scraper5.p.rapidapi.com",
    RAPIDAPI_HOST_NOON: "noon-com.p.rapidapi.com",
    
    // Layer 4: Firebase (Optional - for caching user data)
    FIREBASE_API_KEY: "",
    FIREBASE_AUTH_DOMAIN: "",
    FIREBASE_PROJECT_ID: ""
};

// UAE Store Configuration
const UAE_STORES = {
    amazon: {
        name: "Amazon UAE",
        baseUrl: "https://www.amazon.ae",
        searchUrl: "https://www.amazon.ae/s?k=",
        enabled: true,
        priority: 1
    },
    noon: {
        name: "Noon UAE", 
        baseUrl: "https://www.noon.com",
        searchUrl: "https://www.noon.com/uae-en/search?q=",
        enabled: true,
        priority: 2
    },
    carrefour: {
        name: "Carrefour UAE",
        baseUrl: "https://www.carrefouruae.com",
        searchUrl: "https://www.carrefouruae.com/mafuae/en/search?text=",
        enabled: true,
        priority: 3
    }
};

// Export to global scope
window.UAE_API_KEYS = UAE_API_KEYS;
window.UAE_STORES = UAE_STORES;

console.log("🔐 API Keys Configuration Loaded");
