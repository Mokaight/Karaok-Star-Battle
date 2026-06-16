import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: false,
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          violet: '#C9A8E0',
          rose:   '#F4A0C8',
          peach:  '#FBBF8A',
          bg:     '#FDF6FF',
          star:   '#FFD966',
          text:   '#3D2B56',
          muted:  '#8B7AAA',
        }
      },
      fontFamily: {
        sans:    ['Nunito', 'system-ui', 'sans-serif'],
        display: ['Fredoka One', 'cursive'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 4px 20px rgba(201, 168, 224, 0.25)',
        glow: '0 0 20px rgba(201, 168, 224, 0.4)',
      }
    }
  },
  plugins: []
}

export default config
