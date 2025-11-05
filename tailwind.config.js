/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/frontend/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        scanner: {
          '0%':   { transform: 'translateY(0)' },
          '50%':  { transform: 'translateY(168px)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        scanner: 'scanner 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

