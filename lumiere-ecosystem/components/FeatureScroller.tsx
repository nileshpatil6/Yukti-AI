import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Layout, PenTool, Trophy, Zap, Box, Layers } from 'lucide-react';

const features = [
  {
    id: "01",
    title: "The Playground",
    subtitle: "Infinite Canvas",
    desc: "A limitless workspace where physics, code, and logic intertwine. Drag and drop over 500+ intelligent components. Wire up a CPU, simulate a rocket trajectory, or synthesize a new compound.",
    icon: Layout,
    color: "from-orange-500/10 to-orange-100/50 dark:from-orange-500/20 dark:to-orange-900/20",
    border: "border-orange-200 dark:border-orange-800/50",
    iconBg: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
    stats: ["Physics Engine v2.4", "Real-time Rendering", "Python Integrated"]
  },
  {
    id: "02",
    title: "The Workshop",
    subtitle: "Guided Mastery",
    desc: "Forget textbooks. Learn by fixing broken machines, decrypting alien signals, and optimizing supply chains. Our adaptive AI mentor guides you when you're stuck, not before.",
    icon: PenTool,
    color: "from-blue-500/10 to-blue-100/50 dark:from-blue-500/20 dark:to-blue-900/20",
    border: "border-blue-200 dark:border-blue-800/50",
    iconBg: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    stats: ["Adaptive Hints", "Step-by-step Logic", "Concept Mapping"]
  },
  {
    id: "03",
    title: "The Arena",
    subtitle: "Global Competition",
    desc: "Every midnight, a new brief drops. 'Build a bridge with $500 budget.' 'Write a sorting algo under 10 lines.' Compete against the world's best minds for rank and glory.",
    icon: Trophy,
    color: "from-purple-500/10 to-purple-100/50 dark:from-purple-500/20 dark:to-purple-900/20",
    border: "border-purple-200 dark:border-purple-800/50",
    iconBg: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    stats: ["Global Leaderboard", "Daily Briefs", "Peer Review"]
  }
];

export const FeatureScroller = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"]
  });

  return (
    <section ref={targetRef} className="bg-white dark:bg-zinc-950 relative transition-colors duration-500">
      <div className="container mx-auto px-6">
        {features.map((feature, i) => (
          <FeatureSection key={i} feature={feature} index={i} total={features.length} />
        ))}
      </div>
    </section>
  );
};

interface FeatureSectionProps {
  feature: typeof features[0];
  index: number;
  total: number;
}

const FeatureSection: React.FC<FeatureSectionProps> = ({ feature, index, total }) => {
  return (
    <div className="min-h-screen sticky top-0 flex items-center justify-center py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full items-center">
        
        {/* Text Content */}
        <div className="order-2 lg:order-1">
           <motion.div
             initial={{ opacity: 0, x: -50 }}
             whileInView={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.8, ease: "easeOut" }}
             className="relative"
           >
             <span className="absolute -left-20 top-0 text-[12rem] font-serif text-zinc-100 dark:text-zinc-900 leading-none select-none hidden xl:block transition-colors">
               {feature.id}
             </span>
             <div className="relative z-10 pl-4">
                <div className="flex items-center gap-3 mb-6">
                   <div className={`p-2 rounded-lg ${feature.iconBg}`}>
                      <feature.icon className="w-5 h-5" />
                   </div>
                   <span className="font-mono text-sm text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{feature.subtitle}</span>
                </div>
                
                <h2 className="text-5xl md:text-7xl font-serif text-zinc-900 dark:text-white mb-8 leading-[0.9]">
                  {feature.title}
                </h2>
                
                <p className="text-xl text-zinc-500 dark:text-zinc-400 font-light leading-relaxed mb-10 max-w-lg">
                  {feature.desc}
                </p>

                <div className="flex gap-4">
                   {feature.stats.map((stat: string, i: number) => (
                      <div key={i} className="px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-mono text-zinc-600 dark:text-zinc-400">
                         {stat}
                      </div>
                   ))}
                </div>
             </div>
           </motion.div>
        </div>

        {/* Visual Card */}
        <div className="order-1 lg:order-2 h-[50vh] lg:h-[70vh] w-full relative perspective-1000">
           <motion.div
              initial={{ opacity: 0, rotateX: 20, scale: 0.9 }}
              whileInView={{ opacity: 1, rotateX: 0, scale: 1 }}
              transition={{ duration: 0.8 }}
              className={`w-full h-full rounded-3xl border ${feature.border} bg-gradient-to-br ${feature.color} backdrop-blur-3xl relative overflow-hidden shadow-2xl shadow-black/5 dark:shadow-black/20`}
           >
              {/* Interior UI Mockup */}
              <div className="absolute inset-0 bg-grid-black/[0.03] dark:bg-grid-white/[0.03]" />
              <div className="absolute inset-4 rounded-2xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-black/40 shadow-sm overflow-hidden">
                 {/* Abstract UI Elements */}
                 <div className="absolute top-4 left-4 right-4 h-8 bg-white dark:bg-zinc-900 rounded flex items-center px-3 gap-2 border border-zinc-100 dark:border-zinc-800">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                 </div>
                 
                 <div className="absolute top-16 left-4 bottom-4 w-64 bg-white dark:bg-zinc-900 rounded border border-zinc-100 dark:border-zinc-800 p-4 space-y-3">
                    {[1,2,3,4,5].map((i) => (
                       <div key={i} className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded w-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                 </div>
                 
                 <div className="absolute top-16 right-4 bottom-4 left-72 bg-white dark:bg-zinc-900 rounded border border-zinc-100 dark:border-zinc-800 flex items-center justify-center">
                    <div className="w-32 h-32 border border-orange-500/30 rounded-full flex items-center justify-center">
                       <div className="w-20 h-20 border border-orange-500/60 rounded-full animate-spin-slow" />
                    </div>
                 </div>
              </div>
           </motion.div>
        </div>

      </div>
    </div>
  );
};