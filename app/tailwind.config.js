/** @type {import('tailwindcss').Config} */

// const plugin = require("tailwindcss/plugin");

module.exports = {
  darkMode: "class",
  // Not sure why couldn't make this work yet
  // plugins: function ({ addBase, theme }) {
  //   addBase({
  //     h1: { fontSize: theme("fontSize.xl") },
  //     h2: { fontSize: theme("fontSize.lg") },
  //   });
  // },
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        input: {
          500: "#0D1F27",
        },
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
        tday: {
          100: "#000000",
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
