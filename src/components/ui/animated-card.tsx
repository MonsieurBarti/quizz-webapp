import React from 'react';
import { motion } from 'framer-motion';
import { scaleIn } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';

interface AnimatedCardProps extends React.ComponentProps<typeof Card> {
  index?: number;
}

// Animated version of the Card component
export function AnimatedCard({ 
  children, 
  className, 
  index = 0,
  ...props 
}: AnimatedCardProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={scaleIn}
      transition={{ 
        delay: index * 0.05,
        duration: 0.3,
        ease: [0.33, 1, 0.68, 1]
      }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={cn(className)}
    >
      <Card {...props}>
        {children}
      </Card>
    </motion.div>
  );
}

// Re-export the card subcomponents
export { CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
