"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Search, Filter, Award, Calendar, Users, ArrowLeft, Beaker, Sprout, HeartPulse, Building2, Brain, Zap } from "lucide-react";

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

  const categoryIcons: Record<string, any> = {
    Environment: Beaker,
    Healthcare: HeartPulse,
    "Smart Cities": Building2,
    Agriculture: Sprout,
    Education: Brain,
    Energy: Zap
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
        <p className="mt-4 font-mono text-sm text-zinc-500">LOADING CHALLENGES</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-white/60 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="font-serif text-2xl font-bold text-zinc-900 hover:text-orange-500 transition-colors"
          >
            Yukti-AI
          </button>
          
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 hover:border-orange-200 rounded-lg text-sm font-mono text-zinc-700 hover:text-orange-500 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            DASHBOARD
          </button>
        </div>
      </nav>

      {/* Header */}
      <div className="py-16 px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Award className="w-12 h-12 text-orange-500" />
            <h1 className="font-serif text-5xl font-bold text-zinc-900">
              Global Research Hackathons
            </h1>
          </div>
          <p className="font-sans text-xl text-zinc-600 max-w-3xl mx-auto">
            Solve real-world problems posted by scientists and researchers. Make your contribution count!
          </p>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/60 backdrop-blur-md border border-zinc-200 rounded-2xl p-6 mb-6 shadow-sm"
        >
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search problems, tags, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 hover:border-orange-200 focus:border-orange-500 focus:outline-none rounded-lg font-sans text-zinc-900 placeholder:text-zinc-400"
            />
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <label className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-zinc-700 mb-3">
              <Filter className="w-4 h-4" />
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-sans text-sm transition-all ${
                    selectedCategory === category
                      ? "bg-orange-500 text-white border-2 border-orange-500"
                      : "bg-white text-zinc-700 border-2 border-zinc-200 hover:border-orange-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-zinc-700 mb-3">
              <Zap className="w-4 h-4" />
              Difficulty
            </label>
            <div className="flex gap-2">
              {difficulties.map(difficulty => (
                <button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={`px-4 py-2 rounded-lg font-sans text-sm transition-all ${
                    selectedDifficulty === difficulty
                      ? "bg-orange-500 text-white border-2 border-orange-500"
                      : "bg-white text-zinc-700 border-2 border-zinc-200 hover:border-orange-200"
                  }`}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="font-mono text-sm text-zinc-600">
            {filteredProblems.length} Problem{filteredProblems.length !== 1 ? 's' : ''} Available
          </div>
        </div>

        {/* Problems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProblems.map((problem, index) => {
            const CategoryIcon = categoryIcons[problem.category] || Brain;
            return (
            <motion.div
              key={problem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              onClick={() => router.push(`/hackathons/${problem.id}`)}
              className="bg-white/60 backdrop-blur-md border border-zinc-200 hover:border-orange-200 rounded-2xl p-6 cursor-pointer flex flex-col group shadow-sm hover:shadow-md transition-all"
            >
              {/* Header */}
              <div className="mb-4">
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-3 py-1 rounded-md font-mono text-xs font-semibold ${
                    problem.difficulty === "Beginner" ? "bg-green-100 text-green-700" :
                    problem.difficulty === "Intermediate" ? "bg-orange-100 text-orange-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {problem.difficulty.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 rounded-md">
                    <CategoryIcon className="w-3.5 h-3.5 text-zinc-600" />
                    <span className="font-mono text-xs text-zinc-600">
                      {problem.category}
                    </span>
                  </div>
                </div>
                <h3 className="font-serif text-xl font-bold text-zinc-900 mb-2 leading-tight group-hover:text-orange-500 transition-colors">
                  {problem.title}
                </h3>
                <p className="font-sans text-sm text-zinc-600 leading-relaxed">
                  {problem.description}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {problem.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-orange-50 text-orange-600 rounded font-mono text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-auto pt-4 border-t border-zinc-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-mono text-xs text-zinc-400 uppercase tracking-wider mb-1">Posted by</div>
                    <div className="font-sans text-sm font-semibold text-zinc-900">{problem.postedBy}</div>
                    <div className="font-sans text-xs text-zinc-600">{problem.organization}</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end mb-1">
                      <Users className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-mono text-xs text-zinc-400 uppercase tracking-wider">Submissions</span>
                    </div>
                    <div className="font-serif text-xl font-bold text-orange-500">{problem.submissions}</div>
                  </div>
                </div>

                {problem.prize && (
                  <div className="flex justify-between items-center p-3 bg-orange-50 border border-orange-200 rounded-lg mb-3">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-orange-600" />
                      <span className="font-mono text-sm font-semibold text-orange-700">
                        {problem.prize}
                      </span>
                    </div>
                    {problem.deadline && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-orange-600" />
                        <span className="font-mono text-xs text-orange-700">
                          {problem.deadline}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <button className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-sans text-sm font-semibold transition-colors">
                  View Details & Contribute →
                </button>
              </div>
            </motion.div>
          );})}
        </div>

        {filteredProblems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/60 backdrop-blur-md border border-zinc-200 rounded-2xl p-12 text-center"
          >
            <Search className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
            <h3 className="font-serif text-2xl font-bold text-zinc-900 mb-2">
              No Problems Found
            </h3>
            <p className="font-sans text-base text-zinc-600">
              Try adjusting your filters or search query
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
