const GITHUB_USER = 'Timoisgr8';
const API_BASE    = 'https://api.github.com';
const RAW_BASE    = 'https://raw.githubusercontent.com';

// ── Parse the .portfolio flat key=value file ──────────────────────────────
function parsePortfolioFile(text) {
  const result = {};
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim().toLowerCase();
    const val = trimmed.slice(eq + 1).trim();
    result[key] = val;
  }
  return result;
}

// ── Fetch .portfolio file from a repo (tries main then master) ────────────
async function fetchPortfolioFile(repoName, defaultBranch) {
  const branches = defaultBranch
    ? [defaultBranch, ...['main', 'master'].filter(b => b !== defaultBranch)]
    : ['main', 'master'];

  for (const branch of branches) {
    try {
      const res = await fetch(
        `${RAW_BASE}/${GITHUB_USER}/${repoName}/${branch}/.portfolio`,
        { cache: 'no-store' }
      );
      if (res.ok) return parsePortfolioFile(await res.text());
    } catch { /* try next branch */ }
  }
  return null; // no .portfolio file found
}

// ── Fetch README content for a repo ───────────────────────────────────────
export async function fetchReadme(repoName, defaultBranch) {
  const branches = defaultBranch
    ? [defaultBranch, ...['main', 'master'].filter(b => b !== defaultBranch)]
    : ['main', 'master'];

  const filenames = ['README.md', 'readme.md', 'README.MD', 'Readme.md'];

  for (const branch of branches) {
    for (const filename of filenames) {
      try {
        const res = await fetch(
          `${RAW_BASE}/${GITHUB_USER}/${repoName}/${branch}/${filename}`
        );
        if (res.ok) return await res.text();
      } catch { /* try next */ }
    }
  }
  return null;
}

// ── Fetch GitHub profile ──────────────────────────────────────────────────
export async function fetchProfile() {
  const res = await fetch(`${API_BASE}/users/${GITHUB_USER}`);
  if (!res.ok) return null;
  return res.json();
}

// ── Fetch and filter all portfolio projects ───────────────────────────────
// Only repos WITH a .portfolio file where display != 'false' are shown.
export async function fetchProjects() {
  const res = await fetch(
    `${API_BASE}/users/${GITHUB_USER}/repos?per_page=100&sort=updated`
  );
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const repos = await res.json();

  // Fetch .portfolio files in parallel
  const results = await Promise.all(
    repos.map(async repo => {
      const pf = await fetchPortfolioFile(repo.name, repo.default_branch);
      return { repo, portfolio: pf };
    })
  );

  return results
    .filter(({ portfolio }) => {
      // No .portfolio file → hidden by default
      if (!portfolio) return false;
      // Explicitly hidden
      if (portfolio.display === 'false') return false;
      return true;
    })
    .map(({ repo, portfolio }) => ({
      id:           repo.id,
      name:         repo.name,
      description:  portfolio.description || repo.description || '',
      url:          repo.html_url,
      stars:        repo.stargazers_count,
      forks:        repo.forks_count,
      language:     repo.language || null,
      fork:         repo.fork,
      archived:     repo.archived,
      updatedAt:    repo.updated_at,
      defaultBranch: repo.default_branch || 'main',
      // Extra fields from .portfolio
      portfolio: {
        featured: portfolio.featured === 'true',
        tags:     portfolio.tags ? portfolio.tags.split(',').map(t => t.trim()) : [],
        demo:     portfolio.demo || null,
        order:    portfolio.order ? parseInt(portfolio.order, 10) : 999,
      },
    }))
    .sort((a, b) => a.portfolio.order - b.portfolio.order);
}

export const GITHUB_USER_NAME = GITHUB_USER;
