import React from 'react';
import { Button } from './Button';
import { motion } from 'framer-motion';

export const Footer = () => {
  return (
    <footer className="bg-transparent pt-40 pb-12 border-t border-zinc-200 dark:border-zinc-800 relative overflow-hidden transition-colors duration-500">
      {/* Giant Background Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-serif text-zinc-900/[0.02] dark:text-white/[0.02] whitespace-nowrap pointer-events-none select-none">
         Yukti-AI
      </div>

      <div className="container mx-auto px-6 relative z-10">
        
        {/* CTA Section */}
        <div className="flex flex-col items-center text-center mb-40">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             className="inline-block mb-8"
           >
              <span className="px-4 py-2 rounded-full border border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-mono text-xs tracking-widest uppercase">
                 Early Access Open
              </span>
           </motion.div>
           
          <h2 className="text-6xl md:text-8xl lg:text-[10rem] font-serif text-zinc-900 dark:text-white mb-12 tracking-tighter leading-[0.9]">
            Enroll in the <br />
            <span className="text-zinc-400 dark:text-zinc-600 italic">Future.</span>
          </h2>
          <div className="flex flex-col md:flex-row gap-6">
            <Button variant="primary" className="h-16 px-12 text-lg rounded-full">Start Building</Button>
            <Button variant="outline" className="h-16 px-12 text-lg rounded-full">Take a Guided Tour</Button>
          </div>
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-12 grid grid-cols-1 md:grid-cols-4 gap-12">
           <div className="col-span-1 md:col-span-2">
             <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white font-serif font-bold text-xs leading-none pb-0.5">L</div>
                <span className="font-serif text-2xl text-zinc-900 dark:text-white">Yukti-AI.</span>
             </div>
             <p className="text-zinc-500 dark:text-zinc-400 max-w-xs font-light">
                A next-generation learning ecosystem designed for the builders of tomorrow.
             </p>
           </div>
           
           <div>
              <h4 className="font-mono text-xs text-zinc-900 dark:text-white uppercase tracking-widest mb-6">Platform</h4>
              <ul className="space-y-4 text-sm text-zinc-500 dark:text-zinc-400">
                 <li><a href="#" className="hover:text-orange-500 transition-colors">Curriculum</a></li>
                 <li><a href="#" className="hover:text-orange-500 transition-colors">The Labs</a></li>
                 <li><a href="#" className="hover:text-orange-500 transition-colors">Pricing</a></li>
                 <li><a href="#" className="hover:text-orange-500 transition-colors">For Schools</a></li>
              </ul>
           </div>

           <div>
              <h4 className="font-mono text-xs text-zinc-900 dark:text-white uppercase tracking-widest mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-zinc-500 dark:text-zinc-400">
                 <li><a href="#" className="hover:text-orange-500 transition-colors">Manifesto</a></li>
                 <li><a href="#" className="hover:text-orange-500 transition-colors">Careers</a></li>
                 <li><a href="#" className="hover:text-orange-500 transition-colors">Blog</a></li>
                 <li><a href="#" className="hover:text-orange-500 transition-colors">Contact</a></li>
              </ul>
           </div>
        </div>

        <div className="mt-20 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
           <div>© 2024 Yukti-AI Systems Inc.</div>
           <div className="flex gap-8">
              <a href="#" className="hover:text-zinc-900 dark:hover:text-white">Privacy</a>
              <a href="#" className="hover:text-zinc-900 dark:hover:text-white">Terms</a>
           </div>
        </div>
      </div>
    </footer>
  );
};