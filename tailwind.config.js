/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          700: '#1e2a4a',
          800: '#162040',
          900: '#0f1628',
          950: '#090e1a',
        },
      },
    },
  },
  plugins: [],
}
