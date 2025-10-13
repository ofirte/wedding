// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Get environment from process.env
const isProd = process.env.REACT_APP_ENV === "production";

// Remove hardcoded configurations - use environment variables only

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

// Check if any of the required config values are undefined
const isConfigMissing = !firebaseConfig.apiKey || !firebaseConfig.projectId;

// Throw error if configuration is missing - no more hardcoded fallbacks
if (isConfigMissing) {
  throw new Error(
    "Firebase configuration is missing! Please ensure all REACT_APP_FIREBASE_* environment variables are set."
  );
}

const finalFirebaseConfig = firebaseConfig;

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
export const auth = getAuth(app);
export const functions = getFunctions(app);

if (
  process.env.NODE_ENV === "development" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
) {
  try {
    connectFunctionsEmulator(functions, "localhost", 5001);
    console.log("🔌 Connected to Firebase Functions emulator");
  } catch (error) {
    console.log(
      "Functions emulator connection failed, using deployed functions"
    );
  }
}
