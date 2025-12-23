// UAE Price Hunter - Configuration File
// Save this as config.js - DO NOT SHARE THIS FILE

const UAE_PRICE_HUNTER_CONFIG = {
    // API KEYS (Replace with your own)
    SCRAPEDO_API_KEY: "641c5334a7504c15abb0902cd23d0095b4dbb6711a3",
    
    // UAE Store URLs
    STORE_URLS: {
        AMAZON_UAE: "https://www.amazon.ae",
        NOON_UAE: "https://www.noon.com/uae-en",
        CARREFOUR_UAE: "https://www.carrefouruae.com/mafuae/en",
        SHARAF_DG: "https://www.sharafdg.com",
        EMAX: "https://www.emaxme.com",
        LULU: "https://www.luluhypermarket.com"
    },
    
    // Search Settings
    MAX_RESULTS_PER_STORE: 5,
    CACHE_DURATION: 300000, // 5 minutes in milliseconds
    REQUEST_TIMEOUT: 10000, // 10 seconds
    
    // Scrape.do Settings
    SCRAPEDO_BASE: "https://api.scrape.do",
    
    // Free Proxy List (Backup)
    FREE_PROXIES: [
        {
            host: "51.158.68.133",
            port: 8811,
            country: "FR",
            type: "http"
        },
        // More proxies will be added dynamically
    ],
    
    // User Agents (Rotate to avoid blocking)
    USER_AGENTS: [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
    ],
    
    // UAE-Specific Settings
    CURRENCY: "AED",
    LANGUAGE: "en",
    COUNTRY_CODE: "AE",
    TIMEZONE: "Asia/Dubai",
    
    // Debug Mode (Set to false for production)
    DEBUG_MODE: true,
    
    // Feature Toggles
    FEATURES: {
        ENABLE_CACHING: true,
        ENABLE_PROXY_FALLBACK: true,
        ENABLE_USER_AGENT_ROTATION: true,
        ENABLE_RATE_LIMITING: true
    }
};

// Make it available globally
window.UAE_CONFIG = UAE_PRICE_HUNTER_CONFIG;

console.log("✅ UAE Price Hunter Configuration Loaded");
