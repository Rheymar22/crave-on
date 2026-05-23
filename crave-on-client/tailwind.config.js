/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf8f0',
          100: '#faefd8',
          200: '#f4dba8',
          300: '#ecc06e',
          400: '#e3a03c',
          500: '#d4820f',
          600: '#b86a0c',
          700: '#8f500d',
          800: '#6b3b10',
          900: '#4a2810',
        },
        coffee: {
          light:  '#c8a97e',
          medium: '#8b5e3c',
          dark:   '#3c1f0e',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      borderRadius: {
        lg: '0.625rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [],
}