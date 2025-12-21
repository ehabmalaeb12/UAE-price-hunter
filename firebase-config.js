// ============================================
// FIREBASE CONFIGURATION - UAE PRICE HUNTER
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyBZ_mW9D-Hf36J2QMXzDQMgQzkNCNH2-oY",
  authDomain: "uae-price-hunter.firebaseapp.com",
  projectId: "uae-price-hunter",
  storageBucket: "uae-price-hunter.firebasestorage.app",
  messagingSenderId: "864983845502",
  appId: "1:864983845502:web:263fe72a0b6165963ea62f"
};

// Initialize Firebase
try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("✅ Firebase initialized successfully");
  }
} catch (error) {
  console.error("❌ Firebase init error:", error);
}

// Make Firebase available globally
const auth = firebase.auth();
const db = firebase.firestore();
const analytics = firebase.analytics();

// Check if Firebase services are available
if (!auth || !db) {
  console.error("❌ Firebase services not available. Check Firebase SDK loading.");
  alert("Firebase not loaded. Check console for errors.");
}

export { auth, db, analytics };
