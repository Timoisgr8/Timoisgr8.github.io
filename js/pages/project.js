import { fetchProjects, fetchReadme, GITHUB_USER_NAME } from '../github.js';
import { renderNav } from '../components/nav.js';

// Cache projects so we don't re-fetch when navigating from home
let cachedProjects = null;

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24); if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30); if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
  HTML: '#e34c26', CSS: '#563d7c', Rust: '#dea584', Go: '#00ADD8',
  'C++': '#f34b7d', C: '#555555', Java: '#b07219', Shell: '#89e051',
  Vue: '#41b883', Ruby: '#701516', Kotlin: '#A97BFF', Swift: '#F05138',
  WGSL: '#5E4CDB',
};

function getLangColor(lang) { return LANG_COLORS[lang] || '#8b949e'; }

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Resolve relative image/link URLs in README to absolute GitHub raw/blob URLs
function resolveReadmeUrls(html, repoName, branch) {
  const rawBase  = `https://raw.githubusercontent.com/${GITHUB_USER_NAME}/${repoName}/${branch}`;
  const blobBase = `https://github.com/${GITHUB_USER_NAME}/${repoName}/blob/${branch}`;

  // Resolve relative image src attributes
  html = html.replace(/(<img[^>]+src=")(?!https?:\/\/)([^"]+)(")/gi, (_, pre, path, post) => {
    return `${pre}${rawBase}/${path.replace(/^\.?\//,'')}${post}`;
  });

  // Resolve relative anchor hrefs (but not fragment-only links)
  html = html.replace(/(<a[^>]+href=")(?!https?:\/\/)(?!#)([^"]+)(")/gi, (_, pre, path, post) => {
    return `${pre}${blobBase}/${path.replace(/^\.?\//,'')}${post}`;
  });

  return html;
}

export async function renderProject({ name }) {
  renderNav({ showBack: true, backLabel: 'All projects' });
  window.scrollTo(0, 0);

  const app = document.getElementById('app');
  app.innerHTML = '';
  app.className = 'page-enter';

  // Show loading shell immediately
  app.innerHTML = `
    <div class="container">
      <div class="project-hero">
        <div class="skeleton" style="height:2rem;width:40%;margin-bottom:1rem"></div>
        <div class="skeleton" style="height:1rem;width:70%;margin-bottom:0.5rem"></div>
        <div class="skeleton" style="height:1rem;width:50%"></div>
      </div>
      <div class="readme-container">
        <div class="readme-loading">Loading README…</div>
      </div>
    </div>
  `;

  // Load projects list (use cache if available)
  try {
    cachedProjects = cachedProjects ?? await fetchProjects();
  } catch (e) {
    console.error(e);
  }

  const project = cachedProjects?.find(p => p.name === name);

  if (!project) {
    app.innerHTML = `
      <div class="container" style="padding-top:4rem;text-align:center">
        <p style="font-size:2rem;margin-bottom:1rem">404</p>
        <p style="color:var(--text-secondary)">Project "<strong>${esc(name)}</strong>" not found or not listed in this portfolio.</p>
      </div>`;
    return;
  }

  // Fetch README in parallel (project data already available)
  const readmeText = await fetchReadme(project.name, project.defaultBranch);

  // Render the README with marked + highlight.js
  let readmeHtml = '';
  if (readmeText) {
    marked.setOptions({
      gfm: true,
      breaks: false,
      highlight: (code, lang) => {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
      },
    });
    readmeHtml = resolveReadmeUrls(
      marked.parse(readmeText),
      project.name,
      project.defaultBranch
    );
  }

  const langDot = project.language
    ? `<span style="width:10px;height:10px;border-radius:50%;background:${getLangColor(project.language)};display:inline-block;margin-right:4px"></span>${esc(project.language)}`
    : '';

  app.innerHTML = `
    <div class="container">
      <div class="project-hero">
        <p class="section-label" style="margin-bottom:0.75rem">Project</p>
        <h1>${esc(project.name)}</h1>
        ${project.description ? `<p class="lead" style="margin-bottom:0">${esc(project.description)}</p>` : ''}

        <div class="project-meta">
          ${langDot ? `<span class="project-meta-item">${langDot}</span>` : ''}
          <span class="project-meta-item">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            ${project.stars}
          </span>
          <span class="project-meta-item">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/>
              <circle cx="6" cy="18" r="3"/><circle cx="6" cy="6" r="3"/>
              <path d="M18 9a9 9 0 01-9 9"/>
            </svg>
            ${project.forks}
          </span>
          <span class="project-meta-item">Updated ${timeAgo(project.updatedAt)}</span>
          ${project.portfolio.tags.length ? `
            <span class="project-meta-item" style="gap:4px;flex-wrap:wrap">
              ${project.portfolio.tags.map(t =>
                `<span style="padding:2px 8px;background:var(--accent-light);color:var(--accent-text);border-radius:100px;font-size:11px">${esc(t)}</span>`
              ).join('')}
            </span>` : ''}
        </div>

        <div class="project-actions">
          <a href="${esc(project.url)}" target="_blank" rel="noopener" class="btn btn-primary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            View on GitHub
          </a>
          ${project.portfolio.demo ? `
            <a href="${esc(project.portfolio.demo)}" target="_blank" rel="noopener" class="btn btn-outline">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Live Demo
            </a>` : ''}
        </div>
      </div>

      <!-- README -->
      <div class="readme-container">
        <div class="readme-header">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          README.md
        </div>
        ${readmeHtml
          ? `<div class="markdown-body">${readmeHtml}</div>`
          : `<p class="readme-missing">No README found for this repository.</p>`
        }
      </div>

      <footer>
        <p>Built with the GitHub API &amp; WebGPU · <a href="https://github.com/${GITHUB_USER_NAME}" target="_blank">@${GITHUB_USER_NAME}</a></p>
      </footer>
    </div>
  `;

  // Run highlight.js on any code blocks not already highlighted
  document.querySelectorAll('.markdown-body pre code:not(.hljs)').forEach(block => {
    hljs.highlightElement(block);
  });
}
