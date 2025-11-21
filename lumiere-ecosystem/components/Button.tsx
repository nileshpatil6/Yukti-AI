import React from 'react';
import { cn } from '../utils/cn';
import { ArrowRight } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  className, 
  variant = 'primary', 
  icon = false,
  ...props 
}) => {
  return (
    <button
      className={cn(
        "group relative px-8 py-3 rounded-full font-sans font-medium tracking-wide text-sm transition-all duration-300 ease-out overflow-hidden flex items-center justify-center gap-2",
        "active:scale-95",
        variant === 'primary' && "bg-orange-500 text-white hover:bg-orange-600 shadow-[0_5px_20px_rgba(255,79,0,0.2)] hover:shadow-[0_10px_30px_rgba(255,79,0,0.4)]",
        variant === 'secondary' && "bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-900/10 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100",
        variant === 'outline' && "bg-transparent text-zinc-900 border border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 dark:text-white dark:border-zinc-700 dark:hover:border-zinc-500 dark:hover:bg-zinc-800",
        variant === 'ghost' && "bg-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white",
        className
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {icon && (
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        )}
      </span>
    </button>
  );
};