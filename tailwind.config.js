/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Noto Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', 'sans-serif'],
      },
      colors: {
        ink: {
          900: '#1a1a1a',
          800: '#2d2d2d',
          700: '#404040',
        },
        paper: {
          50: '#fdfbf7',
          100: '#f7f3e8',
          200: '#efe6d0',
        }
      }
    }
  },
  plugins: [],
}