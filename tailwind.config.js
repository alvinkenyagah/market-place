/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FAF7F2',
          dark: '#F0EBE3',
        },
        terracotta: {
          light: '#F5E9E1',
          DEFAULT: '#C4622D',
          dark: '#9E4E22',
        },
        earthGreen: { // renamed slightly to avoid conflict with Tailwind default green
          light: '#E4EFE9',
          DEFAULT: '#2A5C3F',
        },
        gold: {
          light: '#FDF3DC',
          DEFAULT: '#C9941A',
        },
        charcoal: '#1C1917',
        // Your grays map almost perfectly to Tailwind's default 'stone' palette:
        // stone-700 (#44403c), stone-500 (#78716c), stone-300 (#d6d3d1), stone-200 (#e7e5e4), stone-100 (#f5f5f4)
      },
    },
  },
  plugins: [],
}