import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { staggerContainer } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface AnimatedContainerProps extends HTMLMotionProps<'div'> {
	children: React.ReactNode;
	className?: string;
	delay?: number;
	stagger?: boolean;
	viewportEnabled?: boolean; // Flag to enable/disable viewport animation
}

export function AnimatedContainer({
	children,
	className,
	delay = 0,
	stagger = false,
	viewportEnabled = false,
	...props
}: AnimatedContainerProps) {
	return (
		<motion.div
			initial='hidden'
			animate='visible'
			exit='exit'
			variants={stagger ? staggerContainer : undefined}
			transition={{ delay }}
			viewport={viewportEnabled ? { once: true, amount: 0.25 } : undefined}
			className={cn(className)}
			{...props}
		>
			{children}
		</motion.div>
	);
}

// Specialized container for page transitions
export function PageTransition({ children, className }: { children: React.ReactNode; className?: string }) {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
			className={cn('w-full', className)}
		>
			{children}
		</motion.div>
	);
}
