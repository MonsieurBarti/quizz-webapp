import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, listItem } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export function AnimatedList({
  children,
  className,
  as: Component = 'ul',
}: AnimatedListProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className={cn('w-full', className)}
    >
      <Component className="w-full">
        <AnimatePresence>
          {React.Children.map(children, (child, index) => {
            if (React.isValidElement(child)) {
              return (
                <motion.li
                  key={child.key || index}
                  variants={listItem}
                  exit="exit"
                  className="list-none" // Remove default list styling
                >
                  {child}
                </motion.li>
              );
            }
            return child;
          })}
        </AnimatePresence>
      </Component>
    </motion.div>
  );
}

// Usage with custom child animations
export function AnimatedListItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={listItem}
      className={cn('w-full', className)}
    >
      {children}
    </motion.div>
  );
}
