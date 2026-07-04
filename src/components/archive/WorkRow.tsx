export interface WorkRowProps {
  key?: any;
  number: number;
  title: string;
  year?: string | number;
  media?: string;
  first?: boolean;
  onClick?: () => void;
}

export default function WorkRow({
  number,
  title,
  year,
  media,
  first = false,
  onClick
}: WorkRowProps) {
  const pad = (num: number) => String(num).padStart(2, '0');

  return (
    <div
      onClick={onClick}
      className={`group w-full flex items-center justify-between py-5 border-b border-ink-150 cursor-pointer select-none transition-editorial ${
        first ? 'border-t border-t-ink-900' : ''
      }`}
    >
      <div className="flex items-center space-x-6 md:space-x-12 flex-1 min-w-0">
        {/* Numeral */}
        <span className="font-mono text-xs text-ink-400 group-hover:text-klein transition-fast flex-shrink-0">
          {pad(number)}
        </span>

        {/* Title & Media */}
        <div className="flex-1 min-w-0 md:flex md:items-center md:justify-between md:space-x-4">
          <h4 className="font-sans font-medium text-sm md:text-base text-ink-900 group-hover:text-klein group-hover:translate-x-2 transition-editorial truncate">
            {title}
          </h4>
          <span className="font-mono text-[10px] text-ink-400 group-hover:text-klein transition-fast uppercase tracking-wider block mt-0.5 md:mt-0">
            {media}
          </span>
        </div>
      </div>

      {/* Year & Arrow */}
      <div className="flex items-center space-x-6 pl-4 flex-shrink-0">
        {year && (
          <span className="font-mono text-xs text-ink-500">
            {year}
          </span>
        )}
        <span className="font-mono text-xs text-ink-300 group-hover:text-klein opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-editorial">
          →
        </span>
      </div>
    </div>
  );
}
