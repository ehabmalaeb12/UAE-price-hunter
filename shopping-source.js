/* =========================================================
   UAE PRICE HUNTER — SHOPPING SOURCE
   STEP G-B: FILTERING + GROUPING (PRODUCTION LOGIC)
   ========================================================= */

/*
  This file does:
  1. Filters irrelevant results
  2. Separates Phones vs Accessories
  3. Groups SAME products together
  4. Sorts offers by lowest price
*/

/* ---------------- HELPERS ---------------- */

function normalize(text) {
  return text.toLowerCase().trim();
}

function isAccessory(title) {
  const accessoryKeywords = [
    'case', 'cover', 'charger', 'cable', 'lamp',
    'stand', 'holder', 'battery', 'pack',
    'adapter', 'protector', 'glass', 'magsafe'
  ];
  return accessoryKeywords.some(k => title.includes(k));
}

function isPhone(title) {
  return title.includes('iphone') && !isAccessory(title);
}

function normalizeProductKey(title) {
  return title
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ---------------- CORE SEARCH ---------------- */

window.simpleSearch = async function (query) {
  const q = normalize(query);

  /* 🔹 RAW SOURCE (TEMP – API LATER) */
  const rawProducts = [
    {
      title: 'iPhone 12 128GB',
      price: 1999,
      store: 'Amazon UAE',
      image: 'https://m.media-amazon.com/images/I/71ZOtNdaZCL._AC_SL1500_.jpg',
      link: 'https://amazon.ae',
      rating: 4.5,
      shipping: 'Tomorrow'
    },
    {
      title: 'iPhone 12 128GB',
      price: 2099,
      store: 'Noon UAE',
      image: 'https://cdn.nooncdn.com/products/tr:n-t_400/v165.jpg',
      link: 'https://noon.com',
      rating: 4.3,
      shipping: 'Same Day'
    },
    {
      title: 'iPhone 13 128GB',
      price: 2499,
      store: 'Amazon UAE',
      image: 'https://m.media-amazon.com/images/I/61l9ppRIiqL._AC_SL1500_.jpg',
      link: 'https://amazon.ae',
      rating: 4.6,
      shipping: 'Tomorrow'
    },
    {
      title: 'Apple iPhone Charger 20W',
      price: 19.99,
      store: 'Amazon UAE',
      link: 'https://amazon.ae'
    },
    {
      title: 'iPhone 12 Silicone Case with MagSafe',
      price: 29.99,
      store: 'Noon UAE',
      link: 'https://noon.com'
    }
  ];

  /* ---------------- FILTER ---------------- */

  const phones = [];
  const accessories = [];

  rawProducts.forEach(p => {
    const title = normalize(p.title);
    if (!title.includes(q)) return;

    if (isPhone(title)) {
      phones.push(p);
    } else if (isAccessory(title)) {
      accessories.push(p);
    }
  });

  /* ---------------- GROUPING ---------------- */

  function groupProducts(list) {
    const groups = {};

    list.forEach(item => {
      const key = normalizeProductKey(item.title);

      if (!groups[key]) {
        groups[key] = {
          name: item.title,
          image: item.image || '',
          offers: []
        };
      }

      groups[key].offers.push({
        store: item.store,
        price: item.price,
        link: item.link,
        rating: item.rating || null,
        shipping: item.shipping || ''
      });
    });

    return Object.values(groups).map(group => {
      group.offers.sort((a, b) => a.price - b.price);
      group.bestPrice = group.offers[0].price;
      group.bestStore = group.offers[0].store;
      group.offerCount = group.offers.length;
      return group;
    });
  }

  const groupedPhones = groupProducts(phones);
  const groupedAccessories = groupProducts(accessories);

  /* ---------------- FINAL RESULT ---------------- */

  return [...groupedPhones, ...groupedAccessories];
};

/* ---------------- DEBUG ---------------- */

console.log('✅ shopping-source.js loaded (FILTER + GROUP MODE)');
