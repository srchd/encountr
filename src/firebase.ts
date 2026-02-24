// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBPjbrezP5h5ZclajKGgfqU_PNdZSULBsg",
  authDomain: "encountr-b2492.firebaseapp.com",
  projectId: "encountr-b2492",
  storageBucket: "encountr-b2492.firebasestorage.app",
  messagingSenderId: "641215560209",
  appId: "1:641215560209:web:1dd2db4441a278705ecfb0",
  measurementId: "G-3PHVQ1MEW5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
