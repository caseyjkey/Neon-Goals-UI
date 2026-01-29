import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingBackButtonProps {
  isVisible: boolean;
  onClick: () => void;
}

export const FloatingBackButton: React.FC<FloatingBackButtonProps> = ({
  isVisible,
  onClick,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1.2, 1],
            opacity: 1,
          }}
          exit={{
            scale: [1, 1.2, 0],
            opacity: 0,
          }}
          whileTap={{
            scale: 0.85,
          }}
          transition={{
            duration: 0.4,
            ease: [0.34, 1.56, 0.64, 1], // Custom spring-like easing
            times: [0, 0.6, 1],
          }}
          onClick={onClick}
          className={cn(
            "fixed bottom-6 left-6 z-[70]",
            "w-14 h-14 rounded-full",
            "flex items-center justify-center",
            "lg:hidden" // Only show on mobile/tablet
          )}
          style={{
            background: 'rgba(20, 20, 30, 0.8)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
          aria-label="Go back"
        >
          {/* Animated gradient border */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #00f0ff, #ff00ff, #00f0ff)',
              backgroundSize: '200% 200%',
              padding: '2px',
            }}
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <div
              className="w-full h-full rounded-full"
              style={{
                background: 'rgba(20, 20, 30, 0.9)',
              }}
            />
          </motion.div>

          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{
              boxShadow: [
                '0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(255, 0, 255, 0.3)',
                '0 0 30px rgba(255, 0, 255, 0.5), 0 0 60px rgba(0, 240, 255, 0.3)',
                '0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(255, 0, 255, 0.3)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Icon */}
          <ArrowLeft className="w-6 h-6 text-white relative z-10" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
