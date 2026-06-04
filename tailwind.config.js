/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "grays-black": "#0f172a", // Slate-900 (replaces pure black)
        green: "#475569", // Slate-600 (replaces bright blue/lime green)
        grey: "#f8fafc",  // Light slate neutral (replaces warm gray)
        dark: "#334155",  // Charcoal Slate-700 (replaces pitch black/navy)
        black: "#0f172a", // Map black to Slate-900
      },
    },
    screens: {},
  },
  corePlugins: {
    preflight: false,
  },
};
