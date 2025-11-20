"use client";

import { useAuth } from "../../../context/AuthContext";
import { useRouter, useParams } from "next/navigation";
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
  detailedDescription: string;
  requirements: string[];
  resources: string[];
  evaluationCriteria: string[];
}

interface Submission {
  id: string;
  userId: string;
  userName: string;
  problemId: string;
  title: string;
  description: string;
  githubLink: string;
  demoLink?: string;
  submittedAt: string;
  votes: number;
}

const problemsData: Record<string, Problem> = {
  "1": {
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
    deadline: "2025-12-31",
    detailedDescription: `Climate change is one of the most pressing challenges of our time. This project aims to develop sophisticated machine learning models that can predict future climate patterns based on historical data spanning the last century.

Your solution should analyze various factors including:
- Temperature variations across different regions
- Greenhouse gas emissions
- Ocean temperature changes
- Ice cap measurements
- Atmospheric CO2 levels

The model should be able to predict climate patterns for the next 50 years with reasonable accuracy and provide insights that can help policymakers and researchers make informed decisions.`,
    requirements: [
      "Use at least 3 different machine learning algorithms (LSTM, Random Forest, Neural Networks recommended)",
      "Train on historical climate data from at least 50 years",
      "Achieve minimum 75% prediction accuracy on test data",
      "Provide clear visualizations of predictions",
      "Include uncertainty estimates in predictions",
      "Document your methodology thoroughly"
    ],
    resources: [
      "NOAA Climate Data: https://www.ncdc.noaa.gov/data-access",
      "NASA Climate Data: https://climate.nasa.gov/vital-signs/",
      "Kaggle Climate Datasets",
      "IPCC Reports for validation"
    ],
    evaluationCriteria: [
      "Model Accuracy (40%)",
      "Innovation in Approach (25%)",
      "Code Quality and Documentation (20%)",
      "Visualization and Presentation (15%)"
    ]
  },
  "2": {
    id: "2",
    title: "Water Quality Monitoring System",
    description: "Create an IoT-based solution to monitor water quality in real-time across rural areas.",
    category: "Environment",
    difficulty: "Intermediate",
    postedBy: "Prof. Rajesh Kumar",
    organization: "Indian Institute of Science",
    tags: ["IoT", "Sensors", "Water Management"],
    submissions: 189,
    prize: "₹30,000",
    deadline: "2025-11-30",
    detailedDescription: `Access to clean water is crucial for public health. This project requires developing an IoT-based system that can monitor water quality parameters in real-time and alert authorities when contamination is detected.

The system should monitor:
- pH levels
- Turbidity
- Dissolved oxygen
- Temperature
- Presence of harmful bacteria or chemicals

The solution should be cost-effective, easy to deploy in remote areas, and provide real-time alerts through mobile applications.`,
    requirements: [
      "Design sensor array for water quality parameters",
      "Implement real-time data transmission",
      "Create mobile/web dashboard for monitoring",
      "Set up automatic alert system",
      "Ensure system works in low-power conditions",
      "Make it affordable (target cost < ₹10,000 per unit)"
    ],
    resources: [
      "Arduino/Raspberry Pi documentation",
      "Water quality standards: WHO guidelines",
      "IoT communication protocols: MQTT, LoRaWAN",
      "Sample datasets for testing"
    ],
    evaluationCriteria: [
      "Sensor Accuracy (30%)",
      "System Reliability (25%)",
      "Cost Effectiveness (20%)",
      "User Interface (15%)",
      "Scalability (10%)"
    ]
  },
  // Add basic info for other problems
  "3": {
    id: "3",
    title: "AI-Powered Disease Diagnosis",
    description: "Build an AI system that can diagnose common diseases from medical images and symptoms.",
    category: "Healthcare",
    difficulty: "Advanced",
    postedBy: "Dr. Priya Sharma",
    organization: "AIIMS Research Center",
    tags: ["AI", "Healthcare", "Computer Vision", "Medical Imaging"],
    submissions: 312,
    prize: "₹75,000",
    deadline: "2026-01-15",
    detailedDescription: "Develop an AI system to assist healthcare workers in diagnosing diseases from medical images (X-rays, CT scans) and patient symptoms, making healthcare more accessible in rural areas.",
    requirements: ["Train on medical imaging datasets", "Achieve 85%+ accuracy", "Support multiple disease types", "Provide confidence scores", "HIPAA compliant"],
    resources: ["NIH Medical Image Database", "Kaggle Medical Datasets", "TensorFlow/PyTorch tutorials"],
    evaluationCriteria: ["Accuracy (40%)", "Disease Coverage (25%)", "User Interface (20%)", "Performance (15%)"]
  }
};

export default function ProblemDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const problemId = params.id as string;
  
  const [problem, setProblem] = useState<Problem | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (problemId) {
      const problemData = problemsData[problemId];
      if (problemData) {
        setProblem(problemData);
        loadSubmissions(problemId);
      }
    }
  }, [problemId]);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  async function loadUserProfile() {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.uid)
      .single();
    if (data) setUserProfile(data);
  }

  async function loadSubmissions(problemId: string) {
    const { data, error } = await supabase
      .from("hackathon_submissions")
      .select("*")
      .eq("problem_id", problemId)
      .order("votes", { ascending: false });

    if (data) {
      setSubmissions(data.map((sub: any) => ({
        id: sub.id,
        userId: sub.user_id,
        userName: sub.user_name,
        problemId: sub.problem_id,
        title: sub.title,
        description: sub.description,
        githubLink: sub.github_link,
        demoLink: sub.demo_link,
        submittedAt: sub.created_at,
        votes: sub.votes || 0
      })));
    }
  }

  async function handleVote(submissionId: string, currentVotes: number) {
    const { error } = await supabase
      .from("hackathon_submissions")
      .update({ votes: currentVotes + 1 })
      .eq("id", submissionId);

    if (!error) {
      loadSubmissions(problemId);
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case "Beginner": return "#28a745";
      case "Intermediate": return "#fd7e14";
      case "Advanced": return "#dc3545";
      default: return "#6c757d";
    }
  };

  if (loading || !problem) {
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
          <p style={{ fontSize: "18px", color: "#667eea" }}>Loading...</p>
        </div>
      </div>
    );
  }

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
          onClick={() => router.push("/hackathons")}
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
          ← Back to Problems
        </button>
      </nav>

      <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
        {/* Problem Header */}
        <div style={{
          backgroundColor: "rgba(255,255,255,0.95)",
          borderRadius: "16px",
          padding: "2rem",
          marginBottom: "2rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
        }}>
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <span style={{
              padding: "0.5rem 1rem",
              backgroundColor: getDifficultyColor(problem.difficulty),
              color: "white",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600"
            }}>
              {problem.difficulty}
            </span>
            <span style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#f0f0f0",
              color: "#666",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600"
            }}>
              {problem.category}
            </span>
          </div>

          <h1 style={{
            fontSize: "36px",
            fontWeight: "800",
            color: "#333",
            marginBottom: "1rem"
          }}>
            {problem.title}
          </h1>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem"
          }}>
            <div>
              <p style={{ fontSize: "14px", color: "#999", marginBottom: "0.25rem" }}>Posted by</p>
              <p style={{ fontSize: "18px", fontWeight: "600", color: "#333" }}>{problem.postedBy}</p>
              <p style={{ fontSize: "14px", color: "#666" }}>{problem.organization}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "14px", color: "#999", marginBottom: "0.25rem" }}>Total Submissions</p>
              <p style={{ fontSize: "32px", fontWeight: "700", color: "#667eea" }}>{submissions.length}</p>
            </div>
          </div>

          {problem.prize && (
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem",
              backgroundColor: "#fff3cd",
              borderRadius: "12px",
              marginBottom: "1rem"
            }}>
              <span style={{ fontSize: "18px", fontWeight: "700", color: "#856404" }}>
                🏆 Prize Pool: {problem.prize}
              </span>
              {problem.deadline && (
                <span style={{ fontSize: "16px", fontWeight: "600", color: "#856404" }}>
                  ⏰ Deadline: {problem.deadline}
                </span>
              )}
            </div>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }}>
            {problem.tags.map(tag => (
              <span
                key={tag}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#e8f0fe",
                  color: "#667eea",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500"
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <button
            onClick={() => window.open("http://localhost:5000", "_blank")}
            style={{
              padding: "1rem 2rem",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "18px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(102,126,234,0.4)",
              width: "100%"
            }}
          >
            🚀 Open Canvas to Build Solution
          </button>
        </div>

        {/* Two Column Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
          {/* Left Column - Details */}
          <div>
            {/* Description */}
            <div style={{
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: "16px",
              padding: "2rem",
              marginBottom: "2rem",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
            }}>
              <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#333", marginBottom: "1rem" }}>
                📋 Problem Description
              </h2>
              <p style={{ fontSize: "16px", color: "#666", lineHeight: "1.8", whiteSpace: "pre-line" }}>
                {problem.detailedDescription}
              </p>
            </div>

            {/* Requirements */}
            <div style={{
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: "16px",
              padding: "2rem",
              marginBottom: "2rem",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
            }}>
              <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#333", marginBottom: "1rem" }}>
                ✅ Requirements
              </h2>
              <ul style={{ paddingLeft: "1.5rem" }}>
                {problem.requirements.map((req, idx) => (
                  <li key={idx} style={{ fontSize: "16px", color: "#666", marginBottom: "0.75rem", lineHeight: "1.6" }}>
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            {/* Submissions */}
            <div style={{
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: "16px",
              padding: "2rem",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
            }}>
              <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#333", marginBottom: "1.5rem" }}>
                💡 Community Submissions ({submissions.length})
              </h2>
              
              {submissions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "#999" }}>
                  <p style={{ fontSize: "18px" }}>No submissions yet. Be the first to contribute!</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {submissions.map(submission => (
                    <div
                      key={submission.id}
                      style={{
                        border: "2px solid #e1e8ed",
                        borderRadius: "12px",
                        padding: "1.5rem",
                        transition: "all 0.3s"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                        <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#333" }}>
                          {submission.title}
                        </h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <button
                            onClick={() => handleVote(submission.id, submission.votes)}
                            style={{
                              padding: "0.5rem 1rem",
                              backgroundColor: "#667eea",
                              color: "white",
                              border: "none",
                              borderRadius: "8px",
                              cursor: "pointer",
                              fontWeight: "600",
                              fontSize: "14px"
                            }}
                          >
                            👍 {submission.votes}
                          </button>
                        </div>
                      </div>
                      <p style={{ fontSize: "14px", color: "#666", marginBottom: "1rem" }}>
                        {submission.description}
                      </p>
                      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        <span style={{ fontSize: "14px", color: "#999" }}>
                          by <strong>{submission.userName}</strong>
                        </span>
                        <a
                          href={submission.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: "14px",
                            color: "#667eea",
                            textDecoration: "none",
                            fontWeight: "600"
                          }}
                        >
                          📂 GitHub
                        </a>
                        {submission.demoLink && (
                          <a
                            href={submission.demoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: "14px",
                              color: "#667eea",
                              textDecoration: "none",
                              fontWeight: "600"
                            }}
                          >
                            🔗 Demo
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Resources & Criteria */}
          <div>
            {/* Resources */}
            <div style={{
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: "16px",
              padding: "1.5rem",
              marginBottom: "2rem",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
            }}>
              <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#333", marginBottom: "1rem" }}>
                📚 Resources
              </h3>
              <ul style={{ paddingLeft: "1.5rem" }}>
                {problem.resources.map((resource, idx) => (
                  <li key={idx} style={{ fontSize: "14px", color: "#666", marginBottom: "0.75rem" }}>
                    {resource}
                  </li>
                ))}
              </ul>
            </div>

            {/* Evaluation Criteria */}
            <div style={{
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: "16px",
              padding: "1.5rem",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
            }}>
              <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#333", marginBottom: "1rem" }}>
                🎯 Evaluation Criteria
              </h3>
              <ul style={{ paddingLeft: "1.5rem" }}>
                {problem.evaluationCriteria.map((criteria, idx) => (
                  <li key={idx} style={{ fontSize: "14px", color: "#666", marginBottom: "0.75rem" }}>
                    {criteria}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
