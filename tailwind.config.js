/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        accent: {
          DEFAULT: '#2563eb',
          light: '#eff4ff',
          text: '#1d4ed8',
        },
      },
      animation: {
        shimmer: 'shimmer 1.4s infinite',
        'page-in': 'pageIn 0.2s ease forwards',
      },
      keyframes: {
        shimmer: {
          to: { backgroundPosition: '-200% 0' },
        },
        pageIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
