// 1. YOUR CONFIGURATION
const SCRAPE_DO_TOKEN = '641c5334a7504c15abb0902cd23d0095b4dbb6711a3';

// PASTE YOUR FIREBASE CONFIG HERE
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  // ... rest of your config
};

// 2. INITIALIZE FIREBASE (The "Brain")
// We use the "Compat" version for easiest setup in GitHub Pages
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, setDoc, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 3. USER MANAGEMENT
let currentUserId = "unique_user_id"; // Later, this will come from Login

async function loadUserPoints() {
    const userDoc = await getDoc(doc(db, "users", currentUserId));
    if (userDoc.exists()) {
        document.getElementById('userPoints').innerText = userDoc.data().points;
    } else {
        await setDoc(doc(db, "users", currentUserId), { points: 0 });
    }
}

async function addPoints(points) {
    const userRef = doc(db, "users", currentUserId);
    await updateDoc(userRef, {
        points: increment(points)
    });
    loadUserPoints(); // Refresh the screen
    alert(`🎉 Hunter! You just banked ${points} points!`);
}

// 4. THE SCRAPER ENGINE (SCRAPE.DO)
async function compareAllPrices() {
    const productName = document.getElementById('productInput').value;
    const container = document.getElementById('resultsContainer');
    
    if(!productName) return alert("Search first!");
    container.innerHTML = '<div class="loader">Hunting...</div>';

    const stores = ['Amazon', 'Noon', 'Carrefour'];
    const results = await Promise.all(stores.map(s => fetchFromStore(s, productName)));
    
    renderResults(results);
}

async function fetchFromStore(store, query) {
    let targetUrl = "";
    if (store === 'Amazon') targetUrl = `https://www.amazon.ae/s?k=${encodeURIComponent(query)}`;
    if (store === 'Noon') targetUrl = `https://www.noon.com/uae-en/search/?q=${encodeURIComponent(query)}`;
    if (store === 'Carrefour') targetUrl = `https://www.carrefouruae.com/mafuae/en/v4/search?q=${encodeURIComponent(query)}`;

    const apiUrl = `https://api.scrape.do?token=${SCRAPE_DO_TOKEN}&url=${encodeURIComponent(targetUrl)}&render=true`;

    try {
        const response = await fetch(apiUrl);
        const html = await response.text();
        const priceRegex = /(\d{1,3}(,\d{3})*(\.\d{2})?)\s*AED/i;
        const match = html.match(priceRegex);
        const price = match ? parseFloat(match[1].replace(/,/g, '')) : 0;

        return {
            store,
            price: price > 0 ? price.toLocaleString() + " AED" : "Out of Stock",
            pts: Math.floor(price * 0.02), // 2 points for every 100 AED
            link: targetUrl
        };
    } catch (e) { return { store, price: "N/A", pts: 0 }; }
}

function renderResults(results) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '';
    results.forEach(res => {
        container.innerHTML += `
            <div class="deal-card">
                <h3>${res.store}</h3>
                <p class="price">${res.price}</p>
                <div class="pts-info">🪙 +${res.pts} Points</div>
                <button onclick="addPoints(${res.pts}); window.open('${res.link}', '_blank')" class="buy-button">
                    Shop & Claim Points
                </button>
            </div>
        `;
    });
}

// Start user session
loadUserPoints();
