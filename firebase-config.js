// ============================================
// FIREBASE CONFIGURATION FILE
// ============================================
// 🔥 REPLACE THESE VALUES WITH YOUR FIREBASE CONFIG
// Get from: Firebase Console → Project Settings → General → Your apps
// ============================================

onst firebaseConfig = {
  apiKey: "AIzaSyBZ_mW9D-Hf36J2QMXzDQMgQzkNCNH2-oY",
  authDomain: "uae-price-hunter.firebaseapp.com",
  projectId: "uae-price-hunter",
  storageBucket: "uae-price-hunter.firebasestorage.app",
  messagingSenderId: "864983845502",
  appId: "1:864983845502:web:263fe72a0b6165963ea62f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Make available globally
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDb = db;

console.log("Firebase configured - ready for profile & basket");
