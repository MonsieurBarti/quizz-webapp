import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { successAnimation, errorAnimation } from '@/lib/animations';

interface FeedbackProps {
  type: 'success' | 'error';
  message: string;
  duration?: number;
  onComplete?: () => void;
  className?: string;
}

export function AnimatedFeedback({
  type,
  message,
  duration = 2000,
  onComplete,
  className,
}: FeedbackProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) {
        onComplete();
      }
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={type}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={type === 'success' ? successAnimation : errorAnimation}
          className={cn(
            'fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-lg px-4 py-3 shadow-lg',
            type === 'success' ? 'bg-primary text-primary-foreground' : 'bg-destructive text-white',
            className
          )}
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
            {type === 'success' ? (
              <Check className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </div>
          <span className="font-medium">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Loading animation that can be used during API calls
export function AnimatedLoading({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("flex items-center justify-center", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ 
          duration: 1, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      />
    </motion.div>
  );
}
