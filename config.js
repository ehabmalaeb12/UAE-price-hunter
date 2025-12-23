// UAE Price Hunter - Configuration File
// DO NOT SHARE THIS FILE

const UAE_PRICE_HUNTER_CONFIG = {
    // API KEYS (Keep your current Scrape.do key)
    SCRAPEDO_API_KEY: "641c5334a7504c15abb0902cd23d0095b4dbb6711a3",
    
    // UAE Store Settings
    STORE_URLS: {
        AMAZON_UAE: "https://www.amazon.ae",
        NOON_UAE: "https://www.noon.com/uae-en",
        CARREFOUR_UAE: "https://www.carrefouruae.com/mafuae/en"
    },
    
    // Application Settings
    CURRENCY: "AED",
    LANGUAGE: "en",
    COUNTRY_CODE: "AE",
    TIMEZONE: "Asia/Dubai",
    
    // Feature Toggles
    FEATURES: {
        ENABLE_CACHING: true,
        ENABLE_PROXY_FALLBACK: true,
        DEBUG_MODE: true
    }
};

window.UAE_CONFIG = UAE_PRICE_HUNTER_CONFIG;
console.log("✅ UAE Config Loaded");
