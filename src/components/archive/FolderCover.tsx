import React, { useState, useRef, CSSProperties, MouseEvent } from 'react';

export interface FolderCoverProps {
  key?: any;
  number: number;
  title: string;
  subtitle?: string;
  tone?: 'ink' | 'klein' | 'paper';
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  active?: boolean;
  details?: string[];
  hidePaper?: boolean;
  animPhase?: 'idle' | 'tucked' | 'pull' | 'zoom' | 'reverse-zoom' | 'reverse-pull';
  isSiblingAnimating?: boolean;
}

export default function FolderCover({
  number,
  title,
  subtitle,
  tone = 'paper',
  onClick,
  active = false,
  details = [],
  hidePaper = false,
  animPhase = 'idle',
  isSiblingAnimating = false
}: FolderCoverProps) {
  const pad = (num: number) => String(num).padStart(2, '0');

  const [tiltStyle, setTiltStyle] = useState<CSSProperties>({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
  });
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isSiblingAnimating) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within element
    const y = e.clientY - rect.top;  // y position within element
    
    // Normalize coordinates: center is (0,0), range is -1 to 1
    const normalizedX = (x / rect.width) * 2 - 1;
    const normalizedY = (y / rect.height) * 2 - 1;

    // Precise metallic highlight coordinates matching the front flap
    const frontFlapEl = containerRef.current.querySelector('.front-flap');
    if (frontFlapEl) {
      const flapRect = frontFlapEl.getBoundingClientRect();
      const posX = ((e.clientX - flapRect.left) / flapRect.width) * 100;
      const posY = ((e.clientY - flapRect.top) / flapRect.height) * 100;
      setMousePos({ x: posX, y: posY });
    } else {
      const posX = (x / rect.width) * 100;
      const posY = (y / rect.height) * 100;
      setMousePos({ x: posX, y: posY });
    }
    
    // Set max tilt angles (X controls tilt around horizontal axis, Y around vertical axis)
    const maxTiltX = 11; // degrees (enhanced by ~30%)
    const maxTiltY = 11; // degrees (enhanced by ~30%)
    
    // Smooth tilt calculations
    const rotateX = -normalizedY * maxTiltX;
    const rotateY = normalizedX * maxTiltY;
    
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`,
      transition: 'transform 0.1s ease-out',
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
    });
  };

  // Themes mapping
  const themes = {
    klein: {
      backBg: "bg-klein border-klein",
      frontBg: active 
        ? "bg-klein border-klein text-paper-0 shadow-lg" 
        : "bg-[#0A268A] border-klein text-paper-50 group-hover:bg-klein group-hover:text-paper-0",
      tabBg: active ? "bg-klein" : "bg-[#0A268A] group-hover:bg-klein",
      tabText: "text-paper-100/80",
      frontBorder: active ? "border-klein-active" : "border-[#002FA7]/30",
      paperText: "text-klein",
      paperBorder: "border-klein-tint border-l-4 border-l-klein"
    },
    ink: {
      backBg: "bg-ink-800 border-ink-800",
      frontBg: active 
        ? "bg-ink-900 border-ink-900 text-paper-0 shadow-lg" 
        : "bg-ink-800 border-ink-800 text-paper-100 group-hover:bg-ink-900 group-hover:text-paper-0",
      tabBg: active ? "bg-ink-900" : "bg-ink-800 group-hover:bg-ink-900",
      tabText: "text-paper-100/70",
      frontBorder: "border-ink-700",
      paperText: "text-ink-800",
      paperBorder: "border-ink-150 border-l-4 border-l-ink-800"
    },
    paper: {
      backBg: "bg-ink-150 border-ink-200",
      frontBg: active 
        ? "bg-ink-100 border-ink-500 text-ink-900 ring-1 ring-ink-500 shadow-lg" 
        : "bg-ink-150 border-ink-200 text-ink-700 group-hover:bg-ink-100 group-hover:border-ink-400 group-hover:text-ink-900",
      tabBg: active ? "bg-ink-100" : "bg-ink-150 group-hover:bg-ink-100",
      tabText: "text-ink-500",
      frontBorder: active ? "border-ink-500" : "border-ink-200",
      paperText: "text-ink-800",
      paperBorder: "border-ink-150 border-l-4 border-l-klein"
    }
  };

  const currentTheme = themes[tone] || themes.paper;

  let paperStyle: React.CSSProperties = {};
  let paperOpacityClass = '';

  if (animPhase && animPhase !== 'idle') {
    if (animPhase === 'tucked') {
      paperStyle = {
        transform: 'translateY(-70px) rotate(-1.5deg)',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      };
    } else if (animPhase === 'pull') {
      paperStyle = {
        transform: 'translateY(-210px) rotate(-1.5deg)',
        transition: 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)',
      };
    } else if (animPhase === 'zoom' || animPhase === 'reverse-zoom') {
      paperStyle = {
        transform: 'translateY(-210px) rotate(-1.5deg)',
        transition: 'none',
      };
      paperOpacityClass = 'opacity-0 pointer-events-none';
    } else if (animPhase === 'reverse-pull') {
      paperStyle = {
        transform: 'translateY(-70px) rotate(-1.5deg)',
        transition: 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)',
      };
    }
  }

  const isAnimating = animPhase && animPhase !== 'idle';
  const shouldDisableHover = isAnimating || isSiblingAnimating;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={(hidePaper || shouldDisableHover) ? { transform: 'none', transition: 'none' } : tiltStyle}
      className={`${shouldDisableHover ? '' : 'group'} relative flex flex-col cursor-pointer select-none h-[368px] justify-end pt-[70px] overflow-visible`}
      id={`folder-cover-${number}`}
    >
      {/* 1. Back Flap & Tab */}
      <div className="absolute inset-x-0 bottom-0 top-[70px] flex flex-col justify-end pointer-events-none z-[5]">
        {/* Tab */}
        <div className="flex">
          <div
            className={`h-[41px] w-28 text-[9px] font-mono uppercase tracking-widest flex items-center px-4 rounded-t-sm transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] border-t border-l border-r ${
              currentTheme.tabBg
            } ${currentTheme.tabText} ${tone === 'paper' ? 'border-ink-150/60' : 'border-transparent'}`}
          >
            TAB.{pad(number)}
          </div>
        </div>
        {/* Back Body */}
        <div className={`w-full h-[208px] border rounded-b-md ${currentTheme.backBg}`} />
      </div>

      {/* 2. Paper Insert Document */}
      <div
        className={`absolute left-2.5 right-2.5 bottom-3 h-[208px] bg-paper-0 shadow-md p-4 flex flex-col justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none z-10 rounded-sm border ${
          currentTheme.paperBorder
        } ${
          animPhase && animPhase !== 'idle'
            ? ''
            : (active 
              ? 'translate-y-[-24px] rotate-[-0.5deg]' 
              : 'translate-y-1 group-hover:translate-y-[-70px] group-hover:rotate-[-1.5deg] group-hover:scale-[1.01] group-hover:shadow-xl')
        } ${
          hidePaper ? 'opacity-0 pointer-events-none' : ''
        } ${paperOpacityClass}`}
        style={paperStyle}
      >
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-sm"
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: '8px 8px'
          }}
        />

        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            {/* Document Header */}
            <div className="flex items-center justify-between border-b border-ink-100 pb-1.5 mb-2">
              <span className="font-mono text-[8px] uppercase tracking-wider opacity-60">
                ARCHIVE DOSSIER // VOL.{pad(number)}
              </span>
              <span className="font-mono text-[8px] uppercase tracking-widest opacity-80 text-klein font-bold">
                {active ? 'CLASSIFIED' : 'RESTRICTED'}
              </span>
            </div>

            {/* Document Content */}
            <div className="flex flex-col space-y-1.5">
              {details.length > 0 ? (
                details.map((detail, idx) => (
                  <div key={idx} className="flex items-start space-x-1.5">
                    <span className="font-mono text-[8px] opacity-40 mt-0.5">•</span>
                    <span className="font-sans text-[10px] leading-tight font-medium text-ink-700 tracking-tight truncate max-w-[210px]">
                      {detail}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col space-y-1.5">
                  <div className="h-1.5 w-24 bg-ink-100 rounded-sm" />
                  <div className="h-1.5 w-16 bg-ink-100 rounded-sm" />
                  <div className="h-1.5 w-20 bg-ink-100 rounded-sm" />
                </div>
              )}
            </div>
          </div>

          {/* Barcode and Stamp */}
          <div className="flex items-end justify-between border-t border-ink-100 pt-1.5">
            <span className="font-mono text-[8px] opacity-40">
              SYS_REF: {2821 + number}-X
            </span>
            {/* Custom high-fidelity barcode */}
            <div className="flex items-end space-x-[1px] h-4 opacity-40">
              <div className="w-[1px] h-full bg-ink-900" />
              <div className="w-[2px] h-full bg-ink-900" />
              <div className="w-[1px] h-full bg-ink-900" />
              <div className="w-[3px] h-full bg-ink-900" />
              <div className="w-[1px] h-full bg-ink-900" />
              <div className="w-[2px] h-full bg-ink-900" />
              <div className="w-[1px] h-full bg-ink-900" />
              <div className="w-[4px] h-full bg-ink-900" />
              <div className="w-[1px] h-full bg-ink-900" />
              <div className="w-[2px] h-full bg-ink-900" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Front Flap / Cover */}
      <div
        className={`front-flap absolute inset-x-0 bottom-0 h-[185px] p-5 flex flex-col justify-between border rounded-b-md transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-[25] transform translate-y-0 overflow-hidden ${
          currentTheme.frontBg
        } ${currentTheme.frontBorder}`}
      >
        {/* Metallic interactive shine highlight */}
        <div 
          className={`absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${
            tone === 'paper' ? 'mix-blend-overlay' : 'mix-blend-screen'
          }`}
          style={{
            background: tone === 'paper' ? `
              radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255, 255, 255, 0.8) 0%, rgba(240, 242, 248, 0.2) 40%, transparent 70%),
              linear-gradient(115deg, transparent ${mousePos.x - 18}%, rgba(255, 255, 255, 0.5) ${mousePos.x}%, transparent ${mousePos.x + 18}%)
            ` : `
              radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255, 255, 255, 0.35) 0%, rgba(230, 235, 245, 0.12) 40%, transparent 70%),
              linear-gradient(115deg, transparent ${mousePos.x - 20}%, rgba(225, 230, 240, 0.25) ${mousePos.x}%, transparent ${mousePos.x + 20}%)
            `
          }}
        />

        <div className="relative z-10 flex items-start justify-between">
          <span className="font-mono text-[9px] uppercase tracking-widest opacity-80 leading-none">
            {subtitle || 'ARCHIVE FILE'}
          </span>
          <span className="font-sans font-bold text-4xl md:text-5xl tracking-tighter opacity-15 leading-none">
            {pad(number)}
          </span>
        </div>

        <div className="relative z-10">
          <h3 className="font-sans font-semibold text-base md:text-lg tracking-tight leading-snug uppercase">
            {title}
          </h3>
          <div className="flex items-center space-x-1.5 mt-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-klein-active animate-pulse' : 'bg-ink-300'}`} />
            <span className="font-mono text-[8px] uppercase tracking-wider opacity-60">
              {active ? 'ACTIVE VIEW' : 'INDEXED'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
