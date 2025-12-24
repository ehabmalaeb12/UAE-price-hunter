/* =========================================================
   UAE PRICE HUNTER — SHOPPING SOURCE (SMART FILTER VERSION)
   STEP G-A: FILTERING + RELEVANCE
   ========================================================= */

/*
  This file is responsible for:
  - Returning search results
  - Filtering irrelevant items
  - Separating Phones vs Accessories
*/

/* ---------------- HELPERS ---------------- */

function normalize(text) {
  return text.toLowerCase().trim();
}

function isAccessory(title) {
  const accessoryKeywords = [
    'case', 'cover', 'charger', 'cable', 'lamp',
    'stand', 'holder', 'battery', 'pack', 'adapter',
    'protector', 'glass', 'magsafe'
  ];
  return accessoryKeywords.some(k => title.includes(k));
}

function isPhone(title) {
  const phoneKeywords = [
    'iphone', 'samsung', 'galaxy', 'pixel'
  ];
  return phoneKeywords.some(k => title.includes(k)) &&
         !isAccessory(title);
}

/* ---------------- CORE SEARCH ---------------- */

window.simpleSearch = async function (query) {
  const q = normalize(query);

  // 🔹 RAW DATA (TEMP SOURCE – WILL BE API LATER)
  const rawProducts = [
    {
      id: 'p1',
      title: 'iPhone 12 128GB',
      price: 1999,
      store: 'Amazon UAE',
      image: 'https://m.media-amazon.com/images/I/71ZOtNdaZCL._AC_SL1500_.jpg',
      link: 'https://amazon.ae',
      rating: 4.5,
      shipping: 'Tomorrow'
    },
    {
      id: 'p2',
      title: 'iPhone 12 128GB',
      price: 2099,
      store: 'Noon UAE',
      image: 'https://cdn.nooncdn.com/products/tr:n-t_400/v165.jpg',
      link: 'https://noon.com',
      rating: 4.3,
      shipping: 'Same Day'
    },
    {
      id: 'a1',
      title: 'Apple iPhone Charger 20W',
      price: 19.99,
      store: 'Amazon UAE',
      image: '',
      link: 'https://amazon.ae'
    },
    {
      id: 'a2',
      title: 'iPhone 12 Silicone Case with MagSafe',
      price: 29.99,
      store: 'Noon UAE',
      image: '',
      link: 'https://noon.com'
    },
    {
      id: 'p3',
      title: 'iPhone 13 128GB',
      price: 2499,
      store: 'Amazon UAE',
      image: 'https://m.media-amazon.com/images/I/61l9ppRIiqL._AC_SL1500_.jpg',
      link: 'https://amazon.ae',
      rating: 4.6,
      shipping: 'Tomorrow'
    }
  ];

  /* ---------------- FILTER LOGIC ---------------- */

  let phones = [];
  let accessories = [];

  rawProducts.forEach(item => {
    const title = normalize(item.title);

    if (!title.includes(q)) return; // ❌ HARD FILTER

    if (isPhone(title)) {
      phones.push({ ...item, type: 'phone' });
    } else if (isAccessory(title)) {
      accessories.push({ ...item, type: 'accessory' });
    }
  });

  /* ---------------- FINAL RESULT ---------------- */

  // Phones FIRST (priority)
  return [...phones, ...accessories];
};

/* ---------------- DEBUG ---------------- */

console.log('✅ shopping-source.js loaded (SMART FILTER MODE)');
