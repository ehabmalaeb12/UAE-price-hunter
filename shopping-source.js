// REAL GOOGLE SHOPPING SOURCE (CLIENT SAFE MVP)

async function googleShoppingSearch(query) {
  const url = `https://r.jina.ai/https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query + " UAE")}`;

  const res = await fetch(url);
  const text = await res.text();

  const products = [];
  const regex = /<img[^>]+src="([^"]+)"[^>]*>[\s\S]*?<div[^>]*>(.*?)<\/div>[\s\S]*?<span[^>]*>AED\s?([\d,]+)/gi;

  let match;
  while ((match = regex.exec(text)) !== null) {
    products.push({
      name: cleanText(match[2]),
      price: parseInt(match[3].replace(/,/g, '')),
      image: match[1],
      store: 'UAE Store',
      link: '#'
    });
  }

  return products.slice(0, 25);
}

function cleanText(str) {
  return str.replace(/<[^>]*>/g, '').trim();
}

window.googleShoppingSearch = googleShoppingSearch;
