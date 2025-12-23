// UAE Price Hunter — Search Service V1.1
// Full file — copy & replace completely

class SearchService {
    constructor() {
        console.log("🚀 SearchService initializing...");

        this.stores = [
            { id: "amazon", name: "Amazon UAE", multiplier: 1.0 },
            { id: "noon", name: "Noon UAE", multiplier: 0.97 },
            { id: "carrefour", name: "Carrefour UAE", multiplier: 1.03 },
            { id: "sharaf", name: "Sharaf DG", multiplier: 1.02 },
            { id: "aliexpress", name: "AliExpress", multiplier: 0.92 }
        ];

        this.cache = new Map();
        this.cacheTTL = 5 * 60 * 1000;
        this.lastGroups = [];
    }

    async search(query) {
        const key = query.toLowerCase().trim();
        const cached = this.getCache(key);
        if (cached) return cached;

        const intent = ProductResolver.resolve(query);
        const products = [];

        for (const store of this.stores) {
            const price = PriceEngine.estimate(intent, store);
            products.push(ProductFactory.create(intent, store, price));
        }

        const groups = ProductGrouper.group(products, intent);
        this.lastGroups = groups;

        const flat = groups.flatMap(g => g.products);
        this.saveCache(key, flat);

        return flat;
    }

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
   PRODUCT RESOLVER
=============================== */
class ProductResolver {
    static resolve(query) {
        const q = query.toLowerCase();

        const storageMatch = q.match(/(64|128|256|512|1024)\s?gb/);
        const storage = storageMatch ? storageMatch[0].toUpperCase() : null;

        const baseModel = query
            .replace(/(64|128|256|512|1024)\s?gb/i, "")
            .replace(/\s+/g, " ")
            .trim();

        return {
            query,
            brand: this.detectBrand(q),
            category: this.detectCategory(q),
            baseModel,
            variant: storage,
            premium: /pro|max|ultra|plus/.test(q)
        };
    }

    static detectBrand(q) {
        if (q.includes("apple")) return "Apple";
        if (q.includes("samsung")) return "Samsung";
        if (q.includes("sony")) return "Sony";
        return "Generic";
    }

    static detectCategory(q) {
        if (q.includes("iphone") || q.includes("samsung")) return "smartphone";
        if (q.includes("tv")) return "tv";
        if (q.includes("laptop")) return "laptop";
        if (q.includes("perfume")) return "perfume";
        return "general";
    }
}

/* ===============================
   PRICE ENGINE
=============================== */
class PriceEngine {
    static estimate(intent, store) {
        let base = 2000;

        if (intent.category === "smartphone") base = intent.premium ? 4300 : 3500;
        if (intent.category === "tv") base = 3000;
        if (intent.category === "laptop") base = 4200;
        if (intent.category === "perfume") base = 350;

        const variance = Math.random() * 150;
        return Math.round((base + variance) * store.multiplier);
    }
}

/* ===============================
   PRODUCT FACTORY
=============================== */
class ProductFactory {
    static create(intent, store, price) {
        return {
            id: `${store.id}_${Date.now()}_${Math.random()}`,
            name: intent.variant
                ? `${intent.baseModel} ${intent.variant}`
                : intent.baseModel,

            store: store.name,
            storeId: store.id,
            price,
            originalPrice: Math.round(price * 1.12),
            discount: Math.round(((price * 1.12 - price) / (price * 1.12)) * 100),

            image: ImageEngine.get(intent),
            affiliateLink: AffiliateEngine.link(store.id, intent.query),

            identity: {
                brand: intent.brand,
                baseModel: intent.baseModel,
                variant: intent.variant,
                category: intent.category
            },

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
    static group(products) {
        const groups = {};
        const result = [];

        products.forEach(p => {
            const key = `${p.identity.brand}_${p.identity.baseModel}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(p);
        });

        Object.values(groups).forEach(items => {
            let cheapest = items[0];
            items.forEach(p => {
                if (p.price < cheapest.price) cheapest = p;
            });
            cheapest.bestPrice = true;

            result.push({
                type: "exact",
                title: items[0].identity.baseModel,
                products: items
            });
        });

        return result;
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
   AFFILIATE ENGINE
=============================== */
class AffiliateEngine {
    static link(storeId, query) {
        const q = encodeURIComponent(query);
        if (storeId === "amazon")
            return `https://www.amazon.ae/s?k=${q}&tag=YOURTAG-21`;
        if (storeId === "noon")
            return `https://www.noon.com/uae-en/search?q=${q}`;
        return "#";
    }
}

/* ===============================
   GLOBAL EXPORT
=============================== */
window.searchService = new SearchService();
window.simpleSearch = q => window.searchService.search(q);

console.log("✅ SearchService V1.1 ready");
