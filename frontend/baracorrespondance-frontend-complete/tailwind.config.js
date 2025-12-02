const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ajout des couleurs par défaut pour plus de flexibilité
        blue: colors.blue,
        green: colors.green,
        purple: colors.purple,
        yellow: colors.yellow,

        // Modern Blue Palette (Primary)
        primary: {
          50: '#f0f7ff',
          100: '#e0efff',
          200: '#bae0ff',
          300: '#7ac8ff',
          400: '#36b3ff',
          500: '#0090ff',
          600: '#0070d8',
          700: '#0055b8',
          800: '#003d8a',
          900: '#002b5c',
        },
        // Accent Blue (Secondary)
        secondary: {
          50: '#e6f3ff',
          100: '#cce6ff',
          200: '#99cdff',
          300: '#66b3ff',
          400: '#3399ff',
          500: '#0066ff',
          600: '#0052cc',
          700: '#003d99',
          800: '#002966',
          900: '#001a33',
        },
        // Sky Blue (Tertiary)
        accent: {
          50: '#f5f9fc',
          100: '#e8f2f8',
          200: '#d1e5f0',
          300: '#aad4e6',
          400: '#7dbdd6',
          500: '#4fa3c2',
          600: '#3484a8',
          700: '#25658e',
          800: '#1a4a6f',
          900: '#0d2e47',
        },
        // Neutral Palette
        slate: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 20s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -30px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        }
      },
      boxShadow: {
        'glow': '0 0 20px rgba(6, 182, 212, 0.4)',
        'glow-lg': '0 0 40px rgba(6, 182, 212, 0.6)',
      }
    },
  },
  plugins: [],
}
