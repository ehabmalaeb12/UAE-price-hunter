// UAE Price Hunter — Search Service V1 (Frontend-Safe, Intelligent)

class SearchService {
    constructor() {
        console.log("🚀 SearchService V1 initializing...");

        this.stores = [
            { id: "amazon", name: "Amazon UAE", multiplier: 1.0 },
            { id: "noon", name: "Noon UAE", multiplier: 0.97 },
            { id: "carrefour", name: "Carrefour UAE", multiplier: 1.03 },
            { id: "sharaf", name: "Sharaf DG", multiplier: 1.02 },
            { id: "aliexpress", name: "AliExpress", multiplier: 0.92 }
        ];

        this.cache = new Map();
        this.cacheTTL = 5 * 60 * 1000; // 5 minutes

        this.lastGroups = [];
    }

    /* ===============================
       MAIN SEARCH ENTRY
    =============================== */
    async search(query) {
        console.log(`🔍 Searching for: ${query}`);

        const cacheKey = query.toLowerCase().trim();
        const cached = this.getCache(cacheKey);
        if (cached) return cached;

        const intent = ProductResolver.resolve(query);
        const rawProducts = [];

        for (const store of this.stores) {
            const price = PriceEngine.estimate(intent, store);
            rawProducts.push(
                ProductFactory.create(intent, store, price)
            );
        }

        const grouped = ProductGrouper.group(rawProducts, intent);
        this.lastGroups = grouped;

        const flatResults = grouped.flatMap(g => g.products);
        this.saveCache(cacheKey, flatResults);

        return flatResults;
    }

    /* ===============================
       CACHE
    =============================== */
    getCache(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        if (Date.now() - item.time > this.cacheTTL) {
            this.cache.delete(key);
            return null;
        }
        return item.data;
    }

    saveCache(key, data) {
        this.cache.set(key, { data, time: Date.now() });
    }
}

/* ===============================
   PRODUCT RESOLVER (INTENT)
=============================== */
class ProductResolver {
    static resolve(query) {
        const lower = query.toLowerCase();

        return {
            query,
            category: this.detectCategory(lower),
            brand: this.detectBrand(lower),
            model: query,
            premium: /pro|max|ultra|plus/.test(lower)
        };
    }

    static detectCategory(q) {
        if (q.includes("iphone") || q.includes("samsung")) return "smartphone";
        if (q.includes("tv")) return "tv";
        if (q.includes("laptop")) return "laptop";
        if (q.includes("perfume")) return "perfume";
        return "general";
    }

    static detectBrand(q) {
        if (q.includes("apple")) return "Apple";
        if (q.includes("samsung")) return "Samsung";
        if (q.includes("sony")) return "Sony";
        return "Generic";
    }
}

/* ===============================
   PRICE ENGINE (INTELLIGENT ESTIMATE)
=============================== */
class PriceEngine {
    static estimate(intent, store) {
        let base;

        switch (intent.category) {
            case "smartphone": base = intent.premium ? 4300 : 3500; break;
            case "tv": base = 3000; break;
            case "laptop": base = 4200; break;
            case "perfume": base = 350; break;
            default: base = 2000;
        }

        const variance = Math.random() * 150;
        const price = Math.round((base + variance) * store.multiplier);

        return price;
    }
}

/* ===============================
   PRODUCT FACTORY
=============================== */
class ProductFactory {
    static create(intent, store, price) {
        return {
            id: `${store.id}_${Date.now()}`,
            name: intent.model,
            store: store.name,
            storeId: store.id,
            price,
            originalPrice: Math.round(price * 1.12),
            discount: Math.round(((price * 1.12 - price) / (price * 1.12)) * 100),
            image: ImageEngine.get(intent),
            affiliateLink: AffiliateEngine.link(store.id, intent.query),
            estimated: true,
            rating: (4 + Math.random()).toFixed(1),
            reviews: Math.floor(Math.random() * 500 + 50)
        };
    }
}

/* ===============================
   PRODUCT GROUPER
=============================== */
class ProductGrouper {
    static group(products, intent) {
        const mainGroup = {
            title: intent.model,
            products: [...products]
        };

        // Mark cheapest
        let cheapest = mainGroup.products[0];
        mainGroup.products.forEach(p => {
            if (p.price < cheapest.price) cheapest = p;
        });
        cheapest.bestPrice = true;

        return [mainGroup];
    }
}

/* ===============================
   IMAGE ENGINE
=============================== */
class ImageEngine {
    static get(intent) {
        if (intent.category === "smartphone")
            return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600";
        if (intent.category === "laptop")
            return "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600";
        return "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600";
    }
}

/* ===============================
   AFFILIATE ENGINE (PLACEHOLDER)
=============================== */
class AffiliateEngine {
    static link(storeId, query) {
        const encoded = encodeURIComponent(query);
        if (storeId === "amazon")
            return `https://www.amazon.ae/s?k=${encoded}&tag=YOURTAG-21`;
        if (storeId === "noon")
            return `https://www.noon.com/uae-en/search?q=${encoded}`;
        return "#";
    }
}

/* ===============================
   GLOBAL EXPORT
=============================== */
window.searchService = new SearchService();
window.simpleSearch = q => window.searchService.search(q);

console.log("✅ SearchService V1 READY");
