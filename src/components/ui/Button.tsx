import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'light';
type ButtonSize = 'sm' | 'md' | 'lg';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-bamboo-900 text-cream-50 shadow-[0_8px_22px_-12px_rgba(7,28,20,0.55)] hover:bg-bamboo-800 active:bg-bamboo-950',
  secondary:
    'bg-cream-100 text-ink-900 border border-ink-950/10 hover:bg-cream-200 active:bg-cream-300',
  outline:
    'bg-transparent text-bamboo-800 border border-bamboo-800/20 hover:bg-bamboo-50 active:bg-bamboo-100',
  ghost: 'bg-transparent text-ink-700 hover:bg-ink-950/5 active:bg-ink-950/8',
  danger:
    'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 active:bg-red-200',
  light:
    'bg-cream-50 text-bamboo-900 shadow-[0_10px_30px_-14px_rgba(0,0,0,0.5)] hover:bg-white active:bg-cream-100',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3.5 text-[0.8125rem] gap-1.5',
  md: 'min-h-11 px-5 text-sm gap-2',
  lg: 'min-h-[3.25rem] px-6 text-[0.9375rem] gap-2.5',
};

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  full = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  className?: string;
} = {}): string {
  return cn(
    'inline-flex select-none items-center justify-center rounded-xl font-semibold transition-all duration-150',
    'hover:-translate-y-0.5 active:translate-y-0.5',
    'disabled:pointer-events-none disabled:opacity-45',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bamboo-500',
    variants[variant],
    sizes[size],
    full && 'w-full',
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  loading?: boolean;
  children: ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'md',
  full = false,
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonClasses({ variant, size, full, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span
          className="h-4 w-4 animate-[spin_0.7s_linear_infinite] rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : null}
      {children}
    </button>
  );
}
