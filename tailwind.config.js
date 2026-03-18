/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg': '#f8fafc', // bg-slate-50
        'brand-accent': '#f97316', // orange-500
        'brand-text-dark': '#1e293b', // slate-800
        'brand-text-light': '#64748b', // slate-500
      },
    },
  },
  plugins: [],
}
