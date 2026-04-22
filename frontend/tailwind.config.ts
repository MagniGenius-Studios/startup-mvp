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
        display: ['"Inter"', 'ui-sans-serif', 'system-ui'],
        body: ['"Inter"', 'ui-sans-serif', 'system-ui'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Surface layers (softer dark, not harsh black)
        surface: {
          0: '#0c0f1a',
          1: '#111527',
          2: '#171c30',
          3: '#1e2440',
        },
        // Primary accent: purple/violet (AI feel)
        accent: {
          DEFAULT: '#7c5cfc',
          light: '#a78bfa',
          dim: '#5b3fd9',
          glow: 'rgba(124, 92, 252, 0.15)',
        },
        // Semantic colors
        success: '#34d399',
        danger: '#f87171',
        warning: '#fbbf24',
        // Text hierarchy
        text: {
          primary: '#f1f5f9',
          secondary: '#94a3b8',
          muted: '#475569',
        },
        // Legacy compat
        midnight: '#0f172a',
        sky: '#0ea5e9',
        mint: '#34d399',
        ink: '#0c0f1a',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 20px 80px -24px rgba(15, 23, 42, 0.35)',
        glow: '0 0 40px -8px rgba(124, 92, 252, 0.2)',
        card: '0 1px 3px rgba(0,0,0,0.3), 0 8px 24px -4px rgba(0,0,0,0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
