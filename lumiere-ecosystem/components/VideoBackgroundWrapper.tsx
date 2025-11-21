import React, { useRef, useState } from 'react';
import videoSrc from '../Yukti-AI_Future_of_Learning.mp4';

interface VideoBackgroundWrapperProps {
  children: React.ReactNode;
}

export const VideoBackgroundWrapper: React.FC<VideoBackgroundWrapperProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full bg-white dark:bg-zinc-950 overflow-hidden transition-colors duration-500"
      onMouseMove={handleMouseMove}
    >
      {/* Video Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
         <video 
            src={videoSrc} 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover opacity-10 dark:opacity-40 transition-opacity duration-500" 
         />
         
         {/* Overlay that gets removed on hover */}
         <div 
            className="absolute inset-0 bg-white/90 dark:bg-zinc-950/90 transition-colors duration-500"
            style={{
               maskImage: `radial-gradient(circle 400px at ${mousePosition.x}px ${mousePosition.y}px, transparent 10%, black 100%)`,
               WebkitMaskImage: `radial-gradient(circle 400px at ${mousePosition.x}px ${mousePosition.y}px, transparent 10%, black 100%)`
            }}
         />
         
         {/* Additional shadow/vignette */}
         <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(255,255,255,0.8)] dark:shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] pointer-events-none transition-shadow duration-500" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
