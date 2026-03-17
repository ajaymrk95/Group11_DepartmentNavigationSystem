import type { Config } from 'tailwindcss'
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#1A3263', light: '#254a8f', dark: '#111f3d' },
        steel: { DEFAULT: '#547792', light: '#7099b0', dark: '#3a566b' },
        amber: { DEFAULT: '#FAB95B', light: '#fccf87', dark: '#e8a03a' },
        cream: { DEFAULT: '#E8E2DB', light: '#f2ede8', dark: '#cdc5bb' },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
