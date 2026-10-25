/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: '#F8FAFC',
        surface: {
          1: '#FFFFFF',
          2: '#F1F5F9',
          3: '#E2E8F0',
        },
        brand: {
          primary: '#2563EB',
          hover: '#1D4ED8',
          subtle: 'rgba(37, 99, 235, 0.08)',
          electric: '#3B82F6',
        },
        role: {
          customer: {
            DEFAULT: '#2563EB',
            light: '#3B82F6',
            subtle: 'rgba(37, 99, 235, 0.08)',
          },
          pro: {
            DEFAULT: '#D97706',
            accent: '#059669',
            subtle: 'rgba(217, 119, 6, 0.08)',
          },
          admin: {
            DEFAULT: '#7C3AED',
            dark: '#334155',
            subtle: 'rgba(124, 58, 237, 0.08)',
          },
        },
        status: {
          success: '#059669',
          warning: '#D97706',
          danger: '#DC2626',
          info: '#7C3AED',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'elevated': '0 10px 25px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.03)',
        'glow-blue': '0 4px 20px -2px rgba(37, 99, 235, 0.15)',
        'glow-emerald': '0 4px 20px -2px rgba(16, 185, 129, 0.15)',
      },
    },
  },
  plugins: [],
};
