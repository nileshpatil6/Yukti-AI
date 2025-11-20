"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SolveChallengePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [challengeData, setChallengeData] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [question, setQuestion] = useState<any>(null);

  useEffect(() => {
    // Get challenge data from localStorage
    const storedData = localStorage.getItem("challengeData");
    
    if (!storedData) {
      router.push("/challenges");
      return;
    }

    const data = JSON.parse(storedData);
    
    // Check if expired
    if (Date.now() > data.expiresAt) {
      localStorage.removeItem("challengeData");
      router.push("/challenges");
      return;
    }

    const index = parseInt(searchParams.get("index") || "0");
    setCurrentIndex(index);
    setChallengeData(data);
    setQuestion(data.questions[index]);
  }, [searchParams, router]);

  function handleNext() {
    if (challengeData && currentIndex < challengeData.questions.length - 1) {
      const newIndex = currentIndex + 1;
      router.push(`/challenges/solve?index=${newIndex}`);
    }
  }

  function handlePrevious() {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      router.push(`/challenges/solve?index=${newIndex}`);
    }
  }

  function handleComplete() {
    // Mark question as completed
    if (challengeData) {
      const completedQuestions = challengeData.completedQuestions || [];
      if (!completedQuestions.includes(currentIndex)) {
        completedQuestions.push(currentIndex);
        challengeData.completedQuestions = completedQuestions;
        localStorage.setItem("challengeData", JSON.stringify(challengeData));
      }
    }

    // Move to next or return to challenges
    if (challengeData && currentIndex < challengeData.questions.length - 1) {
      handleNext();
    } else {
      router.push("/challenges");
    }
  }

  if (!question || !challengeData) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: "20px"
      }}>
        Loading...
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy": return "#28a745";
      case "medium": return "#ffc107";
      case "hard": return "#dc3545";
      default: return "#6c757d";
    }
  };

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
          WebkitTextFillColor: "transparent",
          cursor: "pointer"
        }}
        onClick={() => router.push("/dashboard")}
        >
          🚀 CodeBharat
        </div>
        
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <div style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "#666",
            padding: "0.5rem 1rem",
            backgroundColor: "#f0f0f0",
            borderRadius: "8px"
          }}>
            Question {currentIndex + 1} of {challengeData.questions.length}
          </div>
          <button 
            onClick={() => router.push("/challenges")}
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
            Exit Challenge
          </button>
        </div>
      </nav>

      <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "400px 1fr",
          gap: "2rem",
          height: "calc(100vh - 150px)"
        }}>
          {/* Question Panel */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "2rem",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            overflowY: "auto"
          }}>
            <div style={{
              display: "inline-block",
              padding: "0.5rem 1rem",
              backgroundColor: getDifficultyColor(question.difficulty),
              color: "white",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "600",
              marginBottom: "1rem"
            }}>
              {question.difficulty.toUpperCase()}
            </div>

            <div style={{
              display: "inline-block",
              marginLeft: "0.5rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#f0f0f0",
              color: "#333",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "600",
              marginBottom: "1rem"
            }}>
              {question.category}
            </div>

            <h1 style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#333",
              marginBottom: "1rem"
            }}>
              {question.question}
            </h1>

            <p style={{
              color: "#666",
              lineHeight: "1.8",
              marginBottom: "2rem"
            }}>
              {question.description}
            </p>

            {question.hints && question.hints.length > 0 && (
              <div style={{
                backgroundColor: "#fff3cd",
                border: "1px solid #ffc107",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "2rem"
              }}>
                <div style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#856404",
                  marginBottom: "0.5rem"
                }}>
                  💡 Hints:
                </div>
                <ul style={{ margin: 0, paddingLeft: "1.5rem", color: "#856404" }}>
                  {question.hints.map((hint: string, idx: number) => (
                    <li key={idx} style={{ marginBottom: "0.5rem" }}>{hint}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Navigation Buttons */}
            <div style={{ display: "flex", gap: "1rem", marginTop: "auto" }}>
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  backgroundColor: currentIndex === 0 ? "#e0e0e0" : "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: currentIndex === 0 ? "not-allowed" : "pointer",
                  opacity: currentIndex === 0 ? 0.6 : 1
                }}
              >
                ← Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === challengeData.questions.length - 1}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  backgroundColor: currentIndex === challengeData.questions.length - 1 ? "#e0e0e0" : "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: currentIndex === challengeData.questions.length - 1 ? "not-allowed" : "pointer",
                  opacity: currentIndex === challengeData.questions.length - 1 ? 0.6 : 1
                }}
              >
                Next →
              </button>
            </div>

            <button
              onClick={handleComplete}
              style={{
                width: "100%",
                marginTop: "1rem",
                padding: "1rem",
                background: "linear-gradient(135deg, #22c1c3 0%, #fdbb2d 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              {currentIndex === challengeData.questions.length - 1 ? "Complete Challenge" : "Mark Complete & Next"}
            </button>
          </div>

          {/* Canvas Panel */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "2rem",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column"
          }}>
            <h2 style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#333",
              marginBottom: "1rem"
            }}>
              🎨 Your Solution Canvas
            </h2>

            <div style={{
              flex: 1,
              backgroundColor: "#f8f9fa",
              borderRadius: "12px",
              border: "2px dashed #dee2e6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6c757d",
              fontSize: "18px"
            }}>
              Canvas drawing area will be implemented here
              <br />
              (Circuit/Diagram/Graph drawing tools)
            </div>

            <div style={{
              marginTop: "1rem",
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap"
            }}>
              <button style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer"
              }}>
                ✏️ Draw
              </button>
              <button style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer"
              }}>
                🗑️ Clear
              </button>
              <button style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer"
              }}>
                ↶ Undo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
