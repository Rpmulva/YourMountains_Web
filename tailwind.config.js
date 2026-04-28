/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // ===== The Six — locked palette (v1.1) =====
        orange: "#db7947",     // CTAs, primary highlights, Explorers
        green: "#96966c",      // Nature/outdoor, Vendor Partners
        blue: "#7291a1",       // Trust/info, Community Anchors
        yellow: "#f6ba68",     // Warmth/energy, Outdoor Influencers & Creators
        brown: "#705339",      // Grounding, heritage, frames
        sandstone: "#fff9de",  // Background warmth, light surface

        // ===== Tonal derivatives (v1.1 ratified 2026-04-21 — shades of Brown / Sandstone) =====
        "brown-deep": "#2c2419",
        "brown-ink": "#3a2d20",
        "brown-ink-2": "#4a3a2a",
        "brown-ink-muted": "#7a6a55",
        "sandstone-2": "#f4ecc9",
        "sandstone-3": "#e9dfb5",
      },
      spacing: {
        18: "72px",
        22: "88px",
      },
      fontFamily: {
        sans: ["'Montserrat'", "system-ui", "-apple-system", "'Segoe UI'", "Roboto", "sans-serif"],
        mono: ["'JetBrains Mono'", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};
