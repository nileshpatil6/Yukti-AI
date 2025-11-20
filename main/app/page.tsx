'use client';

import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-500">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-8 py-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h1 className="font-serif text-7xl md:text-8xl font-normal text-zinc-950 dark:text-white mb-8 tracking-tight">
            Quadbits
          </h1>
          <p className="font-sans text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto leading-relaxed mb-16">
            Academic excellence meets interactive learning. Build experiments, solve challenges, and master concepts through visual programming.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/signup">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-12 py-4 bg-accent text-white font-sans font-medium text-lg rounded-lg hover:bg-accent/90 transition-all duration-500 shadow-lg hover:shadow-xl border border-accent/20"
              >
                Create Account
              </motion.button>
            </Link>
            <Link href="/login">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-12 py-4 bg-transparent text-zinc-950 dark:text-white font-sans font-medium text-lg rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-accent/50 transition-all duration-500"
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
              <div className="bg-zinc-50/80 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 h-full hover:border-accent/30 transition-all duration-500 hover:shadow-lg">
                <h3 className="font-serif text-2xl text-zinc-950 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="font-sans text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 mt-32">
        <div className="max-w-7xl mx-auto px-8 py-12 text-center">
          <p className="font-mono text-sm text-zinc-500 dark:text-zinc-600">
            Academic Futurism Design System
          </p>
        </div>
      </div>
    </main>
  );
}
