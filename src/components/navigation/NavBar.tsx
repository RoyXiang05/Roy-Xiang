import { useEffect, useState } from 'react';

export interface NavBarProps {
  items?: string[];
  active?: string;
  onSelect?: (item: string) => void;
  sticky?: boolean;
}

export default function NavBar({
  items = ['Works', 'Profile', 'Contact'],
  active,
  onSelect,
  sticky = true
}: NavBarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!sticky) return;
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sticky]);

  const pad = (num: number) => String(num).padStart(2, '0');

  return (
    <nav
      className={`top-0 left-0 right-0 z-50 transition-editorial border-b border-transparent ${
        sticky ? 'sticky' : 'relative'
      } ${
        isScrolled 
          ? 'bg-paper-50/92 backdrop-blur-md border-ink-150 py-4 shadow-sm' 
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Left wordmark */}
        <div 
          onClick={() => onSelect && onSelect('Works')}
          className="cursor-pointer group flex items-center space-x-3 select-none"
        >
          <span className="font-mono text-xs font-bold text-paper-0 bg-ink-900 px-1.5 py-0.5 tracking-widest group-hover:bg-klein transition-fast">
            RX
          </span>
          <span className="font-sans text-sm font-bold uppercase tracking-tight text-ink-900 group-hover:text-klein transition-fast">
            Roy Xiang
          </span>
        </div>

        {/* Right nav list */}
        <ul className="flex items-center space-x-6 md:space-x-8">
          {items.map((item, idx) => {
            const isSelected = active === item;
            return (
              <li key={item}>
                <button
                  onClick={() => onSelect && onSelect(item)}
                  className={`group inline-flex items-center font-mono text-[11px] uppercase tracking-wider cursor-pointer transition-fast select-none focus:outline-none ${
                    isSelected ? 'text-klein' : 'text-ink-500 hover:text-klein'
                  }`}
                >
                  <span className="text-[9px] text-ink-300 group-hover:text-klein transition-fast mr-1.5">
                    {pad(idx + 1)}
                  </span>
                  <span>{item}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
