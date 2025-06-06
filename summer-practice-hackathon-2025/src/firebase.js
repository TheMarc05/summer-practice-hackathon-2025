// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configurația proiectului tău Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB3uXj0wWqv7xdmxFwgw2gQd12-bRUJSSk",
  authDomain: "gitgud-7ae77.firebaseapp.com",
  projectId: "gitgud-7ae77",
  storageBucket: "gitgud-7ae77.firebasestorage.app",
  messagingSenderId: "426594069450",
  appId: "1:426594069450:web:d43dd5bd295b16b038fd33",
  measurementId: "G-QHF2E36CFJ",
};

// Inițializează Firebase
const app = initializeApp(firebaseConfig);

// Exportă serviciile de care ai nevoie
export const auth = getAuth(app);
export const db = getFirestore(app);
