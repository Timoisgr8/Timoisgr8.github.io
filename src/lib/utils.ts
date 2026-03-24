export const LANG_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python:     '#3572A5',
  HTML:       '#e34c26',
  CSS:        '#563d7c',
  Rust:       '#dea584',
  Go:         '#00ADD8',
  'C++':      '#f34b7d',
  C:          '#555555',
  Java:       '#b07219',
  Shell:      '#89e051',
  Vue:        '#41b883',
  Ruby:       '#701516',
  Kotlin:     '#A97BFF',
  Swift:      '#F05138',
  WGSL:       '#5E4CDB',
};

export function getLangColor(lang: string | null): string {
  return (lang && LANG_COLORS[lang]) || '#8b949e';
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60)   return `${s}s ago`;
  const m = Math.floor(s / 60);  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);  if (d < 30)  return `${d}d ago`;
  const mo = Math.floor(d / 30); if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}
