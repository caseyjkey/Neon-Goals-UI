import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SyncStatus = 'syncing' | 'success' | 'error';

interface SyncToastProps {
  isVisible: boolean;
  status: SyncStatus;
  message: string;
  onClose: () => void;
  autoCloseDuration?: number;
}

export const SyncToast: React.FC<SyncToastProps> = ({
  isVisible,
  status,
  message,
  onClose,
  autoCloseDuration = 3000,
}) => {
  // Auto-close after duration (only for success/error)
  useEffect(() => {
    if (isVisible && status !== 'syncing') {
      const timer = setTimeout(onClose, autoCloseDuration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, status, onClose, autoCloseDuration]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className={cn(
            "fixed z-[100]",
            // Mobile: centered
            "bottom-20 left-1/2 -translate-x-1/2",
            // Desktop: bottom right
            "sm:bottom-6 sm:right-6 sm:left-auto sm:translate-x-0"
          )}
        >
          {/* Glassmorphism container */}
          <div className="relative overflow-hidden rounded-2xl">
            {/* Rotating gradient border */}
            <div 
              className="absolute inset-0 rounded-2xl"
              style={{
                background: 'linear-gradient(90deg, #00f0ff, #ff00ff, #00f0ff)',
                backgroundSize: '200% 100%',
                animation: 'gradientRotate 2s linear infinite',
                padding: '2px',
              }}
            >
              <div className="absolute inset-[2px] rounded-2xl bg-background/80 backdrop-blur-xl" />
            </div>

            {/* Content */}
            <div className="relative px-5 py-4 flex items-center gap-4 min-w-[280px]">
              {/* Icon with animation */}
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                status === 'syncing' && "bg-primary/20",
                status === 'success' && "bg-success/20",
                status === 'error' && "bg-destructive/20"
              )}>
                {status === 'syncing' && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <RefreshCw className="w-5 h-5 text-primary" />
                  </motion.div>
                )}
                {status === 'success' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    <Check className="w-5 h-5 text-success" />
                  </motion.div>
                )}
                {status === 'error' && (
                  <AlertCircle className="w-5 h-5 text-destructive" />
                )}
              </div>

              {/* Message */}
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {status === 'syncing' && 'Syncing'}
                  {status === 'success' && 'Synced'}
                  {status === 'error' && 'Sync Failed'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {message}
                </p>
              </div>

              {/* Glow effect for syncing */}
              {status === 'syncing' && (
                <motion.div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(0, 240, 255, 0.3)',
                      '0 0 40px rgba(255, 0, 255, 0.3)',
                      '0 0 20px rgba(0, 240, 255, 0.3)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook for managing sync toast state
export const useSyncToast = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState<SyncStatus>('syncing');
  const [message, setMessage] = useState('');

  const showSyncing = (msg: string = 'Updating account data...') => {
    setStatus('syncing');
    setMessage(msg);
    setIsVisible(true);
  };

  const showSuccess = (msg: string = 'All accounts updated') => {
    setStatus('success');
    setMessage(msg);
  };

  const showError = (msg: string = 'Please try again') => {
    setStatus('error');
    setMessage(msg);
  };

  const close = () => {
    setIsVisible(false);
  };

  return {
    isVisible,
    status,
    message,
    showSyncing,
    showSuccess,
    showError,
    close,
  };
};
