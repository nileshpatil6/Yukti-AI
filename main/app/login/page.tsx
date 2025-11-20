"use client";
import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  const googleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Google login failed");
    }
  };

  return (
    <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px"
    }}>
        <div style={{
            backgroundColor: "white",
            padding: "40px",
            borderRadius: "16px",
            maxWidth: "450px",
            width: "100%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
        }}>
            <h1 style={{
                fontSize: "32px",
                fontWeight: "700",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "0.5rem",
                textAlign: "center"
            }}>🔐 Welcome Back</h1>
            <p style={{ textAlign: "center", color: "#666", marginBottom: "2rem" }}>Sign in to continue to your account</p>

            <button 
                onClick={googleLogin}
                style={{
                    width: "100%",
                    padding: "14px 20px",
                    backgroundColor: "#4285f4",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 16,
                    fontWeight: "600",
                    marginBottom: 20,
                    boxShadow: "0 4px 15px rgba(66,133,244,0.3)",
                    transition: "all 0.3s ease"
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(66,133,244,0.4)";
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(66,133,244,0.3)";
                }}
            >
                🔍 Login with Google
            </button>

            <div style={{ textAlign: "center", margin: "25px 0", color: "#999", fontSize: "14px", position: "relative" }}>
                <span style={{ backgroundColor: "white", padding: "0 10px", position: "relative", zIndex: 1 }}>OR</span>
                <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "1px", backgroundColor: "#e1e8ed", zIndex: 0 }}></div>
            </div>

            <input 
                type="email" 
                placeholder="📧 Email Address" 
                onChange={(e) => setEmail(e.target.value)}
                style={{
                    width: "100%",
                    padding: "14px 16px",
                    marginBottom: 14,
                    border: "2px solid #e1e8ed",
                    borderRadius: 8,
                    fontSize: 16,
                    outline: "none",
                    transition: "border-color 0.3s ease",
                    boxSizing: "border-box"
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "#667eea"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#e1e8ed"}
            />

            <input 
                type="password" 
                placeholder="🔒 Password" 
                onChange={(e) => setPassword(e.target.value)}
                style={{
                    width: "100%",
                    padding: "14px 16px",
                    marginBottom: 25,
                    border: "2px solid #e1e8ed",
                    borderRadius: 8,
                    fontSize: 16,
                    outline: "none",
                    transition: "border-color 0.3s ease",
                    boxSizing: "border-box"
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "#667eea"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#e1e8ed"}
            />

            <button 
                onClick={login}
                style={{
                    width: "100%",
                    padding: "14px 20px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 16,
                    fontWeight: "600",
                    boxShadow: "0 4px 15px rgba(102,126,234,0.4)",
                    transition: "all 0.3s ease"
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(102,126,234,0.5)";
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(102,126,234,0.4)";
                }}
            >
                ✨ Sign In
            </button>

            {error && <div style={{
                marginTop: 15,
                padding: "12px",
                backgroundColor: "#fee",
                color: "#c33",
                borderRadius: 8,
                fontSize: "14px",
                textAlign: "center"
            }}>⚠️ {error}</div>}
            
            <p style={{ textAlign: "center", marginTop: 25, color: "#666", fontSize: "15px" }}>
                Don't have an account? <a href="/signup" style={{ color: "#667eea", fontWeight: "600", textDecoration: "none" }}>Sign up →</a>
            </p>
        </div>
    </div>
  );
}
