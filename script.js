// script.js — BULLETPROOF UI ENGINE

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 App ready');
});

async function performSearch() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) return;

  showLoading(true);

  let results = [];

  try {
    if (typeof window.simpleSearch === 'function') {
      results = await window.simpleSearch(query);
    } else {
      throw new Error('simpleSearch missing');
    }
  } catch (e) {
    console.error(e);
    alert('Search engine failed');
  }

  renderResults(results);
  showLoading(false);
}

function renderResults(groups) {
  const container = document.getElementById('searchResults');
  container.innerHTML = '';

  if (!groups.length) {
    container.innerHTML = `<p style="color:white">No products found</p>`;
    return;
  }

  groups.forEach(p => {
    const div = document.createElement('div');
    div.className = 'product-card';

    div.innerHTML = `
      <img src="${p.image}">
      <h3>${p.name}</h3>
      <p class="best">Best: ${p.bestPrice} AED</p>
      <p class="store">${p.bestStore}</p>

      <button onclick="this.nextElementSibling.classList.toggle('hidden')">
        Compare ${p.offerCount} stores
      </button>

      <div class="offers hidden">
        ${p.offers.map(o => `
          <div class="offer">
            <span>${o.store}</span>
            <strong>${o.price} AED</strong>
            <a href="${o.link}" target="_blank">Buy</a>
          </div>
        `).join('')}
      </div>
    `;

    container.appendChild(div);
  });
}

function showLoading(state) {
  const el = document.getElementById('loading');
  if (el) el.style.display = state ? 'flex' : 'none';
}

window.performSearch = performSearch;
