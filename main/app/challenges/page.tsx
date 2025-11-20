"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ChallengesPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [error, setError] = useState("");

  // Check for existing challenge data on mount
  useEffect(() => {
    const storedData = localStorage.getItem("challengeData");
    if (storedData) {
      const challengeData = JSON.parse(storedData);
      
      // Check if data has expired
      if (Date.now() < challengeData.expiresAt) {
        setQuestions(challengeData.questions);
        setCategory(challengeData.category);
        setDifficulty(challengeData.difficulty);
        setStep(2);
      } else {
        // Clear expired data
        localStorage.removeItem("challengeData");
      }
    }
  }, []);

  const categories = [
    { id: "electronics", name: "Electronics", icon: "⚡" },
    { id: "ml", name: "Machine Learning", icon: "🤖" },
    { id: "physics", name: "Physics", icon: "🔬" },
    { id: "mathematics", name: "Mathematics", icon: "📐" },
    { id: "programming", name: "Programming", icon: "💻" },
    { id: "chemistry", name: "Chemistry", icon: "🧪" }
  ];

  const difficulties = [
    { id: "easy", name: "Easy", color: "#28a745", icon: "✅" },
    { id: "medium", name: "Medium", color: "#ffc107", icon: "⚠️" },
    { id: "hard", name: "Hard", color: "#dc3545", icon: "🔥" }
  ];

  async function generateQuestions() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, difficulty, count: questionCount })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate questions");
      }

      // Store all questions in localStorage with 30 minutes expiration
      const challengeData = {
        questions: data.questions,
        category,
        difficulty,
        createdAt: Date.now(),
        expiresAt: Date.now() + (30 * 60 * 1000), // 30 minutes
        currentIndex: 0,
        completedQuestions: []
      };
      localStorage.setItem("challengeData", JSON.stringify(challengeData));

      setQuestions(data.questions);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to generate questions");
    } finally {
      setLoading(false);
    }
  }

  function startChallenge(questionIndex: number) {
    // Update current question index in localStorage
    const storedData = localStorage.getItem("challengeData");
    if (storedData) {
      const challengeData = JSON.parse(storedData);
      challengeData.currentIndex = questionIndex;
      localStorage.setItem("challengeData", JSON.stringify(challengeData));
    }
    router.push(`/challenges/solve?index=${questionIndex}`);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    }}>
      {/* Navigation */}
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
          WebkitTextFillColor: "transparent",
          cursor: "pointer"
        }}
        onClick={() => router.push("/dashboard")}
        >
          🚀 CodeBharat
        </div>
        <button 
          onClick={() => router.push("/dashboard")}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#667eea",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600"
          }}
        >
          ← Back to Dashboard
        </button>
      </nav>

      <div style={{ padding: "2rem" }}>
        {step === 1 ? (
          // Step 1: Question Configuration
          <div style={{
            maxWidth: "800px",
            margin: "0 auto",
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "2.5rem",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
          }}>
            <h1 style={{
              fontSize: "32px",
              fontWeight: "700",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "0.5rem"
            }}>🏆 Generate Challenge</h1>
            <p style={{ color: "#666", marginBottom: "2rem" }}>Configure your challenge questions</p>

            {/* Category Selection */}
            <div style={{ marginBottom: "2rem" }}>
              <label style={{ fontSize: "16px", fontWeight: "600", color: "#333", display: "block", marginBottom: "1rem" }}>
                1️⃣ Select Category
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
                {categories.map(cat => (
                  <div
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    style={{
                      padding: "1rem",
                      border: `3px solid ${category === cat.id ? "#667eea" : "#e1e8ed"}`,
                      borderRadius: "12px",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.3s ease",
                      backgroundColor: category === cat.id ? "#f0f4ff" : "white"
                    }}
                  >
                    <div style={{ fontSize: "32px", marginBottom: "0.5rem" }}>{cat.icon}</div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>{cat.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Difficulty Selection */}
            <div style={{ marginBottom: "2rem" }}>
              <label style={{ fontSize: "16px", fontWeight: "600", color: "#333", display: "block", marginBottom: "1rem" }}>
                2️⃣ Select Difficulty
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                {difficulties.map(diff => (
                  <div
                    key={diff.id}
                    onClick={() => setDifficulty(diff.id)}
                    style={{
                      padding: "1.5rem",
                      border: `3px solid ${difficulty === diff.id ? diff.color : "#e1e8ed"}`,
                      borderRadius: "12px",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.3s ease",
                      backgroundColor: difficulty === diff.id ? `${diff.color}15` : "white"
                    }}
                  >
                    <div style={{ fontSize: "32px", marginBottom: "0.5rem" }}>{diff.icon}</div>
                    <div style={{ fontSize: "16px", fontWeight: "600", color: diff.color }}>{diff.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div style={{ marginBottom: "2rem" }}>
              <label style={{ fontSize: "16px", fontWeight: "600", color: "#333", display: "block", marginBottom: "1rem" }}>
                3️⃣ Number of Questions
              </label>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  style={{ flex: 1, cursor: "pointer" }}
                />
                <div style={{
                  padding: "1rem 2rem",
                  backgroundColor: "#667eea",
                  color: "white",
                  borderRadius: "12px",
                  fontSize: "24px",
                  fontWeight: "700",
                  minWidth: "80px",
                  textAlign: "center"
                }}>
                  {questionCount}
                </div>
              </div>
            </div>

            {error && (
              <div style={{
                padding: "1rem",
                backgroundColor: "#fee",
                color: "#c33",
                borderRadius: "8px",
                marginBottom: "1rem"
              }}>
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={generateQuestions}
              disabled={!category || !difficulty || loading}
              style={{
                width: "100%",
                padding: "1rem",
                background: category && difficulty ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "#ccc",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "18px",
                fontWeight: "600",
                cursor: category && difficulty ? "pointer" : "not-allowed",
                transition: "all 0.3s ease"
              }}
            >
              {loading ? "🔄 Generating Questions..." : "✨ Generate Questions"}
            </button>
          </div>
        ) : (
          // Step 2: Display Generated Questions
          <div style={{
            maxWidth: "1200px",
            margin: "0 auto"
          }}>
            <div style={{
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "2rem",
              marginBottom: "2rem",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
            }}>
              <h2 style={{
                fontSize: "28px",
                fontWeight: "700",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "0.5rem"
              }}>
                📝 Generated Questions
              </h2>
              <p style={{ color: "#666" }}>
                Category: <strong>{categories.find(c => c.id === category)?.name}</strong> | 
                Difficulty: <strong>{difficulty}</strong> | 
                Total: <strong>{questions.length} questions</strong>
              </p>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "1.5rem"
            }}>
              {questions.map((q, index) => {
                const diffColor = q.difficulty === "easy" ? "#28a745" : q.difficulty === "medium" ? "#ffc107" : "#dc3545";
                
                return (
                  <div
                    key={index}
                    style={{
                      backgroundColor: "white",
                      borderRadius: "16px",
                      padding: "1.5rem",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                      transition: "all 0.3s ease",
                      cursor: "pointer"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-5px)";
                      e.currentTarget.style.boxShadow = "0 15px 40px rgba(102,126,234,0.3)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <span style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#667eea"
                      }}>
                        Question {index + 1}
                      </span>
                      <span style={{
                        padding: "0.25rem 0.75rem",
                        backgroundColor: diffColor,
                        color: "white",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600"
                      }}>
                        {q.difficulty.toUpperCase()}
                      </span>
                    </div>

                    <h3 style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#333",
                      marginBottom: "1rem",
                      lineHeight: "1.5"
                    }}>
                      {q.question}
                    </h3>

                    {q.description && (
                      <p style={{
                        fontSize: "14px",
                        color: "#666",
                        marginBottom: "1rem",
                        lineHeight: "1.5"
                      }}>
                        {q.description}
                      </p>
                    )}

                    <button
                      onClick={() => startChallenge(index)}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.3s ease"
                      }}
                    >
                      🚀 Start Challenge
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                setStep(1);
                setQuestions([]);
                setCategory("");
                setDifficulty("");
              }}
              style={{
                marginTop: "2rem",
                padding: "1rem 2rem",
                backgroundColor: "white",
                color: "#667eea",
                border: "2px solid #667eea",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                display: "block",
                margin: "2rem auto 0"
              }}
            >
              ← Generate New Questions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
