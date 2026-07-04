import { useState, FormEvent } from 'react';
import RevealText from '../core/RevealText';
import IndexLabel from '../core/IndexLabel';
import Button from '../core/Button';
import { PROFILE } from '../../data';

export default function ContactScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [inquiryType, setInquiryType] = useState('AI Operations');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setLoading(true);
    // Simulate API request
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  const pad = (num: number) => String(num).padStart(2, '0');

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
        <IndexLabel number={3} text="Inquiry & Secure Connection" tone="klein" className="mb-4 inline-block" />
        <RevealText
          as="h1"
          lines={["Establish Contact", "Inquire Archive"]}
          className="font-sans font-bold text-4xl md:text-6xl tracking-tighter text-ink-900 leading-none"
        />
        <p className="font-sans text-sm text-ink-500 max-w-lg mt-6 leading-relaxed">
          Submit formal inquiries for brand consulting, B2B campaigns, AI pipeline setups, or full-time engagements in APAC/MENA.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Side: Dynamic Inquiry Form */}
        <div className="lg:col-span-7">
          <div className="border border-ink-900 bg-paper-0 p-6 md:p-8">
            <div className="border-b border-ink-900 pb-4 mb-6 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink-500 font-bold">
                — TRANSMIT INQUIRY / RX-FORM
              </span>
              <span className="text-klein animate-pulse font-bold text-xs">● COMMS_ONLINE</span>
            </div>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-widest text-ink-400 block mb-2">
                    01 / SENDER NAME
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ENTER YOUR FULL NAME..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-paper-50 border border-ink-150 rounded-none px-4 py-3 font-mono text-xs text-ink-900 focus:outline-none focus:border-klein uppercase tracking-wider"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-widest text-ink-400 block mb-2">
                    02 / RETRANSMIT EMAIL
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ENTER YOUR BUSINESS EMAIL..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-paper-50 border border-ink-150 rounded-none px-4 py-3 font-mono text-xs text-ink-900 focus:outline-none focus:border-klein uppercase tracking-wider"
                  />
                </div>

                {/* Inquiry Type */}
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-widest text-ink-400 block mb-2">
                    03 / DISCIPLINE SCOPE
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['AI Operations', 'Brand GTM', 'Product UI/UX', 'Other'].map((type) => {
                      const isSelected = inquiryType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setInquiryType(type)}
                          className={`border p-2 font-mono text-[9px] uppercase tracking-wider text-center cursor-pointer transition-fast focus:outline-none ${
                            isSelected 
                              ? 'bg-klein border-klein text-paper-0' 
                              : 'bg-paper-50 border-ink-150 text-ink-500 hover:border-ink-400'
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-widest text-ink-400 block mb-2">
                    04 / PROJECT BRIEF
                  </label>
                  <textarea
                    required
                    rows={6}
                    placeholder="PROVIDE INQUIRY BRIEF OR ENGAGEMENT PARTICULARS..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-paper-50 border border-ink-150 rounded-none p-4 font-mono text-xs text-ink-900 focus:outline-none focus:border-klein uppercase tracking-wider resize-none"
                  />
                </div>

                {/* Action Submit */}
                <div className="pt-2 border-t border-ink-150 flex items-center justify-between">
                  <span className="font-mono text-[9px] text-ink-400">
                    Form converts payload into secure business notification.
                  </span>
                  <Button type="submit" variant="primary" disabled={loading} arrow>
                    {loading ? 'TRANSMITTING...' : 'SEND INQUIRY'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="py-12 text-center space-y-6">
                <div className="w-16 h-16 rounded-full border border-klein flex items-center justify-center mx-auto text-klein text-2xl font-bold animate-bounce">
                  ✓
                </div>
                <div>
                  <h4 className="font-sans font-bold text-lg text-ink-900 uppercase">
                    TRANSMISSION SUCCESSFUL
                  </h4>
                  <p className="font-mono text-xs text-ink-400 mt-2">
                    Payload received by Roy. Expect response within 24 standard business hours.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setName('');
                    setEmail('');
                    setMessage('');
                  }}
                  className="font-mono text-[10px] text-klein uppercase hover:underline cursor-pointer focus:outline-none"
                >
                  [SEND ANOTHER MESSAGE]
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Quick Connect Coordinates */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="font-sans font-bold text-xs uppercase tracking-widest text-ink-500 mb-6">
            — DIRECT CHANNELS / SECURE COORDINATES
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
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
