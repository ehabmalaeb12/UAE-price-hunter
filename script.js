console.log("✅ script.js loaded");

document.getElementById("searchBtn").addEventListener("click", performSearch);

async function performSearch() {
  const q = document.getElementById("searchInput").value;
  const loading = document.getElementById("loading");
  const results = document.getElementById("searchResults");

  loading.style.display = "block";
  results.innerHTML = "";

  const data = await window.simpleSearch(q);

  loading.style.display = "none";

  data.forEach(p => {
    const div = document.createElement("div");
    div.innerHTML = `<p><strong>${p.name}</strong> — ${p.price} AED (${p.store})</p>`;
    results.appendChild(div);
  });
}
