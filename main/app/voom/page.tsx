"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { updateRoomStatuses, Room } from "@/lib/voomData";

export default function VoomPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [loadingRooms, setLoadingRooms] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    loadRooms();
  }, []);

  function loadRooms() {
    setLoadingRooms(true);
    const roomsWithStatus = updateRoomStatuses();
    setRooms(roomsWithStatus);
    setLoadingRooms(false);
  }

  const difficulties = ["All", "Easy", "Medium", "Hard"];
  const statuses = [
    { value: "active", label: "🟢 Active" },
    { value: "upcoming", label: "🟡 Upcoming" },
    { value: "ended", label: "🔴 Ended" }
  ];

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = searchQuery === "" || 
      room.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === "All" || room.difficulty === selectedDifficulty;
    const matchesStatus = selectedStatus === "all" || room.status === selectedStatus;
    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case "Easy": return "#28a745";
      case "Medium": return "#fd7e14";
      case "Hard": return "#dc3545";
      default: return "#6c757d";
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "active": return { bg: "#d4edda", color: "#155724", text: "🟢 Live Now" };
      case "upcoming": return { bg: "#fff3cd", color: "#856404", text: "🟡 Coming Soon" };
      case "ended": return { bg: "#f8d7da", color: "#721c24", text: "🔴 Ended" };
      default: return { bg: "#e2e3e5", color: "#383d41", text: "Unknown" };
    }
  };

  const getTimeRemaining = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Ended";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h left`;
    }
    return `${hours}h ${minutes}m left`;
  };

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

      {/* Header */}
      <div style={{
        padding: "3rem 2rem",
        textAlign: "center",
        color: "white"
      }}>
        <h1 style={{
          fontSize: "48px",
          fontWeight: "800",
          marginBottom: "1rem",
          textShadow: "0 2px 10px rgba(0,0,0,0.2)"
        }}>
          🎯 Voom Challenge Rooms
        </h1>
        <p style={{
          fontSize: "20px",
          opacity: 0.95,
          maxWidth: "800px",
          margin: "0 auto"
        }}>
          Join 24-hour challenge rooms, solve questions, and compete on the leaderboard!
        </p>
      </div>

      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0 2rem 2rem"
      }}>
        {/* Search and Filters */}
        <div style={{
          backgroundColor: "rgba(255,255,255,0.95)",
          borderRadius: "16px",
          padding: "1.5rem",
          marginBottom: "2rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
        }}>
          {/* Search Bar */}
          <input
            type="text"
            placeholder="🔍 Search rooms by topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "1rem 1.5rem",
              fontSize: "16px",
              border: "2px solid #e1e8ed",
              borderRadius: "12px",
              outline: "none",
              marginBottom: "1.5rem",
              boxSizing: "border-box"
            }}
          />

          {/* Status Filter */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontWeight: "600", color: "#333", marginBottom: "0.5rem", display: "block" }}>
              Status
            </label>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {statuses.map(status => (
                <button
                  key={status.value}
                  onClick={() => setSelectedStatus(status.value)}
                  style={{
                    padding: "0.5rem 1rem",
                    border: selectedStatus === status.value ? "2px solid #667eea" : "2px solid #e1e8ed",
                    backgroundColor: selectedStatus === status.value ? "#667eea" : "white",
                    color: selectedStatus === status.value ? "white" : "#333",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.2s"
                  }}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label style={{ fontWeight: "600", color: "#333", marginBottom: "0.5rem", display: "block" }}>
              Difficulty
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {difficulties.map(difficulty => (
                <button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  style={{
                    padding: "0.5rem 1rem",
                    border: selectedDifficulty === difficulty ? "2px solid #667eea" : "2px solid #e1e8ed",
                    backgroundColor: selectedDifficulty === difficulty ? "#667eea" : "white",
                    color: selectedDifficulty === difficulty ? "white" : "#333",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.2s"
                  }}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div style={{
          color: "white",
          fontSize: "18px",
          fontWeight: "600",
          marginBottom: "1.5rem",
          textAlign: "center"
        }}>
          {filteredRooms.length} Room{filteredRooms.length !== 1 ? 's' : ''} Available
        </div>

        {/* Rooms Grid */}
        {loadingRooms ? (
          <div style={{ textAlign: "center", color: "white", fontSize: "18px", padding: "3rem" }}>
            Loading rooms...
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "1.5rem"
          }}>
            {filteredRooms.map(room => {
              const statusBadge = getStatusBadge(room.status);
              return (
                <div
                  key={room.id}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    padding: "1.5rem",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                    transition: "all 0.3s ease",
                    cursor: room.status === "active" ? "pointer" : "default",
                    opacity: room.status === "ended" ? 0.7 : 1,
                    display: "flex",
                    flexDirection: "column"
                  }}
                  onClick={() => room.status === "active" && router.push(`/voom/${room.id}`)}
                  onMouseOver={(e) => {
                    if (room.status === "active") {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow = "0 15px 40px rgba(102,126,234,0.4)";
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
                  }}
                >
                  {/* Status Badge */}
                  <div style={{
                    display: "inline-block",
                    padding: "0.5rem 1rem",
                    backgroundColor: statusBadge.bg,
                    color: statusBadge.color,
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "600",
                    marginBottom: "1rem",
                    alignSelf: "flex-start"
                  }}>
                    {statusBadge.text}
                  </div>

                  {/* Room Header */}
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                    <div style={{
                      fontSize: "40px",
                      width: "60px",
                      height: "60px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                      borderRadius: "12px"
                    }}>
                      {room.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: "20px",
                        fontWeight: "700",
                        color: "#333",
                        marginBottom: "0.25rem"
                      }}>
                        {room.topic}
                      </h3>
                      <span style={{
                        padding: "0.25rem 0.75rem",
                        backgroundColor: getDifficultyColor(room.difficulty),
                        color: "white",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "600"
                      }}>
                        {room.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{
                    fontSize: "14px",
                    color: "#666",
                    lineHeight: "1.6",
                    marginBottom: "1rem",
                    flexGrow: 1
                  }}>
                    {room.description}
                  </p>

                  {/* Stats */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    marginBottom: "1rem",
                    padding: "1rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px"
                  }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "24px", fontWeight: "700", color: "#667eea" }}>
                        {room.total_questions}
                      </div>
                      <div style={{ fontSize: "12px", color: "#666" }}>Questions</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "24px", fontWeight: "700", color: "#667eea" }}>
                        {room.active_users}
                      </div>
                      <div style={{ fontSize: "12px", color: "#666" }}>Competitors</div>
                    </div>
                  </div>

                  {/* Time Info */}
                  {room.status === "active" && (
                    <div style={{
                      padding: "0.75rem",
                      backgroundColor: "#fff3cd",
                      borderRadius: "8px",
                      marginBottom: "1rem",
                      textAlign: "center"
                    }}>
                      <span style={{ fontSize: "14px", fontWeight: "600", color: "#856404" }}>
                        ⏰ {getTimeRemaining(room.ends_at)}
                      </span>
                    </div>
                  )}

                  {room.status === "upcoming" && (
                    <div style={{
                      padding: "0.75rem",
                      backgroundColor: "#d1ecf1",
                      borderRadius: "8px",
                      marginBottom: "1rem",
                      textAlign: "center"
                    }}>
                      <span style={{ fontSize: "14px", fontWeight: "600", color: "#0c5460" }}>
                        🕐 Starts: {new Date(room.starts_at).toLocaleDateString()} {new Date(room.starts_at).toLocaleTimeString()}
                      </span>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    disabled={room.status !== "active"}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      background: room.status === "active" 
                        ? "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
                        : "#ccc",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: room.status === "active" ? "pointer" : "not-allowed"
                    }}
                  >
                    {room.status === "active" ? "🚀 Enter Room" : 
                     room.status === "upcoming" ? "⏳ Not Started" : "✅ Ended"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {filteredRooms.length === 0 && !loadingRooms && (
          <div style={{
            backgroundColor: "rgba(255,255,255,0.95)",
            borderRadius: "16px",
            padding: "3rem",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "1rem" }}>🔍</div>
            <h3 style={{ fontSize: "24px", fontWeight: "600", color: "#333", marginBottom: "0.5rem" }}>
              No Rooms Found
            </h3>
            <p style={{ fontSize: "16px", color: "#666" }}>
              Try adjusting your filters or check back later for new rooms!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
