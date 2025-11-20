"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { updateRoomStatuses, Room } from "@/lib/voomData";
import { motion } from "framer-motion";
import { 
  Binary, 
  Globe, 
  Brain, 
  Code2, 
  Database, 
  Layout, 
  Network, 
  Cloud,
  Search,
  Filter,
  Clock,
  Users,
  Trophy,
  Target,
  Calendar,
  ArrowLeft
} from "lucide-react";

// Topic icon mapping
const getTopicIcon = (topic: string) => {
  if (topic.includes("Data Structures")) return Binary;
  if (topic.includes("Web Development")) return Globe;
  if (topic.includes("Machine Learning")) return Brain;
  if (topic.includes("Python")) return Code2;
  if (topic.includes("Database")) return Database;
  if (topic.includes("React")) return Layout;
  if (topic.includes("System Design")) return Network;
  if (topic.includes("DevOps")) return Cloud;
  return Target;
};

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
    { value: "active", label: "Active", icon: Clock },
    { value: "upcoming", label: "Upcoming", icon: Calendar },
    { value: "ended", label: "Ended", icon: Trophy }
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
      case "active": return { 
        bgClass: "bg-green-50 border-green-200", 
        textClass: "text-green-700", 
        text: "Live Now",
        icon: Clock
      };
      case "upcoming": return { 
        bgClass: "bg-orange-50 border-orange-200", 
        textClass: "text-orange-700", 
        text: "Coming Soon",
        icon: Calendar
      };
      case "ended": return { 
        bgClass: "bg-zinc-100 border-zinc-200", 
        textClass: "text-zinc-600", 
        text: "Ended",
        icon: Trophy
      };
      default: return { 
        bgClass: "bg-zinc-100 border-zinc-200", 
        textClass: "text-zinc-600", 
        text: "Unknown",
        icon: Target
      };
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

  // Calculate stats
  const activeRoomsCount = rooms.filter(r => r.status === "active").length;
  const totalParticipants = rooms.reduce((sum, r) => sum + r.active_users, 0);
  const totalChallenges = rooms.reduce((sum, r) => sum + r.total_questions, 0);

  if (loading) return (
    <div className="min-h-screen flex justify-center items-center bg-white">
      <motion.div 
        className="p-8 bg-white/60 backdrop-blur-md border border-zinc-200 rounded-2xl shadow-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <p className="text-lg font-sans text-orange-500">Loading...</p>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-white/60 backdrop-blur-md border-b border-zinc-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <motion.div 
          className="text-2xl font-serif font-bold text-zinc-900 cursor-pointer hover:text-orange-500 transition-colors"
          onClick={() => router.push("/dashboard")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Yukti-AI
        </motion.div>
        
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white border border-orange-600 rounded-lg font-sans font-semibold text-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </nav>

      {/* Hero Header */}
      <motion.div 
        className="py-16 px-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Target className="w-12 h-12 text-orange-500" />
          <h1 className="text-5xl font-serif font-bold text-zinc-900">
            Voom Challenge Rooms
          </h1>
        </div>
        <p className="text-xl font-sans text-zinc-600 max-w-3xl mx-auto">
          Join 24-hour challenge rooms, solve questions, and compete on the leaderboard!
        </p>
      </motion.div>

      <div className="max-w-7xl mx-auto px-8 pb-16">
        {/* Stats Section */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white/60 backdrop-blur-md border border-zinc-200 hover:border-orange-200 rounded-2xl p-6 text-center transition-all">
            <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-3xl font-serif font-bold text-zinc-900">{activeRoomsCount}</div>
            <div className="text-sm font-mono text-zinc-600 uppercase tracking-wider">Active Rooms</div>
          </div>
          <div className="bg-white/60 backdrop-blur-md border border-zinc-200 hover:border-orange-200 rounded-2xl p-6 text-center transition-all">
            <Users className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-3xl font-serif font-bold text-zinc-900">{totalParticipants}</div>
            <div className="text-sm font-mono text-zinc-600 uppercase tracking-wider">Participants</div>
          </div>
          <div className="bg-white/60 backdrop-blur-md border border-zinc-200 hover:border-orange-200 rounded-2xl p-6 text-center transition-all">
            <Trophy className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-3xl font-serif font-bold text-zinc-900">{totalChallenges}</div>
            <div className="text-sm font-mono text-zinc-600 uppercase tracking-wider">Total Challenges</div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          className="bg-white/60 backdrop-blur-md border border-zinc-200 rounded-2xl p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search rooms by topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 font-sans text-zinc-900 bg-white border-2 border-zinc-200 focus:border-orange-500 rounded-xl outline-none transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="mb-6">
            <label className="flex items-center gap-2 font-mono text-sm font-semibold text-zinc-700 uppercase tracking-wider mb-3">
              <Filter className="w-4 h-4" />
              Status
            </label>
            <div className="flex gap-2 flex-wrap">
              {statuses.map(status => {
                const StatusIcon = status.icon;
                return (
                  <button
                    key={status.value}
                    onClick={() => setSelectedStatus(status.value)}
                    className={`flex items-center gap-2 px-4 py-2 border-2 rounded-lg font-sans font-medium text-sm transition-all ${
                      selectedStatus === status.value
                        ? "border-orange-500 bg-orange-500 text-white"
                        : "border-zinc-200 bg-white text-zinc-700 hover:border-orange-200"
                    }`}
                  >
                    <StatusIcon className="w-4 h-4" />
                    {status.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="flex items-center gap-2 font-mono text-sm font-semibold text-zinc-700 uppercase tracking-wider mb-3">
              <Target className="w-4 h-4" />
              Difficulty
            </label>
            <div className="flex gap-2">
              {difficulties.map(difficulty => (
                <button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={`px-4 py-2 border-2 rounded-lg font-sans font-medium text-sm transition-all ${
                    selectedDifficulty === difficulty
                      ? "border-orange-500 bg-orange-500 text-white"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-orange-200"
                  }`}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="text-center mb-6">
          <p className="text-lg font-sans font-semibold text-zinc-900">
            {filteredRooms.length} Room{filteredRooms.length !== 1 ? 's' : ''} Available
          </p>
        </div>

        {/* Rooms Grid */}
        {loadingRooms ? (
          <div className="text-center py-12">
            <p className="text-lg font-sans text-zinc-600">Loading rooms...</p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {filteredRooms.map((room, index) => {
              const statusBadge = getStatusBadge(room.status);
              const StatusIcon = statusBadge.icon;
              const TopicIcon = getTopicIcon(room.topic);
              const isClickable = room.status === "active";

              return (
                <motion.div
                  key={room.id}
                  className={`bg-white/60 backdrop-blur-md border border-zinc-200 rounded-2xl p-6 transition-all flex flex-col ${
                    isClickable ? "cursor-pointer hover:border-orange-200 hover:-translate-y-2 hover:shadow-xl" : "opacity-70"
                  } ${room.status === "ended" ? "opacity-60" : ""}`}
                  onClick={() => isClickable && router.push(`/voom/${room.id}`)}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={isClickable ? { scale: 1.02 } : {}}
                  whileTap={isClickable ? { scale: 0.98 } : {}}
                >
                  {/* Status Badge */}
                  <div className={`inline-flex items-center gap-2 self-start px-3 py-1.5 ${statusBadge.bgClass} border ${statusBadge.textClass} rounded-lg text-xs font-mono font-semibold uppercase tracking-wider mb-4`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusBadge.text}
                  </div>

                  {/* Room Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl shadow-lg">
                      <TopicIcon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-serif font-bold text-zinc-900 mb-1">
                        {room.topic}
                      </h3>
                      <span className={`inline-block px-3 py-1 rounded-lg text-xs font-mono font-semibold text-white ${
                        room.difficulty === "Easy" ? "bg-green-500" :
                        room.difficulty === "Medium" ? "bg-orange-500" :
                        "bg-red-500"
                      }`}>
                        {room.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm font-sans text-zinc-600 leading-relaxed mb-4 flex-grow">
                    {room.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-zinc-50 border border-zinc-100 rounded-xl">
                    <div className="text-center">
                      <div className="text-2xl font-serif font-bold text-orange-500">
                        {room.total_questions}
                      </div>
                      <div className="text-xs font-mono text-zinc-600 uppercase tracking-wider">Questions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-serif font-bold text-orange-500">
                        {room.active_users}
                      </div>
                      <div className="text-xs font-mono text-zinc-600 uppercase tracking-wider">Competitors</div>
                    </div>
                  </div>

                  {/* Time Info */}
                  {room.status === "active" && (
                    <div className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl mb-4">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-sans font-semibold text-orange-700">
                        {getTimeRemaining(room.ends_at)}
                      </span>
                    </div>
                  )}

                  {room.status === "upcoming" && (
                    <div className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl mb-4">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-sans font-semibold text-blue-700">
                        Starts: {new Date(room.starts_at).toLocaleDateString()} {new Date(room.starts_at).toLocaleTimeString()}
                      </span>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    disabled={room.status !== "active"}
                    className={`w-full py-3 rounded-xl font-sans font-semibold text-sm transition-all ${
                      room.status === "active"
                        ? "bg-orange-500 hover:bg-orange-600 text-white border border-orange-600"
                        : "bg-zinc-300 text-zinc-500 cursor-not-allowed"
                    }`}
                  >
                    {room.status === "active" ? "Enter Room" : 
                     room.status === "upcoming" ? "Not Started" : "Ended"}
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {filteredRooms.length === 0 && !loadingRooms && (
          <motion.div 
            className="bg-white/60 backdrop-blur-md border border-zinc-200 rounded-2xl p-12 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Search className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
            <h3 className="text-2xl font-serif font-bold text-zinc-900 mb-2">
              No Rooms Found
            </h3>
            <p className="text-base font-sans text-zinc-600">
              Try adjusting your filters or check back later for new rooms!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
