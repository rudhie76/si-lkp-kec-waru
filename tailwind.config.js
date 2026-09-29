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
        // ZINC mapped to MAROON Background (950) and CREAM Cards (900)
        zinc: {
          950: '#2a0a0a', // Main BG: Dark Maroon
          900: '#fdfbf7', // Card BG: Cream
          800: '#f5f0e1', // Borders / Inner cards
          700: '#e8dfc7', 
          600: '#d1c4a5',
          500: '#a39171',
          400: '#c4aa8f', // Muted text on maroon bg
          300: '#e3ccb3', // Normal text on maroon bg
          200: '#f5e8d7', // Bright text on maroon bg
          100: '#fdfbf7', // Headings (Cream)
          50:  '#ffffff',
        },
        // OLIVE mapped to CREAM Panels
        olive: {
          50: '#2a0a0a',
          100: '#3d0a0a',
          200: '#4a0e0e',
          300: '#5c1212',
          400: '#731717',
          500: '#8c1c1c',
          600: '#d1c4a5',
          700: '#e8dfc7', 
          800: '#fdfbf7', // Primary panels (Cream)
          900: '#f5f0e1', // Secondary panels (Slightly darker cream)
          950: '#e8dfc7',
        },
        // EMERALD mapped to MAROON Buttons
        emerald: {
          50: '#fdfbf7',
          100: '#f7f2e1',
          200: '#efe5c4',
          300: '#e3d29a',
          400: '#d6bc69', // text-emerald-400 (Gold/Cream highlights)
          500: '#800000', // bg-emerald-500 (Maroon Button)
          600: '#660000', // Hover Button
          700: '#4d0000',
          800: '#330000',
          900: '#1a0000',
          950: '#0a0000',
        },
        // AMBER mapped to GOLD
        amber: {
          400: '#d97706',
          500: '#b45309',
          600: '#92400e',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
