import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { buttonTap } from '@/lib/animations';

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:bg-primary/80',
				destructive:
					'bg-destructive text-white shadow-sm hover:bg-destructive/90 active:bg-destructive/80 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
				outline:
					'border border-primary text-primary shadow-sm hover:bg-primary hover:text-primary-foreground active:bg-primary/90 dark:border-accent dark:text-accent dark:hover:bg-accent dark:hover:text-accent-foreground',
				secondary:
					'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:bg-secondary/70',
				ghost: 'hover:bg-accent/20 hover:text-accent-foreground active:bg-accent/30 dark:hover:bg-accent/20',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-9 px-4 py-2 has-[>svg]:px-3',
				sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
				lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
				icon: 'size-9',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

interface ButtonProps
	extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'ref'>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const buttonClassName = cn(buttonVariants({ variant, size, className }));

		// Use Framer Motion with asChild compatibility
		if (asChild) {
			return <Slot className={buttonClassName} ref={ref} data-slot='button' {...props} />;
		}

		return (
			<motion.button
				className={buttonClassName}
				ref={ref}
				data-slot='button'
				whileTap={buttonTap} // Xbox-style tap animation
				initial={{ scale: 1 }}
				whileHover={{ scale: 1.02 }}
				transition={{ duration: 0.2, ease: [0.33, 1, 0.68, 1] }}
				{...props}
			/>
		);
	},
);

Button.displayName = 'Button';

export { Button, buttonVariants };
