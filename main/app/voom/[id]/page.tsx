"use client";

import { useAuth } from "../../../context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getRoomById, Question, Room } from "@/lib/voomData";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Trophy,
  CheckCircle,
  Circle,
  Code,
  Target,
  Medal,
  Crown,
  Award,
  Binary,
  Globe,
  Brain,
  Code2,
  Database,
  Layout,
  Network,
  Cloud,
  Zap,
  Users,
} from "lucide-react";

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
      case "easy": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "medium": return "bg-amber-100 text-amber-700 border-amber-200";
      case "hard": return "bg-rose-100 text-rose-700 border-rose-200";
      default: return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  const getQuestionStatus = (questionId: string) => {
    return solvedQuestions.has(questionId);
  };

  if (loading || !room) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 bg-white/60 backdrop-blur-md border border-zinc-200 rounded-2xl shadow-lg"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Code className="w-6 h-6 text-orange-500" />
            </motion.div>
            <p className="text-lg font-sans text-zinc-900">Loading room...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  const userRank = leaderboard.findIndex(entry => entry.user_id === user?.uid) + 1;

  const isTimeCritical = timeRemaining && !timeRemaining.includes("Time's up") && 
    parseInt(timeRemaining.split('h')[0]) === 0 && 
    parseInt(timeRemaining.split('h')[1]?.split('m')[0] || "60") < 10;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/60 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push("/dashboard")}
            className="text-2xl font-serif font-bold text-zinc-900 cursor-pointer flex items-center gap-2"
          >
            <Code2 className="w-6 h-6 text-orange-500" />
            Yukti-AI
          </motion.div>
          
          <motion.button
            whileHover={{ scale: 1.05, x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/voom")}
            className="px-4 py-2 bg-white border border-zinc-200 hover:border-orange-200 text-zinc-900 rounded-lg font-sans text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Rooms
          </motion.button>
        </div>
      </motion.nav>

      {/* Room Header */}
      <div className="py-16 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/60 backdrop-blur-md border border-zinc-200 rounded-2xl p-8 mb-6 shadow-lg"
        >
          <div className="flex justify-between items-start gap-6 mb-6">
            <div className="flex gap-6 items-center flex-1">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl shadow-md"
              >
                <Target className="w-10 h-10 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-serif font-bold text-zinc-900 mb-2">
                  {room.topic}
                </h1>
                <p className="text-base font-sans text-zinc-600">
                  {room.description}
                </p>
              </div>
            </div>

            {/* Timer */}
            <motion.div
              animate={isTimeCritical ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 1, repeat: isTimeCritical ? Infinity : 0 }}
              className={`text-center px-6 py-4 rounded-xl min-w-[200px] border ${
                isTimeCritical 
                  ? 'bg-orange-50 border-orange-200' 
                  : 'bg-white border-zinc-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className={`w-4 h-4 ${isTimeCritical ? 'text-orange-500' : 'text-zinc-500'}`} />
                <span className="text-xs font-mono uppercase tracking-wide text-zinc-500">
                  Time Remaining
                </span>
              </div>
              <div className={`text-2xl font-mono font-bold ${
                isTimeCritical ? 'text-orange-500' : 'text-zinc-900'
              }`}>
                {timeRemaining}
              </div>
            </motion.div>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-4 gap-4 p-6 bg-white/80 border border-zinc-100 rounded-xl">
            <motion.div
              whileHover={{ y: -2 }}
              className="text-center"
            >
              <div className="text-3xl font-serif font-bold text-zinc-900 mb-1">
                {userProgress.questionsSolved}/{room.total_questions}
              </div>
              <div className="text-sm font-mono text-zinc-500 uppercase tracking-wide">Solved</div>
            </motion.div>
            <motion.div
              whileHover={{ y: -2 }}
              className="text-center"
            >
              <div className="text-3xl font-serif font-bold text-orange-500 mb-1">
                {userProgress.totalPoints}
              </div>
              <div className="text-sm font-mono text-zinc-500 uppercase tracking-wide">Points</div>
            </motion.div>
            <motion.div
              whileHover={{ y: -2 }}
              className="text-center"
            >
              <div className="text-3xl font-serif font-bold text-zinc-900 mb-1">
                #{userRank || "-"}
              </div>
              <div className="text-sm font-mono text-zinc-500 uppercase tracking-wide">Rank</div>
            </motion.div>
            <motion.div
              whileHover={{ y: -2 }}
              className="text-center"
            >
              <div className="text-3xl font-serif font-bold text-zinc-900 mb-1">
                {leaderboard.length}
              </div>
              <div className="text-sm font-mono text-zinc-500 uppercase tracking-wide">Competitors</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/60 backdrop-blur-md border border-zinc-200 rounded-2xl p-2 mb-6 flex gap-2"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab("questions")}
            className={`flex-1 px-6 py-4 rounded-xl font-sans text-base font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "questions"
                ? "bg-orange-500 text-white shadow-md"
                : "bg-transparent text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            <Code className="w-5 h-5" />
            Questions ({questions.length})
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab("leaderboard")}
            className={`flex-1 px-6 py-4 rounded-xl font-sans text-base font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "leaderboard"
                ? "bg-orange-500 text-white shadow-md"
                : "bg-transparent text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            <Trophy className="w-5 h-5" />
            Leaderboard
          </motion.button>
        </motion.div>

        {/* Content */}
        {activeTab === "questions" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {questions.map((question, index) => {
              const isSolved = getQuestionStatus(question.id);
              return (
                <motion.div
                  key={question.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className={`bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border-2 transition-all ${
                    isSolved 
                      ? "border-emerald-200 bg-emerald-50/30" 
                      : "border-zinc-200 hover:border-orange-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      {isSolved ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-400" />
                      )}
                      <span className="text-sm font-mono font-bold text-zinc-900 uppercase tracking-wide">
                        Question #{index + 1}
                      </span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className={`px-3 py-1 rounded-lg text-xs font-sans font-semibold capitalize border ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty}
                      </span>
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 border border-orange-200 rounded-lg text-xs font-mono font-bold">
                        {question.points} pts
                      </span>
                    </div>
                  </div>

                  <p className="text-base font-sans text-zinc-700 leading-relaxed mb-6 min-h-[60px]">
                    {question.question_text}
                  </p>

                  {isSolved ? (
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-50 border border-emerald-200 rounded-xl"
                    >
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <span className="font-sans font-semibold text-emerald-700">Solved!</span>
                    </motion.div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSolveQuestion(question)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-sans font-semibold shadow-md hover:shadow-lg transition-shadow"
                    >
                      <Zap className="w-5 h-5" />
                      Solve on Canvas
                    </motion.button>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/60 backdrop-blur-md border border-zinc-200 rounded-2xl p-8 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-7 h-7 text-orange-500" />
              <h2 className="text-3xl font-serif font-bold text-zinc-900">
                Leaderboard
              </h2>
            </div>
            {leaderboard.length === 0 ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-16"
              >
                <Users className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
                <p className="text-lg font-sans text-zinc-500">No submissions yet. Be the first!</p>
              </motion.div>
            ) : (
              <div className="flex flex-col gap-3">
                {leaderboard.map((entry, index) => {
                  const isCurrentUser = entry.user_id === user?.uid;
                  const RankIcon = entry.rank === 1 ? Crown : entry.rank === 2 || entry.rank === 3 ? Medal : Trophy;
                  const rankColor = entry.rank === 1 ? "text-amber-500" : entry.rank === 2 ? "text-zinc-400" : entry.rank === 3 ? "text-orange-600" : "text-zinc-500";
                  
                  return (
                    <motion.div
                      key={entry.user_id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 4 }}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                        isCurrentUser
                          ? "bg-orange-50/50 border-orange-200"
                          : "bg-white/80 border-zinc-200 hover:border-zinc-300"
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${
                        entry.rank <= 3 
                          ? "bg-gradient-to-br from-amber-100 to-amber-200 border-amber-300" 
                          : "bg-zinc-50 border-zinc-200"
                      }`}>
                        {entry.rank <= 3 ? (
                          <RankIcon className={`w-7 h-7 ${rankColor}`} />
                        ) : (
                          <span className="text-lg font-serif font-bold text-zinc-700">
                            {entry.rank}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-sans font-semibold text-zinc-900">
                            {entry.user_name}
                          </span>
                          {isCurrentUser && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 border border-orange-200 rounded-md text-xs font-mono font-semibold">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm font-sans text-zinc-600">
                          <CheckCircle className="w-4 h-4" />
                          <span>
                            Solved {entry.questions_solved} question{entry.questions_solved !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-serif font-bold text-orange-500 mb-1">
                          {entry.total_points}
                        </div>
                        <div className="text-xs font-mono text-zinc-500 uppercase tracking-wide">points</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
