"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      checkUserProfile();
    }
  }, [user]);

  async function checkUserProfile() {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.uid)
      .single();

    if (error || !data) {
      setShowModal(true);
    } else {
      setUserProfile(data);
    }
  }

  async function saveProfile() {
    if (!user || !name || !age) return;

    setSaving(true);
    const { error } = await supabase.from("profiles").insert([
      {
        id: user.uid,
        name: name,
        age: parseInt(age),
        email: user.email,
      },
    ]);

    if (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    } else {
      setShowModal(false);
      checkUserProfile();
    }
    setSaving(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center transition-colors duration-500">
      <div className="bg-zinc-50/80 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-xl p-8">
        <p className="font-sans text-zinc-950 dark:text-white">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-500">
      {/* Navigation Bar */}
      <nav className="bg-zinc-50/80 dark:bg-zinc-900/50 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-8 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="font-serif text-3xl text-zinc-950 dark:text-white">
            Quadbits
          </h1>
          
          <div className="flex items-center gap-6">
            <div className="px-5 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg">
              <span className="font-sans text-sm text-zinc-600 dark:text-zinc-400">
                {userProfile?.name || user?.email}
              </span>
            </div>
            <motion.button 
              onClick={logout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2 bg-red-500 text-white font-sans text-sm font-medium rounded-lg hover:bg-red-600 transition-colors duration-500"
            >
              Logout
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Profile Section */}
        {userProfile && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-50/80 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 mb-12"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <p className="font-mono text-xs text-zinc-500 dark:text-zinc-600 mb-2">NAME</p>
                <p className="font-sans text-lg font-medium text-zinc-950 dark:text-white">{userProfile.name}</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-xs text-zinc-500 dark:text-zinc-600 mb-2">AGE</p>
                <p className="font-sans text-lg font-medium text-zinc-950 dark:text-white">{userProfile.age}</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-xs text-zinc-500 dark:text-zinc-600 mb-2">EMAIL</p>
                <p className="font-sans text-lg font-medium text-zinc-950 dark:text-white truncate">{userProfile.email}</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-xs text-zinc-500 dark:text-zinc-600 mb-2">PROVIDER</p>
                <p className="font-sans text-lg font-medium text-zinc-950 dark:text-white">{user?.providerData[0]?.providerId}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              title: "Playground",
              description: "Build visual experiments with drag-and-drop components. Get real-time AI feedback.",
              action: () => window.open("http://localhost:5000", "_blank"),
              buttonText: "Start Building"
            },
            {
              title: "Challenges",
              description: "Topic-based learning challenges. AI guides you without giving away answers.",
              action: () => router.push("/challenges"),
              buttonText: "View Challenges"
            },
            {
              title: "Hackathons",
              description: "Join collaborative coding events. Build projects and compete for prizes.",
              action: () => router.push("/hackathons"),
              buttonText: "Browse Events"
            },
            {
              title: "Voom Rooms",
              description: "24-hour challenge rooms on different topics. Compete and climb leaderboards.",
              action: () => router.push("/voom"),
              buttonText: "Enter Rooms"
            }
          ].map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.1, duration: 0.6 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              onClick={card.action}
              className="group bg-zinc-50/80 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 hover:border-accent/30 transition-all duration-500 cursor-pointer hover:shadow-xl"
            >
              <h3 className="font-serif text-2xl text-zinc-950 dark:text-white mb-4">
                {card.title}
              </h3>
              <p className="font-sans text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">
                {card.description}
              </p>
              <button className="w-full px-6 py-3 bg-transparent text-accent border border-accent/30 rounded-lg font-sans font-medium group-hover:bg-accent group-hover:text-white transition-all duration-500">
                {card.buttonText}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-10 max-w-md w-[90%] shadow-2xl"
          >
            <h2 className="font-serif text-3xl text-zinc-950 dark:text-white mb-3">
              Complete Profile
            </h2>
            <p className="font-sans text-zinc-600 dark:text-zinc-400 mb-8">
              Please provide your information to continue
            </p>
            
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-4 mb-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-sans text-zinc-950 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-accent/50 focus:outline-none transition-all duration-500"
            />
            
            <input
              type="number"
              placeholder="Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-5 py-4 mb-8 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-sans text-zinc-950 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-accent/50 focus:outline-none transition-all duration-500"
            />
            
            <motion.button
              onClick={saveProfile}
              disabled={!name || !age || saving}
              whileHover={name && age ? { scale: 1.02 } : {}}
              whileTap={name && age ? { scale: 0.98 } : {}}
              className={`w-full px-6 py-4 font-sans font-medium rounded-lg transition-all duration-500 ${
                name && age 
                  ? 'bg-accent text-white hover:bg-accent/90 shadow-lg hover:shadow-xl border border-accent/20 cursor-pointer' 
                  : 'bg-zinc-300 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-600 cursor-not-allowed'
              }`}
            >
              {saving ? "Saving..." : "Save Profile"}
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
