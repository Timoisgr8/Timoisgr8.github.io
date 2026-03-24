import { useNavigate } from 'react-router-dom';
import type { Project } from '../types';
import { getLangColor, timeAgo } from '../lib/utils';

interface RepoCardProps {
  project: Project;
}

export default function RepoCard({ project }: RepoCardProps) {
  const navigate = useNavigate();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/project/${project.name}`)}
      onKeyDown={e => e.key === 'Enter' && navigate(`/project/${project.name}`)}
      className="group relative bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 flex flex-col cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md hover:border-stone-300 dark:hover:border-stone-700 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {/* Accent bar on hover */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-200" />

      {/* Name + badges */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[15px] font-medium tracking-tight break-words">
          {project.name}
        </span>
        <div className="flex gap-1 shrink-0">
          {project.portfolio.featured && (
            <Badge className="bg-accent-light text-accent-text">featured</Badge>
          )}
          {project.fork && (
            <Badge className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">fork</Badge>
          )}
          {project.archived && (
            <Badge className="bg-stone-100 dark:bg-stone-800 text-stone-500">archived</Badge>
          )}
        </div>
      </div>

      {/* Description */}
      <p className={`text-[13px] leading-snug flex-1 mb-4 line-clamp-2 ${
        project.description
          ? 'text-stone-500 dark:text-stone-400'
          : 'text-stone-400 dark:text-stone-600 italic'
      }`}>
        {project.description || 'No description'}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-3 flex-wrap mt-auto">
        <Stat icon={<StarIcon />}>{project.stars}</Stat>
        <Stat icon={<ForkIcon />}>{project.forks}</Stat>
        {project.language && (
          <span className="flex items-center gap-1.5 text-[12px] text-stone-500 dark:text-stone-400 ml-auto">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: getLangColor(project.language) }}
            />
            {project.language}
          </span>
        )}
      </div>

      <p className="font-mono text-[11px] text-stone-400 dark:text-stone-600 mt-2">
        Updated {timeAgo(project.updatedAt)}
      </p>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function Badge({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-medium ${className}`}>
      {children}
    </span>
  );
}

function Stat({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1 font-mono text-[12px] text-stone-400 dark:text-stone-500">
      {icon}
      {children}
    </span>
  );
}

function StarIcon() {
  return (
    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function ForkIcon() {
  return (
    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <path d="M18 9a9 9 0 01-9 9" />
    </svg>
  );
}
