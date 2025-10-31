/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      borderRadius: {
        "7px": "7px",
        "10px": "10px",
      },
      fontFamily: {
        "sf-pro": ["SF Pro Display"],
      },
      colors: {
        brand: {
          blue: "#1877F2",
          black: "#0E121A",
        },
      },
    },
  },
  plugins: [],
};
