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
        // Claude Orange/Terracotta
        claude: {
          50: '#FDF8F6',
          100: '#F9EDE8',
          200: '#F5DDD3',
          300: '#ECC4B3',
          400: '#DFA084',
          500: '#D97757', // Claude's signature orange
          600: '#C96442',
          700: '#A84E33',
          800: '#8A422E',
          900: '#723A2A',
        },
        // Warm cream backgrounds
        cream: {
          50: '#FDFCFB',
          100: '#FAF8F6',
          200: '#F5F0EB',
          300: '#EDE5DC',
          400: '#E0D3C5',
          500: '#D4C4B0',
        },
        // Claude's warm dark tones
        ink: {
          50: '#F8F6F4',
          100: '#EDE8E3',
          200: '#DDD5CC',
          300: '#C4B8AA',
          400: '#A69686',
          500: '#8C7B6A',
          600: '#756556',
          700: '#5F5147',
          800: '#4A3F38',
          900: '#3D342E',
          950: '#1F1A17',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Cormorant Garamond', 'serif'],
        body: ['var(--font-body)', 'Montserrat', 'sans-serif'],
      },
      letterSpacing: {
        'widest': '0.25em',
        'ultra': '0.35em',
      },
      fontWeight: {
        'extralight': 200,
        'light': 300,
      },
    },
  },
  plugins: [],
}
