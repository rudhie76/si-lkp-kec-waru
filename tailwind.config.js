/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          50: '#f2f9f4',
          100: '#e1f2e6',
          200: '#c5e4cf',
          300: '#9bcfab',
          400: '#6bb282',
          500: '#469561',
          600: '#34784d',
          700: '#2a603f',
          800: '#1b4d36', // Primary Olive Dark
          900: '#123724', // Deep Olive Dark
          950: '#0a2115', // Pitch Olive Dark
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
