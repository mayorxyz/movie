import React from 'react';
import { isFeatureEnabled } from '../../config/features';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'disabled';
  size?: 'sm' | 'md' | 'lg';
  comingSoon?: boolean;
  featureFlag?: 'downloadButton' | 'streamButton';
}

export function Button({
  variant = 'primary',
  size = 'md',
  comingSoon,
  featureFlag,
  className = '',
  children,
  disabled,
  title,
  type = 'button',
  ...props
}: ButtonProps) {
  const isDisabled = Boolean(comingSoon || (featureFlag && !isFeatureEnabled(featureFlag)));

  const baseClasses =
    'inline-flex items-center justify-center gap-1.5 md:gap-2 rounded-full font-semibold whitespace-nowrap select-none transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100';

  const variantClasses = {
    primary: 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]',
    secondary: 'bg-[var(--color-surface-raised)] text-[var(--color-text)] hover:bg-[var(--color-border)]',
    ghost: 'bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]',
    disabled: 'bg-[var(--color-surface)] text-[var(--color-text-muted)]',
  };

  const sizeClasses = {
    sm: 'h-8 md:h-9 px-3 md:px-4 text-[12px] md:text-[13px]',
    md: 'h-9 md:h-10 px-4 md:px-5 text-[13px] md:text-[14px]',
    lg: 'h-10 md:h-11 px-5 md:px-7 text-[14px] md:text-[15px]',
  };

  const finalVariant = isDisabled ? 'disabled' : variant;

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[finalVariant]} ${sizeClasses[size]} ${className}`}
      disabled={isDisabled || disabled}
      title={isDisabled ? 'Coming soon' : title}
      {...props}
    >
      {children}
      {isDisabled && (
        <span className="ml-0.5 text-[10px] md:text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-faint)]">
          Soon
        </span>
      )}
    </button>
  );
}