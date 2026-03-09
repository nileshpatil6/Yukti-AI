import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from './Button';
import { Play, ChevronDown } from 'lucide-react';

export const Hero = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const handleStartBuilding = () => {
    window.location.href = "https://main.d1hvp1lq9dt37i.amplifyapp.com/";
  };

  const handleOpenPlatform = () => {
    window.location.href = "https://main.d12g8b8lvrkq9l.amplifyapp.com/dashboard";
  };

  return (
    <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-white dark:bg-zinc-950 transition-colors duration-500">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-50/50 via-white to-white dark:from-orange-900/20 dark:via-zinc-950 dark:to-zinc-950 pointer-events-none" />
      <motion.div
        style={{ opacity }}
        className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-orange-200/20 dark:bg-orange-500/10 rounded-full blur-[120px] pointer-events-none"
      />

      {/* Noise Texture */}
      <div className="absolute inset-0 bg-noise opacity-[0.02] dark:opacity-[0.05] pointer-events-none mix-blend-multiply dark:mix-blend-overlay" />

      <div className="container mx-auto px-6 relative z-10 h-full flex flex-col justify-center">
        <motion.div
          style={{ y }}
          className="flex flex-col items-center text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8 flex items-center gap-3 px-4 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-default shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 dark:text-zinc-400 uppercase">System v2.0 Live</span>
          </motion.div>

          <h1 className="font-serif text-7xl md:text-9xl lg:text-[11rem] leading-[0.85] tracking-tighter text-zinc-900 dark:text-white mb-10 transition-colors duration-500">
            <motion.span
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="block"
            >
              The Future
            </motion.span>
            <motion.span
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="block text-zinc-400 dark:text-zinc-600 italic font-light px-4"
            >
              of Learning
            </motion.span>
            <motion.span
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="block text-orange-500 relative"
            >
              is Play.
              <svg className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[120%] h-6 text-orange-500/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto mb-12 font-light leading-relaxed transition-colors duration-500"
          >
            A high-fidelity ecosystem for engineering, coding, and design. <br className="hidden md:block" />
            Where curiosity isn't graded, but rewarded.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center gap-6"
          >
            <Button
              variant="primary"
              icon
              className="h-14 px-8 text-base min-w-[220px]"
              onClick={handleStartBuilding}
            >
              Experiment Lab
            </Button>
            <Button
              variant="secondary"
              className="h-14 px-8 text-base min-w-[220px]"
              onClick={handleOpenPlatform}
            >
              Learning Platform
            </Button>
            <button className="group flex items-center gap-4 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors px-6 py-4 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 border border-zinc-300 dark:border-zinc-700 rounded-full group-hover:scale-110 transition-transform duration-500" />
                <Play className="w-3 h-3 fill-current relative z-10" />
              </div>
              <span className="font-mono text-xs tracking-widest uppercase">Watch Film</span>
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-400 dark:text-zinc-600"
      >
        <span className="text-[10px] font-mono uppercase tracking-widest">Scroll to explore</span>
        <ChevronDown className="w-4 h-4 animate-bounce" />
      </motion.div>
    </section>
  );
};
