import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageActionsProps {
  content: string;
  isUser: boolean;
  className?: string;
}

export const MessageActions: React.FC<MessageActionsProps> = ({ content, isUser, className }) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "flex items-center gap-0.5 mt-1",
        isUser ? "justify-end" : "justify-start",
        className
      )}
    >
      {/* Copy */}
      <button
        onClick={handleCopy}
        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        title="Copy message"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>

      {/* Like/Dislike — only for assistant messages */}
      {!isUser && (
        <>
          <button
            onClick={() => setFeedback(f => f === 'like' ? null : 'like')}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              feedback === 'like'
                ? "text-green-400 bg-green-400/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
            title="Helpful"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setFeedback(f => f === 'dislike' ? null : 'dislike')}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              feedback === 'dislike'
                ? "text-destructive bg-destructive/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
            title="Not helpful"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </motion.div>
  );
};
