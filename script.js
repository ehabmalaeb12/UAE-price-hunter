// script.js
// UAE Price Hunter — Live-first engine with local fallback
// Replace existing script.js with this complete file.

console.log("✅ script.js (live-first) loaded");

// -----------------------
// CONFIG
// -----------------------
const WORKER_URL = 'https://uae-price-proxy.ehabmalaeb2.workers.dev'; // <-- update if needed
const WORKER_TIMEOUT_MS = 9000; // 9s timeout (safe for mobile)
const DEBUG_PANEL_ID = 'uae-debug-panel';

// -----------------------
// DOM ELEMENTS
// -----------------------
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const loadingEl = document.getElementById('loading');
const resultsEl = document.getElementById('searchResults');

// create debug panel if not present
let debugEl = document.getElementById(DEBUG_PANEL_ID);
if (!debugEl) {
  debugEl = document.createElement('div');
  debugEl.id = DEBUG_PANEL_ID;
  debugEl.style.cssText = 'margin-top:18px;padding:14px;background:rgba(0,0,0,0.25);border-radius:10px;color:#ddd;font-size:13px;max-height:260px;overflow:auto;';
  if (resultsEl && resultsEl.parentNode) {
    resultsEl.parentNode.insertBefore(debugEl, resultsEl);
  } else {
    document.body.appendChild(debugEl);
  }
}

function logDebug(msg) {
  const t = new Date().toLocaleTimeString();
  const line = document.createElement('div');
  line.textContent = `${t} — ${msg}`;
  debugEl.prepend(line);
  console.log('[UAE Debug]', msg);
}

// -----------------------
// SAFETY CHECKS
// -----------------------
if (!searchBtn || !searchInput || !resultsEl) {
  console.error('❌ Missing main DOM elements (searchInput, searchBtn, searchResults).');
  // show user message
  if (resultsEl) resultsEl.innerHTML = '<p style="color:orangered">App DOM not loaded correctly.</p>';
}

// -----------------------
// EVENTS
// -----------------------
searchBtn?.addEventListener('click', runSearch);
searchInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') runSearch();
});

// -----------------------
// HELPER: fetch with timeout
// -----------------------
async function fetchWithTimeout(url, opts = {}, timeout = WORKER_TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// -----------------------
// MAIN SEARCH
// -----------------------
async function runSearch() {
  const rawQuery = (searchInput?.value || '').trim();
  const query = rawQuery.toLowerCase();

  // clear UI
  resultsEl.innerHTML = '';
  loadingEl && (loadingEl.style.display = 'block');

  if (!query) {
    loadingEl && (loadingEl.style.display = 'none');
    resultsEl.innerHTML = '<p>Please enter a product name.</p>';
    return;
  }

  logDebug(`Searching for "${query}"`);
  // 1) Try the worker
  try {
    const url = `${WORKER_URL}?q=${encodeURIComponent(query)}`;
    logDebug(`Calling worker: ${url}`);
    const res = await fetchWithTimeout(url, { method: 'GET' }, WORKER_TIMEOUT_MS);

    if (!res.ok) {
      logDebug(`Worker returned HTTP ${res.status}. Falling back to local data.`);
      return useLocalFallback(query, 'worker-failed');
    }

    const data = await res.json().catch(err => {
      logDebug('Worker JSON parse failed: ' + err.message);
      return null;
    });

    logDebug('Raw results: ' + JSON.stringify(data || {}));

    if (data && Array.isArray(data.results) && data.results.length > 0) {
      // use live results
      renderResultsFromSource(data.results, query, 'Live Worker');
      return;
    } else {
      logDebug('Worker returned no results. Falling back to local data.');
      return useLocalFallback(query, 'worker-empty');
    }
  } catch (err) {
    // network/timeout/error -> fallback
    logDebug('Worker request error: ' + (err.message || err) + '. Using local fallback.');
    return useLocalFallback(query, 'worker-error');
  } finally {
    loadingEl && (loadingEl.style.display = 'none');
  }
}

// -----------------------
// LOCAL FALLBACK
// -----------------------
function useLocalFallback(query, reason = 'fallback') {
  // Ensure data exists
  if (!window.SHOPPING_SOURCES || !Array.isArray(window.SHOPPING_SOURCES)) {
    logDebug(`No local SHOPPING_SOURCES available (${reason}).`);
    resultsEl.innerHTML = `<div class="empty-results">No products returned for "${query}".</div>`;
    return;
  }

  // Filter local dataset
  const matches = window.SHOPPING_SOURCES.filter(p => (p.name || '').toLowerCase().includes(query));
  logDebug(`Local fallback used (${reason}). Matches: ${matches.length}`);

  if (!matches || matches.length === 0) {
    resultsEl.innerHTML = `<div class="empty-results">No products returned for "${query}".</div>`;
    return;
  }

  // Render
  renderResultsFromSource(matches, query, 'Local demo');
}

// -----------------------
// RENDER (common)
// Each item in `items` should be:
// { id, name, image, stores: [{store, price, link}, ...] }
// -----------------------
function renderResultsFromSource(items, query, sourceLabel = 'Local demo') {
  // Clear
  resultsEl.innerHTML = '';

  // For each product
  items.forEach(product => {
    const cheapest = (Array.isArray(product.stores) && product.stores.length > 0)
      ? [...product.stores].sort((a,b)=> a.price - b.price)[0]
      : null;

    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.marginBottom = '20px';
    card.style.padding = '18px';
    card.style.borderRadius = '12px';
    card.style.background = 'rgba(255,255,255,0.03)';

    // build store list HTML
    const storesHtml = (Array.isArray(product.stores) ? product.stores : []).map(s => {
      const safeLink = s.link || '#';
      const priceTxt = typeof s.price === 'number' ? `${s.price} AED` : (s.price || '');
      return `
        <div class="store-row" style="display:flex;justify-content:space-between;align-items:center;margin:8px 0;">
          <div style="flex:1">${escapeHtml(s.store)}: ${escapeHtml(priceTxt)}</div>
          <div style="margin-left:12px"><a class="btn-buy" href="${safeLink}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:8px 12px;border-radius:8px;background:linear-gradient(90deg,#b8863b,#cfa25a);color:#08121a;text-decoration:none;font-weight:700;">Buy</a></div>
        </div>
      `;
    }).join('');

    card.innerHTML = `
      <div style="display:flex;gap:18px;align-items:flex-start;">
        <div style="flex:1">
          <h2 style="margin:0 0 6px 0">${escapeHtml(product.name || 'Unnamed')}</h2>
          ${product.image ? `<img src="${product.image}" alt="${escapeHtml(product.name||'')}" style="max-width:240px;border-radius:8px;margin-bottom:10px;">` : ''}
          <div style="color:#e3c58e;margin-top:6px;font-weight:700;">
            ${cheapest ? `Best Price: ${cheapest.price} AED (${escapeHtml(cheapest.store)})` : 'Best Price: N/A'}
            <span style="font-weight:600;color:#c6c6c6;margin-left:8px;font-size:13px;">— source: ${escapeHtml(sourceLabel)}</span>
          </div>
          <div style="margin-top:10px;">${storesHtml}</div>
        </div>
      </div>
    `;

    resultsEl.appendChild(card);
  });

  // Scroll to first result for UX
  setTimeout(()=> {
    const first = resultsEl.querySelector('.product-card');
    if (first) first.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

// -----------------------
// SAFE ESCAPE HTML
// -----------------------
function escapeHtml(str) {
  if (!str && str !== 0) return '';
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}

// -----------------------
// EXPORT for console testing
// -----------------------
window.runSearch = runSearch;
window.logUae = logDebug;

logDebug('Engine ready. Worker: ' + WORKER_URL);
