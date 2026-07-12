import { Work } from '../../data';

export const renderSchematic = (type: Work['schematicType']) => {
    switch (type) {
      case 'platform':
        return (
          <svg className="w-full h-full text-ink-300" viewBox="0 0 400 300" fill="none" stroke="currentColor" strokeWidth="1">
            {/* Main window boundary */}
            <rect x="20" y="20" width="360" height="260" rx="0" strokeWidth="1.5" />
            <line x1="20" y1="50" x2="380" y2="50" strokeWidth="1.5" />
            
            {/* Header circles */}
            <circle cx="35" cy="35" r="4" fill="currentColor" />
            <circle cx="50" cy="35" r="4" />
            <circle cx="65" cy="35" r="4" />
            <line x1="120" y1="35" x2="280" y2="35" strokeDasharray="3 3" />
            
            {/* Left sidebar / tabs */}
            <rect x="40" y="70" width="80" height="180" strokeDasharray="2 2" />
            <line x1="50" y1="90" x2="110" y2="90" />
            <line x1="50" y1="120" x2="110" y2="120" stroke="currentColor" strokeWidth="2" className="text-klein" />
            <line x1="50" y1="150" x2="110" y2="150" />
            
            {/* Right main portal layout */}
            <rect x="140" y="70" width="220" height="80" rx="0" />
            <text x="155" y="95" className="font-mono text-[9px] fill-ink-900" stroke="none">SUPPLIER REGISTRATION</text>
            <line x1="155" y1="110" x2="320" y2="110" />
            <line x1="155" y1="125" x2="260" y2="125" strokeDasharray="4 2" />
            
            {/* Verification ticks */}
            <circle cx="160" cy="180" r="10" className="text-klein" fill="none" />
            <path d="M156 180 L159 183 L164 177" className="text-klein" />
            <line x1="180" y1="180" x2="260" y2="180" />
            
            <circle cx="290" cy="180" r="10" />
            <line x1="310" y1="180" x2="340" y2="180" />
          </svg>
        );

      case 'workflow':
        return (
          <svg className="w-full h-full text-ink-300" viewBox="0 0 400 300" fill="none" stroke="currentColor" strokeWidth="1">
            {/* Workflow steps */}
            <g className="text-klein">
              <rect x="25" y="110" width="90" height="80" rx="0" strokeWidth="1.5" />
              <text x="35" y="145" className="font-mono text-[9px] fill-klein" stroke="none">01 / GEN-AI</text>
              <text x="35" y="160" className="font-mono text-[8px] fill-ink-500" stroke="none">PROMPT SOP</text>
              <circle cx="70" cy="110" r="4" fill="currentColor" />
            </g>

            <path d="M115 150 L145 150" strokeWidth="1.5" strokeDasharray="3 3" />
            <polygon points="145,150 139,146 139,154" fill="currentColor" />

            <g>
              <rect x="155" y="110" width="90" height="80" rx="0" strokeWidth="1.5" />
              <text x="165" y="145" className="font-mono text-[9px] fill-ink-900" stroke="none">02 / HYBRID</text>
              <text x="165" y="160" className="font-mono text-[8px] fill-ink-500" stroke="none">PSD COMPOSITE</text>
              <circle cx="200" cy="110" r="4" fill="currentColor" />
            </g>

            <path d="M245 150 L275 150" strokeWidth="1.5" strokeDasharray="3 3" />
            <polygon points="275,150 269,146 269,154" fill="currentColor" />

            <g>
              <rect x="285" y="110" width="90" height="80" rx="0" strokeWidth="1.5" />
              <text x="295" y="145" className="font-mono text-[9px] fill-ink-900" stroke="none">03 / SOCIAL</text>
              <text x="295" y="160" className="font-mono text-[8px] fill-ink-500" stroke="none">LINKEDIN GTM</text>
              <circle cx="330" cy="110" r="4" fill="currentColor" />
            </g>

            {/* Grid structure lines */}
            <line x1="20" y1="40" x2="380" y2="40" />
            <line x1="20" y1="260" x2="380" y2="260" />
            <text x="30" y="32" className="font-mono text-[8px] fill-ink-400" stroke="none">FLOW PIPELINE — REGIONAL SOPS</text>
            <text x="320" y="275" className="font-mono text-[8px] fill-ink-400" stroke="none">EFFICIENCY +50%</text>
          </svg>
        );

      case 'campaign':
        return (
          <svg className="w-full h-full text-ink-300" viewBox="0 0 400 300" fill="none" stroke="currentColor" strokeWidth="1">
            {/* Multi-channel Funnel circles */}
            <circle cx="200" cy="150" r="110" strokeWidth="1.5" />
            <circle cx="200" cy="150" r="75" strokeDasharray="4 2" />
            <circle cx="200" cy="150" r="45" className="text-klein" strokeWidth="1.5" />
            
            {/* Lines from center to outer edge */}
            <line x1="200" y1="150" x2="200" y2="30" strokeDasharray="2 2" />
            <line x1="200" y1="150" x2="310" y2="150" strokeDasharray="2 2" />
            <line x1="200" y1="150" x2="120" y2="220" strokeDasharray="2 2" />
            
            {/* Target nodes and captions */}
            <g className="text-klein" fill="currentColor">
              <circle cx="200" cy="40" r="4" />
              <text x="212" y="44" className="font-mono text-[8px] fill-ink-900" stroke="none">BYTEDANCE (50B+)</text>
            </g>
            
            <g fill="currentColor">
              <circle cx="310" cy="150" r="4" />
              <text x="320" y="154" className="font-mono text-[8px] fill-ink-900" stroke="none">SEA CAMPAIGNS</text>
            </g>
            
            <g fill="currentColor">
              <circle cx="120" cy="220" r="4" />
              <text x="60" y="235" className="font-mono text-[8px] fill-ink-900" stroke="none">XIAOHONGSHU INTEGRATION</text>
            </g>

            {/* Target Center */}
            <circle cx="200" cy="150" r="5" fill="#002FA7" className="text-klein" />
            <text x="212" y="154" className="font-mono text-[8px] fill-klein font-bold" stroke="none">CORE GTM</text>
          </svg>
        );

      case 'analytics':
        return (
          <svg className="w-full h-full text-ink-300" viewBox="0 0 400 300" fill="none" stroke="currentColor" strokeWidth="1">
            {/* Modular dashboard widget grids */}
            <rect x="20" y="20" width="170" height="110" strokeWidth="1.5" />
            <line x1="20" y1="50" x2="190" y2="50" />
            <text x="30" y="40" className="font-mono text-[8px] fill-ink-500" stroke="none">CONVERSION METRICS</text>
            <text x="30" y="90" className="font-sans text-2xl fill-klein font-bold text-klein" stroke="none">+18%</text>
            <text x="30" y="110" className="font-mono text-[8px] fill-ink-400" stroke="none">MONTHLY GROWTH INDEX</text>

            <rect x="210" y="20" width="170" height="110" strokeWidth="1.5" />
            <line x1="210" y1="50" x2="380" y2="50" />
            <text x="220" y="40" className="font-mono text-[8px] fill-ink-500" stroke="none">SAAS RETENTION INDEX</text>
            <text x="220" y="90" className="font-sans text-2xl fill-ink-900 font-bold" stroke="none">85%</text>
            <text x="220" y="110" className="font-mono text-[8px] fill-ink-400" stroke="none">ANNUAL ENTERPRISE RENEWALS</text>

            {/* Bottom Chart widget */}
            <rect x="20" y="150" width="360" height="130" strokeWidth="1.5" />
            <text x="35" y="172" className="font-mono text-[8px] fill-ink-900" stroke="none">A/B TESTING TIMELINE (CRO)</text>
            <line x1="35" y1="250" x2="365" y2="250" strokeWidth="1.5" />
            <line x1="35" y1="185" x2="35" y2="250" />
            
            {/* Chart lines */}
            <path d="M35 240 L100 210 L180 225 L250 175 L320 190 L365 160" strokeWidth="2" strokeLinecap="round" />
            <path d="M35 230 L100 220 L180 195 L250 190 L320 165 L365 155" strokeWidth="1.5" strokeDasharray="3 3" className="text-klein" />
            
            <circle cx="250" cy="175" r="3.5" fill="#0A0A0A" />
            <circle cx="320" cy="165" r="3.5" fill="#002FA7" className="text-klein" />
          </svg>
        );

      case 'exhibition':
        return (
          <svg className="w-full h-full text-ink-300" viewBox="0 0 400 300" fill="none" stroke="currentColor" strokeWidth="1">
            {/* ADIPEC double deck architectural isometric wireframe */}
            {/* ISO projection floor */}
            <path d="M200 40 L360 120 L200 200 L40 120 Z" strokeWidth="1.5" />
            <path d="M200 120 L360 200 L200 280 L40 200 Z" strokeWidth="1.5" strokeDasharray="2 2" />
            
            {/* Vertical columns linking floors */}
            <line x1="40" y1="120" x2="40" y2="200" strokeWidth="1.5" />
            <line x1="200" y1="40" x2="200" y2="120" strokeWidth="1.5" />
            <line x1="360" y1="120" x2="360" y2="200" strokeWidth="1.5" />
            <line x1="200" y1="200" x2="200" y2="280" strokeWidth="1.5" strokeDasharray="2 2" />

            {/* Dynamic screen display zone */}
            <g className="text-klein">
              <polygon points="120,120 180,90 180,130 120,160" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
              <text x="135" y="115" className="font-mono text-[7px] fill-klein" stroke="none" transform="rotate(11 135 115)">DIGITAL WALL</text>
            </g>

            {/* VIP lounge area details */}
            <path d="M240 140 L300 110 L320 120 L260 150 Z" fill="#0A0A0A" fillOpacity="0.1" />
            <text x="265" y="140" className="font-mono text-[7px] fill-ink-900" stroke="none">VIP ZONE</text>

            {/* Direction labels */}
            <text x="35" y="270" className="font-mono text-[9px] fill-ink-900" stroke="none">ADIPEC 2025</text>
            <text x="280" y="270" className="font-mono text-[8px] fill-ink-400" stroke="none">SCALE: 160,000+ ATTD</text>
          </svg>
        );

      case 'mobile':
        return (
          <svg className="w-full h-full text-ink-300" viewBox="0 0 400 300" fill="none" stroke="currentColor" strokeWidth="1">
            {/* Mobile phone bezel outline */}
            <rect x="140" y="20" width="120" height="260" rx="16" strokeWidth="2.5" />
            <rect x="146" y="26" width="108" height="248" rx="12" />
            
            {/* Top notch speaker */}
            <rect x="180" y="32" width="40" height="6" rx="3" fill="currentColor" />
            
            {/* Luxury shoe silhouette mockup (minimalist stitch lines) */}
            <g className="text-klein">
              <path d="M165 145 C165 130, 185 110, 210 110 C220 110, 235 125, 235 135 L235 155 C235 155, 215 158, 205 158 C185 158, 165 155, 165 145 Z" strokeWidth="1.5" />
              <path d="M165 148 L235 148" strokeDasharray="2 2" />
              <path d="M210 110 L205 148" strokeDasharray="2 2" />
            </g>
            
            {/* UI details inside screen */}
            <text x="156" y="65" className="font-sans font-bold text-[9px] fill-ink-900" stroke="none">JOHN LOBB</text>
            <text x="156" y="77" className="font-mono text-[6px] fill-ink-500" stroke="none">BESPOKE COLLECTION</text>
            <line x1="156" y1="85" x2="244" y2="85" />

            <rect x="156" y="175" width="88" height="25" rx="0" fill="#0A0A0A" />
            <text x="172" y="190" className="font-mono text-[7px] fill-paper-50" stroke="none">BOOK FITTING</text>
            
            <circle cx="200" cy="225" r="12" fill="none" className="text-klein" />
            <text x="198" y="228" className="font-sans text-[8px] fill-klein font-bold" stroke="none">1:1</text>
            <text x="156" y="250" className="font-mono text-[5px] fill-ink-400" stroke="none">DIGITAL CONCIERGE ENABLED</text>
          </svg>
        );

      default:
        return (
          <div className="w-full h-full bg-ink-100 flex items-center justify-center font-mono text-[9px] text-ink-400 uppercase tracking-widest">
            Schematic Archive
          </div>
        );
    }
};

export interface WorkCardProps {
  key?: any;
  work: Work;
  onClick?: () => void;
  ratio?: string;
}

export default function WorkCard({
  work,
  onClick,
  ratio = "aspect-[4/3]"
}: WorkCardProps) {
  const pad = (num: number) => String(num).padStart(2, '0');

  return (
    <div
      onClick={onClick}
      className="group flex flex-col h-full bg-paper-50 border border-ink-150 overflow-hidden cursor-pointer select-none"
    >
      {/* Schematic canvas boundary */}
      <div className={`relative ${ratio} w-full bg-paper-0 border-b border-ink-150 flex items-center justify-center overflow-hidden`}>
        {/* Schematic layout */}
        <div className="w-full h-full p-4 flex items-center justify-center transition-editorial group-hover:scale-[1.03]">
          {renderSchematic(work.schematicType)}
        </div>

        {/* Dynamic Category Index Tag */}
        <div className="absolute top-3 left-3 bg-ink-900 text-paper-0 font-mono text-[8px] uppercase tracking-widest px-2 py-0.5 z-10 select-none group-hover:bg-klein transition-editorial">
          {pad(work.number)}
        </div>
      </div>

      {/* Caption info below */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-paper-50 transition-editorial group-hover:bg-paper-100">
        <div className="mb-2">
          <span className="font-mono text-[9px] uppercase tracking-widest text-ink-500 block mb-1">
            {work.subCategory.toUpperCase()}
          </span>
          <h4 className="font-sans font-medium text-sm md:text-base text-ink-900 leading-snug truncate">
            {work.title}
          </h4>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-ink-150/50 mt-1 font-mono text-[10px] text-ink-400">
          <span className="uppercase">{work.tags[0]}</span>
          <span className="text-ink-900 font-medium">{work.period}</span>
        </div>
      </div>
    </div>
  );
}
