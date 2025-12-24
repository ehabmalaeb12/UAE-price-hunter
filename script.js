// script.js - Frontend that calls the Cloudflare Worker and renders results
// Replace WORKER_BASE below if your Worker URL is different.

const WORKER_BASE = "https://uae-price-proxy.ehabmalaeb2.workers.dev"; // <-- your Worker endpoint
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const loadingEl = document.getElementById("loading");
const resultsEl = document.getElementById("searchResults");
const logEl = document.getElementById("log");

function log(msg) {
  const ts = new Date().toLocaleTimeString();
  logEl.textContent = `${ts} — ${msg}\n` + logEl.textContent;
}

// Map store names to a search URL pattern (used for "Buy" buttons until we can use exact product links)
function storeSearchLink(store, query) {
  query = encodeURIComponent(query);
  switch ((store||"").toLowerCase()) {
    case "amazon uae":
    case "amazon.ae":
    case "amazon":
      return `https://www.amazon.ae/s?k=${query}`;
    case "noon":
    case "noon uae":
      return `https://www.noon.com/uae-en/search?q=${query}`;
    case "carrefour":
    case "carrefour uae":
      return `https://www.carrefouruae.com/mafuae/en/search?text=${query}`;
    case "sharaf dg":
      return `https://www.sharafdg.com/search/?text=${query}`;
    default:
      return `https://www.google.com/search?q=${query}+${encodeURIComponent(store)}`;
  }
}

// Safe render fallback when image fails
function imgOnError(e) {
  e.target.src = "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600";
}

// Normalize product name (basic)
function normalizeName(name) {
  return (name || "").toLowerCase().replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/\s+/g, " ").trim();
}

// Group results by normalized product name
function groupProducts(results) {
  const groups = {};
  results.forEach(r => {
    const key = normalizeName(r.name).replace(/[^a-z0-9 ]/g,"").slice(0,60) || r.name;
    groups[key] = groups[key] || { normalizedName: r.name, items: [] };
    groups[key].items.push(r);
  });
  return Object.values(groups);
}

async function doSearch(query) {
  if (!query) return;
  resultsEl.innerHTML = "";
  loadingEl.style.display = "block";
  log(`Searching for "${query}"`);

  try {
    const url = `${WORKER_BASE}?q=${encodeURIComponent(query)}`;
    log(`Calling worker: ${url}`);
    const resp = await fetch(url, { method: "GET" });
    if (!resp.ok) {
      const txt = await resp.text();
      log(`Worker HTTP ${resp.status}: ${txt}`);
      resultsEl.innerHTML = `<div class="card">Error calling search service: ${resp.status}</div>`;
      return;
    }
    const data = await resp.json();
    log(`Raw results: ${JSON.stringify(data).slice(0,1000)}`);

    if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
      resultsEl.innerHTML = `<div class="card">No products returned for "${query}".</div>`;
      return;
    }

    // Group similar product names
    const groups = groupProducts(data.results);

    // Render each group
    resultsEl.innerHTML = "";
    groups.forEach(group => {
      // Determine cheapest item across this group
      const sorted = group.items.slice().sort((a,b)=> (a.price||999999) - (b.price||999999));
      const cheapest = sorted[0];

      const card = document.createElement("div");
      card.className = "card";

      // Card header
      const title = document.createElement("h3");
      title.textContent = group.normalizedName;
      card.appendChild(title);

      // Image - use cheapest image if available
      const img = document.createElement("img");
      img.src = cheapest.image || "";
      img.alt = group.normalizedName;
      img.onerror = imgOnError;
      card.appendChild(img);

      // Best price line
      const bestLine = document.createElement("div");
      bestLine.className = "best";
      bestLine.textContent = `Best Price: ${cheapest.price} AED (${cheapest.store})`;
      card.appendChild(bestLine);

      // Stores list - show price and buy button
      const storesWrap = document.createElement("div");
      storesWrap.className = "stores";
      group.items.forEach(item => {
        const row = document.createElement("div");
        row.className = "store-row";

        const left = document.createElement("div");
        left.textContent = `${item.store}: ${item.price} AED`;
        row.appendChild(left);

        const buy = document.createElement("button");
        buy.className = "buy-btn";
        buy.textContent = "Buy";
        buy.onclick = () => {
          const link = storeSearchLink(item.store, item.name || query);
          window.open(link, "_blank");
        };
        row.appendChild(buy);

        storesWrap.appendChild(row);
      });
      card.appendChild(storesWrap);

      resultsEl.appendChild(card);
    });

  } catch (err) {
    log(`Error: ${err.message || err}`);
    resultsEl.innerHTML = `<div class="card">Search failed: ${err.message || err}</div>`;
  } finally {
    loadingEl.style.display = "none";
  }
}

searchBtn.addEventListener("click", () => doSearch(searchInput.value.trim()));
searchInput.addEventListener("keydown", (e) => { if (e.key === "Enter") doSearch(searchInput.value.trim()); });

// On load, do the default query once
window.addEventListener("load", () => {
  log("Client ready");
  const q = searchInput.value && searchInput.value.trim();
  if (q) doSearch(q);
});
