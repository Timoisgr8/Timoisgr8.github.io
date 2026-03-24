import { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import { fetchReadme, resolveReadmeUrls } from '../lib/github';

// Configure marked once
marked.setOptions({ gfm: true, breaks: false });

const renderer = new marked.Renderer();

// Open all links in a new tab
renderer.link = ({ href, title, text }) => {
  const titleAttr = title ? ` title="${title}"` : '';
  return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
};

marked.use({ renderer });

interface ReadmeViewerProps {
  repoName: string;
  defaultBranch: string;
}

export default function ReadmeViewer({ repoName, defaultBranch }: ReadmeViewerProps) {
  const [html, setHtml]       = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const containerRef          = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    setHtml(null);

    fetchReadme(repoName, defaultBranch).then(markdown => {
      if (!markdown) {
        setHtml('');
        setLoading(false);
        return;
      }

      const raw = marked.parse(markdown) as string;
      const resolved = resolveReadmeUrls(raw, repoName, defaultBranch);
      setHtml(resolved);
      setLoading(false);
    });
  }, [repoName, defaultBranch]);

  // Run highlight.js after HTML is injected into the DOM
  useEffect(() => {
    if (!html || !containerRef.current) return;
    containerRef.current
      .querySelectorAll<HTMLElement>('pre code:not(.hljs)')
      .forEach(block => hljs.highlightElement(block));
  }, [html]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-8 text-stone-400 dark:text-stone-500 text-sm">
        <span className="w-4 h-4 border-2 border-stone-200 dark:border-stone-700 border-t-accent rounded-full animate-spin shrink-0" />
        Loading README…
      </div>
    );
  }

  if (!html) {
    return (
      <p className="text-sm text-stone-400 dark:text-stone-500 italic py-6 text-center">
        No README found for this repository.
      </p>
    );
  }

  return (
    <div
      ref={containerRef}
      className="markdown-body"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
