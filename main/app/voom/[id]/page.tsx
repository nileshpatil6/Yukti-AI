"use client";

import { useAuth } from "../../../context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getRoomById, Question, Room } from "@/lib/voomData";

interface LeaderboardEntry {
  rank: number;
  user_name: string;
  user_id: string;
  questions_solved: number;
  total_points: number;
  last_solved_at: string;
}

export default function RoomPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [solvedQuestions, setSolvedQuestions] = useState<Set<string>>(new Set());
  const [userProgress, setUserProgress] = useState({ questionsSolved: 0, totalPoints: 0 });
  const [timeRemaining, setTimeRemaining] = useState("");
  const [activeTab, setActiveTab] = useState<"questions" | "leaderboard">("questions");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (roomId) {
      loadRoomData();
      loadProgress();
      const interval = setInterval(() => {
        calculateTimeRemaining();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [roomId]);

  function loadRoomData() {
    const roomData = getRoomById(roomId);
    if (roomData) {
      setRoom(roomData);
      setQuestions(roomData.questions);
    }
    loadLeaderboard();
  }

  function loadProgress() {
    if (!user) return;
    const storageKey = `voom_progress_${roomId}_${user.uid}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const data = JSON.parse(saved);
      setSolvedQuestions(new Set(data.solved || []));
      setUserProgress({
        questionsSolved: data.solved?.length || 0,
        totalPoints: data.totalPoints || 0
      });
    }
  }

  function loadLeaderboard() {
    const allProgress: LeaderboardEntry[] = [];
    
    // Load all user progress from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`voom_progress_${roomId}_`)) {
        const data = JSON.parse(localStorage.getItem(key) || "{}");
        if (data.userName) {
          allProgress.push({
            rank: 0,
            user_id: data.userId,
            user_name: data.userName,
            questions_solved: data.solved?.length || 0,
            total_points: data.totalPoints || 0,
            last_solved_at: data.lastSolvedAt || new Date().toISOString()
          });
        }
      }
    }

    // Sort by questions solved, then by points, then by time
    allProgress.sort((a, b) => {
      if (b.questions_solved !== a.questions_solved) {
        return b.questions_solved - a.questions_solved;
      }
      if (b.total_points !== a.total_points) {
        return b.total_points - a.total_points;
      }
      return new Date(a.last_solved_at).getTime() - new Date(b.last_solved_at).getTime();
    });

    // Assign ranks
    const rankedLeaderboard = allProgress.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

    setLeaderboard(rankedLeaderboard);
  }

  function calculateTimeRemaining() {
    if (!room) return;
    
    const now = new Date();
    const end = new Date(room.ends_at);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) {
      setTimeRemaining("Time's up!");
      return;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
  }

  function handleSolveQuestion(question: Question) {
    // Store the current question in localStorage so canvas can access it
    localStorage.setItem("currentVoomQuestion", JSON.stringify({
      roomId: roomId,
      questionId: question.id,
      questionText: question.question_text,
      points: question.points
    }));

    // Open canvas in new window
    window.open("http://localhost:5000", "_blank");
  }

  function markQuestionSolved(questionId: string, points: number) {
    if (!user) return;

    const newSolved = new Set(solvedQuestions);
    newSolved.add(questionId);
    setSolvedQuestions(newSolved);

    const newProgress = {
      questionsSolved: newSolved.size,
      totalPoints: userProgress.totalPoints + points
    };
    setUserProgress(newProgress);

    // Save to localStorage
    const storageKey = `voom_progress_${roomId}_${user.uid}`;
    localStorage.setItem(storageKey, JSON.stringify({
      userId: user.uid,
      userName: user.email?.split('@')[0] || 'User',
      solved: Array.from(newSolved),
      totalPoints: newProgress.totalPoints,
      lastSolvedAt: new Date().toISOString()
    }));

    // Reload leaderboard
    loadLeaderboard();
  }

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty?.toLowerCase()) {
      case "easy": return "#28a745";
      case "medium": return "#fd7e14";
      case "hard": return "#dc3545";
      default: return "#6c757d";
    }
  };

  const getQuestionStatus = (questionId: string) => {
    return solvedQuestions.has(questionId);
  };

  if (loading || !room) {
    return (
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
          <p style={{ fontSize: "18px", color: "#667eea" }}>Loading room...</p>
        </div>
      </div>
    );
  }

  const userRank = leaderboard.findIndex(entry => entry.user_id === user?.uid) + 1;

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
        
        <button
          onClick={() => router.push("/voom")}
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
          ← Back to Rooms
        </button>
      </nav>

      {/* Room Header */}
      <div style={{
        padding: "2rem",
        maxWidth: "1400px",
        margin: "0 auto"
      }}>
        <div style={{
          backgroundColor: "rgba(255,255,255,0.95)",
          borderRadius: "16px",
          padding: "2rem",
          marginBottom: "2rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <div style={{
                fontSize: "48px",
                width: "80px",
                height: "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                borderRadius: "16px"
              }}>
                {room.icon}
              </div>
              <div>
                <h1 style={{
                  fontSize: "32px",
                  fontWeight: "800",
                  color: "#333",
                  marginBottom: "0.5rem"
                }}>
                  {room.topic}
                </h1>
                <p style={{ fontSize: "16px", color: "#666" }}>
                  {room.description}
                </p>
              </div>
            </div>

            {/* Timer */}
            <div style={{
              textAlign: "center",
              padding: "1rem",
              backgroundColor: "#fff3cd",
              borderRadius: "12px",
              minWidth: "180px"
            }}>
              <div style={{ fontSize: "12px", color: "#856404", marginBottom: "0.25rem" }}>
                Time Remaining
              </div>
              <div style={{ fontSize: "24px", fontWeight: "800", color: "#856404" }}>
                {timeRemaining}
              </div>
            </div>
          </div>

          {/* User Stats */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1rem",
            padding: "1.5rem",
            backgroundColor: "#f8f9fa",
            borderRadius: "12px"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "#667eea" }}>
                {userProgress.questionsSolved}/{room.total_questions}
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>Solved</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "#28a745" }}>
                {userProgress.totalPoints}
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>Points</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "#fd7e14" }}>
                #{userRank || "-"}
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>Rank</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "#dc3545" }}>
                {leaderboard.length}
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>Competitors</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          backgroundColor: "rgba(255,255,255,0.95)",
          borderRadius: "16px",
          padding: "1rem",
          marginBottom: "2rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          display: "flex",
          gap: "1rem"
        }}>
          <button
            onClick={() => setActiveTab("questions")}
            style={{
              flex: 1,
              padding: "1rem",
              backgroundColor: activeTab === "questions" ? "#667eea" : "transparent",
              color: activeTab === "questions" ? "white" : "#333",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s"
            }}
          >
            📝 Questions ({questions.length})
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            style={{
              flex: 1,
              padding: "1rem",
              backgroundColor: activeTab === "leaderboard" ? "#667eea" : "transparent",
              color: activeTab === "leaderboard" ? "white" : "#333",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s"
            }}
          >
            🏆 Leaderboard
          </button>
        </div>

        {/* Content */}
        {activeTab === "questions" ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
            gap: "1.5rem"
          }}>
            {questions.map((question, index) => {
              const isSolved = getQuestionStatus(question.id);
              return (
                <div
                  key={question.id}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    padding: "1.5rem",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                    transition: "all 0.3s ease",
                    border: isSolved ? "3px solid #28a745" : "none"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <div style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "#667eea"
                    }}>
                      Question #{index + 1}
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <span style={{
                        padding: "0.25rem 0.75rem",
                        backgroundColor: getDifficultyColor(question.difficulty),
                        color: "white",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "600",
                        textTransform: "capitalize"
                      }}>
                        {question.difficulty}
                      </span>
                      <span style={{
                        padding: "0.25rem 0.75rem",
                        backgroundColor: "#ffc107",
                        color: "white",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "600"
                      }}>
                        {question.points} pts
                      </span>
                    </div>
                  </div>

                  <p style={{
                    fontSize: "15px",
                    color: "#333",
                    lineHeight: "1.6",
                    marginBottom: "1.5rem",
                    minHeight: "60px"
                  }}>
                    {question.question_text}
                  </p>

                  {isSolved ? (
                    <div style={{
                      padding: "0.75rem",
                      backgroundColor: "#d4edda",
                      borderRadius: "8px",
                      textAlign: "center",
                      color: "#155724",
                      fontWeight: "600"
                    }}>
                      ✅ Solved!
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSolveQuestion(question)}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer"
                      }}
                    >
                      🚀 Solve on Canvas
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "2rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
          }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#333", marginBottom: "1.5rem" }}>
              🏆 Leaderboard
            </h2>
            {leaderboard.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#999" }}>
                <p style={{ fontSize: "18px" }}>No submissions yet. Be the first!</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {leaderboard.map((entry) => (
                  <div
                    key={entry.user_id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "1rem",
                      backgroundColor: entry.user_id === user?.uid ? "#e8f0fe" : "#f8f9fa",
                      borderRadius: "12px",
                      border: entry.user_id === user?.uid ? "2px solid #667eea" : "none"
                    }}
                  >
                    <div style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      background: entry.rank <= 3 
                        ? "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)"
                        : "#e1e8ed",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      fontWeight: "800",
                      color: entry.rank <= 3 ? "#fff" : "#333",
                      marginRight: "1rem"
                    }}>
                      {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : entry.rank}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "16px", fontWeight: "600", color: "#333" }}>
                        {entry.user_name}
                        {entry.user_id === user?.uid && (
                          <span style={{ marginLeft: "0.5rem", fontSize: "14px", color: "#667eea" }}>
                            (You)
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "13px", color: "#666" }}>
                        Solved {entry.questions_solved} question{entry.questions_solved !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "24px", fontWeight: "700", color: "#667eea" }}>
                        {entry.total_points}
                      </div>
                      <div style={{ fontSize: "12px", color: "#666" }}>points</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
