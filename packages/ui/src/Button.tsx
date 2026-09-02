import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn.js';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
  children: ReactNode;
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'border-text-primary bg-text-primary text-surface-1 hover:bg-transparent hover:text-text-primary',
  secondary: 'border-rule bg-transparent text-text-primary hover:bg-surface-2',
  ghost: 'border-transparent bg-transparent text-text-secondary hover:text-text-primary',
};

const SIZE_CLASSES: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-6 px-2 text-xs gap-1.5',
  md: 'h-8 px-3 text-sm gap-2',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-control border font-collar font-medium',
        'focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-signal',
        'disabled:cursor-not-allowed disabled:opacity-40',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
