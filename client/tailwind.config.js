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
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#EFF6FF',
        },
        secondary: {
          DEFAULT: '#0F172A',
          hover: '#1E293B',
          light: '#F1F5F9',
        },
        background: '#F8FAFC',
        card: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
        display: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        premium: '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 8px -1px rgba(15, 23, 42, 0.02)',
        subtle: '0 2px 10px 0 rgba(15, 23, 42, 0.03)',
        active: '0 10px 25px -3px rgba(37, 99, 235, 0.08), 0 4px 12px -2px rgba(37, 99, 235, 0.03)',
      },
      borderRadius: {
        'premium': '14px',
        'super': '20px',
      }
    },
  },
  plugins: [],
}
