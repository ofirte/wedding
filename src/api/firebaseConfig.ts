// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Get environment from process.env
const isProd = process.env.REACT_APP_ENV === "production";

// Development Firebase configuration as fallback
const devFirebaseConfig = {
  apiKey: "AIzaSyA2exk9CEMRDrm1kLCT_2Va0Yyo3Og34Xk",
  authDomain: "wedding-c89a1.firebaseapp.com",
  projectId: "wedding-c89a1",
  storageBucket: "wedding-c89a1.firebasestorage.app",
  messagingSenderId: "206786649581",
  appId: "1:206786649581:web:1d3ad0e2f96d483f975be4",
  measurementId: "G-RTW3LZZ6HW",
};

// Production Firebase configuration as fallback
const prodFirebaseConfig = {
  apiKey: "AIzaSyCybM_iI_Ix87_yNCT8yTUidNxqnkbQKmQ",
  authDomain: "wedding-prod-f13a0.firebaseapp.com",
  projectId: "wedding-prod-f13a0",
  storageBucket: "wedding-prod-f13a0.firebasestorage.app",
  messagingSenderId: "130800835414",
  appId: "1:130800835414:web:0e9ad92dc1d4db393c14f7",
  measurementId: "G-QLS6532QGT",
};

// Firebase configuration based on environment variables or fallback to constants
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Fallback to hostname detection if environment variables are not set
const isHostnameProd =
  window.location.hostname === "weddingplanstudio.web.app" ||
  window.location.hostname === "weddingplanstudio.firebaseapp.com";

// Determine the actual environment
const isProduction = isProd || isHostnameProd;

// If environment variables are missing, use the appropriate fallback
// Check if any of the required config values are undefined
const isConfigMissing = !firebaseConfig.apiKey || !firebaseConfig.projectId;

// Apply fallback if necessary
const finalFirebaseConfig = isConfigMissing
  ? isProduction
    ? prodFirebaseConfig
    : devFirebaseConfig
  : firebaseConfig;

console.log(
  `Running in ${
    isProduction ? "PRODUCTION" : "DEVELOPMENT"
  } environment with project: ${finalFirebaseConfig.projectId}`
);

// Initialize Firebase
const app = initializeApp(finalFirebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = isProduction ? getAnalytics(app) : null;
