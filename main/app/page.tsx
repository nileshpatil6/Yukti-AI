import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      textAlign: "center"
    }}>
      <div style={{
        backgroundColor: "rgba(255,255,255,0.95)",
        padding: "3rem",
        borderRadius: "20px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        maxWidth: "600px"
      }}>
        <h1 style={{
          fontSize: "48px",
          fontWeight: "800",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "1rem"
        }}>🎉 Welcome!</h1>
        <p style={{
          fontSize: "18px",
          color: "#666",
          marginBottom: "2.5rem",
          lineHeight: "1.6"
        }}>Get started with our amazing authentication system. Create an account or sign in to continue.</p>
        
        <div style={{ display: "flex", gap: "1rem", flexDirection: "column" }}>
          <Link href="/signup/" style={{
            padding: "16px 32px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            borderRadius: "10px",
            textDecoration: "none",
            fontSize: "18px",
            fontWeight: "600",
            boxShadow: "0 4px 15px rgba(102,126,234,0.4)",
            transition: "all 0.3s ease",
            display: "inline-block"
          }}>
            ✨ Create Account
          </Link>
          <Link href="/login" style={{
            padding: "16px 32px",
            backgroundColor: "white",
            color: "#667eea",
            border: "2px solid #667eea",
            borderRadius: "10px",
            textDecoration: "none",
            fontSize: "18px",
            fontWeight: "600",
            transition: "all 0.3s ease",
            display: "inline-block"
          }}>
            🔐 Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
