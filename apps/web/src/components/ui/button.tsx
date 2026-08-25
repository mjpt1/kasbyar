import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[calc(var(--radius)-4px)] text-sm font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-150 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-br from-primary to-primary/85 text-primary-foreground shadow-[0_1px_2px_hsl(var(--foreground)/0.08),0_8px_20px_hsl(var(--primary)/0.28)] hover:from-primary/95 hover:to-primary/80 hover:shadow-[0_1px_2px_hsl(var(--foreground)/0.08),0_12px_26px_hsl(var(--primary)/0.34)]',
        destructive:
          'bg-destructive text-destructive-foreground shadow-[0_6px_16px_hsl(var(--destructive)/0.24)] hover:bg-destructive/90',
        outline:
          'border border-input bg-background/75 shadow-[var(--elevation-1)] backdrop-blur-sm hover:border-primary/40 hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-[calc(var(--radius)-6px)] px-3',
        lg: 'h-11 rounded-[calc(var(--radius)-2px)] px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
