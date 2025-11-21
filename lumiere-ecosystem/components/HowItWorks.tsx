import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const steps = [
  {
    num: "01",
    title: "Initialize",
    desc: "Create your profile. Set your technical goals. Calibrate the difficulty.",
    details: "Choose from 4 distinct tracks: Electrical, Software, Mechanical, or Chemical."
  },
  {
    num: "02",
    title: "Experiment",
    desc: "Enter the open playground. No rules. Just raw components and physics.",
    details: "Access a library of 500+ simulated components with realistic physics properties."
  },
  {
    num: "03",
    title: "Challenge",
    desc: "Take on guided puzzles. The system learns from your mistakes.",
    details: "Receive AI-generated hints that nudge you without giving away the answer."
  },
  {
    num: "04",
    title: "Compete",
    desc: "Join the global arena. Solve the daily brief before time runs out.",
    details: "Earn rank, unlock special components, and get scouted by real companies."
  },
];

export const HowItWorks = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  return (
    <section ref={containerRef} className="py-32 bg-white dark:bg-zinc-950 relative overflow-hidden transition-colors duration-500">
      <div className="container mx-auto px-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-32">
          <div>
            <h2 className="text-5xl md:text-7xl font-serif text-zinc-900 dark:text-white mb-6">The Protocol</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-md font-light">Your journey from novice to master engineer follows a proven sequence designed for retention.</p>
          </div>
        </div>

        <div className="relative">
           {/* Animated connecting line */}
           <div className="absolute left-[19px] top-0 bottom-0 w-[2px] bg-zinc-100 dark:bg-zinc-800 hidden md:block">
              <motion.div 
                style={{ scaleY: scrollYProgress }}
                className="absolute top-0 left-0 w-full h-full bg-orange-500 origin-top"
              />
           </div>

           <div className="space-y-32">
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative pl-4 md:pl-24 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
              >
                {/* Node */}
                <div className="absolute left-[11px] top-8 w-[18px] h-[18px] bg-white dark:bg-zinc-900 border-2 border-orange-500 rounded-full z-10 hidden md:block">
                  <div className="absolute inset-1 bg-orange-500 rounded-full animate-pulse" />
                </div>
                
                <div>
                   <div className="font-mono text-orange-500 text-xs mb-2 tracking-widest uppercase">STEP {step.num}</div>
                   <h3 className="text-4xl md:text-5xl font-serif text-zinc-900 dark:text-white mb-6">{step.title}</h3>
                   <p className="text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed font-light border-l border-orange-200 dark:border-orange-900 pl-6">
                     {step.desc}
                   </p>
                </div>

                <div className="hidden md:block">
                   <div className="p-8 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-500 group">
                      <p className="text-zinc-400 dark:text-zinc-500 font-mono text-sm group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                         {`// SYSTEM_NOTE: ${step.details}`}
                      </p>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};