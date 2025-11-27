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
        // Soft Rose - #F08787
        rose: {
          50: '#FDF5F5',
          100: '#FCEAEA',
          200: '#F8D4D4',
          300: '#F4B3B3',
          400: '#F08787', // Main color
          500: '#E06B6B',
          600: '#C85555',
          700: '#A84444',
          800: '#8B3838',
          900: '#6B2B2B',
        },
        // Soft Peach - #FFC7A7
        peach: {
          50: '#FFFAF7',
          100: '#FFF3EC',
          200: '#FFE5D6',
          300: '#FFC7A7', // Main color
          400: '#FFB08A',
          500: '#F5956B',
          600: '#E07A50',
          700: '#C4633C',
          800: '#A35030',
          900: '#7D3E26',
        },
        // Butter Cream - #FEE2AD
        butter: {
          50: '#FFFDF7',
          100: '#FFFBEF',
          200: '#FEF3D8',
          300: '#FEE2AD', // Main color
          400: '#FDD580',
          500: '#F5C450',
          600: '#E0AC30',
          700: '#C49420',
          800: '#A07818',
          900: '#7D5E14',
        },
        // Light Lemon - #F8FAB4
        lemon: {
          50: '#FEFEF5',
          100: '#FDFDE8',
          200: '#FBFCD4',
          300: '#F8FAB4', // Main color
          400: '#F2F590',
          500: '#E8EC6C',
          600: '#D4D850',
          700: '#B8BC38',
          800: '#96992D',
          900: '#747724',
        },
        // Dark accent for text/contrast
        warmgray: {
          50: '#FAF9F7',
          100: '#F5F3F0',
          200: '#E8E4DE',
          300: '#D4CEC4',
          400: '#B5ADA0',
          500: '#8B8178',
          600: '#6B6259',
          700: '#524A43',
          800: '#3D3732',
          900: '#2A2622',
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
