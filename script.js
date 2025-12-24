// script.js - frontend with Worker + fallback to local data
// Replace WORKER_BASE if your worker URL changes.
const WORKER_BASE = "https://uae-price-proxy.ehabmalaeb2.workers.dev"; // your worker
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const loadingEl = document.getElementById("loading");
const resultsEl = document.getElementById("searchResults");
const logEl = document.getElementById("log");

function log(msg) {
  const ts = new Date().toLocaleTimeString();
  if (logEl) logEl.textContent = `${ts} — ${msg}\n` + logEl.textContent;
  console.log(msg);
}

function imgOnError(e) {
  e.target.src = "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600";
}

function normalizeName(name) {
  return (name || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function groupProducts(results) {
  const groups = {};
  results.forEach(r => {
    const key = normalizeName(r.name).replace(/[^a-z0-9 ]/g, "").slice(0, 60) || r.name;
    groups[key] = groups[key] || { normalizedName: r.name, items: [] };
    groups[key].items.push(r);
  });
  return Object.values(groups);
}

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

function renderGroups(groups, originalQuery, sourceLabel = "Worker") {
  resultsEl.innerHTML = "";
  if (!groups || groups.length === 0) {
    resultsEl.innerHTML = `<div class="card">No products found (source: ${sourceLabel}).</div>`;
    return;
  }

  groups.forEach(group => {
    const sorted = group.items.slice().sort((a,b)=> (a.price||999999) - (b.price||999999));
    const cheapest = sorted[0];

    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("h3");
    title.textContent = group.normalizedName;
    card.appendChild(title);

    const img = document.createElement("img");
    img.src = cheapest.image || "";
    img.alt = group.normalizedName;
    img.onerror = imgOnError;
    card.appendChild(img);

    const bestLine = document.createElement("div");
    bestLine.className = "best";
    bestLine.textContent = `Best Price: ${cheapest.price} AED (${cheapest.store}) — source: ${sourceLabel}`;
    card.appendChild(bestLine);

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
        const link = item.link || storeSearchLink(item.store, item.name || originalQuery);
        window.open(link, "_blank");
      };
      row.appendChild(buy);

      storesWrap.appendChild(row);
    });
    card.appendChild(storesWrap);
    resultsEl.appendChild(card);
  });
}

// FALLBACK: use local demo if window.SHOPPING_SOURCES exists
function fallbackToLocal(query) {
  if (!window.SHOPPING_SOURCES || !Array.isArray(window.SHOPPING_SOURCES)) {
    log("No local SHOPPING_SOURCES available for fallback.");
    resultsEl.innerHTML = `<div class="card">No products returned and no local fallback available.</div>`;
    return;
  }

  log("Falling back to local SHOPPING_SOURCES (demo data).");
  // Convert local SHOPPING_SOURCES into same result format expected from worker:
  // worker results should be array of { name, store, price, image, link }
  const results = [];

  window.SHOPPING_SOURCES.forEach(prod => {
    if (!prod || !prod.stores) return;
    prod.stores.forEach(s => {
      results.push({
        id: prod.id || prod.name,
        name: prod.name,
        store: s.store,
        price: s.price,
        image: prod.image,
        link: s.link || ""
      });
    });
  });

  // filter by query
  const filtered = results.filter(r => (r.name || "").toLowerCase().includes((query||"").toLowerCase()));
  const groups = groupProducts(filtered);
  renderGroups(groups, query, "Local demo");
  log(`Local fallback: ${filtered.length} items shown.`);
}

// MAIN: call worker, parse, fallback
async function callWorkerOrFallback(query) {
  if (!query) {
    resultsEl.innerHTML = "<div class='card'>Please enter a product name.</div>";
    return;
  }

  resultsEl.innerHTML = "";
  loadingEl.style.display = "block";
  log(`Searching for "${query}"`);

  const url = `${WORKER_BASE}?q=${encodeURIComponent(query)}`;
  log(`Calling worker: ${url}`);

  try {
    // Use timeout using AbortController to avoid long hangups
    const controller = new AbortController();
    const timeout = setTimeout(()=> controller.abort(), 15000); // 15s

    const resp = await fetch(url, { method: "GET", signal: controller.signal });
    clearTimeout(timeout);

    log(`Worker HTTP ${resp.status}`);
    const text = await resp.text();

    // show raw snippet
    log(`Raw results: ${text.slice(0,2000)}`);

    let data;
    try { data = JSON.parse(text); } catch(err) {
      log("Failed to parse JSON from worker. Falling back to local if available.");
      fallbackToLocal(query);
      return;
    }

    // Worker returned error key?
    if (data.error) {
      log(`Worker error: ${data.error}. Falling back to local.`);
      fallbackToLocal(query);
      return;
    }

    // expected shape: { query: "...", results: [ {name, store, price, image, link}, ... ] }
    if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
      log(`Worker returned no results (results length=${(data.results||[]).length}). Falling back to local.`);
      fallbackToLocal(query);
      return;
    }

    // success
    log(`Worker returned ${data.results.length} results.`);
    const groups = groupProducts(data.results);
    renderGroups(groups, query, "Worker");
  } catch (err) {
    if (err.name === "AbortError") {
      log("Worker request timed out. Falling back to local data.");
    } else {
      log(`Fetch error: ${err.message || err}. Falling back to local data.`);
    }
    fallbackToLocal(query);
  } finally {
    loadingEl.style.display = "none";
  }
}

searchBtn.addEventListener("click", ()=> callWorkerOrFallback(searchInput.value.trim()));
searchInput.addEventListener("keydown", e => { if (e.key === "Enter") callWorkerOrFallback(searchInput.value.trim()); });

window.addEventListener("load", () => {
  log("Client ready");
  const q = searchInput.value && searchInput.value.trim();
  if (q) callWorkerOrFallback(q);
});
