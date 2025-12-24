// shopping-source.js — GUARANTEED DATA ENGINE

window.simpleSearch = async function (query) {
  console.log('🔍 Searching for:', query);

  await new Promise(r => setTimeout(r, 800)); // simulate real search

  return [
    {
      name: "Apple iPhone 15 (128GB)",
      image: "https://m.media-amazon.com/images/I/71d7rfSl0wL._AC_SL1500_.jpg",
      bestPrice: 4199,
      bestStore: "Amazon UAE",
      offerCount: 2,
      offers: [
        {
          store: "Amazon UAE",
          price: 4299,
          link: "https://www.amazon.ae",
          rating: 4.4,
          shipping: "Tomorrow"
        },
        {
          store: "Noon UAE",
          price: 4199,
          link: "https://www.noon.com",
          rating: 4.3,
          shipping: "2 days"
        }
      ]
    },
    {
      name: "Apple iPhone 15 Pro (256GB)",
      image: "https://m.media-amazon.com/images/I/81SigpJN1KL._AC_SL1500_.jpg",
      bestPrice: 4899,
      bestStore: "Noon UAE",
      offerCount: 2,
      offers: [
        {
          store: "Noon UAE",
          price: 4899,
          link: "https://www.noon.com",
          rating: 4.5,
          shipping: "Tomorrow"
        },
        {
          store: "Amazon UAE",
          price: 4999,
          link: "https://www.amazon.ae",
          rating: 4.4,
          shipping: "Tomorrow"
        }
      ]
    }
  ];
};

console.log('✅ shopping-source loaded');
