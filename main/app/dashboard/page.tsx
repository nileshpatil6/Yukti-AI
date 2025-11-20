"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      checkUserProfile();
    }
  }, [user]);

  async function checkUserProfile() {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.uid)
      .single();

    if (error || !data) {
      // No profile found, show modal
      setShowModal(true);
    } else {
      setUserProfile(data);
    }
  }

  async function saveProfile() {
    if (!user || !name || !age) return;

    setSaving(true);
    const { error } = await supabase.from("profiles").insert([
      {
        id: user.uid,
        name: name,
        age: parseInt(age),
        email: user.email,
      },
    ]);

    if (error) {
      console.error("Error saving profile:", error);
      console.log(error);
      alert("Failed to save profile. Please try again.");
    } else {
      setShowModal(false);
      checkUserProfile();
    }
    setSaving(false);
  }

  if (loading) return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    }}>
      <div style={{
        padding: "2rem",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.1)"
      }}>
        <p style={{ fontSize: "18px", color: "#667eea" }}>Loading...</p>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    }}>
      {/* Navigation Bar */}
      <nav style={{
        backgroundColor: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(10px)",
        padding: "1rem 2rem",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{
          fontSize: "24px",
          fontWeight: "700",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          🚀 CodeBharat
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#f5f7fa",
            borderRadius: "8px"
          }}>
            <span style={{ fontSize: "14px", color: "#666" }}>👤 {userProfile?.name || user?.email}</span>
          </div>
          <button onClick={logout} style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            transition: "all 0.3s ease"
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#c82333"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#dc3545"}
          >
            🚪 Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ padding: "2rem" }}>
        {/* Profile Section */}
        {userProfile && (
          <div style={{
            maxWidth: "1200px",
            margin: "0 auto 2rem",
            backgroundColor: "rgba(255,255,255,0.95)",
            borderRadius: "16px",
            padding: "1.5rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "14px", color: "#999", marginBottom: "0.25rem" }}>Name</p>
                <p style={{ fontSize: "18px", fontWeight: "600", color: "#333" }}>{userProfile.name}</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "14px", color: "#999", marginBottom: "0.25rem" }}>Age</p>
                <p style={{ fontSize: "18px", fontWeight: "600", color: "#333" }}>{userProfile.age}</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "14px", color: "#999", marginBottom: "0.25rem" }}>Email</p>
                <p style={{ fontSize: "18px", fontWeight: "600", color: "#333" }}>{userProfile.email}</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "14px", color: "#999", marginBottom: "0.25rem" }}>Provider</p>
                <p style={{ fontSize: "18px", fontWeight: "600", color: "#333" }}>{user?.providerData[0]?.providerId}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Cards */}
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "2rem"
        }}>
          {/* Playground Card */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "2rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            transition: "all 0.3s ease",
            cursor: "pointer"
          }}
          onClick={() => window.open("http://localhost:5000", "_blank")}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-8px)";
            e.currentTarget.style.boxShadow = "0 15px 40px rgba(102,126,234,0.3)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
          }}
          >
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              marginBottom: "1rem"
            }}>
              🎮
            </div>
            <h3 style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#333",
              marginBottom: "0.5rem"
            }}>Playground</h3>
            <p style={{
              fontSize: "15px",
              color: "#666",
              lineHeight: "1.6"
            }}>
              Experiment with code, test algorithms, and practice your programming skills in our interactive playground.
            </p>
            <button style={{
              marginTop: "1.5rem",
              padding: "0.75rem 1.5rem",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem"
            }}>
              Start Coding <span style={{ fontSize: "12px" }}>↗</span>
            </button>
          </div>

          {/* Challenges Card */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "2rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            transition: "all 0.3s ease",
            cursor: "pointer"
          }}
          onClick={() => router.push("/challenges")}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-8px)";
            e.currentTarget.style.boxShadow = "0 15px 40px rgba(34,193,195,0.3)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
          }}
          >
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #22c1c3 0%, #fdbb2d 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              marginBottom: "1rem"
            }}>
              🏆
            </div>
            <h3 style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#333",
              marginBottom: "0.5rem"
            }}>Challenges</h3>
            <p style={{
              fontSize: "15px",
              color: "#666",
              lineHeight: "1.6"
            }}>
              Test your skills with coding challenges ranging from beginner to advanced levels. Track your progress and compete.
            </p>
            <button style={{
              marginTop: "1.5rem",
              padding: "0.75rem 1.5rem",
              background: "linear-gradient(135deg, #22c1c3 0%, #fdbb2d 100%)",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              width: "100%"
            }}>
              View Challenges →
            </button>
          </div>

          {/* Hackathons Card */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "2rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            transition: "all 0.3s ease",
            cursor: "pointer"
          }}
          onClick={() => router.push("/hackathons")}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-8px)";
            e.currentTarget.style.boxShadow = "0 15px 40px rgba(253,29,29,0.3)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
          }}
          >
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              marginBottom: "1rem"
            }}>
              💻
            </div>
            <h3 style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#333",
              marginBottom: "0.5rem"
            }}>Hackathons</h3>
            <p style={{
              fontSize: "15px",
              color: "#666",
              lineHeight: "1.6"
            }}>
              Join exciting hackathons, collaborate with teams, build innovative projects and win amazing prizes.
            </p>
            <button style={{
              marginTop: "1.5rem",
              padding: "0.75rem 1.5rem",
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              width: "100%"
            }}>
              Explore Hackathons →
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(8px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          animation: "fadeIn 0.3s ease"
        }}>
          <div style={{
            backgroundColor: "white",
            padding: 40,
            borderRadius: 16,
            maxWidth: 450,
            width: "90%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            animation: "slideUp 0.3s ease"
          }}>
            <h2 style={{
              marginTop: 0,
              fontSize: "28px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "0.5rem"
            }}>✨ Complete Your Profile</h2>
            <p style={{ color: "#666", marginBottom: 25, fontSize: "15px" }}>Please provide your information to get started</p>
            
            <input
              type="text"
              placeholder="👤 Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px",
                marginBottom: 16,
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
              type="number"
              placeholder="🎂 Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
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
              onClick={saveProfile}
              disabled={!name || !age || saving}
              style={{
                width: "100%",
                padding: "14px 20px",
                background: name && age ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "#ccc",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontSize: 17,
                cursor: name && age ? "pointer" : "not-allowed",
                fontWeight: "600",
                boxShadow: name && age ? "0 4px 15px rgba(102,126,234,0.4)" : "none",
                transition: "all 0.3s ease"
              }}
              onMouseOver={(e) => {
                if (name && age) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(102,126,234,0.5)";
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = name && age ? "0 4px 15px rgba(102,126,234,0.4)" : "none";
              }}
            >
              {saving ? "💾 Saving..." : "✅ Save Profile"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
