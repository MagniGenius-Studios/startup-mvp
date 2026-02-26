import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui'],
        body: ['var(--font-body)', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        midnight: '#0f172a',
        sky: '#0ea5e9',
        mint: '#34d399',
        ink: '#0b1224',
      },
      boxShadow: {
        soft: '0 20px 80px -24px rgba(15, 23, 42, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
