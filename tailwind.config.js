/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable dark mode based on class
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          50: '#f8f8f7',
          100: '#f2f2f0',
          200: '#eaeae7',
          300: '#e1e1de',
          400: '#d8d8d5',
          500: '#fffff0', // Ivory color
          600: '#ecece7',
          700: '#e3e3de', // Ivory color
          800: '#d9d9d0',
          900: '#d0d0c7',
        },
        'secondary': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Secondary color
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        'neutral': {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373', // Neutral color
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        'dark-bg': '#111827', // Dark mode background
        'dark-text': '#f9fafb', // Dark mode text
        'light-bg': '#f9fafb', // Light mode background
        'light-text': '#111827', // Light mode text
      },
      fontFamily: {
        'sans': ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'],
        'serif': ['ui-serif', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        'mono': ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'soft-dark': '0 7px 14px rgba(0, 0, 0, 0.25), 0 5px 5px rgba(0, 0, 0, 0.22)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      translate: { // Add custom translate values here
        '[-4.5px]': '-4.5px',
        '[-4.6px]': '-4.6px',
        '[-4.7px]': '-4.7px',
        '[-4.8px]': '-4.8px',
        '[-4.9px]': '-4.9px',
        '[-4.99px]': '-4.99px',
        '[-4.95px]': '-4.95px',
        '[-4.97px]': '-4.97px',
        '[-4.98px]': ' -4.98px',
        '[-4.989px]': '-4.989px',
      },
    },
  },
  plugins: [],
}
