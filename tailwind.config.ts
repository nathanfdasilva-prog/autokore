// tailwind.config.ts
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
          50:  '#FFF0E6',
          100: '#FFD9B3',
          200: '#FFB566',
          300: '#FF9133',
          400: '#FF7A00',
          500: '#E85D04',   // cor principal da marca
          600: '#B34500',
          700: '#7A2F00',
          800: '#4A1C00',
          900: '#1A0A00',
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
