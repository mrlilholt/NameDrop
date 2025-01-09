// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDiHaU6ajRkeo-YFiErXsZ7pu3LuvtBGZ0",
  authDomain: "namedrop-16d4b.firebaseapp.com",
  projectId: "namedrop-16d4b",
  storageBucket: "namedrop-16d4b.firebasestorage.app",
  messagingSenderId: "373402334408",
  appId: "1:373402334408:web:1f1c36d48863eed50f21fd",
  measurementId: "G-5DN86C549G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);