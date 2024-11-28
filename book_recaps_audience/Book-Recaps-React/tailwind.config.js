/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        "2xl": "1360px",
      },
    },
    container: {
      padding: {
        DEFAULT: "1rem",
        md: "1.5rem",
        lg: "2rem",
      },
    },
  },
  plugins: [],
}
