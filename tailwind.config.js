/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "grays-black": "#0f172a", // Slate-900 (replaces pure black)
        green: "#097C87", // Ocean Teal (replaces bright blue/lime green)
        grey: "#f8fafc",  // Light slate neutral (replaces warm gray)
        dark: "#334155",  // Charcoal Slate-700 (replaces pitch black/navy)
        black: "#0f172a", // Map black to Slate-900
        "primary-teal": "#097C87",
        "accent-cyan": "#23CED9",
        "sage-green": "#A1CCA6",
        "palette-dark-teal": "#355C7D",
        "palette-muted-blue": "#5F8D9E",
        "palette-rust": "#A25244",
      },
    },
    screens: {},
  },
  corePlugins: {
    preflight: false,
  },
};
