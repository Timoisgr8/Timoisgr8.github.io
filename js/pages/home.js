import { fetchProjects, fetchProfile, GITHUB_USER_NAME } from '../github.js';
import { createRepoCard, renderSkeletons } from '../components/repoCard.js';
import { renderNav } from '../components/nav.js';

// Cache so navigating back doesn't re-fetch
let cachedProjects = null;
let cachedProfile  = null;
let activeFilter   = 'all';
let searchQuery    = '';

export async function renderHome() {
  renderNav();

  const app = document.getElementById('app');
  app.innerHTML = '';
  app.className = 'page-enter';

  // ── Build static shell ────────────────────────────────────────────────
  app.innerHTML = `
    <div class="container">

      <!-- HERO -->
      <section class="section hero" id="about">
        <p class="hero-eyebrow">
          Portfolio
          <span class="gpu-badge" id="gpu-badge">
            <span class="gpu-dot"></span>
            <span id="gpu-label">WebGPU</span>
          </span>
        </p>
        <h1>Hi, I'm <em>Timothy Tew</em> —<br>a developer who builds things.</h1>
        <p class="lead" id="hero-bio">
          Passionate about pushing the web forward with modern graphics APIs,
          creative tooling, and open source. Welcome to my corner of GitHub.
        </p>
        <div class="hero-actions">
          <a href="#projects" class="btn btn-primary">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            View Projects
          </a>
          <a href="https://github.com/${GITHUB_USER_NAME}" target="_blank" rel="noopener" class="btn btn-outline">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            GitHub
          </a>
        </div>
      </section>

      <!-- SKILLS -->
      <section class="section" id="skills">
        <p class="section-label">Tech Stack</p>
        <h2>Skills &amp; Technologies</h2>
        <div class="skills-grid" id="skills-grid">
          <span class="skill-tag featured">WebGPU</span>
          <span class="skill-tag featured">JavaScript</span>
          <span class="skill-tag featured">TypeScript</span>
          <span class="skill-tag">HTML / CSS</span>
          <span class="skill-tag">WebGL</span>
          <span class="skill-tag">WGSL</span>
          <span class="skill-tag">Node.js</span>
          <span class="skill-tag">Python</span>
          <span class="skill-tag">React</span>
          <span class="skill-tag">Git</span>
          <span class="skill-tag">GitHub Pages</span>
          <span class="skill-tag">Open Source</span>
        </div>
      </section>

      <!-- PROJECTS -->
      <section class="section" id="projects">
        <p class="section-label">Open Source</p>
        <div class="repos-toolbar">
          <h2>Projects</h2>
          <span class="repo-count" id="repo-count"></span>
        </div>
        <div class="search-box">
          <span class="search-icon">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </span>
          <input type="text" id="search-input" placeholder="Search projects…">
        </div>
        <div class="filter-row" id="lang-filters"></div>
        <div class="repos-grid" id="repos-grid"></div>
        <p style="font-size:12px;color:var(--text-muted);margin-top:1.5rem;font-family:var(--mono)">
          Only repos with a <code style="font-family:var(--mono);background:var(--bg);padding:1px 5px;border-radius:3px;border:1px solid var(--border)">.portfolio</code> file are shown.
          Set <code style="font-family:var(--mono);background:var(--bg);padding:1px 5px;border-radius:3px;border:1px solid var(--border)">display=false</code> to hide any repo.
        </p>
      </section>

      <!-- CONTACT -->
      <section class="section" id="contact">
        <p class="section-label">Get in Touch</p>
        <h2>Contact</h2>
        <p class="lead" style="margin-bottom:0">
          Have a project idea, collaboration request, or just want to say hi?
        </p>
        <div class="contact-links">
          <a href="https://github.com/${GITHUB_USER_NAME}" target="_blank" rel="noopener" class="contact-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            github.com/${GITHUB_USER_NAME}
          </a>
        </div>
      </section>

      <footer>
        <p>Built with the GitHub API &amp; WebGPU · <a href="https://github.com/${GITHUB_USER_NAME}" target="_blank">@${GITHUB_USER_NAME}</a> · ${new Date().getFullYear()}</p>
      </footer>
    </div>
  `;

  // Wire up search
  const searchInput = document.getElementById('search-input');
  searchInput.value = searchQuery;
  searchInput.addEventListener('input', e => {
    searchQuery = e.target.value;
    renderFiltered();
  });

  // Start loading
  renderSkeletons(document.getElementById('repos-grid'), 6);
  loadData();
}

async function loadData() {
  try {
    // Load profile and projects in parallel
    [cachedProfile, cachedProjects] = await Promise.all([
      cachedProfile  ?? fetchProfile(),
      cachedProjects ?? fetchProjects(),
    ]);

    // Update bio from GitHub profile
    if (cachedProfile?.bio) {
      const bioEl = document.getElementById('hero-bio');
      if (bioEl) bioEl.textContent = cachedProfile.bio;
    }

    // Add discovered languages to skills
    const seenLangs = new Set(cachedProjects.map(p => p.language).filter(Boolean));
    const skillGrid = document.getElementById('skills-grid');
    if (skillGrid) {
      seenLangs.forEach(lang => {
        if (!skillGrid.querySelector(`[data-lang="${lang}"]`)) {
          const tag = document.createElement('span');
          tag.className = 'skill-tag';
          tag.dataset.lang = lang;
          tag.textContent = lang;
          skillGrid.appendChild(tag);
        }
      });
    }

    renderLanguageFilters();
    renderFiltered();
  } catch (err) {
    console.error(err);
    const grid = document.getElementById('repos-grid');
    if (grid) grid.innerHTML = `
      <div class="state-box">
        <span class="state-icon">⚠</span>
        <p>Couldn't load projects. Try refreshing.</p>
      </div>`;
  }
}

function renderLanguageFilters() {
  const container = document.getElementById('lang-filters');
  if (!container || !cachedProjects) return;

  const langs = [...new Set(cachedProjects.map(p => p.language).filter(Boolean))].sort();
  const all = ['all', ...langs];

  container.innerHTML = all.map(lang => `
    <button class="filter-btn ${lang === activeFilter ? 'active' : ''}"
            data-filter="${lang}">
      ${lang === 'all' ? 'All' : lang}
    </button>
  `).join('');

  container.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      renderLanguageFilters();
      renderFiltered();
    });
  });
}

function renderFiltered() {
  const grid      = document.getElementById('repos-grid');
  const countEl   = document.getElementById('repo-count');
  if (!grid || !cachedProjects) return;

  const q = searchQuery.toLowerCase();
  const filtered = cachedProjects.filter(p => {
    const matchLang   = activeFilter === 'all' || p.language === activeFilter;
    const matchSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.language ?? '').toLowerCase().includes(q) ||
      p.portfolio.tags.some(t => t.toLowerCase().includes(q));
    return matchLang && matchSearch;
  });

  if (countEl) countEl.textContent = `${filtered.length} repo${filtered.length !== 1 ? 's' : ''}`;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="state-box">
        <span class="state-icon">○</span>
        <p>No projects match your search.</p>
      </div>`;
    return;
  }

  grid.innerHTML = '';
  filtered.forEach(p => grid.appendChild(createRepoCard(p)));
}
