/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // This forces dark mode to activate via the 'dark' class on html
  theme: {
    extend: {},
  },
  plugins: [],
}
