import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { fetchProjects, GITHUB_USER } from '../lib/github';
import { getLangColor, timeAgo } from '../lib/utils';
import ReadmeViewer from '../components/ReadmeViewer';

export default function Project() {
  const { name } = useParams<{ name: string }>();

  const { data: projects, loading, error } = useFetch(fetchProjects, []);

  const project = projects?.find(p => p.name === name);

  // ── Loading ──
  if (loading) {
    return (
      <div className="page-enter max-w-4xl mx-auto px-6">
        <div className="py-10 border-b border-stone-200 dark:border-stone-800 mb-8">
          <div className="skeleton h-8 w-2/5 mb-4" />
          <div className="skeleton h-4 w-3/5 mb-2" />
          <div className="skeleton h-4 w-2/5" />
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-8">
          <div className="flex items-center gap-3 text-stone-400 text-sm">
            <span className="w-4 h-4 border-2 border-stone-200 dark:border-stone-700 border-t-accent rounded-full animate-spin shrink-0" />
            Loading…
          </div>
        </div>
      </div>
    );
  }

  // ── Error or not found ──
  if (error || !project) {
    return (
      <div className="page-enter max-w-4xl mx-auto px-6 pt-20 text-center">
        <p className="text-5xl mb-4">404</p>
        <p className="text-stone-500 dark:text-stone-400 mb-6">
          Project <strong className="text-stone-900 dark:text-stone-100">{name}</strong> not found or not listed in this portfolio.
        </p>
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-accent hover:underline">
          ← Back to all projects
        </Link>
      </div>
    );
  }

  return (
    <div className="page-enter max-w-4xl mx-auto px-6">

      {/* ── Project hero ── */}
      <div className="py-10 border-b border-stone-200 dark:border-stone-800 mb-8">
        <p className="flex items-center gap-3 font-mono text-[12px] tracking-widest uppercase text-stone-400 mb-3">
          Project
          <span className="flex-1 h-px bg-stone-200 dark:bg-stone-800 max-w-[60px]" />
        </p>

        <h1 className="text-3xl font-semibold tracking-tight mb-3">{project.name}</h1>

        {project.description && (
          <p className="text-stone-500 dark:text-stone-400 font-light text-lg max-w-lg leading-relaxed">
            {project.description}
          </p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 mt-5">
          {project.language && (
            <span className="flex items-center gap-1.5 font-mono text-[13px] text-stone-500 dark:text-stone-400">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ background: getLangColor(project.language) }}
              />
              {project.language}
            </span>
          )}
          <MetaItem icon={<StarIcon />}>{project.stars} stars</MetaItem>
          <MetaItem icon={<ForkIcon />}>{project.forks} forks</MetaItem>
          <span className="font-mono text-[13px] text-stone-400">
            Updated {timeAgo(project.updatedAt)}
          </span>
          {project.portfolio.tags && project.portfolio.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {project.portfolio.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-accent-light text-accent-text rounded-full text-[11px] font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-6 flex-wrap">
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity hover:-translate-y-px shadow-sm"
          >
            <GitHubIcon />
            View on GitHub
          </a>
          {project.portfolio.demo && (
            <a
              href={project.portfolio.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-stone-300 dark:border-stone-700 rounded-lg text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors hover:-translate-y-px"
            >
              <ExternalIcon />
              Live Demo
            </a>
          )}
        </div>
      </div>

      {/* ── README ── */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-8 mb-12">
        <div className="flex items-center gap-2 font-mono text-[13px] text-stone-400 pb-4 mb-6 border-b border-stone-200 dark:border-stone-800">
          <FileIcon />
          README.md
        </div>
        <ReadmeViewer repoName={project.name} defaultBranch={project.defaultBranch} />
      </div>

      <footer className="border-t border-stone-200 dark:border-stone-800 py-8 text-center font-mono text-[13px] text-stone-400 mb-4">
        <a
          href={`https://github.com/${GITHUB_USER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-accent transition-colors"
        >
          @{GITHUB_USER}
        </a>
      </footer>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function MetaItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 font-mono text-[13px] text-stone-500 dark:text-stone-400">
      {icon}
      {children}
    </span>
  );
}

function StarIcon() {
  return (
    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function ForkIcon() {
  return (
    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <path d="M18 9a9 9 0 01-9 9" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
