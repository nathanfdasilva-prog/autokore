import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          50:  '#FFF5F5',
          100: '#FFD0D0',
          200: '#FFA0A0',
          300: '#FF7070',
          400: '#E03030',
          500: '#C0131A',   // vermelho escuro principal
          600: '#8B0D12',
          700: '#5E0809',
          800: '#350405',
          900: '#1A0202',
        },
        gold: {
          50:  '#FFFBF0',
          100: '#FFF0C0',
          200: '#FFE080',
          300: '#F0C840',
          400: '#D4A017',   // dourado principal
          500: '#B08010',
          600: '#806008',
          700: '#504005',
          800: '#302502',
          900: '#181200',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config