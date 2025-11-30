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
        // GEO Orange accents (from palette)
        claude: {
          50: '#FFF4E8',
          100: '#FFE6CC',
          200: '#FFD0A3',
          300: '#FFB36B',
          400: '#F89A3F',
          500: '#E97424', // primary orange
          600: '#D1611F',
          700: '#AF4B19',
          800: '#8C3A14',
          900: '#6E2F11',
        },
        // Beige backgrounds
        cream: {
          50: '#FFF7EA',
          100: '#FDF0DD',
          200: '#F5E1B9',
          300: '#E6CB94',
          400: '#D4B47D',
          500: '#C2A067',
        },
        // Brown text & neutrals
        ink: {
          50: '#F7EFE9',
          100: '#EAD7C7',
          200: '#D8B79D',
          300: '#C19075',
          400: '#A56F53',
          500: '#8A5338',
          600: '#6F422D',
          700: '#5B3A29', // main brown
          800: '#4A2F22',
          900: '#3A251B',
          950: '#21130E',
        },
      },
      fontFamily: {
        display: ['"TikTok Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        body: ['"TikTok Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
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
