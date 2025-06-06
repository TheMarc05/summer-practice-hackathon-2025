// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB3uXj0wWqv7xdmxFwgw2gQd12-bRUJSSk",
  authDomain: "gitgud-7ae77.firebaseapp.com",
  projectId: "gitgud-7ae77",
  storageBucket: "gitgud-7ae77.firebasestorage.app",
  messagingSenderId: "426594069450",
  appId: "1:426594069450:web:d43dd5bd295b16b038fd33",
  measurementId: "G-QHF2E36CFJ",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
