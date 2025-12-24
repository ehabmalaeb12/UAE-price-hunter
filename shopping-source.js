// shopping-source.js
// UAE Price Hunter — unified shopping source

console.log("🛒 shopping-source.js loaded");

// MAIN SEARCH FUNCTION
async function fetchShoppingResults(query) {
  console.log("🔍 fetchShoppingResults:", query);

  // For now we return REALISTIC structured data
  // Later this will be replaced with Scrape.do / Cloudflare Workers

  const q = query.toLowerCase();

  const results = [];

  if (q.includes("iphone")) {
    results.push(
      {
        id: "amz-iphone",
        title: "iPhone 15 (128GB)",
        store: "Amazon UAE",
        price: 999,
        oldPrice: 1299,
        rating: 4.5,
        shipping: "Free Tomorrow",
        image: "https://m.media-amazon.com/images/I/71TPda7cwUL._AC_SL1500_.jpg",
        link: "https://www.amazon.ae/"
      },
      {
        id: "noon-iphone",
        title: "iPhone 15 (128GB)",
        store: "Noon UAE",
        price: 1049,
        oldPrice: 1199,
        rating: 4.3,
        shipping: "Same Day",
        image: "https://cdn.nooncdn.com/products/tr:n-t_240/v165.jpg",
        link: "https://www.noon.com/"
      }
    );
  }

  if (q.includes("samsung")) {
    results.push(
      {
        id: "amz-s24",
        title: "Samsung Galaxy S24",
        store: "Amazon UAE",
        price: 2899,
        oldPrice: 3199,
        rating: 4.6,
        shipping: "Free Tomorrow",
        image: "https://images.samsung.com/is/image/samsung/p6pim/ae/2401/gallery/ae-galaxy-s24-s921-sm-s921bzkqmea-thumb-539305087",
        link: "https://www.amazon.ae/"
      }
    );
  }

  return results;
}

// expose globally
window.fetchShoppingResults = fetchShoppingResults;
