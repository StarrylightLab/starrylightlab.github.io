/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./**/*.{html,js}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7C3AED',
        secondary: '#8B5CF6',
        accent: '#A78BFA'
      }
    },
  },
  plugins: [],
}