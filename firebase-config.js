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
let firebaseApp, auth, db;

try {
  if (typeof firebase !== 'undefined') {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    
    console.log("✅ Firebase initialized successfully");
    
    // Enable offline persistence
    db.enablePersistence()
      .catch((err) => {
        console.warn("⚠️ Offline persistence not supported:", err.code);
      });
  } else {
    console.warn("⚠️ Firebase SDK not loaded");
  }
} catch (error) {
  console.error("❌ Firebase initialization error:", error);
}

// Firebase Authentication Functions
async function loginUser(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    console.log("✅ User logged in:", userCredential.user.email);
    return userCredential.user;
  } catch (error) {
    console.error("❌ Login error:", error);
    throw error;
  }
}

async function signupUser(email, password) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    console.log("✅ User created:", userCredential.user.email);
    
    // Create user document in Firestore
    await db.collection('users').doc(userCredential.user.uid).set({
      email: email,
      name: email.split('@')[0],
      points: 100, // Welcome bonus
      joined: firebase.firestore.FieldValue.serverTimestamp(),
      updated: firebase.firestore.FieldValue.serverTimestamp(),
      basket: []
    });
    
    return userCredential.user;
  } catch (error) {
    console.error("❌ Signup error:", error);
    throw error;
  }
}

async function logoutUser() {
  try {
    await auth.signOut();
    console.log("✅ User logged out");
  } catch (error) {
    console.error("❌ Logout error:", error);
    throw error;
  }
}

// Firestore Functions
async function saveUserData(userId, data) {
  try {
    await db.collection('users').doc(userId).update({
      ...data,
      updated: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log("✅ User data saved");
  } catch (error) {
    console.error("❌ Save user data error:", error);
    throw error;
  }
}

async function getUserData(userId) {
  try {
    const doc = await db.collection('users').doc(userId).get();
    if (doc.exists) {
      return doc.data();
    }
    return null;
  } catch (error) {
    console.error("❌ Get user data error:", error);
    throw error;
  }
}

async function saveSearchHistory(userId, searchData) {
  try {
    await db.collection('search_history').add({
      userId: userId,
      ...searchData,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log("✅ Search history saved");
  } catch (error) {
    console.error("❌ Save search history error:", error);
    throw error;
  }
}

async function getSearchHistory(userId, limit = 20) {
  try {
    const snapshot = await db.collection('search_history')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error("❌ Get search history error:", error);
    throw error;
  }
}

async function saveBasket(userId, basket) {
  try {
    await db.collection('users').doc(userId).update({
      basket: basket,
      basketUpdated: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log("✅ Basket saved");
  } catch (error) {
    console.error("❌ Save basket error:", error);
    throw error;
  }
}

async function getBasket(userId) {
  try {
    const doc = await db.collection('users').doc(userId).get();
    if (doc.exists) {
      return doc.data().basket || [];
    }
    return [];
  } catch (error) {
    console.error("❌ Get basket error:", error);
    throw error;
  }
}

async function updatePoints(userId, pointsChange, reason) {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      const currentPoints = userDoc.data().points || 0;
      const newPoints = currentPoints + pointsChange;
      
      await db.collection('users').doc(userId).update({
        points: newPoints
      });
      
      // Log points transaction
      await db.collection('points_transactions').add({
        userId: userId,
        pointsChange: pointsChange,
        reason: reason,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        newBalance: newPoints
      });
      
      console.log(`✅ Points updated: ${pointsChange} (${reason})`);
      return newPoints;
    }
  } catch (error) {
    console.error("❌ Update points error:", error);
    throw error;
  }
}

// Export Firebase services
window.firebaseServices = {
  auth: auth,
  db: db,
  loginUser: loginUser,
  signupUser: signupUser,
  logoutUser: logoutUser,
  saveUserData: saveUserData,
  getUserData: getUserData,
  saveSearchHistory: saveSearchHistory,
  getSearchHistory: getSearchHistory,
  saveBasket: saveBasket,
  getBasket: getBasket,
  updatePoints: updatePoints
};

console.log("🚀 Firebase services ready");
