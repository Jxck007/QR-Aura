import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface ConicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  borderColor?: string;
  animationDuration?: number;
}

export const ConicButton: React.FC<ConicButtonProps> = ({ 
  children, 
  className, 
  borderColor = "#477f88", 
  animationDuration = 4,
  ...props 
}) => {
  return (
    <button
      className={cn(
        "relative group overflow-hidden border-none bg-transparent active:scale-95 transition-transform",
        className
      )}
      {...props}
    >
      {/* Rotating Conic Gradient Border */}
      <motion.div
        className="absolute inset-[-400%] z-0"
        style={{
          background: `conic-gradient(transparent 120deg, ${borderColor}, transparent 240deg)`,
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: animationDuration,
          ease: "linear",
          repeat: Infinity,
        }}
      />
      
      {/* Inner Surface - High visibility surface */}
      <div className="absolute inset-[2px] z-10 bg-white dark:bg-black rounded-[inherit] transition-colors group-hover:bg-slate-50 dark:group-hover:bg-slate-900" />
      
      {/* Content */}
      <div className="relative z-20 w-full h-full flex items-center justify-center pointer-events-none px-6">
        {children}
      </div>
    </button>
  );
};

export const LiquidMetalLogo: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <div className={cn("relative inline-block group cursor-pointer", className)}>
      <span className="relative z-10 bg-gradient-to-r from-black via-zinc-400 to-black dark:from-white dark:via-zinc-300 dark:to-white bg-[length:200%_auto] bg-clip-text text-transparent animate-shine">
        {children}
      </span>
      <style>{`
        @keyframes shine {
          to { background-position: 200% center; }
        }
        .animate-shine {
          animation: shine 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export const TypewriterText: React.FC<{ text: string; delay?: number; repeat?: boolean }> = ({ text, delay = 0, repeat = false }) => {
  const characters = text.split("");
  
  return (
    <div className="inline-flex">
      {characters.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, display: "none" }}
          animate={{ opacity: 1, display: "inline-block" }}
          transition={{
            delay: delay + (i * 0.1),
            duration: 0.1,
            repeat: repeat ? Infinity : 0,
            repeatDelay: characters.length * 0.1 + 2,
            repeatType: "reverse"
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "steps(2)" }}
        className="w-[2px] h-[1.1em] bg-primary ml-1 inline-block align-middle"
      />
    </div>
  );
};

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ElementType;
}

export const SmoothTabs: React.FC<{
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={cn("flex px-2 py-1 bg-slate-100/50 dark:bg-black/80 backdrop-blur-md rounded-xl relative", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative z-10 flex flex-col items-center justify-center flex-1 py-1.5 px-3 transition-colors duration-300",
              isActive ? "text-primary dark:text-white" : "text-slate-400 dark:text-slate-500 hover:text-slate-600"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-x-0 bottom-0 h-0.5 bg-primary rounded-full z-0"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            {Icon && <Icon size={16} className="mb-0.5" />}
            <span className="text-[10px] font-bold uppercase tracking-tighter">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export const InputGroup: React.FC<{
  label: string;
  children: React.ReactNode;
  className?: string;
}> = ({ label, children, className }) => {
  return (
    <div className={cn("flex flex-col gap-1.5 p-3 rounded-2xl bg-white dark:bg-black border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:border-primary/20 hover:shadow-md", className)}>
      <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 ml-1">
        {label}
      </label>
      <div className="relative">
        {children}
      </div>
    </div>
  );
};
