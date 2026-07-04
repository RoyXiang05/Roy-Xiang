export interface IndexLabelProps {
  number?: number;
  text?: string;
  tone?: 'muted' | 'ink' | 'klein' | 'onInk';
  track?: 'wide' | 'wider' | 'widest';
  className?: string;
}

export default function IndexLabel({
  number,
  text = '',
  tone = 'muted',
  track = 'wide',
  className = ''
}: IndexLabelProps) {
  const toneClasses = {
    muted: "text-ink-500",
    ink: "text-ink-900",
    klein: "text-klein",
    onInk: "text-paper-100"
  };

  const trackClasses = {
    wide: "tracking-wide",
    wider: "tracking-wider",
    widest: "tracking-widest"
  };

  const pad = (num: number) => String(num).padStart(2, '0');

  const formattedLabel = number !== undefined 
    ? `NO. ${pad(number)} — ${text.toUpperCase()}`
    : text.toUpperCase();

  return (
    <span className={`font-mono text-[11px] uppercase ${toneClasses[tone]} ${trackClasses[track]} ${className}`}>
      {formattedLabel}
    </span>
  );
}
