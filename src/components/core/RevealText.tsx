import { CSSProperties, ElementType } from 'react';

export interface RevealTextProps {
  as?: ElementType;
  lines: string[];
  delay?: number;
  stagger?: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}

export default function RevealText({
  as: Component = 'div',
  lines,
  delay = 0,
  stagger = 90,
  duration = 900,
  className = '',
  style
}: RevealTextProps) {
  return (
    <Component className={`${className}`} style={style}>
      {lines.map((line, index) => {
        const lineDelay = delay + index * stagger;
        return (
          <span key={index} className="rx-reveal mb-1 block">
            <span
              className="rx-reveal-inner block"
              style={{
                animationDelay: `${lineDelay}ms`,
                animationDuration: `${duration}ms`
              }}
            >
              {line}
            </span>
          </span>
        );
      })}
    </Component>
  );
}
