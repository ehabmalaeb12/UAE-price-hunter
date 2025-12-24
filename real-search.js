// REAL SEARCH ENGINE (SAFE MODULE)
// This file ONLY handles fetching real product data

window.realSearch = async function (query) {
  const API_URL = "https://green-mud-2561.ehabmalaeb2.workers.dev/search";

  const response = await fetch(
    `${API_URL}?q=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    throw new Error("API error");
  }

  const data = await response.json();

  // Normalize response to match your existing product structure
  return data.products.map(p => ({
    id: p.id,
    name: p.title,
    store: p.store,
    price: p.price,
    originalPrice: p.originalPrice,
    image: p.images[0],
    link: p.productUrl,
    description: p.title,
    shipping: p.delivery,
    rating: p.rating,
    reviews: p.reviews,
    inStock: true,
    isBestPrice: false
  }));
};
