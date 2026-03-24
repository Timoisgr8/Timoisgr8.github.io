import { navigate } from '../router.js';

const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
  HTML: '#e34c26', CSS: '#563d7c', Rust: '#dea584', Go: '#00ADD8',
  'C++': '#f34b7d', C: '#555555', Java: '#b07219', Shell: '#89e051',
  Vue: '#41b883', Ruby: '#701516', Kotlin: '#A97BFF', Swift: '#F05138',
  WGSL: '#5E4CDB',
};

function getLangColor(lang) {
  return LANG_COLORS[lang] || '#8b949e';
}

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

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function createRepoCard(project) {
  const card = document.createElement('div');
  card.className = 'repo-card';

  const badges = [
    project.fork     ? `<span class="repo-badge fork">fork</span>`     : '',
    project.archived ? `<span class="repo-badge archived">archived</span>` : '',
    project.portfolio.featured ? `<span class="repo-badge">featured</span>` : '',
  ].join('');

  card.innerHTML = `
    <div class="repo-card-name">
      ${esc(project.name)}${badges}
    </div>
    <p class="repo-card-desc ${project.description ? '' : 'empty'}">
      ${project.description ? esc(project.description) : 'No description'}
    </p>
    <div class="repo-card-footer">
      <span class="repo-stat">
        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        ${project.stars}
      </span>
      <span class="repo-stat">
        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/>
          <circle cx="6" cy="18" r="3"/><circle cx="6" cy="6" r="3"/>
          <path d="M18 9a9 9 0 01-9 9"/>
        </svg>
        ${project.forks}
      </span>
      ${project.language ? `
        <span class="repo-lang">
          <span class="lang-dot" style="background:${getLangColor(project.language)}"></span>
          ${esc(project.language)}
        </span>` : ''}
    </div>
    <p class="repo-updated">Updated ${timeAgo(project.updatedAt)}</p>
  `;

  card.addEventListener('click', () => navigate(`/project/${project.name}`));
  return card;
}

export function renderSkeletons(container, count = 6) {
  container.innerHTML = Array.from({ length: count }, () => `
    <div class="skeleton-card">
      <div class="skeleton" style="height:16px;width:55%"></div>
      <div class="skeleton" style="height:12px;width:88%"></div>
      <div class="skeleton" style="height:12px;width:70%"></div>
      <div class="skeleton" style="height:10px;width:40%;margin-top:8px"></div>
    </div>
  `).join('');
}
