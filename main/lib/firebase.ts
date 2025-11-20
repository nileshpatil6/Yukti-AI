// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC7oWIeOfdyRkOvKjEOlvU3X6F5XVIRemA",
  authDomain: "Yukti-AI-31863.firebaseapp.com",
  projectId: "Yukti-AI-31863",
  storageBucket: "Yukti-AI-31863.firebasestorage.app",
  messagingSenderId: "79399875782",
  appId: "1:79399875782:web:b3e4d5915dc56ab43553c7",
  measurementId: "G-L5WZFFD7E3"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();