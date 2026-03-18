/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg': '#fdf1e2',
        'brand-accent': '#e8492a',
        'brand-text': '#342626',
      },
    },
  },
  plugins: [],
}
