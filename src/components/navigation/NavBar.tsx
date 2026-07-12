import { useEffect, useState, useLayoutEffect } from 'react';

export interface NavBarProps {
  items?: string[];
  active?: string;
  onSelect?: (item: string) => void;
  sticky?: boolean;
}

export default function NavBar({
  items = ['Works', 'About', 'Contact'],
  active,
  onSelect,
  sticky = true
}: NavBarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  // Update immediately and synchronously before painting when active page changes
  useLayoutEffect(() => {
    if (!sticky) return;
    setIsScrolled(window.scrollY > 20);
  }, [active, sticky]);

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
      className={`top-0 left-0 right-0 z-50 transition-editorial border-b border-transparent fixed py-5 ${
        isScrolled 
          ? 'bg-paper-50/92 backdrop-blur-md border-ink-150 shadow-sm' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Left wordmark */}
        <div 
          onClick={() => onSelect && onSelect('Works')}
          className="cursor-pointer group flex items-center select-none"
        >
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
