import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC7oWIeOfdyRkOvKjEOlvU3X6F5XVIRemA",
  authDomain: "codebharat-31863.firebaseapp.com",
  projectId: "codebharat-31863",
  storageBucket: "codebharat-31863.firebasestorage.app",
  messagingSenderId: "79399875782",
  appId: "1:79399875782:web:b3e4d5915dc56ab43553c7",
  measurementId: "G-L5WZFFD7E3"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
