// ==========================================
// FIREBASE CONFIGURATION
// ==========================================

// Your Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyDMwC5T8TmGBYpz4V61DFU6shcaTADeD_8",
    authDomain: "portfolio-ac8b5.firebaseapp.com",
    projectId: "portfolio-ac8b5",
    storageBucket: "portfolio-ac8b5.firebasestorage.app",
    messagingSenderId: "569337020342",
    appId: "1:569337020342:web:6e37cd02a93ba10fe38b17",
    measurementId: "G-3YWQD5G0BX"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Export for use in other files
window.auth = auth;
window.db = db;

console.log('✅ Firebase initialized successfully!');