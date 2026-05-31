/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "grays-black": "#000",
        green: "#b9ff66",
        grey: "#f3f3f3",
        dark: "#191a23",
        black: "#000",
      },
    },
    screens: {},
  },
  corePlugins: {
    preflight: false,
  },
};
