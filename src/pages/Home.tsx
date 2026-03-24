import { useState, useMemo } from 'react';
import { useFetch } from '../hooks/useFetch';
import { fetchProjects, fetchProfile, GITHUB_USER } from '../lib/github';
import RepoCard from '../components/RepoCard';
import { SkeletonGrid } from '../components/Skeleton';
import type { Project } from '../types';

const DEFAULT_SKILLS = [
  { label: 'JavaScript', featured: true },
  { label: 'TypeScript', featured: true },
  { label: 'React',      featured: true },
  { label: 'HTML / CSS', featured: false },
  { label: 'Node.js',    featured: false },
  { label: 'Python',     featured: false },
  { label: 'Git',        featured: false },
  { label: 'GitHub Pages', featured: false },
  { label: 'Open Source',  featured: false },
];

export default function Home() {
  const [search, setSearch]           = useState('');
  const [activeLang, setActiveLang]   = useState<string>('all');

  const { data: projects, loading: projectsLoading, error: projectsError } =
    useFetch(fetchProjects, []);

  const { data: profile } = useFetch(fetchProfile, []);

  // Collect unique languages from loaded projects
  const languages = useMemo<string[]>(() => {
    if (!projects) return [];
    return [...new Set(projects.map(p => p.language).filter((l): l is string => l !== null))].sort();
  }, [projects]);

  // Merge GitHub-discovered languages into skills list (de-duped)
  const skills = useMemo(() => {
    const existing = new Set(DEFAULT_SKILLS.map(s => s.label.toLowerCase()));
    const extra = languages
      .filter(l => !existing.has(l.toLowerCase()))
      .map(l => ({ label: l, featured: false }));
    return [...DEFAULT_SKILLS, ...extra];
  }, [languages]);

  const filtered = useMemo<Project[]>(() => {
    if (!projects) return [];
    const q = search.toLowerCase();
    return projects.filter(p => {
      const matchLang   = activeLang === 'all' || p.language === activeLang;
      const matchSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.language ?? '').toLowerCase().includes(q) ||
        p.portfolio.tags?.some(t => t.toLowerCase().includes(q));
      return matchLang && matchSearch;
    });
  }, [projects, search, activeLang]);

  return (
    <div className="page-enter">
      <div className="max-w-4xl mx-auto px-6">

        {/* ── HERO ── */}
        <section className="py-20 pb-14" id="about">
          <p className="flex items-center gap-2 font-mono text-[13px] text-accent tracking-widest uppercase mb-4">
            <span className="w-6 h-px bg-accent inline-block" />
            Portfolio
          </p>
          <h1 className="text-5xl font-semibold tracking-tight leading-tight mb-5">
            Hi, I'm <em className="not-italic text-accent">Timothy Tew</em> —<br />
            a developer who builds things.
          </h1>
          <p className="text-lg text-stone-500 dark:text-stone-400 max-w-lg leading-relaxed font-light mb-8">
            {profile?.bio ?? 'Passionate about open source, creative tooling, and modern web technology. Welcome to my corner of GitHub.'}
          </p>
          <div className="flex gap-3 flex-wrap">
            <a href="#projects" className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity hover:-translate-y-px active:translate-y-0 shadow-sm">
              <HomeIcon />
              View Projects
            </a>
            <a
              href={`https://github.com/${GITHUB_USER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-stone-300 dark:border-stone-700 rounded-lg text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors hover:-translate-y-px active:translate-y-0"
            >
              <GitHubIcon />
              GitHub
            </a>
          </div>
        </section>

        {/* ── SKILLS ── */}
        <section className="py-10 pt-0" id="skills">
          <SectionLabel>Tech Stack</SectionLabel>
          <h2 className="text-2xl font-semibold tracking-tight mb-5">Skills &amp; Technologies</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
              <span
                key={skill.label}
                className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-[13px] border transition-colors cursor-default
                  ${skill.featured
                    ? 'bg-accent-light border-blue-200 dark:border-blue-900 text-accent-text font-medium'
                    : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-accent hover:text-accent-text hover:bg-accent-light'
                  }`}
              >
                {skill.label}
              </span>
            ))}
          </div>
        </section>

        {/* ── PROJECTS ── */}
        <section className="py-10 pt-0" id="projects">
          <SectionLabel>Open Source</SectionLabel>
          <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
            <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
            {!projectsLoading && (
              <span className="font-mono text-[13px] text-stone-400">
                {filtered.length} repo{filtered.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search projects…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
            />
          </div>

          {/* Language filters */}
          {languages.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {['all', ...languages].map(lang => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`px-3.5 py-1.5 rounded-full text-[13px] border transition-colors font-medium
                    ${activeLang === lang
                      ? 'bg-accent border-accent text-white'
                      : 'bg-transparent border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:border-accent hover:text-accent-text'
                    }`}
                >
                  {lang === 'all' ? 'All' : lang}
                </button>
              ))}
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectsLoading && <SkeletonGrid count={6} />}

            {projectsError && (
              <div className="col-span-full py-12 text-center text-stone-400">
                <p className="text-4xl mb-3">⚠</p>
                <p className="text-sm">Couldn't load projects. Try refreshing.</p>
              </div>
            )}

            {!projectsLoading && !projectsError && filtered.length === 0 && (
              <div className="col-span-full py-12 text-center text-stone-400">
                <p className="text-2xl mb-3">○</p>
                <p className="text-sm">No projects match your search.</p>
              </div>
            )}

            {!projectsLoading && filtered.map(project => (
              <RepoCard key={project.id} project={project} />
            ))}
          </div>

          <p className="mt-4 text-[12px] font-mono text-stone-400 dark:text-stone-600">
            Only repos with a{' '}
            <code className="bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded border border-stone-200 dark:border-stone-700">.portfolio</code>
            {' '}file are shown. Set{' '}
            <code className="bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded border border-stone-200 dark:border-stone-700">display=false</code>
            {' '}to hide any repo.
          </p>
        </section>

        {/* ── CONTACT ── */}
        <section className="py-10 pt-0" id="contact">
          <SectionLabel>Get in Touch</SectionLabel>
          <h2 className="text-2xl font-semibold tracking-tight mb-2">Contact</h2>
          <p className="text-stone-500 dark:text-stone-400 font-light mb-5 max-w-md">
            Have a project idea, collaboration request, or just want to say hi?
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={`https://github.com/${GITHUB_USER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-sm text-stone-600 dark:text-stone-400 hover:border-accent hover:text-accent-text hover:bg-accent-light transition-all hover:-translate-y-px"
            >
              <GitHubIcon size={18} />
              github.com/{GITHUB_USER}
            </a>
          </div>
        </section>

      </div>

      <footer className="relative z-10 border-t border-stone-200 dark:border-stone-800 py-8 text-center font-mono text-[13px] text-stone-400">
        Built with the GitHub API ·{' '}
        <a
          href={`https://github.com/${GITHUB_USER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-accent transition-colors"
        >
          @{GITHUB_USER}
        </a>
        {' '}· {new Date().getFullYear()}
      </footer>
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 font-mono text-[12px] tracking-widest uppercase text-stone-400 mb-4">
      {children}
      <span className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function GitHubIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}
