import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Bunch design system
        cream: {
          50: "#faf9f7",
          100: "#f5f2ee",
          200: "#ede8e1",
        },
        charcoal: {
          800: "#2c2c2c",
          900: "#1a1a1a",
        },
        border: "#d8d2c8",
        // Tile cleared colors (muted, distinct without relying on color alone)
        bunch: {
          1: "#d4e8d0", // sage green
          2: "#d4e0f0", // slate blue
          3: "#f0ddd4", // terracotta
          4: "#e8d4f0", // lavender
          5: "#f0e8d4", // warm sand
          6: "#d4f0e8", // seafoam
          7: "#f0d4d4", // blush
          8: "#d4d4f0", // periwinkle
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      animation: {
        "tile-clear": "tileClear 0.35s ease-out forwards",
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.25s ease-out",
        "bounce-gentle": "bounceGentle 0.4s ease-out",
        "shake": "shake 0.4s ease-out",
      },
      keyframes: {
        tileClear: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "40%": { transform: "scale(1.06)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { transform: "translateY(8px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        bounceGentle: {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.97)" },
          "100%": { transform: "scale(1)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-4px)" },
          "40%": { transform: "translateX(4px)" },
          "60%": { transform: "translateX(-3px)" },
          "80%": { transform: "translateX(3px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
