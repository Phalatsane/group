import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB5IL_f7uughBrFYu_GJeJQ_Cjxf8fQbUo",
  authDomain: "career-platform2.firebaseapp.com",
  projectId: "career-platform2",
  storageBucket: "career-platform2.firebasestorage.app",
  messagingSenderId: "768952908213",
  appId: "1:768952908213:web:63ac424db6647c47c881fc"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);