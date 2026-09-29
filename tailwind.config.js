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
        // ZINC mapped to Dark Maroon for Backgrounds, Cream for Text
        zinc: {
          950: '#1a0505', // bg-zinc-950 -> Very Dark Maroon BG
          900: '#2b0a0a', // bg-zinc-900 -> Dark Maroon Card
          800: '#421212', // border-zinc-800 -> Maroon Borders
          700: '#591a1a', 
          600: '#702222',
          500: '#872a2a',
          400: '#c4aa8f', // text-zinc-400 -> Muted Cream
          300: '#e3ccb3', // text-zinc-300 -> Standard Cream
          200: '#f5e8d7', // text-zinc-200 -> Bright Cream
          100: '#fdfbf7', // text-zinc-100 -> Very Bright Cream
          50:  '#ffffff',
        },
        // OLIVE mapped to Solid Maroon Scale (Panels, Badges)
        olive: {
          50: '#f5e6e6',
          100: '#e6bfbf',
          200: '#d99999',
          300: '#cc7373',
          400: '#b34d4d',
          500: '#992626',
          600: '#800000', 
          700: '#660000',
          800: '#4d0000', // bg-olive-800 -> Primary Panels (Deep Maroon)
          900: '#330000', // bg-olive-900 -> Secondary Panels (Pitch Maroon)
          950: '#1a0000',
        },
        // EMERALD mapped to Cream/Gold (Text/Icons) & Bright Maroon (Buttons)
        emerald: {
          50: '#fcfbf7',
          100: '#f7f2e1',
          200: '#efe5c4',
          300: '#e3d29a',
          400: '#d6bc69', // text-emerald-400 -> Cream/Gold Text Highlight
          500: '#8c1111', // bg-emerald-500 -> Bright Maroon Button
          600: '#6e0d0d', // bg-emerald-600 -> Maroon Button Hover
          700: '#4d0000',
          800: '#330000',
          900: '#1a0000',
          950: '#0a0000',
        },
        // AMBER mapped to warm Cream
        amber: {
          400: '#e6c885',
          500: '#d1ab52',
          600: '#b8923a',
        },
        gold: {
          400: '#e3c68a',
          500: '#ccaa5e',
          600: '#b39042',
          700: '#99762e',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
