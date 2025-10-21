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
          red: "#E63946",
          green: "#2D9A6C",
          yellow: "#FFC533",
          gray: "#C4C4C4",
        },
      },
    },
  },
  plugins: [],
};
