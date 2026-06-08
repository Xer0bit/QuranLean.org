/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: { dark: '#c9a96e', light: '#8b6914', DEFAULT: '#c9a96e' },
        correct: { dark: '#4ade80', light: '#16a34a', DEFAULT: '#4ade80' },
        incorrect: { dark: '#f87171', light: '#dc2626', DEFAULT: '#f87171' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['Amiri', 'serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
    },
  },
  plugins: [],
}

