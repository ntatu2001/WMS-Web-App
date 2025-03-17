/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'teal': {
          700: '#0F766E',
          800: '#115E59',
        },
        'slate': {
          900: '#0F172A',
        }
      },
    },
  },
  plugins: [],
} 