import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: '#60a5fa',
        muted: '#94a3b8',
        border: '#334155',
        panel: '#1e293b',
        good: '#4ade80',
        warn: '#fbbf24',
        bad: '#f87171',
      },
    },
  },
  plugins: [],
};

export default config;
