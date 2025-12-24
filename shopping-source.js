// shopping-source.js — STABLE DATA ENGINE

window.simpleSearch = async function (query) {
  console.log("🔍 Searching:", query);

  await new Promise(r => setTimeout(r, 1000));

  return [
    {
      name: "Apple iPhone 15 (128GB)",
      image: "https://m.media-amazon.com/images/I/71d7rfSl0wL._AC_SL1500_.jpg",
      bestPrice: 4199,
      bestStore: "Noon UAE",
      offerCount: 2,
      offers: [
        { store: "Noon UAE", price: 4199, link: "https://www.noon.com" },
        { store: "Amazon UAE", price: 4299, link: "https://www.amazon.ae" }
      ]
    },
    {
      name: "Apple iPhone 14 (128GB)",
      image: "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_SL1500_.jpg",
      bestPrice: 3599,
      bestStore: "Amazon UAE",
      offerCount: 2,
      offers: [
        { store: "Amazon UAE", price: 3599, link: "https://www.amazon.ae" },
        { store: "Noon UAE", price: 3699, link: "https://www.noon.com" }
      ]
    }
  ];
};

console.log("✅ shopping-source loaded");
