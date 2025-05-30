/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  safelist: [
    "bg-blue-600", "hover:bg-blue-700",
    "bg-green-600", "hover:bg-green-700",
    "bg-blue-500", "hover:bg-blue-600",
    "bg-green-500", "hover:bg-green-600",
  ],
  theme: {
    extend: {
      colors: {
        blue: { 500: '#3b82f6', 600: '#2563eb' },
        green: { 500: '#10b981', 600: '#059669' },
        purple: { 500: '#8b5cf6', 600: '#7c3aed' },
        orange: { 500: '#f97316', 600: '#ea580c' },
        oya: '#3b82f6',
        ko: '#10b981',
        oyaTsumo: '#8b5cf6',
        koTsumo: '#f97316',
        oyaRon: '#3b82f6',
        koRon: '#10b981',
        oyaRonHover: '#2563eb',
        koRonHover: '#059669',
        oyaTsumoHover: '#7c3aed',
        koTsumoHover: '#ea580c'
      }
    }
  },
  plugins: [],
};
