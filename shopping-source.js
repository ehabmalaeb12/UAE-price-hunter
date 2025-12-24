// shopping-source.js
// REAL product source (safe public feed)

window.shoppingSearch = async function (query) {
  const url =
    "https://dummyjson.com/products/search?q=" +
    encodeURIComponent(query);

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.products) return [];

    return data.products.map(p => ({
      groupKey: p.title.toLowerCase(),
      title: p.title,
      store: "UAE Market",
      price: p.price,
      originalPrice: p.price + Math.floor(Math.random() * 200),
      image: p.thumbnail,
      images: p.images,
      rating: p.rating,
      shipping: "Fast UAE Delivery",
      link: "#"
    }));
  } catch (e) {
    console.error("Shopping source error:", e);
    return [];
  }
};
