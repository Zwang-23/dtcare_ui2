/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Brand color palette - lime green to teal gradient
        'brand': {
          primary: '#84cc16', // lime-500 - main brand green
          secondary: '#06b6d4', // cyan-500 - main brand teal
          'lime-light': '#bef264', // lime-300
          'lime': '#84cc16', // lime-500
          'lime-dark': '#65a30d', // lime-600
          'teal-light': '#22d3ee', // cyan-400
          'teal': '#06b6d4', // cyan-500
          'teal-dark': '#0891b2', // cyan-600
          'dark': '#0f172a', // slate-900 for text
          'light': '#f8fafc', // slate-50 for light text
          'gray': {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
          }
        }
      },
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'display': ['Space Grotesk', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'brand-gradient': 'linear-gradient(135deg, #84cc16 0%, #06b6d4 100%)',
        'brand-gradient-reverse': 'linear-gradient(135deg, #06b6d4 0%, #84cc16 100%)',
        'brand-mesh': 'linear-gradient(135deg, #bef264 0%, #84cc16 25%, #06b6d4 75%, #0891b2 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}


