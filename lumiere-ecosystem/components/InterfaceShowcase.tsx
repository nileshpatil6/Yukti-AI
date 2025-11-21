import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const InterfaceShowcase = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <section ref={containerRef} className="py-32 bg-white dark:bg-zinc-950 perspective-1000 overflow-hidden transition-colors duration-500">
       <div className="container mx-auto px-6 text-center mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="font-mono text-orange-500 text-xs tracking-[0.3em] uppercase"
          >
             The Environment
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif text-zinc-900 dark:text-white mt-4 mb-6"
          >
             Professional Grade Tools. <br />
             <span className="text-zinc-400 dark:text-zinc-600">Zero Configuration.</span>
          </motion.h2>
       </div>

       <motion.div 
          style={{ rotateX, scale, opacity }}
          className="container mx-auto px-2 md:px-6"
       >
          <div className="relative w-full aspect-video bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-orange-500/10 dark:shadow-orange-500/5 overflow-hidden group">
             {/* Browser Chrome */}
             <div className="absolute top-0 left-0 right-0 h-12 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4 justify-between z-20">
                <div className="flex gap-2">
                   <div className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                   <div className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                   <div className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                </div>
                <div className="h-6 w-96 bg-zinc-100 dark:bg-zinc-900 rounded-md mx-auto flex items-center justify-center text-[10px] text-zinc-400 font-mono">
                   Yukti-AI.lab / project_alpha
                </div>
                <div className="w-20" />
             </div>

             {/* Main Interface Content - Abstracted */}
             <div className="absolute top-12 inset-0 bg-zinc-50 dark:bg-zinc-900/50 flex">
                {/* Sidebar */}
                <div className="w-16 border-r border-zinc-200 dark:border-zinc-800 flex flex-col items-center py-6 gap-6 bg-white dark:bg-zinc-950">
                   {[1,2,3,4,5].map((i) => (
                      <div key={i} className="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-orange-500 dark:hover:bg-orange-500 hover:text-white transition-colors duration-300" />
                   ))}
                </div>
                
                {/* Editor Area */}
                <div className="flex-1 p-8 relative">
                   <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                   
                   {/* Floating Nodes */}
                   <motion.div 
                      drag
                      dragConstraints={{ left: 0, right: 300, top: 0, bottom: 200 }}
                      className="absolute top-20 left-20 w-64 h-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur border border-orange-200 dark:border-orange-800 rounded-lg p-4 shadow-xl cursor-grab active:cursor-grabbing"
                   >
                      <div className="flex justify-between items-center mb-4">
                         <div className="text-xs font-mono text-orange-500">Logic Node</div>
                         <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      </div>
                      <div className="space-y-2">
                         <div className="h-2 w-3/4 bg-zinc-200 dark:bg-zinc-700 rounded" />
                         <div className="h-2 w-1/2 bg-zinc-200 dark:bg-zinc-700 rounded" />
                      </div>
                   </motion.div>

                   <motion.div 
                      drag
                      dragConstraints={{ left: 0, right: 300, top: 0, bottom: 200 }}
                      className="absolute bottom-32 right-32 w-56 h-56 bg-white/90 dark:bg-zinc-900/90 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 shadow-xl cursor-grab active:cursor-grabbing"
                   >
                       <div className="text-xs font-mono text-zinc-400 mb-4">Output View</div>
                       <div className="w-full h-32 border border-zinc-100 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-black flex items-center justify-center">
                          <div className="text-zinc-400 dark:text-zinc-600 text-xs">No Signal</div>
                       </div>
                   </motion.div>
                </div>

                {/* Properties Panel */}
                <div className="w-72 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 hidden lg:block">
                   <div className="font-mono text-xs text-zinc-400 mb-6 uppercase">Properties</div>
                   <div className="space-y-6">
                      {[1,2,3,4].map((i) => (
                         <div key={i}>
                            <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-800 rounded mb-2" />
                            <div className="h-8 w-full bg-zinc-50 dark:bg-zinc-900 rounded border border-zinc-100 dark:border-zinc-800" />
                         </div>
                      ))}
                   </div>
                </div>
             </div>

             {/* Overlay Glow */}
             <div className="absolute inset-0 bg-gradient-to-t from-orange-500/5 to-transparent pointer-events-none" />
          </div>
       </motion.div>
    </section>
  );
};