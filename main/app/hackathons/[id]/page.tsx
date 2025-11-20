"use client";

import { useAuth } from "../../../context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Award,
  Users,
  Tag,
  Beaker,
  Building2,
  HeartPulse,
  Sprout,
  Brain,
  Zap,
  ExternalLink,
  Code,
  Clock,
  CheckCircle,
  BookOpen,
  Target,
  ThumbsUp,
  Github,
  Link as LinkIcon
} from "lucide-react";

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
      case "Beginner": return "bg-emerald-500 text-white";
      case "Intermediate": return "bg-orange-500 text-white";
      case "Advanced": return "bg-rose-500 text-white";
      default: return "bg-zinc-400 text-white";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case "Environment": return Sprout;
      case "Healthcare": return HeartPulse;
      case "AI/ML": return Brain;
      case "IoT": return Zap;
      case "Biotechnology": return Beaker;
      default: return Code;
    }
  };

  if (loading || !problem) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 bg-white/60 backdrop-blur-md border border-zinc-200 rounded-2xl shadow-xl"
        >
          <p className="text-lg font-serif text-zinc-900">Loading...</p>
        </motion.div>
      </div>
    );
  }

  const CategoryIcon = getCategoryIcon(problem.category);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-white/60 backdrop-blur-md border-b border-zinc-200 px-8 py-4 sticky top-0 z-50">
        <div className="max-width-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-serif font-bold text-zinc-900 cursor-pointer"
            onClick={() => router.push("/dashboard")}
          >
            Yukti-AI
          </motion.div>
          
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/hackathons")}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg transition-all font-sans font-medium text-sm border border-zinc-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Problems
          </motion.button>
        </div>
      </nav>

      <div className="py-16 px-8 max-w-7xl mx-auto">
        {/* Problem Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/60 backdrop-blur-md border border-zinc-200 rounded-2xl p-8 mb-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className={`px-4 py-2 rounded-lg text-sm font-mono font-semibold ${getDifficultyColor(problem.difficulty)}`}>
              {problem.difficulty}
            </span>
            <span className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg text-sm font-mono font-semibold border border-zinc-200">
              <CategoryIcon className="w-4 h-4" />
              {problem.category}
            </span>
          </div>

          <h1 className="text-5xl font-serif font-bold text-zinc-900 mb-6 leading-tight">
            {problem.title}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">Posted by</p>
              <p className="text-xl font-sans font-semibold text-zinc-900">{problem.postedBy}</p>
              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <Building2 className="w-4 h-4" />
                <span className="font-sans">{problem.organization}</span>
              </div>
            </div>
            <div className="text-right space-y-2">
              <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">Total Submissions</p>
              <p className="text-4xl font-serif font-bold text-orange-500">{submissions.length}</p>
            </div>
          </div>

          {problem.prize && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-orange-50 border border-orange-200 rounded-xl mb-6"
            >
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-orange-600" />
                <span className="text-lg font-serif font-bold text-orange-900">
                  Prize Pool: {problem.prize}
                </span>
              </div>
              {problem.deadline && (
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="text-base font-sans font-semibold text-orange-900">
                    Deadline: {problem.deadline}
                  </span>
                </div>
              )}
            </motion.div>
          )}

          <div className="flex flex-wrap gap-2 mb-6">
            {problem.tags.map((tag, idx) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg text-sm font-sans font-medium border border-zinc-200 hover:border-orange-200 transition-colors"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </motion.span>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.open("http://localhost:5000", "_blank")}
            className="flex items-center justify-center gap-3 w-full px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-lg font-sans font-bold shadow-lg hover:shadow-xl transition-all"
          >
            <Code className="w-6 h-6" />
            Solve this Challenge
            <ExternalLink className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/60 backdrop-blur-md border border-zinc-200 rounded-2xl p-8 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-6 h-6 text-orange-500" />
                <h2 className="text-2xl font-serif font-bold text-zinc-900">
                  Problem Description
                </h2>
              </div>
              <p className="text-base font-sans text-zinc-700 leading-relaxed whitespace-pre-line">
                {problem.detailedDescription}
              </p>
            </motion.div>

            {/* Requirements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/60 backdrop-blur-md border border-zinc-200 rounded-2xl p-8 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="w-6 h-6 text-orange-500" />
                <h2 className="text-2xl font-serif font-bold text-zinc-900">
                  Requirements
                </h2>
              </div>
              <ul className="space-y-3">
                {problem.requirements.map((req, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.05 }}
                    className="flex gap-3 text-base font-sans text-zinc-700 leading-relaxed"
                  >
                    <span className="text-orange-500 font-bold mt-1">•</span>
                    <span>{req}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Submissions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/60 backdrop-blur-md border border-zinc-200 rounded-2xl p-8 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-orange-500" />
                <h2 className="text-2xl font-serif font-bold text-zinc-900">
                  Community Submissions
                  <span className="ml-2 text-base font-mono text-zinc-500">({submissions.length})</span>
                </h2>
              </div>
              
              {submissions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg font-sans text-zinc-500">
                    No submissions yet. Be the first to contribute!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission, idx) => (
                    <motion.div
                      key={submission.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + idx * 0.05 }}
                      className="border-2 border-zinc-200 hover:border-orange-200 rounded-xl p-6 transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-serif font-semibold text-zinc-900">
                          {submission.title}
                        </h3>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleVote(submission.id, submission.votes)}
                          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-sans font-semibold text-sm transition-colors"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          {submission.votes}
                        </motion.button>
                      </div>
                      <p className="text-sm font-sans text-zinc-600 mb-4">
                        {submission.description}
                      </p>
                      <div className="flex flex-wrap gap-4 items-center">
                        <span className="text-sm font-sans text-zinc-500">
                          by <strong className="text-zinc-900">{submission.userName}</strong>
                        </span>
                        <a
                          href={submission.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm font-sans font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                        >
                          <Github className="w-4 h-4" />
                          GitHub
                        </a>
                        {submission.demoLink && (
                          <a
                            href={submission.demoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm font-sans font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                          >
                            <LinkIcon className="w-4 h-4" />
                            Demo
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Resources & Criteria */}
          <div className="space-y-6">
            {/* Resources */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/60 backdrop-blur-md border border-zinc-200 rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-5 h-5 text-orange-500" />
                <h3 className="text-xl font-serif font-bold text-zinc-900">
                  Resources
                </h3>
              </div>
              <ul className="space-y-3">
                {problem.resources.map((resource, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.05 }}
                    className="flex gap-3 text-sm font-sans text-zinc-700"
                  >
                    <span className="text-orange-500 font-bold mt-1">•</span>
                    <span>{resource}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Evaluation Criteria */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/60 backdrop-blur-md border border-zinc-200 rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-5 h-5 text-orange-500" />
                <h3 className="text-xl font-serif font-bold text-zinc-900">
                  Evaluation Criteria
                </h3>
              </div>
              <ul className="space-y-3">
                {problem.evaluationCriteria.map((criteria, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.05 }}
                    className="flex gap-3 text-sm font-sans text-zinc-700"
                  >
                    <span className="text-orange-500 font-bold mt-1">•</span>
                    <span>{criteria}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
