// data.js
// Local fallback data (used when live sources fail)

window.SHOPPING_SOURCES = [
  {
    id: "iphone-15",
    name: "Apple iPhone 15 128GB",
    image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-blue-select-202309",
    stores: [
      {
        store: "Amazon UAE",
        price: 3399,
        link: "https://www.amazon.ae/s?k=iphone+15"
      },
      {
        store: "Noon",
        price: 3349,
        link: "https://www.noon.com/uae-en/search?q=iphone+15"
      },
      {
        store: "Carrefour UAE",
        price: 3499,
        link: "https://www.carrefouruae.com/mafuae/en/search?text=iphone+15"
      }
    ]
  },
  {
    id: "iphone-14",
    name: "Apple iPhone 14 128GB",
    image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-14-purple-select-202209",
    stores: [
      {
        store: "Amazon UAE",
        price: 2999,
        link: "https://www.amazon.ae/s?k=iphone+14"
      },
      {
        store: "Noon",
        price: 2949,
        link: "https://www.noon.com/uae-en/search?q=iphone+14"
      }
    ]
  }
];

console.log("✅ data.js loaded:", window.SHOPPING_SOURCES.length, "products");
