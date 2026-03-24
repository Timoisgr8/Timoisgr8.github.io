import type { GitHubProfile, GitHubRepo, Project, PortfolioConfig } from '../types';

const GITHUB_USER = 'Timoisgr8';
const API_BASE    = 'https://api.github.com';
const RAW_BASE    = `https://raw.githubusercontent.com/${GITHUB_USER}`;

// ── Parse flat key=value .portfolio file ──────────────────────────────────
function parsePortfolioFile(text: string): PortfolioConfig {
  const raw: Record<string, string> = {};

  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    raw[trimmed.slice(0, eq).trim().toLowerCase()] = trimmed.slice(eq + 1).trim();
  }

  return {
    display:     raw['display'] !== 'false',
    description: raw['description'],
    featured:    raw['featured'] === 'true',
    demo:        raw['demo'],
    tags:        raw['tags'] ? raw['tags'].split(',').map(t => t.trim()) : [],
    order:       raw['order'] ? parseInt(raw['order'], 10) : 999,
  };
}

// ── Fetch .portfolio file from a repo ─────────────────────────────────────
async function fetchPortfolioConfig(
  repoName: string,
  defaultBranch: string
): Promise<PortfolioConfig | null> {
  const branches = [
    defaultBranch,
    ...['main', 'master'].filter(b => b !== defaultBranch),
  ];

  for (const branch of branches) {
    try {
      const res = await fetch(
        `${RAW_BASE}/${repoName}/${branch}/.portfolio`,
        { cache: 'no-store' }
      );
      if (res.ok) return parsePortfolioFile(await res.text());
    } catch {
      // try next branch
    }
  }

  return null; // no .portfolio file → hidden by default
}

// ── Fetch README markdown ─────────────────────────────────────────────────
export async function fetchReadme(
  repoName: string,
  defaultBranch: string
): Promise<string | null> {
  const branches  = [defaultBranch, ...['main', 'master'].filter(b => b !== defaultBranch)];
  const filenames = ['README.md', 'readme.md', 'README.MD', 'Readme.md'];

  for (const branch of branches) {
    for (const filename of filenames) {
      try {
        const res = await fetch(`${RAW_BASE}/${repoName}/${branch}/${filename}`);
        if (res.ok) return res.text();
      } catch {
        // try next
      }
    }
  }

  return null;
}

// ── Resolve relative URLs in parsed README HTML ───────────────────────────
export function resolveReadmeUrls(
  html: string,
  repoName: string,
  branch: string
): string {
  const rawBase  = `${RAW_BASE}/${repoName}/${branch}`;
  const blobBase = `https://github.com/${GITHUB_USER}/${repoName}/blob/${branch}`;

  // Relative image srcs → raw URL
  html = html.replace(
    /(<img[^>]+src=")(?!https?:\/\/)([^"]+)(")/gi,
    (_, pre, path, post) => `${pre}${rawBase}/${path.replace(/^\.?\//, '')}${post}`
  );

  // Relative anchor hrefs (not fragment-only) → blob URL
  html = html.replace(
    /(<a[^>]+href=")(?!https?:\/\/)(?!#)([^"]+)(")/gi,
    (_, pre, path, post) => `${pre}${blobBase}/${path.replace(/^\.?\//, '')}${post}`
  );

  return html;
}

// ── Fetch GitHub profile ──────────────────────────────────────────────────
export async function fetchProfile(): Promise<GitHubProfile | null> {
  const res = await fetch(`${API_BASE}/users/${GITHUB_USER}`);
  if (!res.ok) return null;
  return res.json() as Promise<GitHubProfile>;
}

// ── Fetch all displayable portfolio projects ──────────────────────────────
// Only repos WITH a .portfolio file where display !== false are included.
export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(
    `${API_BASE}/users/${GITHUB_USER}/repos?per_page=100&sort=updated`
  );

  if (!res.ok) throw new Error(`GitHub API error ${res.status}`);

  const repos = (await res.json()) as GitHubRepo[];

  const results = await Promise.all(
    repos.map(async repo => {
      const config = await fetchPortfolioConfig(repo.name, repo.default_branch);
      return { repo, config };
    })
  );

  return results
    .filter(({ config }) => config !== null && config.display)
    .map(({ repo, config }): Project => ({
      id:            repo.id,
      name:          repo.name,
      description:   config!.description ?? repo.description ?? '',
      url:           repo.html_url,
      stars:         repo.stargazers_count,
      forks:         repo.forks_count,
      language:      repo.language,
      fork:          repo.fork,
      archived:      repo.archived,
      updatedAt:     repo.updated_at,
      defaultBranch: repo.default_branch,
      portfolio:     config!,
    }))
    .sort((a, b) => (a.portfolio.order ?? 999) - (b.portfolio.order ?? 999));
}

export { GITHUB_USER };
