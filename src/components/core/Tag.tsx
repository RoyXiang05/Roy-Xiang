import { ButtonHTMLAttributes, ReactNode } from 'react';

export interface TagProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  key?: any;
  selected?: boolean;
  children?: ReactNode;
  className?: string;
  onClick?: any;
}

export default function Tag({
  selected = false,
  children,
  className = '',
  ...props
}: TagProps) {
  const baseStyle = "px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider border transition-fast select-none cursor-pointer focus:outline-none";
  
  const stateStyle = selected
    ? "bg-klein border-klein text-paper-0"
    : "bg-transparent border-ink-150 text-ink-500 hover:border-klein hover:text-klein hover:bg-klein-ghost";

  return (
    <button
      className={`${baseStyle} ${stateStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
