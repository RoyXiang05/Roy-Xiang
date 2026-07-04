import LinkArrow from '../core/LinkArrow';
import IndexLabel from '../core/IndexLabel';
import { Work, WORKS } from '../../data';
import WorkCard from '../archive/WorkCard';

interface WorkDetailScreenProps {
  project: Work;
  onNavigateBack: () => void;
  onSelectProject: (project: Work) => void;
}

export default function WorkDetailScreen({
  project,
  onNavigateBack,
  onSelectProject
}: WorkDetailScreenProps) {
  const pad = (num: number) => String(num).padStart(2, '0');

  // Find next and previous projects for the navigation carousel
  const currentIndex = WORKS.findIndex((w) => w.id === project.id);
  const prevProject = WORKS[currentIndex === 0 ? WORKS.length - 1 : currentIndex - 1];
  const nextProject = WORKS[currentIndex === WORKS.length - 1 ? 0 : currentIndex + 1];

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-12">
      {/* Top action row */}
      <div className="border-b border-ink-150 pb-6 mb-12 flex items-center justify-between">
        <LinkArrow back onClick={onNavigateBack} className="cursor-pointer">
          Back to selected archive
        </LinkArrow>
        <span className="font-mono text-[10px] text-ink-400 uppercase tracking-widest">
          Dossier / File.RX-{pad(project.number)}
        </span>
      </div>

      {/* Main Grid: Info left, Schematic right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-16">
        
        {/* Left Side: Technical Info */}
        <div className="lg:col-span-7">
          <div className="mb-8">
            <IndexLabel number={project.number} text={project.category} tone="klein" className="mb-4 inline-block" />
            <h1 className="font-sans font-bold text-3xl md:text-5xl tracking-tighter text-ink-900 leading-tight">
              {project.title}
            </h1>
            <span className="font-mono text-xs uppercase tracking-widest text-ink-400 block mt-2">
              {project.subCategory}
            </span>
          </div>

          {/* Technical Metadata Table */}
          <div className="border-t border-ink-900 mb-8 font-mono text-xs text-ink-900">
            <div className="grid grid-cols-3 py-3 border-b border-ink-150">
              <span className="text-ink-400 uppercase tracking-wider">01 / PERIOD</span>
              <span className="col-span-2 uppercase font-medium">{project.period}</span>
            </div>
            <div className="grid grid-cols-3 py-3 border-b border-ink-150">
              <span className="text-ink-400 uppercase tracking-wider">02 / MARKET</span>
              <span className="col-span-2 uppercase font-medium">{project.market}</span>
            </div>
            <div className="grid grid-cols-3 py-3 border-b border-ink-150">
              <span className="text-ink-400 uppercase tracking-wider">03 / ROLE</span>
              <span className="col-span-2 uppercase font-medium">{project.role}</span>
            </div>
            <div className="grid grid-cols-3 py-3 border-b border-ink-150">
              <span className="text-ink-400 uppercase tracking-wider">04 / STACK TAGS</span>
              <span className="col-span-2 uppercase font-medium text-klein">{project.tags.join(' // ')}</span>
            </div>
          </div>

          {/* Case Narrative: Summary, Challenge, Insight, Solution */}
          <div className="space-y-8 font-sans text-sm leading-relaxed text-ink-700">
            <div>
              <h3 className="font-sans font-bold text-ink-900 uppercase tracking-wider text-xs mb-3">
                [PROJECT DIRECTIVE]
              </h3>
              <p>{project.summary}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-ink-150 pt-8">
              <div>
                <h3 className="font-sans font-bold text-ink-900 uppercase tracking-wider text-xs mb-3">
                  [THE CHALLENGE]
                </h3>
                <p>{project.challenge}</p>
              </div>
              <div>
                <h3 className="font-sans font-bold text-ink-900 uppercase tracking-wider text-xs mb-3">
                  [THE INSIGHT]
                </h3>
                <p>{project.insight}</p>
              </div>
            </div>
            <div className="border-t border-ink-150 pt-8">
              <h3 className="font-sans font-bold text-ink-900 uppercase tracking-wider text-xs mb-3">
                [THE SOLUTION]
              </h3>
              <p className="bg-paper-100 p-4 border border-ink-150 text-ink-900">{project.solution}</p>
            </div>
          </div>
        </div>

        {/* Right Side: Visual Blueprint & Metrics */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Main Blueprint Box */}
          <div className="border border-ink-900 bg-paper-0">
            <div className="border-b border-ink-900 px-4 py-2.5 font-mono text-[9px] uppercase tracking-widest text-ink-500 flex items-center justify-between">
              <span>VISUAL SCHEMATIC ARCHIVE</span>
              <span className="text-klein font-bold">● ACTIVE DIAGRAM</span>
            </div>
            <div className="p-4 flex items-center justify-center bg-paper-0">
              {/* Render vector schematics larger in detail view */}
              <div className="w-full h-80 max-h-80">
                <WorkCard work={project} ratio="aspect-auto" />
              </div>
            </div>
            <div className="border-t border-ink-150 px-4 py-2.5 font-mono text-[8px] uppercase tracking-wider text-ink-400">
              Blueprint represents modular architecture and execution models
            </div>
          </div>

          {/* Key Metrics Showcases */}
          <div className="grid grid-cols-2 gap-4">
            {project.metrics.map((metric, idx) => (
              <div key={idx} className="border border-ink-150 p-4 bg-paper-50 flex flex-col justify-between h-28">
                <span className="font-mono text-[9px] uppercase tracking-widest text-ink-400">
                  METRIC.{pad(idx + 1)} / {metric.label.toUpperCase()}
                </span>
                <span className="font-sans font-bold text-2xl md:text-3xl tracking-tight text-klein leading-none">
                  {metric.value}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Deliverables and Results list grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-b border-ink-150 py-12 mb-16">
        <div>
          <h3 className="font-mono font-bold text-ink-900 uppercase tracking-widest text-xs mb-6">
            — Core Deliverables
          </h3>
          <ul className="space-y-4">
            {project.deliverables.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-3 text-sm text-ink-700">
                <span className="font-mono text-xs text-klein flex-shrink-0 mt-0.5">
                  [{pad(idx + 1)}]
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-mono font-bold text-ink-900 uppercase tracking-widest text-xs mb-6">
            — Measurable Outcomes
          </h3>
          <ul className="space-y-4">
            {project.results.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-3 text-sm text-ink-900 font-medium">
                <span className="text-klein flex-shrink-0 mt-0.5 font-bold">
                  ●
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer navigation for dossier toggling */}
      <div className="flex items-center justify-between border-t border-ink-150 pt-8 font-mono text-xs">
        <button
          onClick={() => onSelectProject(prevProject)}
          className="group inline-flex items-center text-ink-500 hover:text-klein uppercase tracking-wider cursor-pointer focus:outline-none"
        >
          <span className="mr-2 transition-transform duration-300 group-hover:-translate-x-1">←</span>
          <span>Prev File: RX-{pad(prevProject.number)}</span>
        </button>
        
        <button
          onClick={() => onSelectProject(nextProject)}
          className="group inline-flex items-center text-ink-500 hover:text-klein uppercase tracking-wider cursor-pointer focus:outline-none"
        >
          <span>Next File: RX-{pad(nextProject.number)}</span>
          <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
        </button>
      </div>
    </div>
  );
}
