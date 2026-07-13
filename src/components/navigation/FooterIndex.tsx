import { PROFILE } from '../../data';

export interface FooterIndexProps {
  onNavigate?: (view: string) => void;
  colophon?: string;
}

export default function FooterIndex({
  onNavigate,
  colophon = "© 2026 Roy Xiang. All rights reserved. Created with contemporary design discipline."
}: FooterIndexProps) {
  const linksIndex = [
    { name: '01 / Selected Archive', view: 'Works' },
    { name: '02 / Personal About', view: 'About' },
    { name: '03 / Inquiry & Contact', view: 'Contact' }
  ];

  const linksSocial = [
    { name: 'LinkedIn', url: PROFILE.linkedin, external: true },
    { name: 'Direct Email', url: `mailto:${PROFILE.email}`, external: false },
    { name: 'Phone Call', url: `tel:${PROFILE.phone}`, external: false }
  ];

  return (
    <footer className="bg-ink-900 text-paper-100 py-16 px-6 md:px-12 border-t border-ink-800">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Index column */}
          <div className="md:col-span-4">
            <h5 className="font-mono text-xs uppercase tracking-widest text-ink-500 mb-6">
              — Index / Navigation
            </h5>
            <ul className="space-y-4">
              {linksIndex.map((link) => (
                <li key={link.view}>
                  <button
                    onClick={() => onNavigate && onNavigate(link.view)}
                    className="font-mono text-xs uppercase tracking-wider text-paper-100 hover:text-klein transition-fast cursor-pointer focus:outline-none"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Social column */}
          <div className="md:col-span-4">
            <h5 className="font-mono text-xs uppercase tracking-widest text-ink-500 mb-6">
              — Elsewhere / Contact
            </h5>
            <ul className="space-y-4">
              {linksSocial.map((link) => (
                <li key={link.name}>
                  {link.external ? (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center font-mono text-xs uppercase tracking-wider text-paper-100 hover:text-klein transition-fast"
                    >
                      <span>{link.name}</span>
                      <span className="ml-1.5 text-[10px] text-ink-500 group-hover:text-klein transition-fast">↗</span>
                    </a>
                  ) : (
                    <a
                      href={link.url}
                      className="font-mono text-xs uppercase tracking-wider text-paper-100 hover:text-klein transition-fast"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Slogan */}
          <div className="md:col-span-4 flex flex-col justify-between">
            <div>
              <h5 className="font-mono text-xs uppercase tracking-widest text-ink-500 mb-4">
                — Positioning
              </h5>
              <p className="font-sans text-xs text-ink-300 leading-relaxed max-w-xs">
                Turning AI tools into practical business workflows for creative production, content operations, product communication, and digital execution.
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-ink-800 my-8" />

        {/* Giant wordmark & Colophon */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="order-2 md:order-1">
            <p className="font-mono text-[10px] tracking-widest text-ink-500 uppercase">
              {colophon}
            </p>
          </div>
          <div className="order-1 md:order-2 select-none">
            <h1 className="font-sans font-bold text-5xl md:text-7xl tracking-tighter text-paper-0 opacity-10">
              ROY XIANG
            </h1>
          </div>
        </div>
      </div>
    </footer>
  );
}
