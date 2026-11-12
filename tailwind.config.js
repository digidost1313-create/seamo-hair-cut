/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        royal: '#101114', gold: '#C6A15B', golddark: '#A8843F',
        ivory: '#F4F0E8', charcoal: '#34363C', card: '#1B1D22',
      },
      fontFamily: { display: ['Georgia', 'serif'], sans: ['system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
