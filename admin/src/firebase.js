// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // ✅ Import Auth

// 🔹 Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDEJF-i9wTlXs6qtKoVnOazO7Tmc7WTU70",
  authDomain: "alinafe-d9cf8.firebaseapp.com",
  projectId: "alinafe-d9cf8",
  storageBucket: "alinafe-d9cf8.firebasestorage.app",
  messagingSenderId: "684756103555",
  appId: "1:684756103555:web:9db41419bcabf08b2946b6",
  measurementId: "G-3S03TXVZ3G",
};

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firebase Authentication and export it
export const auth = getAuth(app);
export default app;
