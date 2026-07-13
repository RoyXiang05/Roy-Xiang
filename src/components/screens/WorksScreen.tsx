import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import RevealText from '../core/RevealText';
import IndexLabel from '../core/IndexLabel';
import Tag from '../core/Tag';
import FolderCover from '../archive/FolderCover';
import WorkCard, { renderSchematic } from '../archive/WorkCard';
import WorkRow from '../archive/WorkRow';
import { WORKS, Work, isBrokenUrl, cleanMediaUrl } from '../../data';
import { ArrowLeft, FolderOpen, Calendar, Shield, Cpu, Tag as TagIcon, Barcode, Scissors } from 'lucide-react';
import LogoCropper from '../core/LogoCropper';
import { apiFetch } from '../../lib/api';

interface WorksScreenProps {
  onSelectProject: (project: Work) => void;
  isViewActive?: boolean;
  onNavigate?: (viewName: string) => void;
}

const getProjectAbbreviation = (work: Work) => {
  switch (work.id) {
    case 'ai-visual-production-workflow': return 'AVP';
    case 'ai-enabled-content-ops': return 'ACO';
    case 'ai-coded-supplier-platform': return 'SOP';
    case 'hitl-genai-safety-communication': return 'HSC';
    case 'adipec-anton-brand-experience': return 'AEB';
    case 'oppo-find-n5-gtm': return 'OPP';
    case 'vivo-5year-partnership': return 'VIV';
    case 'hr-gen-ai-visual-linkedin': return 'HGA';
    case 'curioeye-fashion-intelligence-saas': return 'FSC';
    case 'john-lobb-wechat-flagship-store': return 'JLW';
    case 'baccarat-ux-optimization': return 'BUO';
    case 'cityu-seo-campaign': return 'CYU';
    case 'hyundai-china-campaign': return 'HYU';
    case 'volvo-internal-platform': return 'VOL';
    default: return 'WRK';
  }
};

const isVideoUrl = (url?: string) => {
  if (!url) return false;
  if (url.includes('#video')) return true;
  if (url.includes('#image')) return false;
  
  const cleanUrl = url.split('?')[0].split('#')[0].toLowerCase();
  return (
    cleanUrl.endsWith('.mp4') || 
    cleanUrl.endsWith('.webm') || 
    cleanUrl.endsWith('.mov') || 
    cleanUrl.endsWith('.ogg') ||
    cleanUrl.includes('mixkit.co/videos')
  );
};

const BRAND_LOGOS = [
  { id: 'anton', label: 'Anton & Andong', file: 'image2_01_anton-andong.svg' },
  { id: 'sinopec', label: 'Sinopec', file: 'image2_02_sinopec.svg' },
  { id: 'hyundai', label: 'Hyundai', file: 'image2_03_hyundai.svg' },
  { id: 'baccarat', label: 'Baccarat', file: 'image2_04_baccarat.svg' },
  { id: 'john_lobb', label: 'John Lobb', file: 'image2_05_john-lobb.svg' },
  { id: 'oppo', label: 'OPPO', file: 'image2_06_oppo.svg' },
  { id: 'vivo', label: 'vivo', file: 'image2_07_vivo.svg' },
  { id: 'douyin', label: 'Douyin', file: 'image2_08_douyin.svg' },
  { id: 'red', label: 'Xiaohongshu', file: 'image2_09_xiaohongshu.svg' },
  { id: 'tencent', label: 'Tencent', file: 'image2_10_tencent.svg' },
  { id: 'tencent_ad', label: 'Tencent Ads', file: 'image2_11_tencent-ads.svg' },
  { id: 'kuaishou', label: 'Kuaishou', file: 'image2_12_kuaishou.svg' },
  { id: 'ocean_engine', label: 'Ocean Engine', file: 'image2_13_ocean-engine.svg' },
] as const;

export default function WorksScreen({ onSelectProject, isViewActive = true, onNavigate }: WorksScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [displayType, setDisplayType] = useState<'cabinet' | 'flat'>('cabinet');

  // Scrolling phrases inside angle brackets
  const [phraseIndex, setPhraseIndex] = useState(0);
  const phrases = [
    'applied AI',
    'AI production pipelines',
    'creative automation',
    'vibe-coded prototypes',
    'growth marketing',
    'content systems',
    'prompt frameworks',
    'human-in-the-loop QA',
    'product management',
    'UI/UX design',
    'graphic design',
    'video producing'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Animation and view states
  const [animatingCat, setAnimatingCat] = useState<any | null>(null);
  const [animPhase, setAnimPhase] = useState<'idle' | 'tucked' | 'pull' | 'zoom' | 'reverse-zoom' | 'reverse-pull'>('idle');
  const [clickRect, setClickRect] = useState<DOMRect | null>(null);
  const [reverseActive, setReverseActive] = useState<boolean>(false);

  // Logo Cropper Custom Assets States & Handlers
  const [showCropper, setShowCropper] = useState<boolean>(false);
  const [customLogos, setCustomLogos] = useState<Record<string, string>>({});

  const [galleryUpdated, setGalleryUpdated] = useState(0);

  const loadCustomLogos = () => {
    const loaded: Record<string, string> = {};
    const brandIds = [
      'sinopec', 'douyin', 'red', 'tencent', 'tencent_ad', 
      'lenovo', 'dior', 'john_lobb', 'vanke', 'vivo', 
      'kuaishou', 'ocean_engine', 'estee_lauder'
    ];
    brandIds.forEach((id) => {
      const saved = localStorage.getItem(`custom_logo_${id}`);
      if (saved) {
        loaded[id] = saved;
      }
    });
    setCustomLogos(loaded);
  };

  useEffect(() => {
    loadCustomLogos();
    
    const applyConfig = (config: any) => {
      if (config) {
        let updated = false;
        WORKS.forEach(work => {
          if (config[work.id]) {
            const savedImages = (config[work.id].galleryImages || []).filter((url: string) => !url.startsWith('blob:') && !isBrokenUrl(url));
            const savedPosters = config[work.id].videoPosters || {};
            
            // Only override with API config if there is no local user override in localStorage
            let hasLocalOverride = false;
            if (typeof window !== 'undefined' && window.localStorage) {
              try {
                const storedImagesStr = window.localStorage.getItem(`project_gallery_images_${work.id}`);
                if (storedImagesStr) {
                  const parsed = JSON.parse(storedImagesStr).filter((url: string) => !url.startsWith('blob:') && !isBrokenUrl(url));
                  if (parsed.length > 0) {
                    hasLocalOverride = true;
                  }
                }
              } catch (e) {
                // Ignore parse errors
              }
            }

            if (!hasLocalOverride && savedImages.length > 0) {
              work.galleryImages = savedImages;
              updated = true;
            }
            if (Object.keys(savedPosters).length > 0) {
              (work as any).videoPosters = { ...((work as any).videoPosters || {}), ...savedPosters };
              updated = true;
            }
          }
        });
        if (updated) {
          setGalleryUpdated(prev => prev + 1);
        }
      }
    };

    // Fetch latest gallery configuration from server to sync WORKS
    apiFetch('/api/gallery')
      .then(res => {
        if (!res.ok) throw new Error('API server unreachable');
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('API did not return JSON');
        }
        return res.json();
      })
      .then(config => {
        applyConfig(config);
      })
      .catch(err => {
        console.warn('[Gallery] Error syncing with server config, trying static fallback:', err);
        apiFetch('/portfolio_assets/gallery_config.json')
          .then(res => {
            if (!res.ok) throw new Error('Static config unreachable');
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              throw new Error('Static config did not return JSON');
            }
            return res.json();
          })
          .then(config => {
            applyConfig(config);
          })
          .catch(staticErr => {
            console.warn('[Gallery] Both API and static config fallback failed:', staticErr);
          });
      });
  }, []);

  const renderBrandLogo = (id: string, defaultSvg: React.ReactNode) => {
    if (customLogos[id]) {
      return (
        <div className="flex items-center h-6 hover:opacity-100 transition-opacity duration-200" id={`brand-logo-custom-${id}`}>
          <img 
            src={customLogos[id]} 
            alt={id} 
            className="h-6 object-contain" 
          />
        </div>
      );
    }
    return defaultSvg;
  };

  // Lock body scroll when floating overlay is active to keep parent scroll position pristine and avoid layout shift
  useEffect(() => {
    // Lock before the zoom begins so the scrollbar cannot change the card's
    // measured position midway through its transition.
    if (animatingCat && isViewActive) {
      // Calculate exact scrollbar width
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [animatingCat, isViewActive]);

  const categories = useMemo(() => [
    { 
      number: 1, 
      title: 'AI Creative Operations' as const, 
      subtitle: `${WORKS.filter(w => w.category === 'AI Creative Operations').length} FILES ARCHIVED`, 
      tone: 'klein' as const,
      details: WORKS.filter(w => w.category === 'AI Creative Operations').map(w => w.title),
      description: "Turning manual creative, marketing, and business processes into repeatable, high-efficiency AI-enabled workflows and functional business prototypes."
    },
    { 
      number: 2, 
      title: 'Branding & Marketing' as const, 
      subtitle: `${WORKS.filter(w => w.category === 'Branding & Marketing').length} FILES ARCHIVED`, 
      tone: 'ink' as const,
      details: WORKS.filter(w => w.category === 'Branding & Marketing').map(w => w.title),
      description: "High-impact brand, product campaign, and exhibition strategies that form the foundation of our commercial and digital operations across APAC, MENA, and global markets."
    },
    { 
      number: 3, 
      title: 'Product & UI/UX' as const, 
      subtitle: `${WORKS.filter(w => w.category === 'Product & UI/UX').length} FILES ARCHIVED`, 
      tone: 'paper' as const,
      details: WORKS.filter(w => w.category === 'Product & UI/UX').map(w => w.title),
      description: "UX blueprints, digital product architectures, and optimization strategies that support high-growth e-commerce, enterprise SaaS, and retail operations."
    }
  ], []);

  // Tags for the active animating category specifically, so the tags list is relevant to what's inside!
  const currentCategoryTags = useMemo(() => {
    if (!animatingCat) return ['All'];
    const tagsSet = new Set<string>();
    const worksInCat = WORKS.filter(w => w.category === animatingCat.title);
    worksInCat.forEach(work => {
      work.tags.forEach(t => tagsSet.add(t));
    });
    return ['All', ...Array.from(tagsSet)];
  }, [animatingCat]);

  // Works filtered for the currently animating category
  const filteredCategoryWorks = useMemo(() => {
    if (!animatingCat) return [];
    return WORKS.filter(work => {
      const matchCategory = work.category === animatingCat.title;
      const matchTag = selectedTag === 'All' || work.tags.includes(selectedTag);
      const matchQuery = searchQuery === '' || 
        work.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        work.subCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
        work.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        work.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchTag && matchQuery;
    });
  }, [animatingCat, selectedTag, searchQuery]);

  // Works filtered for the flat index grid view
  const flatFilteredWorks = useMemo(() => {
    return WORKS.filter(work => {
      const matchCategory = selectedCategory === 'All' || work.category === selectedCategory;
      return matchCategory;
    });
  }, [selectedCategory]);

  // Click on a scrolling marquee/index item opens the respective cabinet folder dossier
  const handleMarqueeItemClick = (catNumber: number) => {
    let folderNumber = 1;
    if (catNumber === 4) folderNumber = 2;
    if (catNumber === 5) folderNumber = 3;

    const targetCat = categories.find(c => c.number === folderNumber);
    if (targetCat) {
      const el = document.getElementById(`folder-cover-${folderNumber}`);
      if (el) {
        handleFolderClick(targetCat, el.getBoundingClientRect());
      } else {
        // Fallback if folder cover element is temporarily not mounted or flat view is active
        setDisplayType('cabinet');
        setTimeout(() => {
          const freshEl = document.getElementById(`folder-cover-${folderNumber}`);
          if (freshEl) {
            handleFolderClick(targetCat, freshEl.getBoundingClientRect());
          } else {
            setSelectedTag('All');
            setSearchQuery('');
            setAnimatingCat(targetCat);
            setAnimPhase('zoom');
            setActiveCategoryPage(targetCat.title);
          }
        }, 100);
      }
    }
  };

  // Click on a category folder leaves the dossier in place and fades in its collection.
  const handleFolderClick = (cat: any, rect: DOMRect) => {
    setSelectedTag('All');
    setSearchQuery('');
    setClickRect(rect);
    setAnimatingCat(cat);
    setAnimPhase('idle');
    
    // Leave one paint frame for the folder, then reveal the collection only.
    requestAnimationFrame(() => {
      setAnimPhase('zoom');
    });
  };

  // Fades the collection away without moving the folder preview.
  const handleBackToCabinet = () => {
    if (!animatingCat) {
      return;
    }

    // Keep the existing overlay geometry while fading out. Re-reading the
    // folder position here caused a one-frame resize on return.
    setAnimPhase('reverse-zoom');

    // The collection only fades out; the dossier underneath never travels.
    setTimeout(() => {
      setAnimPhase('idle');
      setAnimatingCat(null);
      setClickRect(null);
    }, 280);
  };

  // Computes precise GPU-accelerated styles for the animating card to prevent layout reflows
  const getAnimatingCardStyle = () => {
    if (!clickRect || !animatingCat) return {};

    const cardWidth = clickRect.width - 20;
    const cardHeight = 208;
    const cardLeft = clickRect.left + 10;
    // The paper insert bottom is aligned 12px from folder bottom (bottom-3 in tailwind is 12px)
    // The total height of the FolderCover is 368px.
    // So paper insert top is: folder top + (368 - 12 - 208) = folder top + 148px
    const cardTop = clickRect.top + 148;
    const targetWidth = Math.min(cardWidth * 3, window.innerWidth - 32);
    const targetHeight = Math.min(cardHeight * 4.5, window.innerHeight - 48);
    const targetLeft = (window.innerWidth - targetWidth) / 2;
    const targetTop = (window.innerHeight - targetHeight) / 2;
    const scaleX = cardWidth / targetWidth;
    const scaleY = cardHeight / targetHeight;
    const startX = cardLeft - targetLeft;
    const startY = cardTop - targetTop;
    const paperTransform = (offsetY: number) =>
      `translate3d(${startX}px, ${startY + offsetY}px, 0) scale(${scaleX}, ${scaleY}) rotate(-1.5deg)`;

    const initialStyle: React.CSSProperties = {
      position: 'fixed',
      left: `${targetLeft}px`,
      top: `${targetTop}px`,
      width: `${targetWidth}px`,
      height: `${targetHeight}px`,
      zIndex: 40,
      pointerEvents: 'none',
      transformOrigin: 'top left',
      borderRadius: '4px',
      opacity: 0,
      transition: 'none',
      willChange: 'transform, opacity',
    };

    if (animPhase === 'tucked') {
      return {
        ...initialStyle,
        transform: paperTransform(-70),
        opacity: 0,
        transition: 'none',
      };
    }

    if (animPhase === 'pull') {
      return {
        ...initialStyle,
        transform: paperTransform(-210),
        opacity: 0,
        transition: 'none',
      };
    }

    if (animPhase === 'zoom') {
      return {
        ...initialStyle,
        transform: 'translate3d(0, 0, 0)',
        borderRadius: '8px',
        pointerEvents: 'auto',
        opacity: 1,
        transition: 'opacity 0.28s ease-out',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      };
    }

    if (animPhase === 'reverse-zoom') {
      return {
        ...initialStyle,
        transform: 'translate3d(0, 0, 0)',
        opacity: 0,
        transition: 'opacity 0.24s ease-in',
      };
    }

    if (animPhase === 'reverse-pull') {
      return {
        ...initialStyle,
        transform: paperTransform(-70),
        opacity: 0,
        transition: 'opacity 0.15s ease-out',
      };
    }

    return initialStyle;
  };

  const getThemeColors = (tone: 'ink' | 'klein' | 'paper') => {
    switch (tone) {
      case 'klein':
        return {
          banner: 'bg-klein text-paper-0',
          tab: 'bg-klein border-klein text-paper-0',
          seal: 'border-klein text-klein',
          accent: 'text-klein'
        };
      case 'ink':
        return {
          banner: 'bg-ink-900 text-paper-0',
          tab: 'bg-ink-900 border-ink-900 text-paper-0',
          seal: 'border-ink-800 text-ink-800',
          accent: 'text-ink-800'
        };
      case 'paper':
      default:
        return {
          banner: 'bg-paper-100 text-ink-900 border-b border-ink-150',
          tab: 'bg-paper-100 border-ink-150 text-ink-700',
          seal: 'border-red-600/60 text-red-600/80 rotate-[-12deg]',
          accent: 'text-ink-900'
        };
    }
  };

  return (
    <div className="relative min-h-screen">
      
      {/* 1. WORK COLLECTION FADE OVERLAY */}
      {animatingCat && (
        <div 
          className={`fixed inset-0 overflow-hidden flex items-center justify-center ${
            (animPhase === 'zoom' || animPhase === 'reverse-zoom') 
              ? 'z-50 pointer-events-auto cursor-zoom-out' 
              : 'z-[15] pointer-events-none'
          }`}
          onClick={handleBackToCabinet}
        >
          {/* Hardware-accelerated smooth backdrop blur element */}
          <div 
            className={`absolute inset-0 transition-opacity duration-[280ms] ease-out ${
              animPhase === 'zoom' ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundColor: 'rgba(10, 10, 10, 0.25)',
              // Full-viewport blur is costly while the card is still moving.
              // Enable a lighter blur only once it reaches the detail state.
              backdropFilter: animPhase === 'zoom' ? 'blur(8px)' : 'none',
              WebkitBackdropFilter: animPhase === 'zoom' ? 'blur(8px)' : 'none',
              willChange: 'opacity',
              pointerEvents: 'none',
            }}
          />
          {/* Paper Insert Document (Animates dynamically with GPU transition style) */}
          <div
            className={`bg-paper-0 shadow-2xl border relative flex flex-col justify-between overflow-hidden cursor-default ${
              animatingCat.tone === 'klein' ? 'border-klein-tint border-l-4 border-l-klein' :
              animatingCat.tone === 'ink' ? 'border-ink-150 border-l-4 border-l-ink-800' :
              'border-ink-150 border-l-4 border-l-klein'
            }`}
            style={{
              ...getAnimatingCardStyle(),
              backgroundColor: '#ffffff',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grid pattern overlay - retained for legacy non-fade states */}
            {animPhase !== 'zoom' && (
              <div 
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
                  backgroundSize: '8px 8px'
                }}
              />
            )}

            {/* A. SMALL CARD CONTENT (fades out as card zooms to full screen) */}
            <div 
              className={`absolute inset-0 p-5 flex flex-col justify-between transition-opacity duration-300 ease-out z-10 ${
                (animPhase === 'tucked' || animPhase === 'pull' || animPhase === 'reverse-pull') 
                  ? 'opacity-100'
                  : 'opacity-0 pointer-events-none'
              }`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-ink-100 pb-1.5 mb-3">
                  <span className="font-mono text-[8px] uppercase tracking-wider opacity-60">
                    ARCHIVE DOSSIER // VOL.{String(animatingCat.number).padStart(2, '0')}
                  </span>
                  <span className="font-mono text-[8px] uppercase tracking-widest opacity-80 text-klein font-bold">
                    RESTRICTED
                  </span>
                </div>

                <div className="flex flex-col space-y-1.5">
                  {animatingCat.details.slice(0, 4).map((detail: string, idx: number) => (
                    <div key={idx} className="flex items-start space-x-1.5">
                      <span className="font-mono text-[8px] opacity-40 mt-0.5">•</span>
                      <span className="font-sans text-[10px] leading-tight font-medium text-ink-700 tracking-tight truncate max-w-[210px]">
                        {detail}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-end justify-between border-t border-ink-100 pt-1.5">
                <span className="font-mono text-[8px] opacity-40">
                  SYS_REF: {2821 + animatingCat.number}-X
                </span>
                <div className="flex items-end space-x-[1px] h-4 opacity-40">
                  <div className="w-[1px] h-full bg-ink-900" />
                  <div className="w-[2px] h-full bg-ink-900" />
                  <div className="w-[1px] h-full bg-ink-900" />
                  <div className="w-[3px] h-full bg-ink-900" />
                  <div className="w-[1px] h-full bg-ink-900" />
                  <div className="w-[2px] h-full bg-ink-900" />
                </div>
              </div>
            </div>

            {/* B. WORK COLLECTION (fades in without moving the dossier preview) */}
            <div 
              className={`relative z-15 flex flex-col md:flex-row gap-8 md:gap-12 w-full p-8 md:p-12 transition-opacity duration-[280ms] ease-out h-full min-h-full overflow-y-auto bg-white ${
                animPhase === 'zoom' ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              {/* LEFT COLUMN: ARCHIVE SIDEBAR */}
              <div className="w-full md:w-64 flex-shrink-0 flex flex-col justify-between">
                <div>
                  <h2 className="font-sans font-bold text-4xl tracking-wider text-[#2d2722] mb-6 select-none uppercase">
                    WORK
                  </h2>
                  
                  <div className="space-y-4">
                    <span className="font-mono text-[9px] text-[#2d2722]/60 font-bold block mb-2 tracking-widest uppercase">
                      Category // {animatingCat.title}
                    </span>
                    <p className="font-sans text-[11px] leading-relaxed text-[#4c423a] mb-6 font-medium">
                      {animatingCat.description}
                    </p>
                    
                    <div className="border-t border-[#8c8278] pt-4 space-y-1.5">
                      {WORKS.filter(w => w.category === animatingCat.title).map((work) => (
                        <div
                          key={work.id}
                          onClick={() => onSelectProject(work)}
                          className="font-sans text-[13px] text-[#322c27] hover:text-[#002FA7] transition-all cursor-pointer font-medium py-1 border-b border-[#9c938a]/30 flex items-center justify-between group/item"
                        >
                          <span className="truncate pr-4">{work.title}</span>
                          <span className="font-mono text-[9px] text-[#5c524a] group-hover/item:text-[#002FA7] group-hover/item:translate-x-0.5 transition-transform">
                            →
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#8c8278]/30">
                  <button
                    onClick={handleBackToCabinet}
                    className="flex items-center space-x-2 font-mono text-[10px] uppercase tracking-widest text-[#2d2722] hover:text-white transition-all group focus:outline-none cursor-pointer border border-[#2d2722] px-4 py-2 bg-transparent hover:bg-[#2d2722]"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                    <span>[ RETURN ]</span>
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: DOCUMENT FILE CARDS GRID */}
              <div className="flex-grow overflow-y-auto max-h-full pr-2 custom-scrollbar">
                {(() => {
                  const filteredWorks = WORKS.filter(w => w.category === animatingCat.title);
                  const leftWorks = filteredWorks.filter((_, i) => i % 2 === 0);
                  const rightWorks = filteredWorks.filter((_, i) => i % 2 !== 0);

                  const renderWorkCard = (work: typeof WORKS[0], idx: number) => {
                    const padVal = (num: number) => String(num).padStart(2, '0');
                    return (
                      <div
                        key={work.id}
                        onClick={() => onSelectProject(work)}
                        className="group relative flex flex-col bg-[#fbf9f6] p-3 shadow-md border border-[#d2c9be] hover:border-[#b2a99e] hover:shadow-lg transition-all duration-300 cursor-pointer rounded-[4px]"
                      >
                        {/* Rotated Vertical Index Label on the Left (Outside Card Margin) */}
                        <div className="absolute left-[-26px] top-1/2 -translate-y-1/2 select-none h-full flex items-center">
                          <span 
                            className="font-mono text-[8px] uppercase tracking-widest text-[#5c524a] whitespace-nowrap"
                            style={{ 
                              writingMode: 'vertical-lr', 
                              transform: 'rotate(180deg)' 
                            }}
                          >
                            #{padVal(animatingCat.number)}-{padVal(idx + 1)}
                          </span>
                        </div>

                        {/* Media Display Container (Full width, adapts to height) */}
                        <div className="w-full overflow-hidden">
                          {(() => {
                            const firstMediaUrl = work.galleryImages?.[0];
                            if (firstMediaUrl) {
                              const isVideo = isVideoUrl(firstMediaUrl);
                              if (isVideo) {
                                return (
                                  <video
                                    key={firstMediaUrl}
                                    src={cleanMediaUrl(firstMediaUrl)}
                                    poster={cleanMediaUrl((work as any).videoPosters?.[firstMediaUrl] || work.galleryImages?.find(img => !isVideoUrl(img)) || undefined)}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-auto block transition-transform duration-300 group-hover:scale-[1.02]"
                                  />
                                );
                              } else {
                                return (
                                  <img
                                    src={cleanMediaUrl(firstMediaUrl)}
                                    alt={work.title}
                                    className="w-full h-auto block transition-transform duration-300 group-hover:scale-[1.02]"
                                  />
                                );
                              }
                            }
                            return (
                              <div className="w-full aspect-[1.35] bg-white border border-[#d8d2c9] flex items-center justify-center p-3 relative overflow-hidden group-hover:bg-paper-0 transition-colors">
                                <div className="w-full h-auto scale-[0.95] group-hover:scale-[0.98] transition-transform duration-300">
                                  {renderSchematic(work.schematicType)}
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Details Block below */}
                        <div className="mt-3 flex items-start justify-between">
                          <div className="flex-1 min-w-0 pr-2">
                            <span className="font-mono text-[8px] uppercase tracking-widest text-[#6c645c] block mb-0.5">
                              {work.tags[0].toUpperCase()}
                            </span>
                            <h4 className="font-sans font-semibold text-xs text-[#2d2722] truncate group-hover:text-[#002FA7] transition-colors leading-tight">
                              {work.title}
                            </h4>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-[#4c423a] bg-[#ded8cf] px-1.5 py-0.5 rounded-sm">
                              {getProjectAbbreviation(work)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  };

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 pl-6 pt-2 items-start">
                      <div className="flex flex-col gap-y-10">
                        {leftWorks.map((work) => {
                          const originalIdx = filteredWorks.findIndex(w => w.id === work.id);
                          return renderWorkCard(work, originalIdx);
                        })}
                      </div>
                      <div className="flex flex-col gap-y-10">
                        {rightWorks.map((work) => {
                          const originalIdx = filteredWorks.findIndex(w => w.id === work.id);
                          return renderWorkCard(work, originalIdx);
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. STANDARD CABINET/FOLDER GRID VIEW & LISTINGS */}
      <div className={`transition-opacity duration-500 ${animatingCat ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-12">
          
          {/* Editorial Title Section */}
          <div className="mb-5">
            <h1 className="font-sans font-bold text-5xl md:text-[80px] tracking-tighter text-ink-900 leading-none mb-8">
              <div className="mb-2">Roy Xiang does</div>
              <div className="text-klein flex items-center h-[1.15em] overflow-hidden select-none">
                <span className="mr-3 md:mr-4">&lt;</span>
                <span className="relative h-full flex items-center overflow-hidden flex-grow min-w-[200px]">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={phraseIndex}
                      initial={{ y: '80%', opacity: 0 }}
                      animate={{ y: '0%', opacity: 1 }}
                      exit={{ y: '-80%', opacity: 0 }}
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                      className="absolute left-0 inline-block text-klein font-bold leading-none whitespace-nowrap"
                    >
                      {phrases[phraseIndex]}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span className="ml-3 md:ml-4">&gt;</span>
              </div>
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 font-sans text-base md:text-lg text-ink-700 leading-relaxed mt-6 pb-2">
              <div className="space-y-6">
                <p>
                  I'm Roy Xiang, an applied AI practitioner, building at the intersection of APAC and the MENA.
                </p>
                <div>
                  <button 
                    onClick={() => onNavigate && onNavigate('Profile')}
                    className="text-klein hover:text-klein-active font-mono text-xs font-bold tracking-widest uppercase flex items-center space-x-2 border-b border-transparent hover:border-klein pb-1 focus:outline-none cursor-pointer transition-all"
                  >
                    Read More -&gt;
                  </button>
                </div>
              </div>
              <div>
                <p>
                  I turn AI tools into working systems: production pipelines, automation workflows, and shipped prototypes, grounded in 6+ years of growth marketing and product operations across 6 markets.
                </p>
              </div>
            </div>
          </div>

          {/* Cabinet Dossiers grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-5 animate-fade-in">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.title;
              return (
                <div key={cat.title} id={`folder-cover-${cat.number}`} className="w-full">
                  <FolderCover
                    number={cat.number}
                    title={cat.title}
                    subtitle={cat.subtitle}
                    tone={isActive ? 'klein' : cat.tone}
                    active={isActive}
                    details={cat.details}
                    animPhase={animatingCat?.title === cat.title ? animPhase : 'idle'}
                    isSiblingAnimating={animatingCat !== null && animatingCat.title !== cat.title}
                    onClick={(e) => handleFolderClick(cat, e.currentTarget.getBoundingClientRect())}
                  />
                </div>
              );
            })}
          </div>

          {/* Capability marquee follows the folder dossiers. */}
          <div className="w-full border-t border-b border-ink-150 py-6 overflow-hidden mb-16 select-none relative">
            <div className="animate-marquee-reverse whitespace-nowrap flex items-center italic">
              {[1, 2, 3].map((cycle) => (
                <div key={cycle} className="flex items-center space-x-12 pr-12">
                  <div className="font-mono text-[10px] md:text-xs uppercase tracking-widest text-ink-600 flex items-center space-x-2 select-none"><span className="font-bold text-ink-900">[01] APPLIED AI WORKFLOWS</span></div>
                  <div className="font-mono text-[10px] md:text-xs uppercase tracking-widest text-ink-600 flex items-center space-x-2 select-none"><span className="font-bold text-ink-900">[02] CREATIVE AUTOMATION</span></div>
                  <div className="font-mono text-[10px] md:text-xs uppercase tracking-widest text-ink-600 flex items-center space-x-2 select-none"><span className="font-bold text-ink-900">[03] VIBE-CODED PROTOTYPES</span></div>
                  <div className="font-mono text-[10px] md:text-xs uppercase tracking-widest text-ink-600 flex items-center space-x-2 select-none"><span className="font-bold text-ink-900">[04] CONTENT OPERATIONS</span></div>
                  <div className="font-mono text-[10px] md:text-xs uppercase tracking-widest text-ink-600 flex items-center space-x-2 select-none"><span className="font-bold text-ink-900">[05] PRODUCT COMMUNICATION</span></div>
                  <div className="font-mono text-[10px] md:text-xs uppercase tracking-widest text-ink-600 flex items-center space-x-2 select-none"><span className="font-bold text-ink-900">[06] HUMAN-IN-THE-LOOP QA</span></div>
                </div>
              ))}
            </div>
          </div>

          {/* Brand Logos Marquee Scrolling Loop */}
          <div className="hidden" aria-hidden="true">
            <div className="hidden" aria-hidden="true">
              {[1, 2, 3].map((cycle) => (
                <div key={cycle} className="flex items-center space-x-16 pr-16 text-ink-400">
                  {/* SINOPEC */}
                  {renderBrandLogo('sinopec', (
                    <div className="flex items-center h-6 text-ink-500 hover:text-ink-900 transition-colors duration-200">
                      <svg className="h-5 fill-current mr-1" viewBox="0 0 160 32">
                        <g fill="#E60012">
                          <circle cx="16" cy="16" r="14" />
                          <rect x="14.5" y="6" width="3" height="20" fill="white" />
                          <path d="M11 20 L21 20 M11 15 L21 15 M11 24 L21 24" stroke="white" strokeWidth="1.5" />
                          <circle cx="16" cy="16" r="7" fill="none" stroke="white" strokeWidth="2" />
                        </g>
                        <text x="38" y="22" fontFamily="sans-serif" fontWeight="900" fontSize="14" fill="currentColor" letterSpacing="0.05em">SINOPEC</text>
                        <text x="114" y="22" fontFamily="sans-serif" fontWeight="bold" fontSize="11" fill="currentColor">中国石化</text>
                      </svg>
                    </div>
                  ))}
                  {/* 抖音 */}
                  {renderBrandLogo('douyin', (
                    <div className="flex items-center h-6 text-ink-500 hover:text-ink-900 transition-colors duration-200">
                      <svg className="h-5 fill-current mr-1" viewBox="0 0 110 32">
                        <g transform="translate(2, 0)">
                          <path d="M17 6 a6 6 0 0 1 5-5 v3 a3 3 0 0 0-3 3 v10 a6 6 0 1 1-6-6 h2 v3 h-2 a3 3 0 1 0 3 3 z" fill="#FF004F" opacity="0.8" transform="translate(1, 1)" />
                          <path d="M17 6 a6 6 0 0 1 5-5 v3 a3 3 0 0 0-3 3 v10 a6 6 0 1 1-6-6 h2 v3 h-2 a3 3 0 1 0 3 3 z" fill="#00F5FF" opacity="0.8" transform="translate(-1, -1)" />
                          <path d="M17 6 a6 6 0 0 1 5-5 v3 a3 3 0 0 0-3 3 v10 a6 6 0 1 1-6-6 h2 v3 h-2 a3 3 0 1 0 3 3 z" fill="currentColor" />
                        </g>
                        <text x="32" y="22" fontFamily="sans-serif" fontWeight="900" fontSize="15" fill="currentColor" letterSpacing="0.05em">抖音</text>
                      </svg>
                    </div>
                  ))}
                  {/* 小红书 */}
                  {renderBrandLogo('red', (
                    <div className="flex items-center h-6 text-ink-500 hover:text-ink-900 transition-colors duration-200">
                      <svg className="h-4 fill-current mr-1" viewBox="0 0 130 32">
                        <rect x="0" y="4" width="38" height="24" rx="6" fill="#FF2442" />
                        <text x="5" y="21" fontFamily="sans-serif" fontWeight="900" fontSize="13" fill="white" letterSpacing="-0.02em">RED</text>
                        <text x="46" y="22" fontFamily="sans-serif" fontWeight="900" fontSize="15" fill="currentColor" letterSpacing="0.02em">小红书</text>
                      </svg>
                    </div>
                  ))}
                  {/* Tencent */}
                  {renderBrandLogo('tencent', (
                    <div className="flex items-center h-6 text-ink-500 hover:text-ink-900 transition-colors duration-200">
                      <svg className="h-4 fill-current mr-1" viewBox="0 0 150 32">
                        <text x="0" y="22" fontFamily="sans-serif" fontWeight="900" fontStyle="italic" fontSize="18" fill="currentColor" letterSpacing="-0.04em">Tencent</text>
                        <text x="82" y="22" fontFamily="sans-serif" fontWeight="900" fontSize="15" fill="currentColor" letterSpacing="0.05em">腾讯</text>
                      </svg>
                    </div>
                  ))}
                  {/* 腾讯广告 */}
                  {renderBrandLogo('tencent_ad', (
                    <div className="flex items-center h-6 text-ink-500 hover:text-ink-900 transition-colors duration-200">
                      <svg className="h-4 fill-current mr-1" viewBox="0 0 145 32">
                        <g transform="translate(0, 4)" fill="currentColor">
                          <rect x="0" y="10" width="4" height="10" rx="2" transform="rotate(-30 2 15)" />
                          <rect x="8" y="5" width="4" height="15" rx="2" transform="rotate(-30 10 12)" />
                          <rect x="16" y="0" width="4" height="20" rx="2" transform="rotate(-30 18 10)" />
                        </g>
                        <text x="32" y="22" fontFamily="sans-serif" fontWeight="900" fontStyle="italic" fontSize="16" fill="currentColor" letterSpacing="-0.04em">Tencent</text>
                        <text x="106" y="22" fontFamily="sans-serif" fontWeight="bold" fontSize="14" fill="currentColor" letterSpacing="0.05em">广告</text>
                      </svg>
                    </div>
                  ))}
                  {/* Lenovo */}
                  {renderBrandLogo('lenovo', (
                    <div className="flex items-center h-6 text-ink-500 hover:text-ink-900 transition-colors duration-200">
                      <svg className="h-4 fill-current" viewBox="0 0 85 32">
                        <text x="0" y="22" fontFamily="sans-serif" fontWeight="bold" fontSize="17" fill="currentColor" letterSpacing="-0.02em">lenovo</text>
                      </svg>
                    </div>
                  ))}
                  {/* DIOR */}
                  {renderBrandLogo('dior', (
                    <div className="flex items-center h-6 text-ink-500 hover:text-ink-900 transition-colors duration-200">
                      <svg className="h-4 fill-current" viewBox="0 0 65 32">
                        <text x="0" y="22" fontFamily="serif" fontWeight="bold" fontSize="18" fill="currentColor" letterSpacing="0.15em">DIOR</text>
                      </svg>
                    </div>
                  ))}
                  {/* JOHN LOBB */}
                  {renderBrandLogo('john_lobb', (
                    <div className="flex items-center h-6 text-ink-500 hover:text-ink-900 transition-colors duration-200">
                      <svg className="h-3 fill-current" viewBox="0 0 125 32">
                        <text x="0" y="20" fontFamily="serif" fontWeight="bold" fontSize="14" fill="currentColor" letterSpacing="0.18em">JOHN LOBB</text>
                      </svg>
                    </div>
                  ))}
                  {/* vanke */}
                  {renderBrandLogo('vanke', (
                    <div className="flex items-center h-6 text-ink-500 hover:text-ink-900 transition-colors duration-200">
                      <svg className="h-4 fill-current" viewBox="0 0 95 32">
                        <g transform="translate(0, 6)" fill="#E21936">
                          <rect x="0" y="0" width="8" height="8" />
                          <rect x="10" y="0" width="8" height="8" />
                          <rect x="0" y="10" width="8" height="8" />
                          <rect x="10" y="10" width="8" height="8" fill="#999999" />
                        </g>
                        <text x="26" y="22" fontFamily="sans-serif" fontWeight="bold" fontSize="17" fill="currentColor" letterSpacing="-0.02em">vanke</text>
                      </svg>
                    </div>
                  ))}
                  {/* vivo */}
                  {renderBrandLogo('vivo', (
                    <div className="flex items-center h-6 text-ink-500 hover:text-ink-900 transition-colors duration-200">
                      <svg className="h-4 fill-current" viewBox="0 0 50 32">
                        <text x="0" y="22" fontFamily="sans-serif" fontWeight="900" fontStyle="italic" fontSize="21" fill="currentColor" letterSpacing="-0.06em">vivo</text>
                      </svg>
                    </div>
                  ))}
                  {/* 快手 */}
                  {renderBrandLogo('kuaishou', (
                    <div className="flex items-center h-6 text-ink-500 hover:text-ink-900 transition-colors duration-200">
                      <svg className="h-4 fill-current" viewBox="0 0 100 32">
                        <g transform="translate(0, 4)">
                          <path d="M12 0 C5 0, 0 5, 0 12 C 0 19, 5 24, 12 24 C 19 24, 24 19, 24 12 C 24 5, 19 0, 12 0 Z" fill="#FF4E21" />
                          <circle cx="12" cy="12" r="5" fill="white" />
                          <circle cx="12" cy="12" r="2.5" fill="#FF4E21" />
                          <path d="M 6 12 A 6 6 0 0 0 18 12" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                        </g>
                        <text x="32" y="22" fontFamily="sans-serif" fontWeight="900" fontSize="16" fill="currentColor" letterSpacing="0.05em">快手</text>
                      </svg>
                    </div>
                  ))}
                  {/* 巨量引擎 */}
                  {renderBrandLogo('ocean_engine', (
                    <div className="flex items-center h-6 text-ink-500 hover:text-ink-900 transition-colors duration-200">
                      <svg className="h-4 fill-current" viewBox="0 0 115 32">
                        <g transform="translate(0, 4)" fill="#2962FF">
                          <polygon points="0,18 6,4 12,18" opacity="0.7" />
                          <polygon points="8,18 14,0 20,18" />
                        </g>
                        <text x="28" y="21" fontFamily="sans-serif" fontWeight="900" fontSize="14" fill="currentColor" letterSpacing="0.02em">巨量引擎</text>
                      </svg>
                    </div>
                  ))}
                  {/* ESTEE LAUDER */}
                  {renderBrandLogo('estee_lauder', (
                    <div className="flex items-center h-6 text-ink-500 hover:text-ink-900 transition-colors duration-200">
                      <svg className="h-4 fill-current" viewBox="0 0 145 32">
                        <text x="0" y="15" fontFamily="serif" fontWeight="bold" fontSize="11" fill="currentColor" letterSpacing="0.12em">ESTĒE LAUDER</text>
                        <text x="0" y="26" fontFamily="sans-serif" fontSize="7" fill="currentColor" letterSpacing="0.3em" opacity="0.7">雅诗兰黛</text>
                      </svg>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="animate-marquee whitespace-nowrap flex items-center" aria-label="Brand partners moving left">
              {[1, 2, 3].map((cycle) => (
                <div key={cycle} className="flex items-center space-x-16 pr-16">
                  {BRAND_LOGOS.map((brand) => (
                    <React.Fragment key={`${cycle}-${brand.id}`}>
                      {renderBrandLogo(brand.id, (
                        <div className="flex h-7 w-[128px] items-center justify-center opacity-70 transition-opacity duration-200 hover:opacity-100">
                          <img
                            src={`/brand-logos/${brand.file}`}
                            alt={brand.label}
                            className="max-h-7 max-w-[124px] object-contain"
                          />
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              ))}
            </div>
            <div className="animate-marquee-reverse whitespace-nowrap flex items-center" aria-label="Brand partners moving right">
              {[1, 2, 3].map((cycle) => (
                <div key={cycle} className="flex items-center space-x-16 pr-16">
                  {BRAND_LOGOS.map((brand) => (
                    <React.Fragment key={`${cycle}-${brand.id}`}>
                      {renderBrandLogo(brand.id, (
                        <div className="flex h-7 w-[128px] items-center justify-center opacity-70 transition-opacity duration-200 hover:opacity-100">
                          <img
                            src={`/brand-logos/${brand.file}`}
                            alt={brand.label}
                            className="max-h-7 max-w-[124px] object-contain"
                          />
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              ))}
            </div>
          </div>



          {/* Render the Cropper Dialog when active */}
          {showCropper && (
            <LogoCropper 
              onClose={() => setShowCropper(false)}
              onUpdate={loadCustomLogos}
            />
          )}
        </div>
      </div>

    </div>
  );
}
