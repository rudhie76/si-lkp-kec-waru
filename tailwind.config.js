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
        // ZINC mapped to CREAM Backgrounds and MAROON Text
        zinc: {
          950: '#FDFBF7', // Main bg: Light Cream
          900: '#F5F0E1', // Card bg: Cream
          800: '#E8DFC7', // Borders
          700: '#D1C4A5',
          600: '#A39171',
          500: '#756345',
          400: '#800000', // text-zinc-400 -> Maroon muted
          300: '#660000', // text-zinc-300 -> Maroon standard
          200: '#4D0000', // text-zinc-200 -> Maroon dark
          100: '#330000', // text-zinc-100 -> Maroon very dark
          50:  '#1A0000', // text-zinc-50  -> Maroon pitch
        },
        // OLIVE mapped to MAROON Panels
        olive: {
          50: '#FDFBF7',
          100: '#F5E6E6',
          200: '#E6BFBF',
          300: '#D99999',
          400: '#CC7373',
          500: '#B34D4D',
          600: '#992626',
          700: '#800000',
          800: '#5C0000', // bg-olive-800 -> Primary panel (Dark Maroon)
          900: '#3D0000', // bg-olive-900 -> Secondary panel (Deep Maroon)
          950: '#240000', // Pitch Maroon
        },
        // EMERALD mapped to Accents
        emerald: {
          50: '#FDFBF7',
          100: '#F7F2E1',
          200: '#EFE5C4',
          300: '#E3D29A',
          400: '#992626', // text-emerald-400 -> Highlight Maroon
          500: '#800000', // bg-emerald-500 -> Button Maroon
          600: '#660000', // Hover Button
          700: '#4D0000',
          800: '#330000',
          900: '#1A0000',
          950: '#0A0000',
        },
        amber: {
          400: '#D97706',
          500: '#B45309',
          600: '#92400E',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
