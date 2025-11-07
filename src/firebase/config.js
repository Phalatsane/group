// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCsaqr_hM1xLI7hYcQg3c8zzdeIbeatJ54",
  authDomain: "group-28ba4.firebaseapp.com",
  projectId: "group-28ba4",
  storageBucket: "group-28ba4.firebasestorage.app",
  messagingSenderId: "95393457678",
  appId: "1:95393457678:web:36cd389c78ba0b009bfe5f",
  measurementId: "G-7EK9KCDPH8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export default app;