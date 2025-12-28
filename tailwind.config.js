/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        aura: {
          bg: '#F8FAFC', // Slate 50
          'bg-dark': '#0f172a', // Slate 900
          card: '#ffffff',
          'card-dark': '#1e293b', // Slate 800
          accent: '#42b883', // Vue Green
          text: '#1e293b', // Slate 800
          'text-dark': '#f1f5f9', // Slate 100
          muted: '#94a3b8', // Slate 400
        },
      },
      borderRadius: {
        '4xl': '2.0rem',
        card: '2.5rem',
      },
      boxShadow: {
        soft: '0 10px 40px -10px rgba(0, 0, 0, 0.05)',
        glow: '0 0 20px rgba(66, 184, 131, 0.3)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
