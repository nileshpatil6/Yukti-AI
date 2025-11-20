"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Problem {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  postedBy: string;
  organization: string;
  tags: string[];
  submissions: number;
  prize?: string;
  deadline?: string;
}

const realWorldProblems: Problem[] = [
  {
    id: "1",
    title: "Climate Change Prediction Model",
    description: "Develop a machine learning model to predict climate patterns and temperature changes based on historical data. Help scientists understand future climate scenarios.",
    category: "Environment",
    difficulty: "Advanced",
    postedBy: "Dr. Sarah Johnson",
    organization: "NASA Climate Research",
    tags: ["Machine Learning", "Climate Science", "Data Analysis"],
    submissions: 234,
    prize: "₹50,000",
    deadline: "2025-12-31"
  },
  {
    id: "2",
    title: "Water Quality Monitoring System",
    description: "Create an IoT-based solution to monitor water quality in real-time across rural areas. Detect contamination and alert authorities automatically.",
    category: "Environment",
    difficulty: "Intermediate",
    postedBy: "Prof. Rajesh Kumar",
    organization: "Indian Institute of Science",
    tags: ["IoT", "Sensors", "Water Management"],
    submissions: 189,
    prize: "₹30,000",
    deadline: "2025-11-30"
  },
  {
    id: "3",
    title: "AI-Powered Disease Diagnosis",
    description: "Build an AI system that can diagnose common diseases from medical images and symptoms. Focus on accessibility for rural healthcare centers.",
    category: "Healthcare",
    difficulty: "Advanced",
    postedBy: "Dr. Priya Sharma",
    organization: "AIIMS Research Center",
    tags: ["AI", "Healthcare", "Computer Vision", "Medical Imaging"],
    submissions: 312,
    prize: "₹75,000",
    deadline: "2026-01-15"
  },
  {
    id: "4",
    title: "Smart Traffic Management",
    description: "Design an intelligent traffic management system using computer vision to reduce congestion in urban areas and optimize traffic flow.",
    category: "Smart Cities",
    difficulty: "Intermediate",
    postedBy: "Dr. Amit Verma",
    organization: "IIT Delhi",
    tags: ["Computer Vision", "IoT", "Urban Planning"],
    submissions: 156,
    prize: "₹40,000",
    deadline: "2025-12-15"
  },
  {
    id: "5",
    title: "Crop Disease Detection",
    description: "Develop a mobile app that uses AI to identify crop diseases from leaf images. Help farmers detect and treat diseases early to improve yield.",
    category: "Agriculture",
    difficulty: "Intermediate",
    postedBy: "Prof. Lakshmi Narayanan",
    organization: "Agricultural Research Institute",
    tags: ["Machine Learning", "Mobile Development", "Agriculture"],
    submissions: 267,
    prize: "₹35,000",
    deadline: "2025-11-25"
  },
  {
    id: "6",
    title: "Renewable Energy Optimizer",
    description: "Create a system to optimize the distribution and storage of renewable energy from solar and wind sources across smart grids.",
    category: "Energy",
    difficulty: "Advanced",
    postedBy: "Dr. Michael Chen",
    organization: "Renewable Energy Foundation",
    tags: ["Energy Management", "Optimization", "Smart Grid"],
    submissions: 143,
    prize: "₹60,000",
    deadline: "2026-02-01"
  },
  {
    id: "7",
    title: "Disaster Response Coordinator",
    description: "Build a real-time disaster response coordination platform that helps emergency services locate and assist affected populations during natural disasters.",
    category: "Emergency Management",
    difficulty: "Advanced",
    postedBy: "Dr. Anita Desai",
    organization: "National Disaster Management Authority",
    tags: ["Web Development", "Real-time Systems", "GIS"],
    submissions: 198,
    prize: "₹55,000",
    deadline: "2025-12-20"
  },
  {
    id: "8",
    title: "Education Access Platform",
    description: "Develop a low-bandwidth educational platform that works offline and provides quality education content to remote areas with limited internet.",
    category: "Education",
    difficulty: "Intermediate",
    postedBy: "Prof. Kavita Rao",
    organization: "Digital Education Initiative",
    tags: ["Web Development", "Offline-First", "Education"],
    submissions: 221,
    prize: "₹25,000",
    deadline: "2025-11-28"
  },
  {
    id: "9",
    title: "Wildlife Conservation Tracker",
    description: "Create an AI-powered system to track and monitor endangered species using camera traps and satellite imagery to aid conservation efforts.",
    category: "Wildlife",
    difficulty: "Advanced",
    postedBy: "Dr. Robert Williams",
    organization: "World Wildlife Fund",
    tags: ["Computer Vision", "AI", "Conservation"],
    submissions: 176,
    prize: "₹45,000",
    deadline: "2026-01-10"
  },
  {
    id: "10",
    title: "Air Quality Prediction",
    description: "Develop a predictive model for air quality index in urban areas. Help citizens make informed decisions about outdoor activities and health.",
    category: "Environment",
    difficulty: "Intermediate",
    postedBy: "Dr. Sneha Patel",
    organization: "Environmental Research Institute",
    tags: ["Data Science", "Machine Learning", "Environmental Science"],
    submissions: 204,
    prize: "₹30,000",
    deadline: "2025-12-05"
  },
  {
    id: "11",
    title: "Blockchain for Supply Chain",
    description: "Implement a blockchain-based solution to track pharmaceutical supply chains and prevent counterfeit medicines from reaching consumers.",
    category: "Healthcare",
    difficulty: "Advanced",
    postedBy: "Dr. James Anderson",
    organization: "Pharmaceutical Research Council",
    tags: ["Blockchain", "Supply Chain", "Healthcare"],
    submissions: 134,
    prize: "₹70,000",
    deadline: "2026-01-20"
  },
  {
    id: "12",
    title: "Smart Waste Management",
    description: "Design an IoT-based smart waste management system that optimizes garbage collection routes and promotes recycling in cities.",
    category: "Smart Cities",
    difficulty: "Beginner",
    postedBy: "Prof. Meera Iyer",
    organization: "Urban Development Authority",
    tags: ["IoT", "Optimization", "Sustainability"],
    submissions: 289,
    prize: "₹20,000",
    deadline: "2025-11-22"
  },
  {
    id: "13",
    title: "Mental Health Chatbot",
    description: "Build an AI chatbot that provides mental health support and resources. Make mental healthcare more accessible and reduce stigma.",
    category: "Healthcare",
    difficulty: "Intermediate",
    postedBy: "Dr. Emily Rodriguez",
    organization: "Mental Health Foundation",
    tags: ["NLP", "AI", "Healthcare", "Chatbot"],
    submissions: 312,
    prize: "₹35,000",
    deadline: "2025-12-10"
  },
  {
    id: "14",
    title: "Flood Prediction System",
    description: "Create an early warning system for floods using weather data, river levels, and machine learning to predict floods and save lives.",
    category: "Disaster Management",
    difficulty: "Advanced",
    postedBy: "Dr. Suresh Reddy",
    organization: "Meteorological Department",
    tags: ["Machine Learning", "Data Analysis", "Disaster Management"],
    submissions: 167,
    prize: "₹50,000",
    deadline: "2025-12-28"
  },
  {
    id: "15",
    title: "Sign Language Translator",
    description: "Develop a real-time sign language translation system using computer vision to help hearing-impaired individuals communicate more easily.",
    category: "Accessibility",
    difficulty: "Advanced",
    postedBy: "Prof. Linda Martinez",
    organization: "Accessibility Research Lab",
    tags: ["Computer Vision", "Machine Learning", "Accessibility"],
    submissions: 245,
    prize: "₹40,000",
    deadline: "2026-01-05"
  }
];

export default function HackathonsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const categories = ["All", "Environment", "Healthcare", "Smart Cities", "Agriculture", "Energy", "Emergency Management", "Education", "Wildlife", "Disaster Management", "Accessibility"];
  const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

  const filteredProblems = realWorldProblems.filter(problem => {
    const matchesCategory = selectedCategory === "All" || problem.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "All" || problem.difficulty === selectedDifficulty;
    const matchesSearch = searchQuery === "" || 
      problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case "Beginner": return "#28a745";
      case "Intermediate": return "#fd7e14";
      case "Advanced": return "#dc3545";
      default: return "#6c757d";
    }
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
          Yukti
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
          💻 Global Research Hackathons
        </h1>
        <p style={{
          fontSize: "20px",
          opacity: 0.95,
          maxWidth: "800px",
          margin: "0 auto"
        }}>
          Solve real-world problems posted by scientists and researchers. Make your contribution count!
        </p>
      </div>

      {/* Filters and Search */}
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0 2rem 2rem"
      }}>
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
            placeholder="🔍 Search problems, tags, or keywords..."
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

          {/* Category Filter */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontWeight: "600", color: "#333", marginBottom: "0.5rem", display: "block" }}>
              Category
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    padding: "0.5rem 1rem",
                    border: selectedCategory === category ? "2px solid #667eea" : "2px solid #e1e8ed",
                    backgroundColor: selectedCategory === category ? "#667eea" : "white",
                    color: selectedCategory === category ? "white" : "#333",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.2s"
                  }}
                >
                  {category}
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
          {filteredProblems.length} Problem{filteredProblems.length !== 1 ? 's' : ''} Available
        </div>

        {/* Problems Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
          gap: "1.5rem"
        }}>
          {filteredProblems.map(problem => (
            <div
              key={problem.id}
              style={{
                backgroundColor: "white",
                borderRadius: "16px",
                padding: "1.5rem",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                transition: "all 0.3s ease",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column"
              }}
              onClick={() => router.push(`/hackathons/${problem.id}`)}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 15px 40px rgba(102,126,234,0.4)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
              }}
            >
              {/* Header */}
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.75rem" }}>
                  <span style={{
                    padding: "0.25rem 0.75rem",
                    backgroundColor: getDifficultyColor(problem.difficulty),
                    color: "white",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600"
                  }}>
                    {problem.difficulty}
                  </span>
                  <span style={{
                    padding: "0.25rem 0.75rem",
                    backgroundColor: "#f0f0f0",
                    color: "#666",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600"
                  }}>
                    {problem.category}
                  </span>
                </div>
                <h3 style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#333",
                  marginBottom: "0.5rem",
                  lineHeight: "1.3"
                }}>
                  {problem.title}
                </h3>
                <p style={{
                  fontSize: "14px",
                  color: "#666",
                  lineHeight: "1.5",
                  marginBottom: "1rem"
                }}>
                  {problem.description}
                </p>
              </div>

              {/* Tags */}
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                marginBottom: "1rem"
              }}>
                {problem.tags.map(tag => (
                  <span
                    key={tag}
                    style={{
                      padding: "0.25rem 0.5rem",
                      backgroundColor: "#e8f0fe",
                      color: "#667eea",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: "500"
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div style={{
                marginTop: "auto",
                paddingTop: "1rem",
                borderTop: "1px solid #e1e8ed"
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.75rem"
                }}>
                  <div>
                    <div style={{ fontSize: "12px", color: "#999", marginBottom: "0.25rem" }}>Posted by</div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>{problem.postedBy}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>{problem.organization}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "12px", color: "#999", marginBottom: "0.25rem" }}>Submissions</div>
                    <div style={{ fontSize: "18px", fontWeight: "700", color: "#667eea" }}>{problem.submissions}</div>
                  </div>
                </div>

                {problem.prize && (
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.75rem",
                    backgroundColor: "#fff3cd",
                    borderRadius: "8px",
                    marginBottom: "0.5rem"
                  }}>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#856404" }}>
                      🏆 Prize: {problem.prize}
                    </span>
                    {problem.deadline && (
                      <span style={{ fontSize: "12px", color: "#856404" }}>
                        ⏰ {problem.deadline}
                      </span>
                    )}
                  </div>
                )}

                <button style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}>
                  View Details & Contribute →
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProblems.length === 0 && (
          <div style={{
            backgroundColor: "rgba(255,255,255,0.95)",
            borderRadius: "16px",
            padding: "3rem",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "1rem" }}>🔍</div>
            <h3 style={{ fontSize: "24px", fontWeight: "600", color: "#333", marginBottom: "0.5rem" }}>
              No Problems Found
            </h3>
            <p style={{ fontSize: "16px", color: "#666" }}>
              Try adjusting your filters or search query
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
