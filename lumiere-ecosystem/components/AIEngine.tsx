import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Cpu, Activity, Sparkles } from 'lucide-react';
import { cn } from '../utils/cn';

const codeSnippet = [
  "function calculateTrajectory(velocity, angle) {",
  "  const g = 9.81; // Gravity",
  "  const rad = angle * (Math.PI / 180);",
  "  return (velocity * velocity * Math.sin(2 * rad)) / g;",
  "}"
];

export const AIEngine = () => {
  const [typedCode, setTypedCode] = useState<string[]>([]);

  useEffect(() => {
    let lineIndex = 0;
    let charIndex = 0;
    let currentText: string[] = ["", "", "", "", ""];
    
    const typeInterval = setInterval(() => {
      if (lineIndex >= codeSnippet.length) {
         clearInterval(typeInterval);
         return;
      }
      
      const line = codeSnippet[lineIndex];
      currentText[lineIndex] = line.substring(0, charIndex + 1);
      setTypedCode([...currentText]);
      
      charIndex++;
      
      if (charIndex >= line.length) {
         lineIndex++;
         charIndex = 0;
      }
    }, 30);

    return () => clearInterval(typeInterval);
  }, []);

  return (
    <section className="py-32 bg-white dark:bg-zinc-950 border-y border-zinc-100 dark:border-zinc-900 relative overflow-hidden transition-colors duration-500">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      
      <div className="container mx-auto px-6 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
             <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               whileInView={{ opacity: 1, scale: 1 }}
               className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 mb-8"
             >
                <Sparkles className="w-3 h-3 text-orange-500" />
                <span className="text-xs font-mono text-orange-600 dark:text-orange-400 uppercase tracking-wider">Yukti-AI AI Core</span>
             </motion.div>
             
             <h2 className="text-5xl md:text-7xl font-serif text-zinc-900 dark:text-white mb-8 leading-[1.1]">
                A mentor that <br />
                <span className="text-zinc-400 dark:text-zinc-600">speaks code.</span>
             </h2>
             
             <p className="text-xl text-zinc-500 dark:text-zinc-400 font-light leading-relaxed mb-12">
                Yukti-AI isn't just a chatbot. It understands your canvas context, predicts simulation outcomes, and offers repair suggestions in real-time. It's like pair programming with a genius.
             </p>

             <div className="grid grid-cols-1 gap-4">
                {[
                   { icon: Terminal, title: "Contextual Code Analysis", text: "Real-time syntax and logic checking specific to your project state." },
                   { icon: Activity, title: "Predictive Physics", text: "Visualize voltage drops and mechanical stress loads before they happen." },
                   { icon: Cpu, title: "Component Understanding", text: "Deep knowledge of 500+ virtual components and their interactions." }
                ].map((item, i) => (
                   <motion.div 
                     key={i} 
                     initial={{ x: -20, opacity: 0 }}
                     whileInView={{ x: 0, opacity: 1 }}
                     transition={{ delay: i * 0.1 }}
                     className="flex gap-6 items-start p-6 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-orange-200 dark:hover:border-orange-800 transition-colors group"
                   >
                      <div className="mt-1 p-3 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 group-hover:text-orange-500 transition-colors shadow-sm">
                         <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                         <h4 className="text-zinc-900 dark:text-zinc-100 font-bold mb-2 font-serif text-lg">{item.title}</h4>
                         <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">{item.text}</p>
                      </div>
                   </motion.div>
                ))}
             </div>
          </div>

          {/* Visual Representation */}
          <div className="relative">
             <div className="absolute -inset-10 bg-orange-200 dark:bg-orange-900/20 blur-[100px] rounded-full opacity-30 pointer-events-none" />
             
             <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative">
                {/* Fake UI Header */}
                <div className="h-12 border-b border-white/10 bg-zinc-800/50 flex items-center px-4 gap-2">
                   <div className="w-3 h-3 rounded-full bg-red-500/50" />
                   <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                   <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                
                {/* Code Content */}
                <div className="p-8 font-mono text-sm min-h-[300px] bg-black/40 backdrop-blur">
                   {typedCode.map((line, i) => (
                      <div key={i} className="flex gap-4">
                         <span className="text-zinc-600 select-none w-6 text-right">{i + 1}</span>
                         <span className="text-zinc-300">
                            {line}
                            {i === typedCode.length - 1 && i < codeSnippet.length - 1 && (
                               <span className="inline-block w-2 h-4 bg-orange-500 animate-pulse ml-1 align-middle" />
                            )}
                         </span>
                      </div>
                   ))}
                   
                   <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 3 }}
                      className="mt-8 p-4 border border-orange-500/30 bg-orange-500/10 rounded-lg flex gap-3"
                   >
                      <div className="w-1 h-full bg-orange-500 rounded-full" />
                      <div>
                         <div className="text-orange-500 text-xs font-bold mb-1 uppercase tracking-wider flex items-center gap-2">
                            <Sparkles className="w-3 h-3" /> Insight
                         </div>
                         <div className="text-zinc-300 text-sm">
                            Calculation looks good, but you might want to account for <span className="text-white font-bold">air resistance</span> for higher velocities.
                         </div>
                      </div>
                   </motion.div>
                </div>
             </div>
          </div>
        </div>

      </div>
    </section>
  );
};