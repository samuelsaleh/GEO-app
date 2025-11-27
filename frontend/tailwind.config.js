/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // British Phone Booth - Primary Reds
        booth: {
          50: '#FFF5F5',
          100: '#FFE8E8',
          200: '#FFD1D4',
          300: '#FFA8AD',
          400: '#FF6B74',
          500: '#FF001A', // Main British Phone Booth Red
          600: '#E00017',
          700: '#B80014',
          800: '#960012',
          900: '#7A0010',
          950: '#450008',
        },
        // Mulberry Tulip - Deep Burgundy/Wine tones
        mulberry: {
          50: '#FCF5F7',
          100: '#F9E8ED',
          200: '#F3D1DC',
          300: '#E9ABC0',
          400: '#DB7A9A',
          500: '#C94D73',
          600: '#A83259',
          700: '#8B1C42',
          800: '#741838',
          900: '#621832',
          950: '#380818',
        },
        // Coral/Peach accent tones
        coral: {
          50: '#FFF7F5',
          100: '#FFEDE8',
          200: '#FFD9D1',
          300: '#FFB8A8',
          400: '#FF8A6F',
          500: '#FF6347',
          600: '#ED4026',
          700: '#C82D1A',
          800: '#A52818',
          900: '#88261A',
        },
        // Warm Cream/Peach backgrounds
        cream: {
          50: '#FFFBF7',
          100: '#FFF5EB',
          200: '#FFECD9',
          300: '#FFDBB8',
          400: '#FFC48A',
          500: '#FFAA5C',
          600: '#F28C2E',
          700: '#CB6E1A',
          800: '#A65718',
          900: '#874917',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
