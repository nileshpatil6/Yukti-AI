import React from 'react';

const testimonials = [
  {
    quote: "Yukti-AI doesn't feel like school. It feels like I've been given the keys to a high-tech lab.",
    author: "Sarah Jenkins",
    role: "Electrical Engineering Student"
  },
  {
    quote: "The AI feedback is spookily accurate. It caught a logic error I've been making for weeks.",
    author: "Marcus Chen",
    role: "Self-taught Dev"
  },
  {
    quote: "Finally, a platform that respects my intelligence and lets me build freely.",
    author: "Elena Rodriguez",
    role: "Maker & Hobbyist"
  }
];

export const Testimonials = () => {
  return (
    <section className="py-32 bg-transparent border-t border-zinc-100 dark:border-zinc-900 transition-colors duration-500">
      <div className="container mx-auto px-6">
        <h2 className="text-center font-serif text-4xl text-zinc-900 dark:text-white mb-20">Student Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="p-10 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors shadow-sm">
              <div className="mb-8 text-orange-500 text-xl font-serif italic">"</div>
              <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-8 leading-relaxed font-light">"{t.quote}"</p>
              <div>
                <div className="font-bold text-zinc-900 dark:text-white font-serif">{t.author}</div>
                <div className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-1">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};