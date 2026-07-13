export interface Work {
  id: string;
  number: number;
  title: string;
  category: 'AI Creative Operations' | 'Branding & Marketing' | 'Product & UI/UX';
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
  heroImage?: string;
  galleryImages?: string[];
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
  positioning: "Applied AI Workflow Specialist",
  headline: "I turn AI tools into practical business workflows for creative production, content operations, product communication, and digital execution.",
  subheadline: "Currently working in an AI R&D environment, building AI-enabled workflows, vibe-coded prototypes, content SOPs, and human-in-the-loop production systems for business teams.",
  bio: "I work on applied AI implementation — turning AI tools into practical workflows for creative production, content operations, product communication, and business process improvement.\n\nWith 6+ years across digital marketing, product operations, commercial growth, and production management, I focus on building AI-first workflows that help teams move from fragmented tools and manual execution to repeatable, scalable systems.\n\nMy current work sits inside an AI R&D environment, where I design and implement AI-enabled creative workflows, vibe-coded business prototypes, content production SOPs, prompt frameworks, and human-in-the-loop quality control processes.\n\nI am especially interested in how AI can become a practical operating layer for business teams — improving speed, consistency, quality, and execution across daily workflows.",
};

export const CAPABILITIES = [
  {
    title: "AI Workflow & Creative Automation",
    items: [
      "Turning manual creative & marketing processes into repeatable AI workflows",
      "GenAI image & video asset production pipelines",
      "Standardizing brand prompts and style models",
      "Accelerating visual concept exploration and storyboards",
      "SOP design for multi-channel content operations",
      "Human-guided creative automation templates"
    ]
  },
  {
    title: "Vibe-Coded Business Prototypes",
    items: [
      "0-to-1 rapid product prototype development",
      "AI-assisted frontend and full-stack building",
      "Interactive onboarding and registration wizards",
      "Structured taxonomy and data collection models",
      "Landing page design and conversion wireframes",
      "Agile development cycles from prompt to deployment"
    ]
  },
  {
    title: "Human-in-the-Loop Quality Control",
    items: [
      "Maintaining brand standards across AI visual generation",
      "Hazard placement and safety QA checks",
      "Multilingual content and copy localization review",
      "Commercial usability and editorial policy alignment",
      "High-touch user journey and interaction mapping",
      "Business performance monitoring & growth reports"
    ]
  }
];

export const TIMELINE: CareerItem[] = [
  {
    company: "Antonoil (AI Research Institution)",
    location: "Dubai, UAE (On-site)",
    role: "Multimedia Creative Supervisor",
    period: "2025.06 - Present",
    industry: "AI Operations & Energy B2B",
    achievements: [
      "AI Adoption & Workflow Implementation: Built AI-enabled creative workflows and regional SOPs for MENA marketing across the UAE, Egypt and Iraq, improving production efficiency by around 50% while accelerating localisation, content iteration and quality control.",
      "AI-Assisted Product Prototype / Vibe-Coded Build: Designed and launched a 0-to-1 AI-assisted supplier onboarding platform within one week, turning manual email intake into a structured bilingual registration, document upload and vendor profiling flow.",
      "AI-Native Creative Operations: Integrated AI tools into the regional content production process, covering concept generation, visual development, prompt systems, asset adaptation and campaign iteration.",
      "Commercial AI for Growth: Owned audience strategy, creative testing and reporting for LinkedIn activations, delivering 50% CTR uplift YoY, 15% engagement rate and 32% reach/follower growth.",
      "AI Governance & Quality Control: Established prompt frameworks, creative QA checkpoints and brand consistency standards to ensure AI-generated assets remained commercially usable, locally relevant and aligned with corporate communication standards."
    ]
  },
  {
    company: "HOK (Beijing) Digital Technology Co., Ltd.",
    location: "Beijing, China (On-site)",
    role: "Head of Business",
    period: "2024.04 - 2025.05",
    industry: "Digital Marketing & Consultancy",
    achievements: [
      "Co-founded and led business growth for an entrepreneurial digital marketing and creative consultancy, owning client acquisition, commercial strategy, project delivery and P&L responsibilities.",
      "Worked across enterprise client pitching, pricing, resource planning, campaign strategy and cross-functional delivery, helping the business grow from 0 to a million-dollar annual revenue operation.",
      "Built the agency's client acquisition engine from 0 as co-founder, owning pitching, pricing, client retention, delivery governance and P&L accountability.",
      "Sustained million-dollar annual revenue through enterprise client development, commercial proposal design and multi-project resource planning.",
      "Led Hyundai China integrated campaigns across WeChat, Douyin, Xiaohongshu, Weibo and Video Account, achieving 120% engagement uplift versus prior-year KPI.",
      "Managed complex client programmes end-to-end, aligning creative, strategy, production, media and account teams under tight delivery timelines.",
      "Translated client business problems into actionable campaign strategies, commercial proposals and measurable delivery plans."
    ]
  },
  {
    company: "FARFETCH",
    location: "Beijing, China (On-site)",
    role: "Commercial Product & Growth Operations",
    period: "2023.04 - 2024.03",
    industry: "Luxury E-Commerce & B2B SaaS",
    achievements: [
      "Worked across commercial product operations, B2B SaaS growth, and partner enablement for Farfetch’s luxury and fashion-brand (Baccarat, Ducati, Christian Louboutin, Audemars Piguet, La Roca) ecosystem in APAC.",
      "Helped brand partners adopt and extract value from digital products, including product training, onboarding, campaign performance analysis, partner feedback, conversion tracking, and SaaS growth initiatives.",
      "Served as primary product operations contact for CurioEye, delivering product training, onboarding and partner enablement for luxury and fashion brand clients across APAC.",
      "Led B2B SaaS commercialisation by connecting product features, partner needs, campaign performance and commercial growth opportunities.",
      "Managed partner campaign analytics across audience behaviour, conversion paths, CPA and GMV contribution, reducing CPA by 28% and driving 3x GMV growth.",
      "Built A/B testing, attribution and audience segmentation frameworks to optimise partner funnel performance and product adoption.",
      "Defined paid social and lead capture strategy across LinkedIn, Facebook and Twitter/X, driving 100% QoQ uplift in qualified partner conversion and 100% annual contract conversion from qualified leads."
    ]
  },
  {
    company: "Ruder Finn",
    location: "Beijing, China",
    role: "Senior Account Executive",
    period: "2021.07 - 2023.04",
    industry: "Global Communications Agency",
    achievements: [
      "Led integrated marketing strategy and platform campaign execution for consumer technology (vivo, OPPO), automotive (Porsche, Audi), luxury (John Lobb, Estée Lauder), Internet (Tencent) and education (City University of HK) across China and APAC.",
      "Covered campaign strategy, social media planning, digital advertising, SEO, influencer/creator collaboration, platform content strategy, product launch storytelling and performance reporting across multiple key platforms.",
      "Led creative and platform strategy for vivo V21 Southeast Asia social campaign across YouTube, Instagram and TikTok, achieving 100M+ cross-platform impressions.",
      "Worked directly with ByteDance’s official team on a vivo Tier-S national launch campaign, reaching 50B+ impressions and supporting 25% product launch sales uplift.",
      "Delivered a 12-month dual-engine SEO programme for City University of Hong Kong across Google and Baidu, improving website conversion rate by an average 18% monthly.",
      "Developed product launch narratives, social content strategies and influencer/creator activation plans for consumer technology brands across China and APAC.",
      "Managed integrated campaigns across TikTok/Douyin, YouTube, Instagram, WeChat, Xiaohongshu, Weibo, Google and Baidu, translating audience insights into platform-native content strategies."
    ]
  },
  {
    company: "Ruder Finn",
    location: "Beijing, China",
    role: "Account Executive",
    period: "2019.11 - 2021.07",
    industry: "Global Communications Agency",
    achievements: [
      "Supported day-to-day client relations, project coordination, and media tracking for high-profile consumer technology, automotive, and luxury accounts.",
      "Drafted bilingual press releases, social media copy, and pitch angles, securing consistent coverage in tier-1 tech and lifestyle media outlets.",
      "Managed influencer mapping, outreach, and post-campaign reporting for key brand activations across WeChat, Weibo, and Douyin.",
      "Conducted industry research, competitor benchmarking, and weekly/monthly performance reporting to identify growth opportunities for client accounts."
    ]
  }
];

export const WORKS: Work[] = [
  {
    id: "ai-visual-production-workflow",
    number: 1,
    title: "AI Visual Production Workflow",
    category: "AI Creative Operations",
    subCategory: "AI Workflow / Creative Automation / Brand Asset Production",
    role: "AI Visual Workflow Designer",
    period: "2025",
    market: "Dubai, UAE / MENA",
    summary: "Built AI-assisted visual assets and brand-style explorations using a human-in-the-loop process that combines AI generation with design judgment and production polish.",
    challenge: "Business teams need high-quality visual assets faster, but traditional production cycles are slow, resource-heavy, and difficult to scale across repeated content needs.",
    insight: "GenAI can accelerate concept exploration, visual prototyping, and asset variation, but the output needs structured prompts, brand direction, layout refinement, and final creative control.",
    solution: "Created a repeatable workflow from concept definition, prompt writing, visual generation, layout direction, refinement, and final asset preparation.",
    deliverables: [
      "Brand Style Prompt Frameworks",
      "AI-Generated Base Asset SOPs",
      "Layout Direction & Production Guide",
      "High-Fidelity Campaign Prototyping Assets"
    ],
    results: [
      "Improved creative exploration speed and enabled faster iteration across visual communication tasks.",
      "Established clean brand guardrails for AI-assisted image generation.",
      "Successfully delivered production-ready visuals within reduced timelines."
    ],
    metrics: [
      { label: "Exploration Speedup", value: "5x Faster" },
      { label: "SOP Completion", value: "100%" },
      { label: "Brand Alignment", value: "100%" }
    ],
    tags: ["Generative AI", "Creative Automation", "Brand Assets", "Photoshop", "Workflow"],
    schematicType: "workflow",
    heroImage: "/portfolio_assets/1783797479443_Screenshot_2026-02-09_at_2.40.29___PM.png#image",
    galleryImages: [
      "/portfolio_assets/opt_1783661874686_movie.mp4#video",
      "/portfolio_assets/opt_1783661997327_movie.mp4#video",
      "/portfolio_assets/1783689328246_IMG_7520.PNG.png#image",
      "/portfolio_assets/1783797479443_Screenshot_2026-02-09_at_2.40.29___PM.png#image",
      "/portfolio_assets/1783797533528_Picture12.jpg#image",
      "/portfolio_assets/1783797595082_Picture1.png#image",
      "/portfolio_assets/1783797596471_Picture3.png#image",
      "/portfolio_assets/1783797597229_Picture5.png#image",
      "/portfolio_assets/1783797598425_Picture6.png#image",
      "/portfolio_assets/1783797599081_93ff5e99ej2fdaae4df422eb4555353f.png#image",
      "/portfolio_assets/1783797599739_IMG_4530.jpg#image",
      "/portfolio_assets/1783797528976_Picture6.jpg#image",
      "/portfolio_assets/1783797529644_Picture7.jpg#image",
      "/portfolio_assets/1783797530429_Picture8.jpg#image",
      "/portfolio_assets/1783797531136_Picture9.jpg#image",
      "/portfolio_assets/1783797531712_Picture10.jpg#image",
      "/portfolio_assets/1783797532999_Picture11.png#image",
      "/portfolio_assets/1783797130565_7637904cefda3c9611aff36ddfc45f50.PNG.png#image"
    ]
  },
  {
    id: "ai-enabled-content-ops",
    number: 2,
    title: "AI-Enabled Content Operations System",
    category: "AI Creative Operations",
    subCategory: "AI Workflow / Content Operations / Regional SOP",
    role: "Regional Content Operations Lead",
    period: "2025",
    market: "Dubai, UAE / MENA",
    summary: "Integrated AI tools into the content production process and created repeatable workflows for business communication and LinkedIn activations.",
    challenge: "Regional content production requires speed, consistency, localization, and repeated execution across multiple business scenarios.",
    insight: "AI can support content planning, asset adaptation, message variation, visual production, and faster campaign iteration when embedded into a structured operating system.",
    solution: "Built AI-enabled creative workflows and regional SOPs covering planning, content generation, visual development, prompt systems, asset adaptation, and campaign iteration.",
    deliverables: [
      "Bilingual Content Adaptation SOP",
      "LinkedIn Messaging Prompt Libraries",
      "Regional Editorial Alignment System",
      "Repeatable Automation Blueprints"
    ],
    results: [
      "Improved production efficiency by around 50% while supporting faster localization, iteration, and quality control.",
      "Maintained brand consistency, business accuracy, local relevance, and corporate communication standards through QA checkpoints.",
      "Successfully scaled regional communication channels with zero increase in administrative overhead."
    ],
    metrics: [
      { label: "Production Efficiency", value: "50% Increase" },
      { label: "Localization Speed", value: "3x Faster" },
      { label: "Channel Reach Growth", value: "32%" }
    ],
    tags: ["Content Operations", "SOP", "LinkedIn Growth", "AI Workflows", "Bilingual"],
    schematicType: "workflow",
    heroImage: "/portfolio_assets/1783850585409_Screenshot_2026-02-09_at_2.40.29___PM.png#image",
    galleryImages: [
      "/portfolio_assets/1783850585409_Screenshot_2026-02-09_at_2.40.29___PM.png#image",
      "/portfolio_assets/1783850587903_Screenshot_2026-02-09_at_2.40.54___PM.png#image",
      "/portfolio_assets/1783850590278_Screenshot_2026-02-10_at_6.39.11___PM.png#image",
      "/portfolio_assets/1783850593224__________.png#image"
    ]
  },
  {
    id: "ai-coded-supplier-platform",
    number: 3,
    title: "AI-Coded Supplier Onboarding Platform",
    category: "AI Creative Operations",
    subCategory: "Vibe Coding / AI-Assisted Product Prototype / B2B Workflow Digitization",
    role: "AI-Assisted Product Builder & Operations",
    period: "2025",
    market: "Dubai, UAE / MENA / China",
    summary: "Designed and launched a 0-to-1 AI-assisted supplier onboarding platform within one week, replacing manual email intake with a structured bilingual registration and vendor profiling process.",
    challenge: "Supplier intake relied on manual email communication, creating fragmented information, inconsistent qualification data, and inefficient follow-up.",
    insight: "AI-assisted development can quickly turn a manual business process into a structured digital prototype with clearer information architecture and guided data submission.",
    solution: "Mapped the supplier onboarding journey into credibility messaging, company profiling, document upload, vendor category selection, and structured submission flow.",
    deliverables: [
      "Bilingual Registration Wizard UI",
      "Qualification Document Upload Logic",
      "Supplier Category Structured Taxonomy",
      "Intake Database and Notification Flow"
    ],
    results: [
      "Launched functional system solo from first prompt to deployment in 1 week.",
      "Created a faster, clearer, and more structured intake experience for supplier communication and internal processing.",
      "Business logic, information hierarchy, bilingual content, and supplier category structure were manually reviewed to ensure operational usability."
    ],
    metrics: [
      { label: "Build Time", value: "1 Week" },
      { label: "Reduction in Manual Entry", value: "100%" },
      { label: "Languages Supported", value: "EN / 中文" }
    ],
    tags: ["Vibe Coding", "B2B Workflow", "React", "Node.js", "Procurement"],
    schematicType: "platform",
    heroImage: "/portfolio_assets/1783850550164_1920w_light.png#image",
    galleryImages: [
      "/portfolio_assets/1783850550164_1920w_light.png#image",
      "/portfolio_assets/1783856761356_Screenshot_2026-07-12_at_11.15.49___AM.png#image"
    ]
  },
  {
    id: "hitl-genai-safety-communication",
    number: 4,
    title: "Human-in-the-Loop GenAI Safety Communication",
    category: "AI Creative Operations",
    subCategory: "GenAI Visual Workflow / Safety Communication / Creative QA",
    role: "AI Visual Workflow Designer",
    period: "2025",
    market: "Dubai, UAE / MENA",
    summary: "Created safety communication visuals through a hybrid AI + compositing workflow, ensuring the final scenes were visually clear, child-friendly, and aligned with safety messages.",
    challenge: "Safety communication assets need to be visually clear, accurate, and accessible to non-technical audiences while still reflecting professional standards.",
    insight: "GenAI can quickly create friendly visual scenarios, but safety-specific scenes often require precise hazard control and manual correction.",
    solution: "Separated base scene generation from hazard element generation, then combined AI-generated assets with Photoshop compositing and manual QA.",
    deliverables: [
      "Bilingual Safety Play Card Designs",
      "Midjourney Background Asset Prompts",
      "Photoshop Hazard Compositing SOP",
      "Visual Safety Icon Library"
    ],
    results: [
      "Extended GenAI beyond simple image generation into controlled visual communication for business and safety education use cases.",
      "Manual control was applied to hazard placement, safety accuracy, visual clarity, and final asset consistency.",
      "Deployed educational safety sets used across regional events."
    ],
    metrics: [
      { label: "Asset Speedup", value: "50% Increase" },
      { label: "Safety Themes", value: "12 Areas" },
      { label: "Visual Accuracy", value: "100%" }
    ],
    tags: ["Generative AI", "Photoshop", "CSR", "HSE", "Visual System"],
    schematicType: "workflow",
    heroImage: "/portfolio_assets/1783856802987_7637904cefda3c9611aff36ddfc45f50.PNG.png#image",
    galleryImages: [
      "/portfolio_assets/1783856802987_7637904cefda3c9611aff36ddfc45f50.PNG.png#image",
      "/portfolio_assets/1783856801273_Screenshot_2026-07-10_at_3.38.18___PM.png#image",
      "/portfolio_assets/1783856808158_Gemini_Generated_Image_6asj3a6asj3a6asj.png#image",
      "/portfolio_assets/1783856811553_Gemini_Generated_Image_9fz84p9fz84p9fz8.png#image",
      "/portfolio_assets/1783856813352_Gemini_Generated_Image_unpwpfunpwpfunpw.png#image",
      "/portfolio_assets/1783856816812_Gemini_Generated_Image_w2mxqnw2mxqnw2mx.png#image",
      "/portfolio_assets/1783856819037_Gemini_Generated_Image_3y5x5p3y5x5p3y5x.png#image",
      "/portfolio_assets/1783856821413_Gemini_Generated_Image_4h2bjf4h2bjf4h2b.png#image"
    ]
  },
  {
    id: "adipec-anton-brand-experience",
    number: 5,
    title: "ADIPEC Exhibition Brand Experience",
    category: "Branding & Marketing",
    subCategory: "Exhibition Experience / Corporate Storytelling",
    role: "Brand Experience & Creative Operations Lead",
    period: "2025",
    market: "Abu Dhabi, UAE",
    summary: "Orchestrated Anton's brand presence at ADIPEC 2025, coordinating spatial narratives, double-deck booth visual direction, dynamic digital screens, VIP invitation kits, and executive communications for C-suite engagement.",
    challenge: "ADIPEC is a high-stakes arena with 160,000+ global energy executives. Anton needed to differentiate its technical capabilities and project an advanced, trustworthy global brand posture.",
    insight: "In heavy industrial markets, every exhibition touchpoint is a critical trust signal. Unified storytelling—spanning architecture, digital displays, and executive documents—creates massive relational leverage.",
    solution: "Oversaw booth visual narrative architecture, directed production of dynamic digital screens, engineered physical VIP invitation kits, and designed aligned communications for C-suite engagement.",
    deliverables: [
      "Double-deck Booth Visual Direction",
      "Digital Screen Content & Kinetic Typography",
      "C-Suite Pitch Books & Corporate Decks",
      "VIP Spatial Invitation Experience"
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
    schematicType: "exhibition",
    heroImage: "/portfolio_assets/1783857053072_Screenshot_2026-02-09_at_2.40.29___PM.png#image",
    galleryImages: [
      "/portfolio_assets/1783857053072_Screenshot_2026-02-09_at_2.40.29___PM.png#image",
      "/portfolio_assets/1783857055470_Screenshot_2026-02-09_at_2.40.54___PM.png#image",
      "/portfolio_assets/opt_1783857095880_601b0ed52b895e258a8a242efa6c2c58_raw.mp4#video",
      "/portfolio_assets/1783857124673__________.png#image"
    ]
  },
  {
    id: "oppo-find-n5-gtm",
    number: 6,
    title: "OPPO Find N5 Foldable Flagship",
    category: "Branding & Marketing",
    subCategory: "Product Positioning & GTM",
    role: "Senior GTM Strategist",
    period: "2024 - 2025",
    market: "Global / China",
    summary: "Developed premium product GTM campaign that culturally and physically visualized the product's ultra-slim USP, targeting elite professionals by shifting the narrative from hardware specs to lifestyle enablement.",
    challenge: "Shifting the narrative from purely hardware specs to lifestyle enablement to win high-earning elite professionals inside the premium foldable category.",
    insight: "Ultra-premium devices are not bought for performance metrics alone; they are lifestyle choices that represent status, design sophistication, and limit-free productivity.",
    solution: "Formulated the 'Life Without Limits' proposition, created gold foil red packet creative teasers ('The Gift of Thinness'), and defined material-centric high-end naming systems.",
    deliverables: [
      "Product Positioning Strategy Framework",
      "Creative Teaser Campaigns ('The Gift of Thinness')",
      "Luxury Material Naming Systems",
      "GTM Communications Playbook"
    ],
    results: [
      "Defined a luxury-focused visual standard, securing top category mindshare among target elite buyers.",
      "The 'Gift of Thinness' teaser campaign yielded 30M+ high-quality reach.",
      "Successfully matched flagship price point using luxury-inspired product narratives."
    ],
    metrics: [
      { label: "Teaser Campaign Reach", value: "30M+" },
      { label: "Brand Equity Index", value: "+45%" },
      { label: "Target Audience Match", value: "92%" }
    ],
    tags: ["Product Positioning", "GTM Strategy", "Luxury Marketing", "Creative Direction"],
    schematicType: "campaign",
    heroImage: "/portfolio_assets/1783857301578_Picture12.jpg#image",
    galleryImages: [
      "/portfolio_assets/1783857301578_Picture12.jpg#image",
      "/portfolio_assets/1783857285405_Picture6.jpg#image",
      "/portfolio_assets/1783857286052_Picture7.jpg#image",
      "/portfolio_assets/1783857286838_Picture8.jpg#image",
      "/portfolio_assets/1783857287783_Picture9.jpg#image",
      "/portfolio_assets/1783857288705_Picture10.jpg#image",
      "/portfolio_assets/1783857301068_Picture11.png#image"
    ]
  },
  {
    id: "vivo-5year-partnership",
    number: 11,
    title: "vivo 5-Year Strategic Partnership",
    category: "Branding & Marketing",
    subCategory: "Strategic Brand Partner",
    role: "Senior Marketing Strategist",
    period: "Multi-Year",
    market: "China / Southeast Asia",
    summary: "Orchestrated diverse marketing campaigns ranging from product launches to IP collaborations, ensuring consistent brand elevation and hyper-growth across all touchpoints.",
    challenge: "Maintaining consistent brand desirability and distinct personality across rapid smartphone iterations inside highly saturated youth markets.",
    insight: "Connecting device GTM campaigns with lifestyle aesthetic IPs, celebrity makeup algorithms, and popular variety shows builds deep cultural currency that transcends technical specifications.",
    solution: "Created circle-penetrating content on Xiaohongshu for 'Selfie Aesthetics', managed top-rated variety show integrations, and curated high-profile music and entertainment crossovers.",
    deliverables: [
      "Cross-Over Crossovers (NetEase Music)",
      "Celebrity IP Beauty Algorithms (Mao Geping)",
      "Entertainment Show Crossover Systems (Heart Signal)",
      "Niche Social Growth Playbooks (Xiaohongshu)"
    ],
    results: [
      "Southeast Asia campaign achieved 100M+ organic cross-platform impressions.",
      "Integrated variety placements drove massive social buzz and brand recall.",
      "Aesthetic influencer campaigns generated consistent year-over-year growth across 5 generations."
    ],
    metrics: [
      { label: "SEA Impressions", value: "100M+" },
      { label: "Active Generations Managed", value: "5 Gen" },
      { label: "Organic Social Reach", value: "250M+" }
    ],
    tags: ["Strategic Brand", "Entertainment Integration", "KOL Playbook", "IP Crossover"],
    schematicType: "campaign",
    heroImage: "/portfolio_assets/1783857435499_Picture1.png#image",
    galleryImages: [
      "/portfolio_assets/1783857435499_Picture1.png#image",
      "/portfolio_assets/1783857440436_Picture3.png#image",
      "/portfolio_assets/1783857442956_Picture5.png#image",
      "/portfolio_assets/1783857443797_Picture6.png#image",
      "/portfolio_assets/1783857445110_93ff5e99ej2fdaae4df422eb4555353f.png#image",
      "/portfolio_assets/1783857445598_IMG_4530.jpg#image"
    ]
  },
  {
    id: "hr-gen-ai-visual-linkedin",
    number: 10,
    title: "HR Gen-AI Visual LinkedIn Project",
    category: "AI Creative Operations",
    subCategory: "Gen-AI Workflow / Digital Marketing / Recruitment Storytelling",
    role: "Regional Content Operations Lead",
    period: "2025",
    market: "Dubai, UAE / MENA",
    summary: "Pioneered the implementation of Gen-AI visual workflows for regional digital marketing. Achieving a 40% lead conversion rate for recruitment campaigns through high-engagement storytelling.",
    challenge: "Employer branding and recruitment campaigns in the regional energy sector were struggling to attract high-potential specialized engineering and management talents due to standardized, uninspiring visual messaging.",
    insight: "Highly tailored, localized visual scenarios generated with precise safety standards and local crew characteristics resonate far better with top-tier candidates on corporate networks like LinkedIn.",
    solution: "Designed a secure hybrid visual workflow that combines AI scene construction with brand controls, hazard-QA compliance, and high-impact digital typography layouts to tell engaging professional stories.",
    deliverables: [
      "LinkedIn Key Visuals & Graphic Elements",
      "Gen-AI Prompt Systems & Creative SOPs",
      "Safety Hazard QA Protocol Standards",
      "Localized Talent Profile Ad Sets"
    ],
    results: [
      "Achieved an exceptional 40% lead conversion rate for recruitment campaigns.",
      "Delivered hundreds of high-engagement campaign assets at a fraction of standard cost.",
      "Set an advanced corporate storytelling benchmark for employer brand communication on LinkedIn."
    ],
    metrics: [
      { label: "Lead Conversion Rate", value: "40%" },
      { label: "Talent Engagement Index", value: "3x Higher" },
      { label: "Content Cycle Speedup", value: "5x Faster" }
    ],
    tags: ["LinkedIn Growth", "Generative AI", "Employer Branding", "SOP", "Recruitment"],
    schematicType: "campaign",
    heroImage: "/portfolio_assets/opt_1783857560006_QHSE2.mp4#video",
    galleryImages: [
      "/portfolio_assets/opt_1783857560006_QHSE2.mp4#video",
      "/portfolio_assets/opt_1783857529702_jimeng-2025-08-20-5888-_________________________________________2.mp4#video",
      "/portfolio_assets/opt_1783857539969_MUD3.mp4#video",
      "/portfolio_assets/opt_1783857550167_QHSE.mp4#video"
    ]
  },
  {
    id: "curioeye-fashion-intelligence-saas",
    number: 7,
    title: "Farfetch / CurioEye SaaS Commercialization",
    category: "Product & UI/UX",
    subCategory: "B2B SaaS Commercialization / Data Visualization",
    role: "Commercial Product & Growth Operations",
    period: "2023 - 2024",
    market: "APAC / China",
    summary: "Led B2B SaaS commercialization, product onboarding, partner enablement, analytics, and luxury brand growth operations for CurioEye (Farfetch), shifting raw data to high-impact visual intelligence dashboards.",
    challenge: "CurioEye held valuable fashion trend and market data, but partners struggled to extract actionable insights. Adoption was low, causing churn risk among top-tier APAC luxury accounts.",
    insight: "Luxury brand managers do not buy data; they buy business clarity. Reframing datasets into interactive, highly targeted visual stories drives enterprise alignment.",
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
    schematicType: "analytics",
    heroImage: "/portfolio_assets/1783857642354____Curio_eye_One_pager__20230807.___001.jpeg#image",
    galleryImages: [
      "/portfolio_assets/1783857642354____Curio_eye_One_pager__20230807.___001.jpeg#image",
      "/portfolio_assets/1783857645866_CurioEye_demo3_compressed.gif#image",
      "/portfolio_assets/1783857647432_3bcaf45a2rb4e49ccbb87dadc8240a9e.PNG.png#image",
      "/portfolio_assets/1783857648053_4caf472e4occ3d445ce0e46f03f402d3.PNG.png#image",
      "/portfolio_assets/1783857648634_6bb631cebrad8b82d0ca53fba241c9fb.PNG.png#image",
      "/portfolio_assets/1783857650434_09ed9a0c0rdf1ec37c6490e103a6e167.PNG.png#image",
      "/portfolio_assets/1783857651073_89ea8f2b3qc3fe244ba91bb971a1c361.PNG.png#image",
      "/portfolio_assets/1783857653275_curioeye_V6.1.png#image",
      "/portfolio_assets/1783857653826_f01774f99k896b52b307bc59c7313582.PNG.png#image"
    ]
  },
  {
    id: "john-lobb-wechat-flagship-store",
    number: 8,
    title: "John Lobb WeChat Flagship Store",
    category: "Product & UI/UX",
    subCategory: "Luxury E-Commerce / UX & Service Design",
    role: "Product & UX Lead",
    period: "2023",
    market: "China",
    summary: "Developed a bespoke WeChat flagship mini-program store for John Lobb, translating the legendary brand's heritage into an elegant, high-touch mobile commerce and O2O concierge booking journey.",
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
    schematicType: "mobile",
    heroImage: "/portfolio_assets/1783857798873_____________-______.jpg#image",
    galleryImages: [
      "/portfolio_assets/1783857798873_____________-______.jpg#image",
      "/portfolio_assets/1783857799472_____________.jpg#image",
      "/portfolio_assets/1783857800115_____________.jpg#image",
      "/portfolio_assets/1783857800615_______-__________________.jpg#image",
      "/portfolio_assets/1783857801135_____________.jpg#image",
      "/portfolio_assets/1783857801652_______.jpg#image",
      "/portfolio_assets/1783857802246________________-____________.jpg#image",
      "/portfolio_assets/1783857802877_____________.jpg#image",
      "/portfolio_assets/1783857803504_____________.jpg#image",
      "/portfolio_assets/1783857804014__________-____________.jpg#image",
      "/portfolio_assets/1783857804571__________.jpg#image",
      "/portfolio_assets/1783857805119_______.jpg#image"
    ]
  },
  {
    id: "baccarat-ux-optimization",
    number: 9,
    title: "Baccarat UX Optimization",
    category: "Product & UI/UX",
    subCategory: "E-Commerce CRO / A/B Testing / Seasonal Campaigns",
    role: "UX & Growth Operations Lead",
    period: "2023",
    market: "China",
    summary: "Optimized Baccarat's luxury e-commerce checkout flow, checkout visual hierarchies, mobile friction barriers, and engineered seasonal referral gifting mechanisms to trigger exponential conversion during peak holidays.",
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
    schematicType: "analytics",
    heroImage: "/portfolio_assets/1783857861571_Group_1.png#image",
    galleryImages: [
      "/portfolio_assets/1783857861571_Group_1.png#image",
      "/portfolio_assets/1783857862557_Group_2.png#image",
      "/portfolio_assets/1783857864556_4d877ba94i3801a2c50c8852c98d4ea8.PNG.png#image",
      "/portfolio_assets/1783857865405_IMG_6134.png#image",
      "/portfolio_assets/1783857867901_IMG_6135.png#image"
    ]
  },
  {
    id: "cityu-seo-campaign",
    number: 12,
    title: "City University of HK",
    category: "Branding & Marketing",
    subCategory: "03. GTM Campaign / Dual-Engine SEO: Google & Baidu",
    role: "SEO Strategy & Operations Lead",
    period: "12-Month Operation",
    market: "Hong Kong / China / Global",
    summary: "Directed a dual-engine SEO programme for City University of Hong Kong spanning both Google and Baidu ecosystems, aligning on-page optimization, backlink authority, and native content placement under a unified bilingual editorial plan.",
    challenge: "Reaching prospective students who search in two languages on two very different engines: Google's link-driven ranking and Baidu's owned-property ecosystem (Zhidao, Baijiahao, BBS).",
    insight: "One playbook cannot serve both engines. Google rewards authority and backlinks; Baidu rewards native content inside its own properties. The programme had to run two strategies under one editorial calendar.",
    solution: "Delivered a 12-month dual-engine SEO programme spanning both ecosystems: on-page optimization and authority building for Google, native content placement across Baidu's properties, unified by a bilingual content plan.",
    deliverables: [
      "Bilingual Editorial Content Plan",
      "Google On-Page & Backlink Optimization SOP",
      "Baidu Owned-Property Content Placement (Zhidao, Baijiahao)",
      "Unified Cross-Engine Analytics Dashboard"
    ],
    results: [
      "Achieved a sustained +18% increase in website monthly conversion rate.",
      "Established a single coherent content strategy across two distinct search ecosystems.",
      "Successfully optimized visibility across both Google's link-driven index and Baidu's native platform property group."
    ],
    metrics: [
      { label: "Monthly Conversion", value: "+18%" },
      { label: "Search Ecosystems", value: "One Coherent" },
      { label: "Bilingual Platform", value: "Google & Baidu" }
    ],
    tags: ["SEO", "Baidu", "Google", "Bilingual Content", "GTM Campaign"],
    schematicType: "campaign",
    heroImage: "",
    galleryImages: []
  },
  {
    id: "hyundai-china-campaign",
    number: 13,
    title: "Hyundai China",
    category: "Branding & Marketing",
    subCategory: "03. GTM Campaign / Five-Platform Integrated Campaign & Operation",
    role: "Integrated Campaigns & Social Operations Lead",
    period: "2024 - 2025",
    market: "China",
    summary: "Led Hyundai China's digital campaigns across WeChat, Douyin, Xiaohongshu, Weibo, and Video Account, using behavioral data to tailor content and targeting per platform while holding one campaign narrative.",
    challenge: "Hyundai needed to lift brand engagement in a crowded auto market where attention is fragmented across five major Chinese platforms, each with its own content language and audience behavior.",
    insight: "A single creative repurposed everywhere underperforms. Each platform needed content shaped to its native format, coordinated by shared targeting logic rather than a shared asset.",
    solution: "Led Hyundai China's digital campaigns across WeChat, Douyin, Xiaohongshu, Weibo, and Video Account, using behavioral data to tailor content and targeting per platform while holding one campaign narrative.",
    deliverables: [
      "Multi-Platform Content Framework",
      "Platform-Specific Native Content Playbook",
      "Behavioral Audience Segmenting Model",
      "Cross-Platform Campaign Coordination SOP"
    ],
    results: [
      "Achieved an exceptional +120% Engagement versus prior-year KPI.",
      "Coordinated campaigns smoothly across WeChat, Douyin, Xiaohongshu, Weibo, and Video Account.",
      "Successfully established a coherent, high-performing campaign narrative across all channels."
    ],
    metrics: [
      { label: "Engagement Increase", value: "+120%" },
      { label: "Platforms Covered", value: "5 Channels" },
      { label: "Targeting Accuracy", value: "Data-Led" }
    ],
    tags: ["Integrated Campaign", "Social Operations", "Hyundai China", "Growth Marketing"],
    schematicType: "campaign",
    heroImage: "/portfolio_assets/1783857910428_Screenshot_2026-07-10_at_4.34.17___PM.png#image",
    galleryImages: [
      "/portfolio_assets/1783857910428_Screenshot_2026-07-10_at_4.34.17___PM.png#image",
      "/portfolio_assets/1783857915309_IMG_7520.PNG.png#image",
      "/portfolio_assets/1783857917858_IMG_7521_2.PNG.png#image",
      "/portfolio_assets/1783858393690_IMG_7523.PNG.png#image",
      "/portfolio_assets/1783858396609_IMG_7524_2.PNG.png#image",
      "/portfolio_assets/1783858402480_IMG_7525_2.PNG.png#image"
    ]
  },
  {
    id: "volvo-internal-platform",
    number: 14,
    title: "Volvo China",
    category: "Product & UI/UX",
    subCategory: "02. Product & UI/UX / Building An Internal Employee Engagement Platform",
    role: "Internal Employee Platform & Engagement Operations Lead",
    period: "12-Month Operation",
    market: "China",
    summary: "Ran the 12-month operation of Volvo China's internal employee platform end to end, covering content programming, in-platform service modules, and ongoing optimization based on usage data to drive consistent engagement and utility.",
    challenge: "Volvo's China workforce was spread across functions and locations with no single owned channel for internal communication, culture, and HR services. Information was scattered and employee engagement was hard to sustain or measure.",
    insight: "An internal platform only earns daily use if it delivers real utility. The priority was weaving content, HR services, and community into employees' routines, not one-off announcements.",
    solution: "Ran the 12-month operation of Volvo China's internal employee platform end to end, covering content programming, in-platform service modules, and ongoing optimization based on usage data.",
    deliverables: [
      "Content Programming & Publishing Calendar",
      "In-Platform HR Service Modules",
      "Employee Interactive Community Channels",
      "Ongoing Optimization Reports & Dashboards"
    ],
    results: [
      "Delivered sustained employee daily engagement and long-term retention on the platform.",
      "Unified content programming, localized services, and feedback loops into a single operating channel.",
      "Optimized service delivery workflows based on user engagement metrics."
    ],
    metrics: [
      { label: "Active Engagement", value: "Sustained" },
      { label: "Service Modules", value: "Fully Unified" },
      { label: "Operation Duration", value: "12 Months" }
    ],
    tags: ["Employee Platform", "UX Design", "Operations", "Internal Communications"],
    schematicType: "mobile",
    heroImage: "/portfolio_assets/1783857993895_Picture2.png#image",
    galleryImages: [
      "/portfolio_assets/1783857993895_Picture2.png#image",
      "/portfolio_assets/1783858432274_Picture3.png#image",
      "/portfolio_assets/1783858437021_Picture1.png#image"
    ]
  }
];

// Store unmutated original gallery config for reset capability
WORKS.forEach(work => {
  (work as any).originalGalleryImages = [...(work.galleryImages || [])];
  (work as any).originalGalleryLinks = { ...((work as any).galleryLinks || {}) };
});

export const cleanMediaUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  return url.split('#')[0];
};

export const isBrokenUrl = (url: string): boolean => {
  if (!url) return false;
  // Check if the URL is or contains specific legacy broken patterns without timestamp prefixes
  const exactBrokenList = [
    '1783661293602_Screenshot',
    '1783673490533_Screenshot',
    '1783673503827',
    '1783688860067_Screenshot',
    '1783689277346_Screenshot',
    'opt_1783798718120',
    'opt_1783797703502',
    'opt_1783798702794',
    'opt_1783798680868'
  ];
  if (exactBrokenList.some(item => url.includes(item))) {
    return true;
  }

  // For IMG_7520 to IMG_7525, they are only broken if they are legacy names NOT prefixed by a timestamp
  const legacyImgMatch = url.match(/IMG_752[0-5]/i);
  if (legacyImgMatch) {
    // Blob uploads use a hyphen while older local uploads used an underscore.
    // Both timestamp formats are valid uploaded files, not legacy broken assets.
    const hasTimestampPrefix = /\d{13}[-_]IMG_752[0-5]/i.test(url);
    if (!hasTimestampPrefix) {
      return true;
    }
  }

  return false;
};

// Load any saved custom gallery images and links from localStorage on initial load
if (typeof window !== 'undefined' && window.localStorage) {
  WORKS.forEach(work => {
    try {
      const savedImages = window.localStorage.getItem(`project_gallery_images_${work.id}`);
      if (savedImages) {
        try {
          const parsed = JSON.parse(savedImages);
          if (Array.isArray(parsed)) {
            // Self-heal: Migrate old /uploads/ paths to /portfolio_assets/ and filter out empty /portfolio_mapping/
            const migrated = parsed
              .map((url: string) => {
                if (url && url.startsWith('/uploads/')) {
                  return url.replace('/uploads/', '/portfolio_assets/');
                }
                return url;
              })
              .filter((url: string) => {
                return (
                  url &&
                  !url.startsWith('blob:') &&
                  !isBrokenUrl(url) &&
                  !url.startsWith('/portfolio_mapping/recommended_assets/')
                );
              });
            
            if (migrated.length !== parsed.length || JSON.stringify(migrated) !== JSON.stringify(parsed)) {
              try {
                window.localStorage.setItem(`project_gallery_images_${work.id}`, JSON.stringify(migrated));
              } catch (innerErr) {
                console.warn("[LocalStorage] Failed to update project gallery images key:", innerErr);
              }
            }
            work.galleryImages = migrated;
          }
        } catch (parseErr) {
          console.warn("[LocalStorage] Failed to parse gallery images for project:", work.id, parseErr);
        }
      }
    } catch (err) {
      console.warn("[LocalStorage] Failed to read gallery images for project:", work.id, err);
    }

    try {
      const savedLinks = window.localStorage.getItem(`project_gallery_links_${work.id}`);
      if (savedLinks) {
        try {
          const parsedLinks = JSON.parse(savedLinks);
          const migratedLinks: Record<string, string> = {};
          Object.entries(parsedLinks).forEach(([key, val]) => {
            const newKey = key.startsWith('/uploads/') ? key.replace('/uploads/', '/portfolio_assets/') : key;
            const newVal = typeof val === 'string' && val.startsWith('/uploads/') ? val.replace('/uploads/', '/portfolio_assets/') : val;
            migratedLinks[newKey] = newVal as string;
          });
          if (JSON.stringify(migratedLinks) !== JSON.stringify(parsedLinks)) {
            try {
              window.localStorage.setItem(`project_gallery_links_${work.id}`, JSON.stringify(migratedLinks));
            } catch (innerErr) {
              console.warn("[LocalStorage] Failed to update project gallery links key:", innerErr);
            }
          }
          (work as any).galleryLinks = migratedLinks;
        } catch (parseErr) {
          console.warn("[LocalStorage] Failed to parse gallery links for project:", work.id, parseErr);
        }
      }
    } catch (err) {
      console.warn("[LocalStorage] Failed to read gallery links for project:", work.id, err);
    }
  });
}
