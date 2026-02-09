/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0A",
        surface: "#1A1A1A",
        "surface-elevated": "#252525",
        claire: {
          primary: "#FF6B35",
          secondary: "#FF8C5A",
          accent: "#FFB88C",
          dark: "#E55A2B",
        },
        "ui-border": "rgba(255, 255, 255, 0.15)",
        "text-secondary": "#E0E0E0",
        "text-tertiary": "#A0A0A0",
        success: "#4CAF50",
      },
      spacing: {
        18: "72px",
        22: "88px",
      },
      fontFamily: {
        outfit: ["'Outfit'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
