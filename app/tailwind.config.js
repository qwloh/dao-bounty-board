/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          500: "#1FCFF1",
          600: "#00AFFF",
        },
        tnight: {
          100: "#ffffff",
          200: "rgb(255 255 255 / 90%)",
          300: "#e3f2fd",
          400: "rgb(191 190 186 / 90%)",
          500: "rgb(255 255 255 / 50%)",
          600: "rgb(191 190 186 / 50%)",
        },
        night: {
          600: "#121212",
          700: "#010F16",
          800: "#000C11",
          900: "#00070a",
        },
      },
    },
  },
  plugins: [],
};
