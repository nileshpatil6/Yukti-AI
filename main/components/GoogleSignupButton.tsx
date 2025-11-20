"use client";

import { auth, googleProvider } from "@/lib/firebase"; 
import { signInWithPopup } from "firebase/auth";

export default function GoogleSignupButton() {
  const googleSignup = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      alert("Google Signup Success!");
    } catch (error) {
      console.error(error);
      alert("Error: " + error.message);
    }
  };

  return (
    <button 
      onClick={googleSignup}
      style={{
        padding: "10px 20px",
        background: "white",
        border: "1px solid #ccc",
        borderRadius: "6px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "10px"
      }}
    >
      <img 
        src="https://www.svgrepo.com/show/475656/google-color.svg" 
        width="20"
        height="20"
      />
      Sign up with Google
    </button>
  );
}
