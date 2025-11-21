
import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Philosophy } from './components/Philosophy';
import { FeatureScroller } from './components/FeatureScroller';
import { InterfaceShowcase } from './components/InterfaceShowcase';
import { HowItWorks } from './components/HowItWorks';
import { Audience } from './components/Audience';
import { AIEngine } from './components/AIEngine';
import { ToolsGrid } from './components/ToolsGrid';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';
import { AuroraBackground } from './components/ui/AuroraBackground';
import { LaserFlow } from './components/ui/LaserFlow';
import FluidGlass from './components/ui/FluidGlass';
import TextPressure from './components/ui/TextPressure';
import LiquidEther from './components/ui/LiquidEther';
import { VideoBackgroundWrapper } from './components/VideoBackgroundWrapper';
import { motion } from 'framer-motion';

function App() {
  return (
    <div className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 min-h-screen selection:bg-orange-500/30 selection:text-orange-900 dark:selection:text-orange-200 transition-colors duration-500">
      <Navbar />
      <main>
        <Hero />
        
        <Philosophy />

        {/* Fluid Glass Section */}
        <section className="h-screen relative bg-zinc-950 text-white overflow-hidden">
          <div className="absolute inset-0 z-0">
             <FluidGlass 
                mode="cube" 
                cubeProps={{
                  scale: 0.5,
                  ior: 1.2,
                  thickness: 2,
                  chromaticAberration: 0.1,
                  anisotropy: 0.1
                }}
             />
          </div>
          <div className="absolute inset-0 pointer-events-none flex items-end justify-center pb-20 z-10">
             <p className="text-zinc-400 text-sm font-mono uppercase tracking-widest">Interactive Physics</p>
          </div>
        </section>

        <FeatureScroller />
        
        <InterfaceShowcase />
        
        {/* Laser Flow Section */}
        <section className="h-[600px] relative bg-black overflow-hidden border-y border-zinc-900">
           <div className="absolute inset-0 z-0">
             <LaserFlow
                horizontalBeamOffset={0.1}
                verticalBeamOffset={0.0}
                color="#ff4f00" // Yukti-AI Orange
                flowStrength={0.5}
                wispDensity={1.5}
             />
           </div>
           <div className="relative z-10 container mx-auto h-full flex items-center justify-center pointer-events-none">
              <div className="text-center">
                 <h2 className="text-5xl md:text-7xl font-serif text-white mb-6 mix-blend-screen">Photon Simulation</h2>
                 <p className="text-orange-200/80 text-xl max-w-lg mx-auto font-light">
                    Experience light physics in real-time. Our engine renders particle interactions with medical-grade accuracy.
                 </p>
              </div>
           </div>
        </section>

        <HowItWorks />
        
        {/* Liquid Ether Section */}
        <section className="h-[600px] relative bg-black overflow-hidden">
          <div className="absolute inset-0 z-0">
             <LiquidEther 
               colors={['#ff4f00', '#cc3f00', '#ff8f50']}
               mouseForce={40}
             />
          </div>
          <div className="relative z-10 container mx-auto h-full flex items-center justify-center pointer-events-none">
              <div className="backdrop-blur-md bg-black/30 p-12 rounded-3xl border border-white/10">
                 <TextPressure
                    text="Fluid Dynamics"
                    flex={true}
                    alpha={false}
                    stroke={false}
                    width={true}
                    weight={true}
                    italic={true}
                    textColor="#ffffff"
                    strokeColor="#ff0000"
                    minFontSize={48}
                 />
                 <p className="text-white/80 text-center mt-4 font-mono">Real-time Computational Fluid Dynamics</p>
              </div>
          </div>
        </section>

        <AIEngine />
        
        <Audience />
        
        <AuroraBackground className="h-[600px] bg-zinc-50 dark:bg-zinc-950">
          <motion.div
            initial={{ opacity: 0.0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="relative flex flex-col gap-4 items-center justify-center px-4"
          >
            <div className="text-3xl md:text-7xl font-serif font-bold dark:text-white text-center">
              Join the <span className="text-orange-500">Revolution</span>
            </div>
            <div className="font-light text-base md:text-4xl dark:text-neutral-200 py-4 text-center max-w-2xl">
              Be part of a global network of creators pushing the boundaries of what's possible.
            </div>
          </motion.div>
        </AuroraBackground>

        <VideoBackgroundWrapper>
          <ToolsGrid />
          <Testimonials />
          <Footer />
        </VideoBackgroundWrapper>
      </main>
    </div>
  );
}

export default App;
