import { useEffect, useState, useRef, MouseEvent } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

interface LandingPageProps {
  onNavigate: (view: string) => void;
  onScrollDown: () => void;
}

export default function LandingPage({ onNavigate, onScrollDown }: LandingPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(800);

  useEffect(() => {
    setViewportHeight(window.innerHeight);
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Initial call
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Normalize coordinates around the center (-0.5 to 0.5)
    const x = (e.clientX - rect.left) / width - 0.5;
    const y = (e.clientY - rect.top) / height - 0.5;
    
    setCoords({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // Compute 3D rotation based on normalized mouse coords
  const rotateX = isHovered ? -coords.y * 30 : 0; // max 15 deg tilt
  const rotateY = isHovered ? coords.x * 30 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-screen bg-[#000000] text-white flex flex-col justify-between overflow-hidden select-none font-mono"
      style={{ perspective: 1000 }}
    >
      {/* 1. Header Navigation exactly matching the spacing and minimalist styling of the screenshot */}
      <header className="w-full px-6 md:px-12 pt-8 z-10">
        <div className="grid grid-cols-4 w-full text-[10px] md:text-xs tracking-[0.2em] uppercase font-bold text-[#aaaaaa] text-center">
          <div>
            <button 
              onClick={() => onScrollDown()}
              className="hover:text-white transition-colors duration-300 cursor-pointer"
            >
              HOME
            </button>
          </div>
          <div>
            <button 
              onClick={() => onScrollDown()}
              className="hover:text-white transition-colors duration-300 cursor-pointer"
            >
              WORKS
            </button>
          </div>
          <div>
            <button 
              onClick={() => onNavigate('About')}
              className="hover:text-white transition-colors duration-300 cursor-pointer"
            >
              ABOUT
            </button>
          </div>
          <div>
            <button 
              onClick={() => onNavigate('Contact')}
              className="hover:text-white transition-colors duration-300 cursor-pointer"
            >
              CONTACT
            </button>
          </div>
        </div>
      </header>

      {/* 2. Side Margins Text (Pointer events none so they don't block 3D hover) */}
      <div className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 -rotate-90 origin-left text-[10px] tracking-[0.3em] text-[#666666] whitespace-nowrap hidden sm:block pointer-events-none z-10 select-none">
        APPLIED AI WORKFLOW PORTFOLIO
      </div>

      {/* Right Margin - aligned on the right */}
      <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 rotate-90 origin-right text-[10px] tracking-[0.3em] text-[#666666] whitespace-nowrap hidden sm:block pointer-events-none z-10 select-none">
        ROY XIANG 2026
      </div>

      {/* 3. Center Piece: Interactive 3D Television (Spline Embed) */}
      <div 
        className="absolute inset-0 w-full h-full z-0 overflow-hidden transition-opacity duration-300"
        style={{ 
          pointerEvents: scrollY > 5 ? 'none' : 'auto',
          display: scrollY >= viewportHeight ? 'none' : 'block'
        }}
      >
        <iframe
          src="https://my.spline.design/tvportfoliommw14v2-HcR1nH3U3G55UXEMCQLpsRRV/"
          frameBorder="0"
          width="100%"
          className="w-full border-0 block"
          style={{ 
            height: 'calc(100% + 60px)',
            pointerEvents: scrollY > 5 ? 'none' : 'auto'
          }}
          allow="autoplay; fullscreen"
          title="Interactive 3D Retro TV Portfolio Model"
        />
      </div>

      {/* 5. Scroll Down Navigation */}
      <footer className="w-full pb-12 pt-4 flex flex-col items-center justify-center z-10 text-[9px] tracking-[0.3em] text-[#aaaaaa]">
        <button
          onClick={onScrollDown}
          className="flex flex-col items-center hover:text-white transition-colors duration-300 space-y-1 group cursor-pointer focus:outline-none pointer-events-auto"
        >
          <span>SCROLL DOWN</span>
          <motion.span
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="text-xs group-hover:scale-125 transition-transform"
          >
            ↓
          </motion.span>
        </button>
      </footer>
    </div>
  );
}
