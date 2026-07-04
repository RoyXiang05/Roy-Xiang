export interface Work {
  id: string;
  number: number;
  title: string;
  category: 'AI Creative Operations' | 'GTM Campaigns' | 'Product & UI/UX';
  subCategory: string;
  role: string;
  period: string;
  market: string;
  summary: string;
  challenge: string;
  insight: string;
  solution: string;
  deliverables: string[];
  results: string[];
  metrics: { label: string; value: string }[];
  tags: string[];
  schematicType: 'platform' | 'workflow' | 'campaign' | 'analytics' | 'exhibition' | 'mobile';
}

export interface CareerItem {
  company: string;
  location: string;
  role: string;
  period: string;
  industry: string;
  achievements: string[];
}

export const PROFILE = {
  name: "Roy Xiang",
  location: "Dubai, UAE",
  email: "xp238@outlook.com",
  phone: "+971 507379539",
  linkedin: "https://www.linkedin.com/in/roy-xiang-97bb43118/",
  positioning: "Brand & Growth Marketing | Product & GTM | AI Creative Operations",
  headline: "Building AI-powered marketing, product, and brand systems across the Middle East and China.",
  subheadline: "I help brands turn complex business stories into measurable outcomes — through GTM campaigns, content systems, digital products, and AI-enabled creative operations.",
  bio: "Roy Xiang is a Dubai-based Brand & Growth Marketing professional with 6+ years of experience across China, APAC, and the Middle East. His work sits at the intersection of GTM strategy, AI-enabled creative production, digital product operations, and cross-market content systems.\n\nHe has led high-visibility brand campaigns, built digital products from 0 to 1, operated B2B SaaS commercialization projects, and established AI-powered content workflows for regional marketing teams. Roy is especially strong in translating complex business, product, and technical narratives into measurable creative and commercial outcomes.",
};

export const CAPABILITIES = [
  {
    title: "Strategic & Commercial",
    items: [
      "Product Go-To-Market (GTM) Strategy",
      "Brand Positioning & Strategic Narrative",
      "B2B Marketing Communications",
      "SaaS Product Pricing & Packaging",
      "Client Segmentation & Commercial Frameworks",
      "Integrated Campaign Planning",
      "Executive-Facing Storytelling"
    ]
  },
  {
    title: "AI & Creative Operations",
    items: [
      "AI-Enabled Content Production",
      "Generative AI Visual Workflows",
      "Prompt System Design",
      "Hybrid AI + Photoshop Compositing",
      "Vibe Coding / AI-Assisted Web Development",
      "SOP Building for Repeatable Output",
      "Creative Production Localization"
    ]
  },
  {
    title: "Product & UI/UX",
    items: [
      "0-to-1 Digital Product Development",
      "B2B SaaS Commercialization",
      "User Journey & Interaction Mapping",
      "E-Commerce Information Architecture",
      "A/B Testing & Conversion Rate Optimization (CRO)",
      "CRM & Lead Capture Logic",
      "Data Dashboard & Report Design"
    ]
  }
];

export const TIMELINE: CareerItem[] = [
  {
    company: "ANTON Oilfield Services",
    location: "Dubai, UAE",
    role: "Regional Content & Creative Operations Lead",
    period: "2025.05 - Present",
    industry: "Oil & Gas / B2B Industrial Services",
    achievements: [
      "Built the company's first MENA regional content operation from 0, standardizing channels, editorial cadence, and a bilingual production pipeline.",
      "Improved regional LinkedIn campaign performance with a 50% CTR uplift YoY and 15% engagement rate through systematic audience testing.",
      "Grew LinkedIn follower reach by 32% in 10 months and increased content production efficiency by 50% via Gen-AI tool integrations.",
      "Orchestrated brand presence and experience at ADIPEC 2025, coordinating double-deck booth narratives, VIP communications, and executive presentations."
    ]
  },
  {
    company: "HOK Digital",
    location: "Beijing, China",
    role: "Co-Founder & Head of Business",
    period: "2024.04 - 2025.05",
    industry: "Digital Marketing Agency",
    achievements: [
      "Co-founded and scaled agency business operations from 0, securing client acquisition, resource allocation, and retention.",
      "Sustained an annual revenue scale of $1,000,000+ with full P&L accountability.",
      "Led Hyundai China integrated digital campaigns across five platforms, achieving a 120% engagement uplift versus prior-year KPIs."
    ]
  },
  {
    company: "FARFETCH",
    location: "Beijing, China",
    role: "Commercial Product & Growth Operations",
    period: "2023.04 - 2024.03",
    industry: "Luxury E-Commerce / B2B SaaS",
    achievements: [
      "Served as primary product operations lead for CurioEye Fashion Intelligence SaaS, guiding APAC luxury brand partners.",
      "Designed and managed tiered SaaS pricing structures, client segmentation, and product training modules.",
      "Optimized Farfetch internal brand campaigns to reduce CPA by 28% and drive 3x GMV growth via audience refined targeting.",
      "Secured 100% QoQ uplift in qualified partner lead conversion and 100% annual contract renewals."
    ]
  },
  {
    company: "Ruder Finn Interactive",
    location: "Beijing, China",
    role: "Senior Marketing Strategist",
    period: "2019.11 - 2023.04",
    industry: "Global Communications Agency",
    achievements: [
      "Developed integrated creative strategy for vivo V21 Southeast Asia campaign, achieving 100M+ cross-platform impressions.",
      "Partnered with ByteDance team on vivo Tier-S national launch, reaching 50B+ impressions and boosting launch sales by 25%.",
      "Directed 12-month dual-engine search engine optimization (SEO) program for City University of Hong Kong, raising website monthly conversions by 18%."
    ]
  }
];

export const WORKS: Work[] = [
  {
    id: "anton-ai-coded-supplier-platform",
    number: 1,
    title: "Anton AI-Coded Supplier Platform",
    category: "AI Creative Operations",
    subCategory: "AI-Assisted Development / B2B Platform",
    role: "AI-Assisted Product Builder & Operations",
    period: "2025",
    market: "Dubai, UAE / MENA / China",
    summary: "Built a 0-to-1 AI-assisted supplier onboarding and marketing platform for Anton, using vibe-coding workflows to move from first prompt to live platform in one week.",
    challenge: "Supplier intake was historically handled manually through email and unstructured submissions, making it highly inefficient for procurement and regional business teams to evaluate vendor capabilities and qualifications.",
    insight: "A supplier platform should perform two roles: establish credibility through a trust-first brand landing experience, and instantly structure vendor inputs into operational databases.",
    solution: "Developed an elegant landing front detailing Anton's listed credentials alongside a modular registration wizard. Built custom taxonomy systems and integrated digital document uploads to streamline compliance checks.",
    deliverables: [
      "Bilingual Landing Page UI & Copy",
      "Interactive Supplier Registration Flow",
      "Qualification Document Upload Logic",
      "Supply Category Structured Taxonomy"
    ],
    results: [
      "Launched functional system solo from first prompt to deployment in 1 week.",
      "Completely replaced email-based intake with clean structured database records.",
      "Optimized onboarding speed for international vendors in China and MENA."
    ],
    metrics: [
      { label: "Build Time", value: "1 Week" },
      { label: "Reduction in Manual Entry", value: "100%" },
      { label: "Languages Supported", value: "EN / 中文" }
    ],
    tags: ["Vibe Coding", "B2B SaaS", "Procurement Ops", "React", "Node.js"],
    schematicType: "platform"
  },
  {
    id: "adipec-anton-brand-experience",
    number: 2,
    title: "ADIPEC Exhibition Brand Experience",
    category: "GTM Campaigns",
    subCategory: "Exhibition Experience / Corporate Storytelling",
    role: "Brand Experience & Creative Operations Lead",
    period: "2025",
    market: "Abu Dhabi, UAE",
    summary: "Orchestrated Anton's brand presence at ADIPEC 2025, one of the world's largest energy exhibitions, coordinating spatial narratives, executive communication, and digital engagements.",
    challenge: "ADIPEC is a high-stakes arena with 160,000+ global energy executives. Anton needed to differentiate its technical capabilities from competitors and project an advanced, trustworthy global brand posture.",
    insight: "In heavy industrial markets, every exhibition touchpoint is a critical trust signal. Unified storytelling—spanning double-deck architecture, digital displays, and executive documents—creates massive relational leverage.",
    solution: "Oversaw booth visual narrative architecture, directed production of dynamic digital screens, engineered physical VIP invitation kits, and designed aligned communications for C-suite engagement.",
    deliverables: [
      "Double-deck Booth Visual Direction",
      "Digital Screen Content & Kinetic Typography",
      "C-Suite Pitch Books & Corporate Decks",
      "VIP Spatial invitation experience"
    ],
    results: [
      "Delivered a cohesive brand footprint to 160,000+ senior industry visitors.",
      "Supported key corporate networking milestones and regional leadership panels.",
      "Set an elevated visual and technical communication benchmark for the brand."
    ],
    metrics: [
      { label: "ADIPEC Scale", value: "160K+ Attendees" },
      { label: "Media Impressions", value: "2M+" },
      { label: "VIP Lead Index", value: "+35%" }
    ],
    tags: ["B2B Brand", "ADIPEC", "Event Design", "Corporate Strategy"],
    schematicType: "exhibition"
  },
  {
    id: "curioeye-fashion-intelligence-saas",
    number: 3,
    title: "CurioEye Fashion Intelligence SaaS",
    category: "Product & UI/UX",
    subCategory: "B2B SaaS Commercialization / Data Visualization",
    role: "Commercial Product & Growth Operations",
    period: "2023 - 2024",
    market: "APAC / China",
    summary: "Led product commercialization for CurioEye (Farfetch), shifting the platform from raw data displays to high-impact visual intelligence dashboards that drove partner retention.",
    challenge: "CurioEye held valuable fashion trend and market data, but partners struggled to extract actionable insights. Adoption was low, causing churn risk among top-tier APAC luxury accounts.",
    insight: "Luxury brand managers do not buy data; they buy business clarity. Reframing datasets into interactive, highly targeted visual stories drives rapid enterprise alignment.",
    solution: "Redesigned user profiling and dashboard flows. Formulated a tiered packaging and commercial subscription strategy. Connected multi-channel paid campaigns to customized lead flows.",
    deliverables: [
      "Commercial Packaging & Pricing Strategy",
      "Interactive Trend Dashboard UI Redesign",
      "Partner Onboarding and Playbook Modules",
      "Cross-Platform Paid Funnel Architecture"
    ],
    results: [
      "Achieved 100% QoQ growth in qualified partner acquisitions.",
      "Secured 85% annual contract renewal rate for top-tier enterprise clients.",
      "Reduced partner acquisition cost by 28% while boosting GMV impact."
    ],
    metrics: [
      { label: "Lead Growth", value: "+500%" },
      { label: "Contract Conversion", value: "100%" },
      { label: "Partner Renewals", value: "85%" }
    ],
    tags: ["Product Ops", "B2B SaaS", "Data Viz", "Farfetch", "CRO"],
    schematicType: "analytics"
  },
  {
    id: "john-lobb-wechat-flagship-store",
    number: 4,
    title: "John Lobb 0-to-1 WeChat Store",
    category: "Product & UI/UX",
    subCategory: "Luxury E-Commerce / UX & Service Design",
    role: "Product & UX Lead",
    period: "2023",
    market: "China",
    summary: "Developed a bespoke WeChat flagship mini-program store for John Lobb, translating the legendary brand's heritage into an elegant, high-touch mobile commerce journey.",
    challenge: "Selling shoes starting at USD 2,000+ requires intimate, high-trust experiences. Moving this physical bespoke retail journey to a mobile interface risked diluting the brand's white-glove aura.",
    insight: "The digital product must not mimic a catalog; it must replicate the personal concierge. Prioritizing O2O appointment booking and direct personal consultation creates a digital equivalent of the physical fitting.",
    solution: "Mapped low-fidelity UX wireframes for elite clients, built custom interactive product modules detailing custom leather options, and designed a concierge-led consultation interface.",
    deliverables: [
      "E-Commerce UX Wireframes & IA Map",
      "Concierge Chat Integration Wireframes",
      "O2O Store Appointment Scheduler UI",
      "Craftsmanship Visual Asset Guidelines"
    ],
    results: [
      "Shattered targets, achieving 150% of the first-month sales quota.",
      "Successfully integrated offline boutique fittings with online deposits.",
      "Maintained zero-friction customer service score among VIP buyers."
    ],
    metrics: [
      { label: "First Month Quota", value: "150% Achieved" },
      { label: "O2O Conversion", value: "42%" },
      { label: "Average Order Value", value: "$2,200+" }
    ],
    tags: ["Luxury UX", "WeChat Mini Program", "Service Design", "O2O"],
    schematicType: "mobile"
  },
  {
    id: "vivo-5-year-partnership",
    number: 5,
    title: "vivo 5-Year Strategic GTM Partnership",
    category: "GTM Campaigns",
    subCategory: "Consumer Tech GTM / Brand & Social Strategy",
    role: "Senior Marketing Strategist",
    period: "Multi-Year",
    market: "China / Southeast Asia",
    summary: "Guided vivo through multi-year S-series smartphone GTM campaigns, crafting influential social concepts and platform-native viral growth models.",
    challenge: "Maintaining consistent brand desirability across rapid smartphone product iterations inside saturated youth markets is a massive strategic battle.",
    insight: "Product specs fade from memory, but visual style hooks endure. Linking device GTM campaigns with lifestyle aesthetic IPs builds cultural currency.",
    solution: "Designed S-series 'Selfie Aesthetics' narratives on Xiaohongshu. Managed entertainment integrations and directed creator/KOL matrices across Southeast Asia markets.",
    deliverables: [
      "Product Launch Core Brand Narratives",
      "Creator Network Activation Guidelines",
      "Entertainment & Music IP Collaboration Systems",
      "Social-Native Media Matrix Rules"
    ],
    results: [
      "Southeast Asia campaign generated 100M+ organic cross-platform impressions.",
      "ByteDance Tier-S national campaign reached 50B+ impressions.",
      "Contributed to 25% direct sales volume uplift during crucial launch cycles."
    ],
    metrics: [
      { label: "Tier-S Campaign Views", value: "50B+" },
      { label: "SEA Impressions", value: "100M+" },
      { label: "Launch Sales Growth", value: "+25%" }
    ],
    tags: ["GTM Strategy", "Consumer Tech", "KOL Matrix", "Social Growth"],
    schematicType: "campaign"
  },
  {
    id: "anton-mena-content-ops",
    number: 6,
    title: "Anton Content Ops & LinkedIn Growth",
    category: "GTM Campaigns",
    subCategory: "Regional Content Operations / Performance Marketing",
    role: "Regional Content Operations Lead",
    period: "2025 - Present",
    market: "Dubai, UAE / MENA",
    summary: "Built Anton's regional MENA content operation from scratch, establishing a repeatable pipeline for B2B storytelling and systematic LinkedIn audience growth.",
    challenge: "Industrial energy service communications are historically dry and fragmented, failing to build structured lead generation pipelines or premium brand perception globally.",
    insight: "Trust is built via technological transparency and technical credibility. Designing an institutional, bilingual content operations engine solves the volume and credibility gap.",
    solution: "Established a structured MENA content framework, designed visual templates, engineered translation guidelines, and optimized LinkedIn organic and paid operations.",
    deliverables: [
      "Bilingual MENA Editorial Calendar",
      "LinkedIn Template Brand System",
      "Executive Storytelling SOP",
      "Monthly Analytics Dashboard Logic"
    ],
    results: [
      "Sustained a 50% CTR uplift YoY for digital campaign activations.",
      "Attained a stellar 15% average organic engagement rate.",
      "Grew organic LinkedIn reach and followers by 32% in 10 months."
    ],
    metrics: [
      { label: "CTR Uplift YoY", value: "+50%" },
      { label: "Follower Growth", value: "+32%" },
      { label: "Engagement Rate", value: "15%" }
    ],
    tags: ["Content Operations", "LinkedIn Growth", "B2B Marketing", "SOP"],
    schematicType: "workflow"
  },
  {
    id: "csr-gen-ai-hse-safety",
    number: 7,
    title: "CSR Gen-AI HSE Safety Cards",
    category: "AI Creative Operations",
    subCategory: "CSR / Safety Education / Hybrid AI Workflow",
    role: "AI Visual Workflow Designer",
    period: "2025",
    market: "Dubai, UAE / MENA",
    summary: "Designed a Gen-AI-assisted HSE safety visual system that translates industrial safety protocols into child-friendly visual education materials for non-industrial audiences.",
    challenge: "High-level oil & gas safety requirements are dense and inaccessible to non-technical communities. Translating heavy industrial guidelines into warm visual lessons is slow and expensive using traditional workflows.",
    insight: "Gen-AI tools create beautiful background scenarios, but specific safety hazards require absolute graphical precision. A hybrid flow (AI generation + Photoshop compositing) solves both speed and safety accuracy.",
    solution: "Utilized Midjourney for soft base illustration worlds, separately rendered/composited hazard markers and signs, and created child-friendly educational play cards.",
    deliverables: [
      "HSE Bilingual Safety Illustration Play Cards",
      "Midjourney Asset Production Prompts",
      "Photoshop Hazard Compositing SOP",
      "Visual Safety Icon Library"
    ],
    results: [
      "Boosted illustration asset creation speeds by 50%.",
      "Successfully created a repeatable hybrid AI-to-design workflow.",
      "Deployed educational safety sets used across regional CSR events."
    ],
    metrics: [
      { label: "Asset Speedup", value: "+50%" },
      { label: "HSE Themes", value: "12 Areas" },
      { label: "Accuracy Index", value: "100%" }
    ],
    tags: ["Generative AI", "Photoshop", "CSR", "HSE", "Visual System"],
    schematicType: "workflow"
  },
  {
    id: "baccarat-ux-cro-seasonal-growth",
    number: 8,
    title: "Baccarat UX Optimization & CRO",
    category: "Product & UI/UX",
    subCategory: "E-Commerce CRO / A/B Testing / Seasonal Campaigns",
    role: "UX & Growth Operations Lead",
    period: "2023",
    market: "China",
    summary: "Optimized Baccarat's luxury e-commerce checkout flow and engineered seasonal referral gifting mechanisms to trigger exponential conversion during peak holidays.",
    challenge: "High checkout friction on mobile led to high cart abandonment rates, and customer acquisition outside holiday seasons was highly inefficient.",
    insight: "Luxury e-commerce conversions depend on high-quality gifting experiences. Digitizing seasonal gift cards with social sharing creates organic customer referrals.",
    solution: "Redesigned checkout visual hierarchies to reduce clicks, and launched a multi-user digital gifting loop for WeChat Christmas and Chinese New Year activations.",
    deliverables: [
      "Mobile Checkout Redesign Wireframes",
      "Checkout Friction UX Audit Report",
      "Digital Gifting Referral Code Flow",
      "A/B Testing Target Performance Map"
    ],
    results: [
      "Tripled seasonal campaign GMV compared to the prior-year benchmark.",
      "Slashed mobile bounce rates by 22% while increasing user dwell time by 50%.",
      "Reduced customer acquisition costs (CPA) by 28% through referral loops."
    ],
    metrics: [
      { label: "GMV Growth", value: "3x YoY" },
      { label: "Bounce Reduction", value: "-22%" },
      { label: "Dwell Time Increase", value: "+50%" }
    ],
    tags: ["CRO", "UX Design", "Gifting Referral", "Luxury E-Com"],
    schematicType: "analytics"
  }
];
