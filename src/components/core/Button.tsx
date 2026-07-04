import { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'klein' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  arrow?: boolean;
  children?: ReactNode;
  className?: string;
  onClick?: any;
  type?: any;
  disabled?: any;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  arrow = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyle = "font-mono text-xs uppercase tracking-wide select-none transition-fast active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-klein inline-flex items-center justify-center border cursor-pointer";
  
  const variantStyles = {
    primary: "bg-ink-900 border-ink-900 text-paper-50 hover:bg-klein hover:border-klein hover:text-paper-0",
    klein: "bg-klein border-klein text-paper-0 hover:bg-klein-hover hover:border-klein-hover",
    ghost: "bg-transparent border-ink-150 text-ink-900 hover:border-klein hover:text-klein"
  };

  const sizeStyles = {
    sm: "px-4 py-2 text-[10px]",
    md: "px-6 py-3 text-xs",
    lg: "px-8 py-4 text-sm"
  };

  return (
    <button
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      <span>{children}</span>
      {arrow && <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>}
    </button>
  );
}
