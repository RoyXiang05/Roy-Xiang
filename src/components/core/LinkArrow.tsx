import { AnchorHTMLAttributes, ReactNode } from 'react';

export interface LinkArrowProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
  external?: boolean;
  back?: boolean;
  size?: 'sm' | 'md' | 'lg';
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function LinkArrow({
  href,
  external = false,
  back = false,
  size = 'md',
  children,
  className = '',
  onClick,
  ...props
}: LinkArrowProps) {
  const sizeStyles = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm"
  };

  const linkClass = `group inline-flex items-center font-mono uppercase tracking-wide cursor-pointer transition-fast text-ink-900 hover:text-klein ${sizeStyles[size]} ${className}`;

  const renderContent = () => (
    <>
      {back && (
        <span className="mr-2 transition-transform duration-300 transform group-hover:-translate-x-1">
          ←
        </span>
      )}
      <span>{children}</span>
      {!back && !external && (
        <span className="ml-2 transition-transform duration-300 transform group-hover:translate-x-1">
          →
        </span>
      )}
      {!back && external && (
        <span className="ml-2.5 transition-transform duration-300 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          ↗
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={linkClass}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        onClick={onClick}
        {...props}
      >
        {renderContent()}
      </a>
    );
  }

  return (
    <span className={linkClass} onClick={onClick}>
      {renderContent()}
    </span>
  );
}
