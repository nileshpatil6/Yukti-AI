import React, { useState } from 'react';
import { FileText, Mic, Presentation, BookOpen, Languages, BrainCircuit } from 'lucide-react';
import { cn } from '../utils/cn';

const tools = [
  { icon: BrainCircuit, title: "Dynamic Quizzes", desc: "Generated from your builds.", size: "col-span-1 md:col-span-2" },
  { icon: FileText, title: "Notes Upload", desc: "Convert PDFs to interactive lessons.", size: "col-span-1" },
  { icon: Presentation, title: "PPT Generator", desc: "Export your projects as slides.", size: "col-span-1" },
  { icon: Languages, title: "Voice Translation", desc: "Learn in any language.", size: "col-span-1 md:col-span-2" },
  { icon: Mic, title: "Text-to-Speech", desc: "Listen to challenge briefs.", size: "col-span-1" },
  { icon: BookOpen, title: "Notebook Mode", desc: "Integrated documentation.", size: "col-span-1" },
];

export const ToolsGrid = () => {
  return (
    <section className="py-32 bg-transparent transition-colors duration-500">
       <div className="container mx-auto px-6">
          <div className="mb-20 text-center">
             <h2 className="text-5xl md:text-7xl font-serif text-zinc-900 dark:text-white mb-6">The Toolkit</h2>
             <p className="text-zinc-500 dark:text-zinc-400 text-xl max-w-xl mx-auto font-light">Everything you need to document, export, and master your craft.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
             {tools.map((tool, i) => (
                <div 
                  key={i} 
                  className={cn(
                     "group relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-sm p-8 hover:border-orange-200 dark:hover:border-orange-800 transition-all duration-500 shadow-sm hover:shadow-md",
                     tool.size
                  )}
                >
                   <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                   
                   <div className="relative z-10 flex flex-col h-full justify-between">
                      <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                        <tool.icon className="w-5 h-5 text-zinc-600 dark:text-zinc-300 group-hover:text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-serif text-zinc-900 dark:text-white mb-2">{tool.title}</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">{tool.desc}</p>
                      </div>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </section>
  );
};