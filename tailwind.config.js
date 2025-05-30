/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Основные цвета
        primary: {
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        // Цвета для карточек
        card: {
          bg: '#ffffff',
          border: '#e5e5e5',
          hover: '#fafafa',
        },
        // Цвета для текста
        text: {
          primary: '#171717',
          secondary: '#525252',
          muted: '#737373',
        },
        // Цвета для акцентов
        accent: {
          blue: '#3B82F6',
          green: '#10B981',
          red: '#EF4444',
          yellow: '#F59E0B',
        }
      },
      backgroundColor: {
        'gray-750': '#2D3748',
      },
      keyframes: {
        fadeIn: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        shimmer: {
          '0%': {
            backgroundPosition: '-500px 0',
          },
          '100%': {
            backgroundPosition: '500px 0',
          },
        },
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
        pulse: {
          '0%, 100%': {
            opacity: '0.4',
          },
          '50%': {
            opacity: '0.8',
          },
        },
        'fade-in-scale': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'fade-out': {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.95)' }
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        shimmer: 'shimmer 2s infinite linear',
        blob: 'blob 7s infinite',
        'blob-slow': 'blob 10s infinite',
        'blob-delay': 'blob 8s infinite 2s',
        pulse: 'pulse 3s ease-in-out infinite',
        'fade-in-scale': 'fade-in-scale 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-out': 'fade-out 0.2s ease-in forwards'
      },
      transitionDelay: {
        '2000': '2000ms',
        '3000': '3000ms',
        '4000': '4000ms',
      }
    },
  },
  plugins: [],
} 