console.log("✅ shopping-source.js loaded");

window.simpleSearch = async function (query) {
  console.log("🔍 Searching for:", query);

  await new Promise(r => setTimeout(r, 800));

  return [
    {
      name: "Apple iPhone 14",
      price: 3599,
      store: "Amazon UAE"
    },
    {
      name: "Apple iPhone 15",
      price: 4199,
      store: "Noon UAE"
    }
  ];
};
