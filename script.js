// script.js
// UAE Price Hunter — Stable Core Engine (defensive, single-file engine)

(function () {
  console.log("✅ script.js loaded");

  // DOM
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const loadingEl = document.getElementById("loading");
  const resultsEl = document.getElementById("searchResults");
  const diagEl = document.getElementById("diagnostics");

  // helper to show diag messages (also visible on mobile)
  function diag(msg, important=false) {
    try {
      if (!diagEl) return;
      diagEl.style.display = 'block';
      const p = document.createElement('div');
      p.textContent = `${(new Date()).toLocaleTimeString()} — ${msg}`;
      if (important) p.style.fontWeight = '700';
      diagEl.appendChild(p);
    } catch (e) { console.log("diag error", e); }
  }

  // safety: verify DOM
  if (!searchInput || !searchBtn || !resultsEl) {
    console.error("❌ Required DOM elements missing");
    alert("Critical page error: some UI elements are missing. Open console for details.");
    return;
  }

  // safety: verify data loaded
  if (!window.SHOPPING_SOURCES || !Array.isArray(window.SHOPPING_SOURCES)) {
    resultsEl.innerHTML = "<p style='color:tomato'>Product data not loaded. Please ensure data.js is present and loaded before script.js</p>";
    diag("SHOPPING_SOURCES missing or invalid", true);
    console.error("SHOPPING_SOURCES missing");
    return;
  }

  diag(`Data loaded from data.js (${window.SHOPPING_SOURCES.length} products).`);
  if (window.__SHOPPING_SOURCES_LOADED_AT) {
    diag(`Data timestamp: ${window.__SHOPPING_SOURCES_LOADED_AT}`);
  }

  // events
  searchBtn.addEventListener("click", runSearch);
  searchInput.addEventListener("keydown", (e) => { if (e.key === "Enter") runSearch(); });

  // main
  function runSearch() {
    const query = (searchInput.value || "").trim().toLowerCase();

    clearResults();
    showLoading(true);
    diag(`Searching for "${query}"`);

    if (!query) {
      showLoading(false);
      resultsEl.innerHTML = "<p>Please enter a product name.</p>";
      diag("Empty query - aborting");
      return;
    }

    // synchronous, deterministic filter
    const matches = window.SHOPPING_SOURCES.filter(p => p.name.toLowerCase().includes(query));

    showLoading(false);
    diag(`Matches found: ${matches.length}`);

    if (matches.length === 0) {
      resultsEl.innerHTML = "<p>No products found.</p>";
      return;
    }

    try {
      renderResults(matches);
      // scroll to first result
      setTimeout(() => {
        const first = resultsEl.querySelector('.product-card');
        if (first) first.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    } catch (err) {
      console.error("Render error", err);
      resultsEl.innerHTML = "<p style='color:tomato'>Display error — check console.</p>";
      diag("Render error - see console", true);
    }
  }

  // helpers
  function clearResults() {
    resultsEl.innerHTML = "";
  }

  function showLoading(show) {
    loadingEl.style.display = show ? "block" : "none";
  }

  function safeImg(src, alt) {
    // return an <img> HTML string that falls back to a placeholder if the image fails
    const placeholder = "data:image/svg+xml;utf8," + encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='100%' height='100%' fill='#111'/><text x='50%' y='50%' fill='#777' dominant-baseline='middle' text-anchor='middle' font-size='16'>No image</text></svg>`
    );
    return `<img src="${src}" alt="${escapeHtml(alt||'product')}" onerror="this.onerror=null;this.src='${placeholder}';">`;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  }

  // render
  function renderResults(products) {
    products.forEach(product => {
      // determine cheapest store
      const cheapest = [...product.stores].sort((a,b) => a.price - b.price)[0];
      const storesHtml = product.stores.map(s => {
        const buyLink = s.link ? `<a href="${escapeHtml(s.link)}" target="_blank" rel="noopener noreferrer">Buy</a>` : '';
        return `<li>${escapeHtml(s.store)}: <strong>${s.price} AED</strong> ${buyLink}</li>`;
      }).join("");

      const card = document.createElement("div");
      card.className = "product-card";

      card.innerHTML = `
        <h2 style="margin:0 0 8px 0">${escapeHtml(product.name)}</h2>
        ${safeImg(product.image, product.name)}
        <p style="margin:8px 0 6px 0"><strong>Best Price:</strong> ${cheapest.price} AED (${escapeHtml(cheapest.store)})</p>
        <details style="margin-top:10px">
          <summary style="cursor:pointer">Available at (${product.stores.length}) stores</summary>
          <ul>${storesHtml}</ul>
        </details>
      `;

      resultsEl.appendChild(card);
    });
  }

  // Expose a debug helper on window (optional)
  window.__UAEP_debugRunSearch = runSearch;

  diag('Engine ready.');
  console.log("🚀 UAE Price Hunter engine ready");
})();
