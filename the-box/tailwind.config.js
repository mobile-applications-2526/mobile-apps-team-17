/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#0E121A",
          card: "#F4F4F4",
          text: "#000000",
          "text-secondary": "#666666",
          blue: "#3E5BFC",
          red: "#FC573E",
          "red-dark": "#E63946",
          green: "#8AE98D",
          "green-dark": "#2D9A6C",
          yellow: "#FFC533",
          gray: "#D9D9D9",
        },
      },
    },
  },
  plugins: [],
};
