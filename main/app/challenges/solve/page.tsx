"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Trophy,
  Lightbulb,
  Pencil,
  Trash2,
  RotateCcw,
  Code
} from "lucide-react";

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

  const getDifficultyStyles = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return { bg: "bg-green-50", text: "text-green-600", border: "border-green-200" };
      case "medium":
        return { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" };
      case "hard":
        return { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" };
      default:
        return { bg: "bg-zinc-50", text: "text-zinc-600", border: "border-zinc-200" };
    }
  };

  if (!question || !challengeData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-zinc-900 text-xl font-serif"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  const diffStyles = getDifficultyStyles(question.difficulty);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/60 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => router.push("/dashboard")}
            >
              <Trophy className="w-6 h-6 text-orange-500" />
              <span className="font-serif text-2xl font-bold text-zinc-900">Yukti-AI</span>
            </motion.div>
            
            <div className="flex gap-4 items-center">
              <div className="px-4 py-2 bg-zinc-100 border border-zinc-200 rounded-lg">
                <span className="font-mono text-sm font-semibold text-zinc-700">
                  Question {currentIndex + 1} of {challengeData.questions.length}
                </span>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/challenges")}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Exit Challenge
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-6 min-h-[calc(100vh-120px)]">
          {/* Question Panel */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="border border-zinc-200 bg-white rounded-2xl p-6 overflow-y-auto shadow-sm"
          >
            <div className="flex gap-2 mb-4">
              <span className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold uppercase ${diffStyles.bg} ${diffStyles.text}`}>
                {question.difficulty}
              </span>
              <span className="px-3 py-1 bg-zinc-100 text-zinc-700 rounded-lg text-xs font-mono font-semibold">
                {question.category}
              </span>
            </div>

            <h1 className="font-serif text-2xl font-bold text-zinc-900 mb-4 leading-tight">
              {question.question}
            </h1>

            <p className="text-zinc-600 leading-relaxed mb-6">
              {question.description}
            </p>

            {question.hints && question.hints.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-orange-600" />
                  <span className="font-sans text-sm font-semibold text-orange-900">Hints:</span>
                </div>
                <ul className="space-y-2 pl-6 text-sm text-orange-900 list-disc">
                  {question.hints.map((hint: string, idx: number) => (
                    <li key={idx}>{hint}</li>
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
          </motion.div>

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
