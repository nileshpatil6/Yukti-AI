import React, { useState, useEffect } from 'react';
import { cn } from '../utils/cn';
import { Button } from './Button';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Check local storage or system preference
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <>
      <nav 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled ? "py-4" : "py-8"
        )}
      >
        <div className="container mx-auto px-6 md:px-12">
          <div className={cn(
            "flex items-center justify-between rounded-full px-8 transition-all duration-500 backdrop-blur-md",
            scrolled ? "bg-white/70 dark:bg-black/70 border border-zinc-200/50 dark:border-zinc-800/50 py-3 shadow-xl shadow-black/5" : "bg-transparent py-2"
          )}>
            {/* Logo */}
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-serif font-bold text-lg leading-none pb-1 shadow-lg shadow-orange-500/20">
                L
              </div>
              <span className="font-serif font-medium text-xl tracking-tight text-zinc-900 dark:text-white group-hover:text-orange-500 transition-colors">Yukti-AI.</span>
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-1">
              {['Curriculum', 'Labs', 'Research', 'Manifesto'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase()}`}
                  className="px-5 py-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors font-medium rounded-full hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50"
                >
                  {item}
                </a>
              ))}
            </div>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <a href="https://play-yukti.vercel.app" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-orange-500 dark:hover:text-orange-500 transition-colors">
                Student Login
              </a>
              
            </div>

            {/* Mobile Toggle */}
            <div className="flex items-center gap-4 md:hidden">
               <button
                onClick={toggleTheme}
                className="p-2 text-zinc-500 dark:text-zinc-400"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button 
                className="text-zinc-900 dark:text-white p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-xl flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-12">
              <span className="font-serif font-bold text-2xl text-zinc-900 dark:text-white">Yukti-AI.</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                <X className="w-8 h-8" />
              </button>
            </div>
            <div className="flex flex-col gap-6">
              {['Curriculum', 'Labs', 'Research', 'Manifesto'].map((item, i) => (
                <motion.a 
                  key={item}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-4xl font-serif text-zinc-900 dark:text-white hover:text-orange-500 transition-colors"
                >
                  {item}
                </motion.a>
              ))}
            </div>
            <div className="mt-auto">
              <Button variant="primary" className="w-full py-6 text-lg">Start Building</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};