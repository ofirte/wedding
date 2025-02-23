// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA2exk9CEMRDrm1kLCT_2Va0Yyo3Og34Xk",
  authDomain: "wedding-c89a1.firebaseapp.com",
  projectId: "wedding-c89a1",
  storageBucket: "wedding-c89a1.firebasestorage.app",
  messagingSenderId: "206786649581",
  appId: "1:206786649581:web:1d3ad0e2f96d483f975be4",
  measurementId: "G-RTW3LZZ6HW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
