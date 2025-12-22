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
if (typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
  console.log("✅ Firebase initialized");
}

// Enhanced user management
const auth = firebase.auth();
const db = firebase.firestore();

// Create user account with additional data
async function createUserAccount(userData) {
  try {
    // Create auth user
    const userCredential = await auth.createUserWithEmailAndPassword(
      userData.email, 
      userData.password
    );
    
    const user = userCredential.user;
    
    // Update profile
    await user.updateProfile({
      displayName: userData.name
    });
    
    // Create user document with enhanced data
    await db.collection('users').doc(user.uid).set({
      uid: user.uid,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
      location: userData.location || 'UAE',
      points: 200, // Welcome bonus
      level: 'Bronze',
      preferences: {
        favoriteStores: ['amazon', 'noon', 'carrefour'],
        categories: [],
        priceAlerts: true,
        dealNotifications: true
      },
      stats: {
        searches: 0,
        purchases: 0,
        moneySaved: 0,
        pointsEarned: 200
      },
      settings: {
        language: 'en',
        currency: 'AED',
        theme: 'light',
        notifications: {
          priceDrops: true,
          newDeals: true,
          pointsUpdates: true
        }
      },
      security: {
        twoFactorEnabled: false,
        lastLogin: new Date().toISOString(),
        devices: []
      },
      joined: firebase.firestore.FieldValue.serverTimestamp(),
      updated: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Create points transaction
    await db.collection('points_transactions').add({
      userId: user.uid,
      points: 200,
      type: 'welcome_bonus',
      description: 'Welcome to UAE Price Hunter!',
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log("✅ Account created successfully");
    return { success: true, user: user };
    
  } catch (error) {
    console.error("❌ Account creation error:", error);
    throw error;
  }
}

// Enhanced login with security
async function enhancedLogin(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Update last login
    await db.collection('users').doc(user.uid).update({
      'security.lastLogin': new Date().toISOString()
    });
    
    // Log login activity
    await db.collection('user_activity').add({
      userId: user.uid,
      action: 'login',
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      device: navigator.userAgent
    });
    
    return { success: true, user: user };
  } catch (error) {
    throw error;
  }
}

// Enhanced user data management
async function updateUserProfile(userId, data) {
  try {
    await db.collection('users').doc(userId).update({
      ...data,
      updated: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Also update auth profile if name changed
    if (data.name) {
      await auth.currentUser.updateProfile({
        displayName: data.name
      });
    }
    
    return { success: true };
  } catch (error) {
    throw error;
  }
}

// Enhanced points system
async function awardEnhancedPoints(userId, points, reason, metadata = {}) {
  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) return;
    
    const userData = userDoc.data();
    const newPoints = (userData.points || 0) + points;
    
    // Update points
    await userRef.update({
      points: newPoints,
      'stats.pointsEarned': (userData.stats?.pointsEarned || 0) + points
    });
    
    // Create detailed transaction
    await db.collection('points_transactions').add({
      userId: userId,
      points: points,
      newBalance: newPoints,
      type: 'earned',
      reason: reason,
      metadata: metadata,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Check for level upgrade
    await checkLevelUpgrade(userId, newPoints);
    
    return newPoints;
  } catch (error) {
    console.error("Points error:", error);
    throw error;
  }
}

// User levels based on points
async function checkLevelUpgrade(userId, points) {
  const levels = [
    { level: 'Bronze', min: 0, max: 999 },
    { level: 'Silver', min: 1000, max: 4999 },
    { level: 'Gold', min: 5000, max: 9999 },
    { level: 'Platinum', min: 10000, max: Infinity }
  ];
  
  const currentLevel = levels.find(l => points >= l.min && points <= l.max)?.level || 'Bronze';
  
  try {
    await db.collection('users').doc(userId).update({
      level: currentLevel
    });
    
    // Award bonus for level upgrade
    if (points >= 1000 && points < 1500) {
      await awardEnhancedPoints(userId, 500, 'Silver Level Upgrade!');
    }
  } catch (error) {
    console.error("Level check error:", error);
  }
}

// Export enhanced functions
window.firebaseEnhanced = {
  auth: auth,
  db: db,
  createUserAccount: createUserAccount,
  enhancedLogin: enhancedLogin,
  updateUserProfile: updateUserProfile,
  awardEnhancedPoints: awardEnhancedPoints,
  checkLevelUpgrade: checkLevelUpgrade
};

console.log("🚀 Enhanced Firebase system ready");
