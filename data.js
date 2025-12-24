// data.js
// Static demo product data for the Golden Path MVP

window.SHOPPING_SOURCES = [
  {
    id: "iphone-15",
    name: "Apple iPhone 15 128GB",
    image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-select-202309?wid=470&hei=556&fmt=jpeg&qlt=80&.v=1692759974394",
    stores: [
      { store: "Noon UAE", price: 3349, link: "https://noon.com/" },
      { store: "Amazon UAE", price: 3399, link: "https://amazon.ae/" },
      { store: "Sharaf DG", price: 3449, link: "https://sharafdg.com/" }
    ]
  },
  {
    id: "iphone-14",
    name: "Apple iPhone 14 128GB",
    image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-select-202209?wid=470&hei=556&fmt=jpeg&qlt=80&.v=1662022909138",
    stores: [
      { store: "Amazon UAE", price: 2999, link: "https://amazon.ae/" },
      { store: "Noon UAE", price: 2949, link: "https://noon.com/" }
    ]
  },
  {
    id: "charger-20w",
    name: "Apple 20W USB-C Charger",
    image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MHJA3?wid=470&hei=556&fmt=jpeg&qlt=80&.v=1688019819416",
    stores: [
      { store: "Amazon UAE", price: 79, link: "https://amazon.ae/" },
      { store: "Noon UAE", price: 75, link: "https://noon.com/" }
    ]
  }
];

// small metadata to help debug / quick-check
window.__SHOPPING_SOURCES_LOADED_AT = new Date().toISOString();
