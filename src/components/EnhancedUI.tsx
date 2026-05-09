import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  delay?: number;
  direction?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  delay = 0.3,
  direction = 'top',
  className
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay * 1000);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const variants = {
    top: { y: -8, x: '-50%', top: '-8px', left: '50%', transformOrigin: 'bottom' },
    bottom: { y: 8, x: '-50%', bottom: '-8px', left: '50%', transformOrigin: 'top' },
    left: { x: -8, y: '-50%', left: '-8px', top: '50%', transformOrigin: 'right' },
    right: { x: 8, y: '-50%', right: '-8px', top: '50%', transformOrigin: 'left' }
  };

  const initial = {
    top: { opacity: 0, y: 0, x: '-50%' },
    bottom: { opacity: 0, y: 0, x: '-50%' },
    left: { opacity: 0, x: 0, y: '-50%' },
    right: { opacity: 0, x: 0, y: '-50%' }
  };

  return (
    <div 
      className={cn("relative inline-block", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={initial[direction]}
            animate={{ opacity: 1, ...variants[direction] }}
            exit={initial[direction]}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute z-[1000] px-3 py-1.5 rounded-lg bg-black/90 backdrop-blur-xl border border-white/10 text-white text-[9px] font-black whitespace-nowrap shadow-[0_10px_30px_rgba(0,0,0,0.5)] pointer-events-none uppercase tracking-[0.2em]",
              direction === 'top' && "bottom-full left-1/2 -translate-x-1/2 mb-2",
              direction === 'bottom' && "top-full left-1/2 -translate-x-1/2 mt-2",
              direction === 'left' && "right-full top-1/2 -translate-y-1/2 mr-2",
              direction === 'right' && "left-full top-1/2 -translate-y-1/2 ml-2"
            )}
          >
            {content}
            <div 
              className={cn(
                "absolute border-4 border-transparent",
                direction === 'top' && "top-full left-1/2 -translate-x-1/2 border-t-slate-900",
                direction === 'bottom' && "bottom-full left-1/2 -translate-x-1/2 border-b-slate-900",
                direction === 'left' && "left-full top-1/2 -translate-y-1/2 border-l-slate-900",
                direction === 'right' && "right-full top-1/2 -translate-y-1/2 border-r-slate-900"
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ElementType;
}

export const SmoothTabs: React.FC<{
  tabs: (TabItem & { tooltip?: string })[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}> = ({ tabs, activeTab, onChange, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const activeBtn = containerRef.current.querySelector('[data-active="true"]') as HTMLElement;
    if (activeBtn) {
      const container = containerRef.current;
      const scrollLeft = activeBtn.offsetLeft - container.offsetWidth / 2 + activeBtn.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeTab]);

  return (
    <div className={cn("relative w-full", className)}>
      <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[#050505] to-transparent z-20 pointer-events-none opacity-80" />
      <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-[#050505] to-transparent z-20 pointer-events-none opacity-80" />
      
      <div 
        ref={containerRef}
        className="flex overflow-x-auto no-scrollbar scroll-smooth gap-1 md:gap-2 p-1.5 bg-white/[0.03] backdrop-blur-xl rounded-[1.25rem] border border-white/5 relative z-10"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              data-active={isActive}
              className={cn(
                "relative flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all shrink-0 group focus:outline-none",
                isActive ? "text-slate-900" : "text-slate-400 hover:text-white"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-primary shadow-[0_0_15px_rgba(0,255,204,0.3)] rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {Icon && <Icon size={16} className={cn("relative z-10 transition-colors duration-300", isActive ? "text-slate-900" : "group-hover:text-white")} />}
              <span className="relative z-10 tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export const Dropdown: React.FC<{
  trigger: React.ReactNode;
  items: { label: string; icon?: React.ElementType; onClick: () => void; description?: string }[];
  className?: string;
}> = ({ trigger, items, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative inline-block w-full", className)} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="w-full cursor-pointer">
        {trigger}
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute bottom-full left-0 right-0 mb-4 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100]"
          >
            <div className="p-2 space-y-1">
              {items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      item.onClick();
                      setIsOpen(false);
                    }}
                    className="w-full flex flex-col items-start p-3 rounded-xl hover:bg-white/5 transition-colors group text-left"
                  >
                    <div className="flex items-center gap-3 w-full">
                      {Icon && <Icon size={16} className="text-slate-400 group-hover:text-primary transition-colors" />}
                      <span className="text-xs font-black uppercase tracking-widest text-white">{item.label}</span>
                    </div>
                    {item.description && (
                      <span className="text-[10px] text-slate-500 mt-1 font-bold ml-7">{item.description}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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

export const ColorInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}> = ({ value, onChange, label, className }) => {
  const presets = ['#ffffff', '#000000', '#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9'];
  
  return (
    <div className={cn("flex flex-col gap-2 p-3 rounded-2xl bg-white dark:bg-black border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:border-primary/20", className)}>
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 ml-1">
            {label}
          </label>
        )}
        <div className="h-6 px-2 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center">
          <input 
            type="text" 
            className="w-16 bg-transparent border-none text-[10px] font-mono text-slate-600 dark:text-slate-400 focus:ring-0 outline-none text-center"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-11 gap-1">
        <div className="col-span-1 aspect-square rounded-md border border-slate-200 dark:border-slate-800 relative overflow-hidden shrink-0">
          <input 
            type="color" 
            className="absolute -inset-2 w-[200%] h-[200%] cursor-pointer"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
        
        <div className="col-span-1 w-px h-full bg-slate-100 dark:bg-slate-800 mx-1" />
        
        {presets.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={cn(
              "aspect-square rounded-md border transition-all",
              value.toLowerCase() === color.toLowerCase() ? "border-primary scale-110" : "border-transparent"
            )}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
};
