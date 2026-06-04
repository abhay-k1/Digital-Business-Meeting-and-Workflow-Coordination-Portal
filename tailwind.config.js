/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "grays-black": "#000",
        green: "#2563eb", // Corporate blue (replaces lime green)
        grey: "#f8fafc",  // Light slate neutral (replaces warm gray #f3f3f3)
        dark: "#0f172a",  // Deep slate gray (replaces dark #191a23)
        black: "#0f172a", // Map black to deep slate gray for softer professional look
      },
    },
    screens: {},
  },
  corePlugins: {
    preflight: false,
  },
};
