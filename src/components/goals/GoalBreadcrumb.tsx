import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Home, Scan } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Goal } from '@/types/goals';

interface GoalBreadcrumbProps {
  navigationStack: Goal[];
  currentGoal: Goal | null;
  candidateName?: string; // For Scanner mode: "Candidate #3"
  onNavigate: (goalId: string | null) => void;
  className?: string;
}

const springConfig = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 30,
};

/**
 * Neon Breadcrumb Navigation
 * Thin neon line showing drill-down path: Parent > Subgoal > Candidate
 */
export const GoalBreadcrumb: React.FC<GoalBreadcrumbProps> = ({
  navigationStack,
  currentGoal,
  candidateName,
  onNavigate,
  className,
}) => {
  // Build breadcrumb items from stack + current
  const items: Array<{ id: string | null; label: string; isCurrent: boolean }> = [];
  
  // Add home/root
  items.push({ id: null, label: 'Goals', isCurrent: false });
  
  // Add navigation stack (parent goals)
  navigationStack.forEach((goal) => {
    items.push({ id: goal.id, label: goal.title, isCurrent: false });
  });
  
  // Add current goal
  if (currentGoal) {
    items.push({ 
      id: currentGoal.id, 
      label: currentGoal.title, 
      isCurrent: !candidateName 
    });
  }
  
  // Add candidate if in scanner
  if (candidateName) {
    items.push({ 
      id: 'candidate', 
      label: candidateName, 
      isCurrent: true 
    });
  }

  // Don't show if only "Goals" or empty
  if (items.length <= 1) return null;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={springConfig}
      className={cn(
        "relative z-30 px-4 lg:px-6 py-3",
        className
      )}
      aria-label="Goal navigation"
    >
      {/* Neon line background */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--neon-cyan)/0.5)] to-transparent" />
      
      <ol className="flex items-center gap-1 text-sm overflow-x-auto scrollbar-none">
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <React.Fragment key={item.id ?? 'root'}>
              {/* Separator */}
              {index > 0 && (
                <motion.li
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center text-muted-foreground/50"
                  aria-hidden
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.li>
              )}
              
              {/* Breadcrumb Item */}
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ ...springConfig, delay: index * 0.03 }}
                className="flex items-center flex-shrink-0"
              >
                {item.isCurrent ? (
                  <span
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1 rounded-lg font-medium",
                      "text-foreground",
                      item.id === 'candidate' 
                        ? "bg-[hsl(var(--neon-magenta)/0.2)] text-[hsl(var(--neon-magenta))]"
                        : "bg-[hsl(var(--neon-cyan)/0.2)] text-[hsl(var(--neon-cyan))]"
                    )}
                    aria-current="page"
                  >
                    {item.id === 'candidate' && <Scan className="w-3.5 h-3.5" />}
                    <span className="max-w-[150px] truncate">{item.label}</span>
                  </span>
                ) : (
                  <button
                    onClick={() => item.id === 'candidate' ? null : onNavigate(item.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all",
                      "text-muted-foreground hover:text-foreground",
                      "hover:bg-muted/30",
                      "focus:outline-none focus:ring-2 focus:ring-primary/50"
                    )}
                    disabled={item.id === 'candidate'}
                  >
                    {index === 0 && <Home className="w-3.5 h-3.5" />}
                    <span className="max-w-[120px] truncate">{item.label}</span>
                  </button>
                )}
              </motion.li>
            </React.Fragment>
          ))}
        </AnimatePresence>
      </ol>
      
      {/* Subtle neon glow effect at bottom */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-4 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, hsl(var(--neon-cyan) / 0.05), transparent)',
        }}
      />
    </motion.nav>
  );
};

export default GoalBreadcrumb;
