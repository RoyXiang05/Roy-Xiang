import React, { useState, useMemo, useEffect } from 'react';
import RevealText from '../core/RevealText';
import IndexLabel from '../core/IndexLabel';
import Tag from '../core/Tag';
import FolderCover from '../archive/FolderCover';
import WorkCard from '../archive/WorkCard';
import WorkRow from '../archive/WorkRow';
import { WORKS, Work } from '../../data';
import { ArrowLeft, FolderOpen, Calendar, Shield, Cpu, Tag as TagIcon, Barcode } from 'lucide-react';

interface WorksScreenProps {
  onSelectProject: (project: Work) => void;
}

export default function WorksScreen({ onSelectProject }: WorksScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Animation and view states
  const [activeCategoryPage, setActiveCategoryPage] = useState<string | null>(null);
  const [animatingCat, setAnimatingCat] = useState<any | null>(null);
  const [animPhase, setAnimPhase] = useState<'idle' | 'tucked' | 'pull' | 'zoom' | 'reverse-zoom' | 'reverse-pull'>('idle');
  const [clickRect, setClickRect] = useState<DOMRect | null>(null);
  const [reverseActive, setReverseActive] = useState<boolean>(false);

  // Lock body scroll when floating overlay is active to keep parent scroll position pristine
  useEffect(() => {
    if (activeCategoryPage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeCategoryPage]);

  const categories = [
    { 
      number: 1, 
      title: 'AI Creative Operations', 
      subtitle: '2 FILES ARCHIVED', 
      tone: 'klein' as const,
      details: [
        "Midjourney & Runway v3",
        "Custom GPT Assistants",
        "SOP Workflow Automation",
        "Bilingual Creative Pipelines"
      ],
      description: "Harnessing deep neural models and generative tooling to collapse production cycles, establish standardized brand prompts, and deliver localized, high-fidelity creative systems at speed."
    },
    { 
      number: 2, 
      title: 'GTM Campaigns', 
      subtitle: '3 FILES ARCHIVED', 
      tone: 'ink' as const,
      details: [
        "MENA Region GTM Strategy",
        "LinkedIn Growth Operations",
        "Bilingual Content Funnels",
        "ADIPEC Exhibition Experience",
        "Corporate Storytelling Systems",
        "VIP High-Level Communications",
        "Conversion Optimization"
      ],
      description: "High-impact brand, product launch, and exhibition strategies crafted for the Middle East, APAC, and global markets. Integrates physical corporate narratives with digital performance marketing to drive massive commercial leverage."
    },
    { 
      number: 3, 
      title: 'Product & UI/UX', 
      subtitle: '3 FILES ARCHIVED', 
      tone: 'paper' as const,
      details: [
        "B2B SaaS Hub Design",
        "E-Commerce Journeys",
        "System Information Architecture",
        "Data-Driven Dashboards"
      ],
      description: "User experience blueprints and digital product architectures that bridge elite aesthetics with frictionless usability, focusing on data-informed conversion pathways and enterprise SaaS hubs."
    }
  ];

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

  // Click on a category folder initiates pull-out transition
  const handleFolderClick = (cat: any, rect: DOMRect) => {
    setSelectedTag('All');
    setSearchQuery('');
    setClickRect(rect);
    setAnimatingCat(cat);
    setAnimPhase('tucked');
    
    // Step 2: Slide up from tucked position
    setTimeout(() => {
      setAnimPhase('pull');
      
      // Step 3: Zoom up to fill viewport beautifully
      setTimeout(() => {
        setAnimPhase('zoom');
        setActiveCategoryPage(cat.title);
      }, 350);
    }, 15);
  };

  // Triggers return back to general layout
  const handleBackToCabinet = () => {
    if (!animatingCat) {
      setActiveCategoryPage(null);
      return;
    }

    const folderEl = document.getElementById(`folder-cover-${animatingCat.number}`);
    if (folderEl) {
      const rect = folderEl.getBoundingClientRect();
      setClickRect(rect);
    }

    setAnimPhase('reverse-zoom');
    setActiveCategoryPage(null); // Clear selected category

    // Step 2: Transition from zoom down to pulled state, then pull back in
    setTimeout(() => {
      setAnimPhase('reverse-pull');
      
      // Step 3: Tuck completely back in
      setTimeout(() => {
        setAnimPhase('idle');
        setAnimatingCat(null);
        setClickRect(null);
      }, 350);
    }, 400);
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

    const initialStyle: React.CSSProperties = {
      position: 'fixed',
      left: `${cardLeft}px`,
      top: `${cardTop}px`,
      width: `${cardWidth}px`,
      height: `${cardHeight}px`,
      zIndex: 40,
      pointerEvents: 'none',
      transformOrigin: 'center center',
      borderRadius: '4px',
      opacity: 0,
    };

    if (animPhase === 'tucked') {
      return {
        ...initialStyle,
        transform: 'translateY(-70px) rotate(-1.5deg)',
        opacity: 0,
      };
    }

    if (animPhase === 'pull') {
      return {
        ...initialStyle,
        transform: 'translateY(-210px) rotate(-1.5deg)',
        opacity: 0,
      };
    }

    if (animPhase === 'zoom') {
      const targetWidth = Math.min(896, window.innerWidth - 32);
      const targetHeight = Math.min(680, window.innerHeight - 64);
      const targetLeft = (window.innerWidth - targetWidth) / 2;
      const targetTop = (window.innerHeight - targetHeight) / 2;

      return {
        ...initialStyle,
        left: `${targetLeft}px`,
        top: `${targetTop}px`,
        width: `${targetWidth}px`,
        height: `${targetHeight}px`,
        transform: 'translateY(0px) rotate(0deg)',
        borderRadius: '8px',
        pointerEvents: 'auto',
        opacity: 1,
        transition: 'all 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      };
    }

    if (animPhase === 'reverse-zoom') {
      return {
        ...initialStyle,
        transform: 'translateY(-210px) rotate(-1.5deg)',
        opacity: 1,
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      };
    }

    if (animPhase === 'reverse-pull') {
      return {
        ...initialStyle,
        transform: 'translateY(-210px) rotate(-1.5deg)',
        opacity: 0,
        transition: 'opacity 0.1s ease-out',
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
      
      {/* 1. CINEMATIC PULL-OUT TRANSITION OVERLAY */}
      {animatingCat && (
        <div 
          className={`fixed inset-0 overflow-hidden flex items-center justify-center transition-all duration-500 ${
            (animPhase === 'zoom' || animPhase === 'reverse-zoom') 
              ? 'z-50 pointer-events-auto cursor-zoom-out' 
              : 'z-[15] pointer-events-none'
          }`}
          style={{
            backgroundColor: (animPhase === 'zoom' || animPhase === 'reverse-zoom') ? 'rgba(10, 10, 10, 0.25)' : 'transparent',
            backdropFilter: (animPhase === 'zoom' || animPhase === 'reverse-zoom') ? 'blur(12px)' : 'none',
            WebkitBackdropFilter: (animPhase === 'zoom' || animPhase === 'reverse-zoom') ? 'blur(12px)' : 'none',
          }}
          onClick={handleBackToCabinet}
        >
          {/* Paper Insert Document (Animates dynamically with GPU transition style) */}
          <div
            className={`bg-paper-0 shadow-2xl border relative flex flex-col justify-between overflow-y-auto custom-scrollbar cursor-default ${
              animatingCat.tone === 'klein' ? 'border-klein-tint border-l-4 border-l-klein' :
              animatingCat.tone === 'ink' ? 'border-ink-150 border-l-4 border-l-ink-800' :
              'border-ink-150 border-l-4 border-l-klein'
            }`}
            style={getAnimatingCardStyle()}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grid pattern overlay */}
            <div 
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
                backgroundSize: '8px 8px'
              }}
            />

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

            {/* B. FULL SCREEN PAGE CONTENT (fades in when card reaches full screen) */}
            <div 
              className={`relative z-15 flex flex-col min-h-full justify-between max-w-4xl mx-auto w-full px-6 py-12 md:py-16 transition-all duration-500 ease-out ${
                animPhase === 'zoom' 
                  ? 'opacity-100 translate-y-0 delay-200' 
                  : 'opacity-0 translate-y-6 pointer-events-none'
              }`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-ink-150 pb-4 mb-8">
                  <div className="flex flex-col space-y-1 md:flex-row md:items-center md:space-y-0 md:space-x-4">
                    <span className="font-mono text-[10px] md:text-xs uppercase tracking-widest text-ink-400">
                      SEC_DOSSIER // ARCHIVE VOL.{String(animatingCat.number).padStart(2, '0')}
                    </span>
                    <span className="hidden md:inline font-mono text-[10px] uppercase tracking-widest text-ink-250">|</span>
                    <span className="font-mono text-[10px] md:text-xs uppercase tracking-widest text-klein font-bold">
                      STATUS // DOSSIER_LOADED
                    </span>
                  </div>
                  
                  {/* Close button inside the card itself */}
                  <button
                    onClick={handleBackToCabinet}
                    className="flex items-center space-x-2 font-mono text-[10px] md:text-xs text-ink-500 hover:text-klein transition-all group focus:outline-none cursor-pointer border border-ink-150 px-3 py-1 bg-paper-100 uppercase tracking-widest font-semibold hover:border-klein hover:bg-paper-0"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                    <span>[RETURN / 返回]</span>
                  </button>
                </div>

                <div className="mt-8">
                  <h2 className="font-sans font-bold text-4xl md:text-7xl tracking-tighter text-ink-900 uppercase mb-4 leading-none">
                    {animatingCat.title}
                  </h2>
                  <p className="font-sans text-xs md:text-sm text-ink-500 uppercase tracking-wider mb-8">
                    {animatingCat.subtitle || 'Archived Files Section'}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6">
                    <div className="space-y-4">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-ink-400 block border-b border-ink-100 pb-1">
                        Key Initiatives
                      </span>
                      {animatingCat.details.map((detail: string, idx: number) => (
                        <div key={idx} className="flex items-start space-x-3">
                          <span className="font-mono text-xs text-klein mt-0.5">[{idx + 1}]</span>
                          <span className="font-sans text-sm md:text-base font-semibold text-ink-800 tracking-tight">
                            {detail}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4 opacity-85">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-ink-400 block border-b border-ink-100 pb-1">
                        Overview
                      </span>
                      <p className="font-sans text-sm text-ink-600 leading-relaxed">
                        {animatingCat.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* INTERACTIVE PROJECTS SUB-ARCHIVE */}
                <div className="mt-16 border-t border-ink-150 pt-12">
                  <div className="mb-8">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-klein font-bold block mb-1">
                      SEC_ARCHIVE_FILE_REGISTRY // 归档项目索引
                    </span>
                    <h3 className="font-sans font-bold text-2xl md:text-3xl tracking-tight text-ink-900 uppercase">
                      Category Files & Records
                    </h3>
                  </div>

                  {/* Filter and controls bar */}
                  <div className="border-t border-b border-ink-150 py-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    {/* Search Input */}
                    <div className="flex-1 max-w-md">
                      <label className="font-mono text-[9px] uppercase tracking-widest text-ink-400 block mb-2">
                        Search Dossier Files / Keywords
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="FILTER ARCHIVE BY KEYWORD..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-paper-100 border border-ink-150 rounded-none px-4 py-2.5 font-mono text-xs text-ink-900 focus:outline-none focus:border-klein uppercase tracking-wider"
                        />
                        {searchQuery && (
                          <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-ink-400 hover:text-klein cursor-pointer focus:outline-none"
                          >
                            [CLEAR]
                          </button>
                        )}
                      </div>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center space-x-4 self-end md:self-center">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-ink-400">
                        Layout Mode
                      </span>
                      <div className="border border-ink-150 p-1 flex bg-paper-100 select-none">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider cursor-pointer focus:outline-none transition-fast ${
                            viewMode === 'grid' 
                              ? 'bg-ink-900 text-paper-0' 
                              : 'text-ink-500 hover:text-klein'
                          }`}
                        >
                          Grid
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider cursor-pointer focus:outline-none transition-fast ${
                            viewMode === 'list' 
                              ? 'bg-ink-900 text-paper-0' 
                              : 'text-ink-500 hover:text-klein'
                          }`}
                        >
                          List
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sub-tags Horizontal Bar */}
                  {currentCategoryTags.length > 1 && (
                    <div className="flex flex-wrap items-center gap-2 mb-10">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-ink-400 mr-2">
                        Sub-tags:
                      </span>
                      {currentCategoryTags.map((tag) => (
                        <Tag
                          key={tag}
                          selected={selectedTag === tag}
                          onClick={() => setSelectedTag(tag)}
                        >
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  )}

                  {/* Works listings for this category */}
                  {filteredCategoryWorks.length > 0 ? (
                    viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {filteredCategoryWorks.map((work) => (
                          <WorkCard
                            key={work.id}
                            work={work}
                            onClick={() => onSelectProject(work)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        {filteredCategoryWorks.map((work, index) => (
                          <WorkRow
                            key={work.id}
                            first={index === 0}
                            number={work.number}
                            title={work.title}
                            year={work.period}
                            media={work.subCategory}
                            onClick={() => onSelectProject(work)}
                          />
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="border border-dashed border-ink-150 py-16 text-center">
                      <span className="font-mono text-xs uppercase tracking-widest text-ink-400 block mb-2">
                        NO FILES FOUND IN THIS DOSSIER
                      </span>
                      <button
                        onClick={() => {
                          setSelectedTag('All');
                          setSearchQuery('');
                        }}
                        className="font-mono text-[10px] text-klein hover:underline uppercase tracking-wider focus:outline-none cursor-pointer"
                      >
                        [RESET DOSSIER FILTERS]
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-end justify-between border-t border-ink-150 pt-6 mt-12">
                <div className="flex items-center space-x-4">
                  <span className="font-mono text-[10px] md:text-xs text-ink-400">
                    SYS_REF: {2821 + animatingCat.number}-X
                  </span>
                  <span className="w-2 h-2 rounded-full bg-klein-active animate-ping" />
                </div>
                <div className="flex items-end space-x-[2px] h-8 opacity-60">
                  <div className="w-[1px] h-full bg-ink-900" />
                  <div className="w-[3px] h-full bg-ink-900" />
                  <div className="w-[1px] h-full bg-ink-900" />
                  <div className="w-[4px] h-full bg-ink-900" />
                  <div className="w-[2px] h-full bg-ink-900" />
                  <div className="w-[1px] h-full bg-ink-900" />
                  <div className="w-[5px] h-full bg-ink-900" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. STANDARD CABINET/FOLDER GRID VIEW & LISTINGS */}
      <div className={`transition-all duration-500 ${activeCategoryPage ? 'blur-[4px] opacity-40 pointer-events-none' : ''}`}>
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-12">
          
          {/* Editorial Title Section */}
          <div className="mb-16">
            <IndexLabel number={1} text="Index / Selected Works" tone="klein" className="mb-4 inline-block" />
            <RevealText
              as="h1"
              lines={["Selected Archive", "2019 — 2026"]}
              className="font-sans font-bold text-4xl md:text-6xl tracking-tighter text-ink-900 leading-none"
            />
            <p className="font-sans text-sm text-ink-500 max-w-lg mt-6 leading-relaxed">
              An archival dossier documenting Brand & Growth campaigns, 0-to-1 digital products, B2B narratives, and Generative AI creative workflows.
            </p>
          </div>

          {/* Dossier Folders Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
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
                    onClick={(e) => handleFolderClick(cat, e.currentTarget.getBoundingClientRect())}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
