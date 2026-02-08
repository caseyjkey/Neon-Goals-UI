import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ScannerPlaceholderProps {
  status: 'initiating' | 'decoding' | 'acquired' | 'no_candidates' | 'no_results';
  signalCount?: number;
  className?: string;
}

export const ScannerPlaceholder: React.FC<ScannerPlaceholderProps> = ({
  status,
  signalCount = 0,
  className,
}) => {
  const [noiseFrame, setNoiseFrame] = useState(0);

  // Animate static noise
  useEffect(() => {
    if (status === 'acquired') return;

    const interval = setInterval(() => {
      setNoiseFrame(prev => (prev + 1) % 100);
    }, status === 'no_results' ? 80 : 50);

    return () => clearInterval(interval);
  }, [status]);

  const getMessage = () => {
    switch (status) {
      case 'initiating':
        return 'INITIATING SCRAPE...';
      case 'decoding':
        return 'DECODING RESULTS...';
      case 'acquired':
        return 'TARGET ACQUIRED';
      case 'no_candidates':
        return 'NO NEW CANDIDATES';
      case 'no_results':
        return 'NO SIGNAL';
      default:
        return 'SCANNING...';
    }
  };

  const getSignalText = () => {
    if (status === 'decoding' && signalCount > 0) {
      return `${signalCount} SIGNAL${signalCount > 1 ? 'S' : ''} DETECTED`;
    }
    return null;
  };

  return (
    <div className={cn("relative w-full h-full overflow-hidden bg-background", className)}>
      {/* TV Static / Noise Background */}
      {(status !== 'acquired' && status !== 'no_candidates') && (
        <div className="absolute inset-0 z-10">
          {/* Base noise layer */}
          <div
            className="absolute inset-0"
            style={{
              opacity: status === 'no_results' ? 0.5 : 0.2,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${0.8 + (noiseFrame % 10) * 0.02}' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
              backgroundSize: 'cover',
            }}
          />

          {/* Heavy static for no_results */}
          {status === 'no_results' && (
            <>
              {/* Dense horizontal noise bars */}
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute left-0 right-0"
                  style={{
                    top: `${((noiseFrame * (i + 3) * 7) % 100)}%`,
                    height: `${2 + (i % 3)}px`,
                    background: `linear-gradient(90deg, transparent ${(noiseFrame * i) % 20}%, hsl(var(--muted-foreground) / ${0.15 + (i % 4) * 0.05}) ${20 + (noiseFrame * i) % 30}%, transparent ${60 + (noiseFrame * i) % 40}%)`,
                  }}
                />
              ))}
              {/* Flickering overlay */}
              <motion.div
                className="absolute inset-0 bg-foreground/5"
                animate={{ opacity: [0, 0.08, 0, 0.05, 0] }}
                transition={{ duration: 0.3, repeat: Infinity, repeatType: 'loop' }}
              />
            </>
          )}

          {/* Magenta glitch streaks */}
          {status !== 'no_results' && (
            <motion.div
              className="absolute inset-0"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                x: [-2, 2, -2],
              }}
              transition={{
                duration: 0.15,
                repeat: Infinity,
                repeatType: 'mirror',
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-magenta/60" style={{ top: `${(noiseFrame * 3) % 100}%` }} />
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-magenta/80" style={{ top: `${(noiseFrame * 7) % 100}%` }} />
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-magenta/40" style={{ top: `${(noiseFrame * 11) % 100}%` }} />
            </motion.div>
          )}

          {/* Cyan glitch streaks */}
          {status !== 'no_results' && (
            <motion.div
              className="absolute inset-0"
              animate={{
                opacity: [0.4, 0.7, 0.4],
                x: [2, -2, 2],
              }}
              transition={{
                duration: 0.12,
                repeat: Infinity,
                repeatType: 'mirror',
                delay: 0.05,
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary/60" style={{ top: `${(noiseFrame * 5) % 100}%` }} />
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-primary/80" style={{ top: `${(noiseFrame * 13) % 100}%` }} />
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary/50" style={{ top: `${(noiseFrame * 17) % 100}%` }} />
            </motion.div>
          )}

          {/* Scanline overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: status === 'no_results'
                ? 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255, 255, 255, 0.02) 1px, rgba(255, 255, 255, 0.02) 2px)'
                : 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 240, 255, 0.03) 2px, rgba(0, 240, 255, 0.03) 4px)',
            }}
          />
        </div>
      )}

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-0">
        {/* Signal count (decoding state) */}
        {getSignalText() && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-2 rounded-lg bg-warning/20 border border-warning/50"
          >
            <span className="font-mono text-sm font-bold text-warning">
              {getSignalText()}
            </span>
          </motion.div>
        )}

        {/* Main message */}
        <motion.div
          animate={{
            opacity: status === 'no_results'
              ? [0.4, 0.8, 0.3, 0.7, 0.4]
              : status === 'acquired' || status === 'no_candidates'
              ? [0.8, 1, 0.8]
              : [0.7, 1, 0.7],
          }}
          transition={{
            duration: status === 'no_results' ? 0.5 : status === 'acquired' || status === 'no_candidates' ? 1.5 : 0.8,
            repeat: Infinity,
            repeatType: 'mirror',
          }}
          className={cn(
            "px-6 py-3 rounded-xl font-mono font-bold text-lg tracking-wider",
            status === 'acquired'
              ? "bg-primary/30 text-primary border-2 border-primary neon-glow-cyan"
              : status === 'no_results'
              ? "bg-muted/60 text-muted-foreground/70 border border-muted-foreground/20"
              : status === 'no_candidates'
              ? "bg-muted/50 text-muted-foreground border border-muted"
              : "bg-background/80 text-foreground border border-border/50"
          )}
        >
          {getMessage()}
        </motion.div>

        {/* Progress indicator dots (initiating and decoding) */}
        {status !== 'acquired' && status !== 'no_candidates' && status !== 'no_results' && (
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className={cn(
                  "w-2 h-2 rounded-full",
                  status === 'decoding' ? "bg-warning" : "bg-primary"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScannerPlaceholder;
