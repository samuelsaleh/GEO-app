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
        // Dream Palette (Exact ShipX Image)
        'shipx-gold': {
          DEFAULT: '#FDE68A', // Soft yellow/gold from top left
          light: '#FEF3C7',
        },
        'shipx-orange': {
          DEFAULT: '#FDBA74', // Warm peach/orange from bottom left
          light: '#FFEDD5',
        },
        'shipx-blue': {
          DEFAULT: '#A5B4FC', // Periwinkle/Blue from top right
          light: '#E0E7FF',
        },
        'shipx-purple': {
          DEFAULT: '#818CF8', // Indigo/Purple from bottom right
          light: '#C7D2FE',
        },
        // Dream Palette (Pixel-Perfect ShipX)
        'dream-purple': {
          50: '#F3F0FF',
          100: '#EBE5FF',
          200: '#D9D1FF', // Soft Lavender
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#818CF8', // Periwinkle Blue-Purple (matches image right side)
          600: '#6366F1',
          700: '#4F46E5',
          800: '#4338CA',
          900: '#312E81',
        },
        'dream-peach': {
          50: '#FFF8F1',
          100: '#FFF1E6', // Very light cream/peach
          200: '#FFDCC9',
          300: '#FFC6A8',
          400: '#FDBA74', // Soft Orange
          500: '#FB923C', // Warm Orange (matches image left side)
          600: '#EA580C',
        },
        'dream-blue': {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6', // Classic Blue
          600: '#2563EB',
        },
        'dream-cyan': { // New accent from image
            50: '#ECFEFF',
            100: '#CFFAFE',
            500: '#06B6D4',
        },
        'dream-cream': {
          DEFAULT: '#FDFBFF', // Almost white, slight violet tint
          50: '#FDFBFF',
          100: '#F8FAFC',
          200: '#E2E8F0',
        },
        'dream-ink': {
          DEFAULT: '#1E1B4B', // Dark Indigo/Slate (matches text)
          light: '#475569',
          muted: '#64748B',
          dark: '#0F172A',
        },
        // Legacy mapping for gradual migration if needed, but overriding main brand colors
        claude: {
          500: '#8B5CF6', // Map to purple for now
          600: '#7C3AED',
        },
        ink: {
          DEFAULT: '#1E293B',
          light: '#475569',
        }
      },
      fontFamily: {
        display: ['"TikTok Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        body: ['"TikTok Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      letterSpacing: {
        'widest': '0.25em',
        'ultra': '0.35em',
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}
