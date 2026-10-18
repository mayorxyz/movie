import React from 'react';
import { isFeatureEnabled } from '../../config/features';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'disabled';
  size?: 'sm' | 'md' | 'lg';
  comingSoon?: boolean;
  featureFlag?: 'downloadButton' | 'streamButton';
}

export function Button({ variant = 'primary', size = 'md', comingSoon, featureFlag, className = '', children, ...props }: ButtonProps) {
  const isDisabled = comingSoon || (featureFlag && !isFeatureEnabled(featureFlag));
  
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]';
  
  const variantClasses = {
    primary: 'bg-[var(--color-accent)] text-[var(--color-base)] hover:bg-[var(--color-accent-hover)]',
    secondary: 'bg-[var(--color-surface-raised)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-text-muted)]',
    ghost: 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]',
    disabled: 'bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] cursor-not-allowed opacity-50',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const finalVariant = isDisabled ? 'disabled' : variant;

  return (
    <button
      className={`${baseClasses} ${variantClasses[finalVariant]} ${sizeClasses[size]} ${className}`}
      disabled={isDisabled}
      title={isDisabled ? 'Coming soon' : undefined}
      {...props}
    >
      {children}
      {isDisabled && <span className="ml-2 text-xs opacity-70">Coming soon</span>}
    </button>
  );
}
