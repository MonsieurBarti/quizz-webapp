import type { Variants } from 'framer-motion';

// Xbox-inspired animation variants
export const fadeIn: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			duration: 0.3,
			ease: [0.33, 1, 0.68, 1], // Xbox-style easing
		},
	},
};

export const slideIn: Variants = {
	hidden: { x: -20, opacity: 0 },
	visible: {
		x: 0,
		opacity: 1,
		transition: {
			type: 'spring',
			stiffness: 300,
			damping: 24,
		},
	},
};

export const scaleIn: Variants = {
	hidden: { scale: 0.95, opacity: 0 },
	visible: {
		scale: 1,
		opacity: 1,
		transition: {
			duration: 0.2,
			ease: [0.33, 1, 0.68, 1],
		},
	},
};

export const staggerContainer: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.05,
		},
	},
};

// For lists like quiz cards, questions, etc.
export const listItem: Variants = {
	hidden: { opacity: 0, y: 10 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			type: 'spring',
			stiffness: 300,
			damping: 24,
		},
	},
	exit: {
		opacity: 0,
		y: 10,
		transition: {
			duration: 0.2,
		},
	},
};

// For button click animation
export const buttonTap = {
	scale: 0.97,
	transition: {
		duration: 0.1,
	},
};

// For success animation
export const successAnimation: Variants = {
	initial: { scale: 0.8, opacity: 0 },
	animate: {
		scale: 1,
		opacity: 1,
		transition: {
			duration: 0.3,
			ease: [0.33, 1, 0.68, 1],
		},
	},
	exit: {
		scale: 1.2,
		opacity: 0,
		transition: {
			duration: 0.2,
		},
	},
};

// For error animation
export const errorAnimation: Variants = {
	initial: { x: 0 },
	animate: {
		x: [0, -10, 10, -5, 5, 0],
		transition: {
			duration: 0.5,
		},
	},
};

// For page transitions
export const pageTransition: Variants = {
	initial: { opacity: 0 },
	animate: {
		opacity: 1,
		transition: {
			duration: 0.3,
			ease: [0.33, 1, 0.68, 1],
		},
	},
	exit: {
		opacity: 0,
		transition: {
			duration: 0.2,
		},
	},
};
