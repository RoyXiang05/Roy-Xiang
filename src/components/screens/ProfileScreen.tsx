import { useState } from 'react';
import RevealText from '../core/RevealText';
import IndexLabel from '../core/IndexLabel';
import Button from '../core/Button';
import { PROFILE, CAPABILITIES, TIMELINE } from '../../data';

export default function ProfileScreen() {
  const [showResume, setShowResume] = useState(false);
  const [expandedCapability, setExpandedCapability] = useState<number | null>(null);

  const toggleCapability = (idx: number) => {
    setExpandedCapability(expandedCapability === idx ? null : idx);
  };

  const pad = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-12">
      {/* Profile Header */}
      <div className="mb-16">
        <IndexLabel number={2} text="Biography / Career Overview" tone="klein" className="mb-4 inline-block" />
        <RevealText
          as="h1"
          lines={["Professional Profile", "Roy Xiang"]}
          className="font-sans font-bold text-4xl md:text-6xl tracking-tighter text-ink-900 leading-none mb-6"
        />
        <h2 className="font-sans text-lg md:text-2xl text-klein font-medium max-w-3xl leading-snug">
          {PROFILE.headline}
        </h2>
      </div>

      {/* Biography and Resume Call-to-Action */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-16 border-b border-ink-150 pb-16">
        <div className="lg:col-span-8 font-sans text-sm md:text-base text-ink-700 leading-relaxed space-y-6">
          {PROFILE.bio.split('\n\n').map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
          <div className="pt-4 flex flex-wrap gap-4">
            <Button variant="primary" arrow onClick={() => setShowResume(true)}>
              Inspect Printable Resume Dossier
            </Button>
            <a href={`mailto:${PROFILE.email}`} className="inline-block">
              <Button variant="ghost">Inquire for Engagement</Button>
            </a>
          </div>
        </div>

        {/* Core Quick Meta Card */}
        <div className="lg:col-span-4 border border-ink-900 p-6 bg-paper-100 space-y-6 font-mono text-xs">
          <h4 className="font-mono font-bold text-ink-900 uppercase tracking-widest text-[10px] border-b border-ink-900 pb-2">
            — dossier metadata
          </h4>
          <div className="space-y-4">
            <div>
              <span className="text-ink-400 block uppercase tracking-wider mb-0.5">CURRENT LOCATION</span>
              <span className="text-ink-900 font-medium uppercase">{PROFILE.location}</span>
            </div>
            <div>
              <span className="text-ink-400 block uppercase tracking-wider mb-0.5">FOCUS AREAS</span>
              <span className="text-ink-900 font-medium uppercase">AI WORKFLOWS // SAAS GROWTH // B2B GTM</span>
            </div>
            <div>
              <span className="text-ink-400 block uppercase tracking-wider mb-0.5">LANGUAGES SPOKEN</span>
              <span className="text-ink-900 font-medium uppercase">MANDARIN (NATIVE) // ENGLISH (PROFESSIONAL)</span>
            </div>
            <div>
              <span className="text-ink-400 block uppercase tracking-wider mb-0.5">EXPERIENCE</span>
              <span className="text-ink-900 font-medium uppercase">6+ YEARS IN CROSS-MARKET GROWTH</span>
            </div>
          </div>
        </div>
      </div>

      {/* Capabilities Section */}
      <div className="mb-16 border-b border-ink-150 pb-16">
        <div className="mb-10">
          <h3 className="font-sans font-bold text-xs uppercase tracking-widest text-ink-500 mb-2">
            — CAPABILITY DECK
          </h3>
          <p className="font-sans text-sm text-ink-600 max-w-xl">
            Roy operates at the intersection of business strategy and high-efficiency creative technology. Click a capability to expand details.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CAPABILITIES.map((cap, idx) => {
            const isExpanded = expandedCapability === idx;
            return (
              <div
                key={idx}
                onClick={() => toggleCapability(idx)}
                className={`border p-6 transition-editorial cursor-pointer select-none ${
                  isExpanded 
                    ? 'border-klein bg-klein-tint/15' 
                    : 'border-ink-150 bg-paper-50 hover:border-ink-500'
                }`}
              >
                <div className="flex items-start justify-between mb-6">
                  <span className={`font-mono text-[9px] uppercase tracking-widest ${isExpanded ? 'text-klein' : 'text-ink-400'}`}>
                    CAP.{pad(idx + 1)}
                  </span>
                  <span className={`font-mono text-xs ${isExpanded ? 'text-klein font-bold' : 'text-ink-300'}`}>
                    {isExpanded ? '[—]' : '[+]'}
                  </span>
                </div>

                <h4 className={`font-sans font-medium text-lg leading-tight mb-4 ${isExpanded ? 'text-klein font-semibold' : 'text-ink-900'}`}>
                  {cap.title}
                </h4>

                <div className={`transition-editorial overflow-hidden ${isExpanded ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <ul className="space-y-2 pt-2 border-t border-ink-150/50 font-mono text-xs text-ink-600">
                    {cap.items.map((item, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-klein flex-shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Career Timeline */}
      <div className="mb-16">
        <h3 className="font-sans font-bold text-xs uppercase tracking-widest text-ink-500 mb-10">
          — WORK TIMELINE / CHRONOLOGICAL RECORDS
        </h3>

        <div className="space-y-12">
          {TIMELINE.map((item, idx) => (
            <div key={idx} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 border-b border-ink-150 pb-12 last:border-b-0">
              {/* Date & Location Left Column */}
              <div className="lg:col-span-3 font-mono text-xs space-y-2">
                <span className="text-klein font-bold text-sm block">
                  {item.period}
                </span>
                <span className="text-ink-500 uppercase tracking-wider block">
                  {item.location}
                </span>
                <span className="text-ink-400 uppercase tracking-widest text-[10px] block">
                  {item.industry}
                </span>
              </div>

              {/* Company & Role Details Column */}
              <div className="lg:col-span-9 space-y-4">
                <div>
                  <h4 className="font-sans font-bold text-lg md:text-xl text-ink-900 leading-none">
                    {item.company}
                  </h4>
                  <span className="font-mono text-xs uppercase tracking-widest text-ink-400 block mt-1.5">
                    {item.role}
                  </span>
                </div>

                {/* Achievements list */}
                <ul className="space-y-3 pt-2 font-sans text-sm text-ink-700 leading-relaxed">
                  {item.achievements.map((ach, i) => (
                    <li key={i} className="flex items-start space-x-3">
                      <span className="font-mono text-xs text-klein flex-shrink-0 mt-0.5">
                        [{pad(i + 1)}]
                      </span>
                      <span>{ach}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full screen printable resume overlay */}
      {showResume && (
        <div className="fixed inset-0 bg-ink-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-paper-50 border border-ink-900 w-full max-w-4xl p-6 md:p-12 shadow-overlay text-ink-900 font-mono text-xs relative my-8">
            
            {/* Close button */}
            <button
              onClick={() => setShowResume(false)}
              className="absolute right-4 top-4 md:right-8 md:top-8 bg-ink-900 text-paper-0 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider cursor-pointer focus:outline-none"
            >
              × [CLOSE RESUME]
            </button>

            {/* Resume header */}
            <div className="border-b-2 border-ink-900 pb-6 mb-8 text-center md:text-left">
              <h2 className="font-sans font-bold text-3xl md:text-4xl tracking-tighter uppercase mb-2">
                ROY XIANG
              </h2>
              <p className="text-ink-500 uppercase tracking-widest text-[10px] mb-4">
                B2B Brand & Growth Marketing // Product Operations // AI Creative Operations
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[10px] text-ink-500">
                <span>LOCATION: DUBAI, UAE</span>
                <span>•</span>
                <span>EMAIL: {PROFILE.email}</span>
                <span>•</span>
                <span>PHONE: {PROFILE.phone}</span>
                <span>•</span>
                <span>LINKEDIN: linkedin.com/in/roy-xiang-97bb43118</span>
              </div>
            </div>

            {/* Resume content columns */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-8">
              {/* Timeline experience columns */}
              <div className="md:col-span-8 space-y-6">
                <h3 className="border-b border-ink-900 pb-1 font-bold text-ink-900 uppercase tracking-widest text-[11px] mb-4">
                  01 / PROFESSIONAL CHRONICLE
                </h3>
                
                {TIMELINE.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-start flex-wrap gap-1 font-bold text-ink-900">
                      <span>{item.company}</span>
                      <span className="text-klein">{item.period}</span>
                    </div>
                    <div className="text-ink-500 text-[11px] uppercase tracking-wider">{item.role}</div>
                    <ul className="space-y-1 text-ink-700 list-disc list-inside font-sans text-xs">
                      {item.achievements.map((ach, i) => (
                        <li key={i}>{ach}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Sidebar: Skills, Education */}
              <div className="md:col-span-4 space-y-6">
                <div>
                  <h3 className="border-b border-ink-900 pb-1 font-bold text-ink-900 uppercase tracking-widest text-[11px] mb-4">
                    02 / EXPERTISE DECK
                  </h3>
                  <div className="space-y-3 text-[11px] text-ink-700">
                    <div>
                      <span className="font-bold text-ink-900 block mb-0.5">STRATEGIC GTM</span>
                      <span>Product commercialization, Pricing structures, Campaign planning, Client segmentation</span>
                    </div>
                    <div>
                      <span className="font-bold text-ink-900 block mb-0.5">AI CREATIVE</span>
                      <span>Generative AI pipelines, Prompt systems, Hybrid Photoshop workflows, Vibe-coding build</span>
                    </div>
                    <div>
                      <span className="font-bold text-ink-900 block mb-0.5">PRODUCT & UI/UX</span>
                      <span>E-commerce IA mapping, CRM flows, Dashboard analysis, conversion rate optimization (CRO)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="border-b border-ink-900 pb-1 font-bold text-ink-900 uppercase tracking-widest text-[11px] mb-4">
                    03 / ACADEMIC CREDENTIALS
                  </h3>
                  <div className="space-y-3 text-[11px] text-ink-700">
                    <div>
                      <span className="font-bold text-ink-900 block">UNIVERSITY OF BATH</span>
                      <span className="text-ink-500 block">MSc in HRM & Consulting</span>
                    </div>
                    <div>
                      <span className="font-bold text-ink-900 block">CAPITAL NORMAL UNIVERSITY</span>
                      <span className="text-ink-500 block">BA in Chinese Language & Lit</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Print trigger */}
            <div className="border-t border-ink-200 pt-6 flex justify-between items-center text-[10px] text-ink-400">
              <span>RX_RESUME_ARCHIVE_2026.TXT</span>
              <button
                onClick={() => window.print()}
                className="font-mono text-klein hover:underline cursor-pointer focus:outline-none"
              >
                [CMD_P // PRINT DOSSIER]
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
