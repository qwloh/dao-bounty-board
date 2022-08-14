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
    "./sub-pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        float: {
          "0%, 100%": {
            boxShadow: "0 5px 15px 0px rgba(0,0,0,0.6)",
            transform: "translateY(0px)",
          },
          "50%": {
            boxShadow: "0 25px 15px 0px rgba(0,0,0,0.2)",
            transform: "translateY(-20px);",
          },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
      },
      borderColor: {
        card: "rgb(0 175 255 / 60%)",
      },
      boxShadow: {
        "button-shadow": "0px 0px 8px 2px rgba(31, 207, 241, 0.3)",
        card: "0px 4px 16px 4px rgba(0, 175, 255, 0.15)",
        "ghost-button-shadow": "0px 0px 5px 2px rgba(0, 175, 255, 0.5)",
      },
      backgroundImage: {
        "button-gradient":
          "linear-gradient(90deg, #00AFFF 0%, #15C0F7 20.83%, #43E5E6 52.08%, #64FFDA 79.69%, #64FFDA 98.44%)",
        "button-hover":
          "linear-gradient(90deg, #ffffff 0%, #ffffff 20.83%, #ffffff 52.08%, #ffffff 79.69%, #ffffff 98.44%)",
        "dark-gradient":
          "linear-gradient(253.53deg, rgba(3, 24, 34, 0.4) 4.62%, rgba(9, 61, 77, 0.4) 26.21%, rgba(22, 90, 98, 0.4) 50.09%, rgba(5, 70, 66, 0.4) 71.68%, rgba(2, 26, 20, 0.4) 92.81%)",
      },
      colors: {
        textfield: "#202526",
        "text-field-secondary": "#00090B",
        text: {
          primary: "rgba(255, 255, 255, 0.9)",
          secondary: "#8B8585",
        },
        button: {
          "ghost-bg": "#041C27",
        },
        "tag-status": {
          blue: "#00AFFF",
          purple: "#9747FF",
          yellow: "#FFB547",
          pink: "#FF47E2",
        },
        tag: {
          bg: "#053850",
          text: "#00AFFF",
          "text-disabled": "#8B8A85",
        },
        cta: {
          nightGradientFrom: "#00afff",
          nightGradientTo: "#64FFDA",
          night: "#02171C",
        },
        "button-bg-hover": {
          night: "rgb(255 255 255 / 90%)",
        },
        input: {
          500: "#0D1F27",
        },
        accent: "#00AFFF",
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
          500: "#053850",
          600: "#121212",
          700: "#010F16",
          800: "#000C11",
          900: "#00070a",
        },
        container: {
          night: "#02171C",
        },
      },
    },
  },
  plugins: [],
};
