import RevealText from '../core/RevealText';
import IndexLabel from '../core/IndexLabel';
import { PROFILE } from '../../data';

export default function ContactScreen() {
  const contactCards = [
    { label: '01 / Location Base', value: PROFILE.location, link: `https://www.google.com/maps?q=${encodeURIComponent(PROFILE.location)}` },
    { label: '02 / Direct Email', value: PROFILE.email, link: `mailto:${PROFILE.email}` },
    { label: '03 / Secure Line', value: PROFILE.phone, link: `tel:${PROFILE.phone}` },
    { label: '04 / LinkedIn ID', value: 'ROY XIANG', link: PROFILE.linkedin }
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-12">
      {/* Page Header */}
      <div className="mb-16">
        <IndexLabel number={3} text="Secure Connection" tone="klein" className="mb-4 inline-block" />
        <RevealText
          as="h1"
          lines={["Establish Contact", "Direct Channels"]}
          className="font-sans font-bold text-4xl md:text-6xl tracking-tighter text-ink-900 leading-none"
        />
        <p className="font-sans text-sm text-ink-500 max-w-lg mt-6 leading-relaxed">
          For AI workflow projects, business prototypes, creative automation, or content operation discussions, feel free to reach out.
        </p>
      </div>

      <div className="max-w-2xl">
        {/* Right Side: Quick Connect Coordinates */}
        <div className="space-y-6">
          <h3 className="font-sans font-bold text-xs uppercase tracking-widest text-ink-500 mb-6">
            — DIRECT CHANNELS / SECURE COORDINATES
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contactCards.map((card, idx) => (
              <a
                key={idx}
                href={card.link}
                target={card.link.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="block border border-ink-150 p-6 bg-paper-100 hover:border-klein transition-fast cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-ink-400">
                    {card.label}
                  </span>
                  <span className="font-mono text-xs text-ink-300 group-hover:text-klein transition-fast">
                    ↗
                  </span>
                </div>
                <span className="font-sans font-medium text-base text-ink-900 group-hover:text-klein transition-fast block">
                  {card.value}
                </span>
              </a>
            ))}
          </div>

          {/* Secure signature footer */}
          <div className="p-6 border border-dashed border-ink-150 font-mono text-[10px] text-ink-500 leading-relaxed">
            All correspondence is confidential and structured directly under legal framework standards. Operational offices based in Dubai Media City.
          </div>
        </div>
      </div>
    </div>
  );
}

