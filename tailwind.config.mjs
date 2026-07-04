/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50:  '#f6f7fb',
          100: '#e9ebf3',
          200: '#cdd1e0',
          300: '#a0a7c2',
          400: '#6f78a0',
          500: '#4a5378',
          600: '#343c5c',
          700: '#252b45',
          800: '#181c32',
          900: '#0e1126',
          950: '#070817',
        },
        brand: {
          50:  '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          950: '#500724',
        },
        accent: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Space Grotesk"', '"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      backgroundImage: {
        'grid-fade': 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(139,92,246,0.18), rgba(0,0,0,0))',
        'mesh': 'radial-gradient(at 20% 20%, rgba(236,72,153,0.18) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(139,92,246,0.18) 0px, transparent 50%), radial-gradient(at 0% 90%, rgba(56,189,248,0.10) 0px, transparent 50%)',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(139,92,246,0.25), 0 20px 60px -20px rgba(139,92,246,0.45)',
        card: '0 10px 30px -10px rgba(0,0,0,0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
};
