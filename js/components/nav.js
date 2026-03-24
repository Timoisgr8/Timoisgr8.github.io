import { navigate } from '../router.js';

const NAV_LINKS = [
  { label: 'About', hash: '#about' },
  { label: 'Skills', hash: '#skills' },
  { label: 'Projects', hash: '#projects' },
  { label: 'Contact', hash: '#contact' },
];

export function renderNav({ showBack = false, backLabel = 'All projects' } = {}) {
  const mount = document.getElementById('nav-mount');

  const navEl = document.createElement('nav');
  navEl.innerHTML = `
    <a href="#about" class="nav-brand">
      <span>~/</span>Timoisgr8
    </a>
    ${showBack
      ? `<button class="nav-back" data-nav-back>
           <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
             <polyline points="15 18 9 12 15 6"/>
           </svg>
           ${backLabel}
         </button>`
      : `<ul class="nav-links">
           ${NAV_LINKS.map(l =>
        `<li><a href="${l.hash}">${l.label}</a></li>`
      ).join('')}
         </ul>`
    }
  `;

  navEl.querySelector('[data-nav-home]')?.addEventListener('click', () => navigate('/'));
  navEl.querySelector('[data-nav-back]')?.addEventListener('click', () => navigate('/'));

  mount.replaceChildren(navEl);
}
