import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'About',    href: '/#about' },
  { label: 'Skills',   href: '/#skills' },
  { label: 'Projects', href: '/#projects' },
  { label: 'Contact',  href: '/#contact' },
];

interface NavProps {
  showBack?: boolean;
}

export default function Nav({ showBack = false }: NavProps) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav className="sticky top-0 z-50 h-14 flex items-center justify-between px-6 border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-md">
      <Link
        to="/"
        className="font-mono text-[15px] font-medium tracking-tight hover:opacity-70 transition-opacity"
      >
        <span className="text-accent">~/</span>Timoisgr8
      </Link>

      {showBack ? (
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          All projects
        </Link>
      ) : (
        <ul className="hidden sm:flex gap-8 list-none">
          {NAV_LINKS.map(link => (
            <li key={link.label}>
              <a
                href={link.href}
                className={`text-sm transition-colors ${
                  isHome
                    ? 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
