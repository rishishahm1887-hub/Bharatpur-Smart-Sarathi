/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class', // ✅ Add this line to control dark mode manually
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif','Montserrat','Lato','Roboto','Quicksand'],
      },
    },
  },
  plugins: [],
}

