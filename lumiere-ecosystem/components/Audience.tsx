import React from 'react';
import { cn } from '../utils/cn';
import { motion } from 'framer-motion';

const bubbles = [
  { text: "Students", color: "text-orange-600 border-orange-200 bg-orange-50 dark:text-orange-400 dark:border-orange-800 dark:bg-orange-900/20" },
  { text: "Hobbyists", color: "text-pink-600 border-pink-200 bg-pink-50 dark:text-pink-400 dark:border-pink-800 dark:bg-pink-900/20" },
  { text: "Engineers", color: "text-blue-600 border-blue-200 bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:bg-blue-900/20" },
  { text: "Creators", color: "text-teal-600 border-teal-200 bg-teal-50 dark:text-teal-400 dark:border-teal-800 dark:bg-teal-900/20" },
  { text: "Makers", color: "text-amber-600 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:bg-amber-900/20" },
  { text: "Explorers", color: "text-purple-600 border-purple-200 bg-purple-50 dark:text-purple-400 dark:border-purple-800 dark:bg-purple-900/20" },
];

export const Audience = () => {
  return (
    <section className="py-40 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white border-t border-zinc-200 dark:border-zinc-800 relative overflow-hidden transition-colors duration-500">
       {/* Background Elements */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-zinc-200/50 dark:bg-zinc-800/50 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-orange-200/30 dark:bg-orange-900/10 rounded-full blur-[100px]" />
       </div>

       <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
             <motion.h2 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ margin: "-100px" }}
               className="text-5xl md:text-7xl font-serif font-medium mb-16 leading-[1.2]"
             >
                Built for 
                {bubbles.map((b, i) => (
                   <motion.span 
                     key={i} 
                     whileHover={{ scale: 1.05, rotate: Math.random() * 4 - 2 }}
                     className={cn(
                       "inline-block mx-3 mb-4 px-6 py-2 rounded-full border text-3xl md:text-4xl align-middle font-sans transition-colors duration-300 cursor-default shadow-sm", 
                       b.color,
                       "hover:shadow-md"
                     )}
                   >
                      {b.text}
                   </motion.span>
                ))}
                <br />
                <span className="text-zinc-400 dark:text-zinc-600">in one creative playground.</span>
             </motion.h2>
             
             <motion.p 
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               transition={{ delay: 0.2 }}
               className="text-2xl text-zinc-500 dark:text-zinc-400 font-light leading-relaxed max-w-3xl mx-auto"
             >
                Whether you're breaking into tech, refining your engineering craft, or simply love to tinker, Yukti-AI adapts to your pace.
             </motion.p>
          </div>
       </div>
    </section>
  );
};