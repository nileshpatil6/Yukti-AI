import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const Philosophy = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="py-40 bg-white dark:bg-zinc-950 relative z-10 transition-colors duration-500">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div style={{ opacity, y }} className="space-y-16">
            <p className="font-serif text-4xl md:text-6xl text-zinc-900 dark:text-white leading-[1.2]">
              In a world obsessed with <span className="text-zinc-400 dark:text-zinc-600">standardized testing</span>, we built a sanctuary for the <span className="italic text-orange-500">obsessively curious</span>.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div>
                  <h3 className="font-mono text-xs text-orange-500 tracking-widest uppercase mb-6">The Problem</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed font-light">
                     Traditional education treats learning like an assembly line. You memorize, you test, you forget. It's efficient for the system, but catastrophic for the creative mind. We believe the most powerful engine for learning isn't fear of failure—it's the joy of building.
                  </p>
               </div>
               <div>
                  <h3 className="font-mono text-xs text-orange-500 tracking-widest uppercase mb-6">The Solution</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed font-light">
                     Yukti-AI is a sandbox with physics. A code editor that speaks back. A chemistry set that won't blow up your house (unless you want it to). It's a high-fidelity simulation of the real world, designed to let you fail faster, learn deeper, and build things that matter.
                  </p>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};