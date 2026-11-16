/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1D4ED8',
          hover: '#1E40AF',
          soft: '#EFF6FF',
        },
        navy: '#172554',
        page: '#F8FAFC',
        surface: '#FFFFFF',
        text: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#64748B',
        },
        border: {
          DEFAULT: '#E2E8F0',
        },
        divider: '#F1F5F9',
        status: {
          available: '#15803D',
          availableBg: '#F0FDF4',
          reserved: '#B45309',
          reservedBg: '#FFFBEB',
          sold: '#475569',
          soldBg: '#F1F5F9',
          underProcess: '#1D4ED8',
          underProcessBg: '#EFF6FF',
          danger: '#B91C1C',
          dangerBg: '#FEF2F2',
          warning: '#A16207',
          warningBg: '#FEFCE8',
        }
      },
      fontFamily: {
        sans: ['"IBM Plex Sans Arabic"', 'Inter', 'system-ui', 'sans-serif'],
        latin: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
      },
      borderRadius: {
        DEFAULT: '8px',
        card: '12px',
        pill: '9999px',
        badge: '6px',
      }
    },
  },
  plugins: [],
}

