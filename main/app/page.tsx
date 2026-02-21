'use client';

import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-8 py-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h1 className="font-serif text-7xl md:text-8xl font-normal text-zinc-900 mb-8 tracking-tight">
            Yukti-AI
          </h1>
          <p className="font-sans text-xl md:text-2xl text-zinc-600 max-w-3xl mx-auto leading-relaxed mb-16">
            Academic excellence meets interactive learning. Build experiments, solve challenges, and master concepts through visual programming.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/signup">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-12 py-4 bg-orange-500 text-white font-sans font-medium text-lg rounded-lg hover:bg-orange-600 transition-all duration-300 shadow-lg"
              >
                Create Account
              </motion.button>
            </Link>
            <Link href="/login">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-12 py-4 bg-white text-zinc-900 font-sans font-medium text-lg rounded-lg border border-zinc-200 hover:border-orange-200 transition-all duration-300"
              >
                Sign In
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="grid md:grid-cols-3 gap-12 mt-32"
        >
          {[
            {
              title: "Visual Experiments",
              description: "Build complex experiments using drag-and-drop components. See concepts come alive through interactive visualizations."
            },
            {
              title: "Guided Learning",
              description: "Topic-based challenges test your understanding. AI-powered hints guide you without giving away solutions."
            },
            {
              title: "Real-Time Analysis",
              description: "Instant feedback on your work. AI analyzes experiments and provides detailed explanations for every step."
            }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + idx * 0.1, duration: 0.6 }}
              className="group"
            >
              <div className="bg-white/60 backdrop-blur-md border border-zinc-200 rounded-xl p-8 h-full hover:border-orange-200 transition-all duration-300 hover:shadow-lg">
                <h3 className="font-serif text-2xl text-zinc-900 mb-4">
                  {feature.title}
                </h3>
                <p className="font-sans text-zinc-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-200 mt-32">
        <div className="max-w-7xl mx-auto px-8 py-12 text-center">
          <p className="font-mono text-sm text-zinc-500">
            Academic Futurism Design System
          </p>
        </div>
      </div>
    </main>
  );
}
