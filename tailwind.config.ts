import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gunsaar: {
          dark: "#3a2210",
          mid: "#5c3d1e",
          light: "#8b6340",
          cream: "#f5f0e8",
          "cream-dark": "#ede6d6",
          green: "#4a7c59",
          yellow: "#d4a017",
          red: "#b84040",
          text: "#2c1a0a",
          muted: "#6b4c2a",
          border: "#d4c4a8",
        },
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        body: ["var(--font-lora)", "serif"],
        sans: ["var(--font-source-sans)", "sans-serif"],
      },
      boxShadow: {
        warm: "0 22px 65px rgba(58, 34, 16, 0.12)",
      },
      backgroundImage: {
        "earth-gradient":
          "linear-gradient(135deg, rgba(58,34,16,1) 0%, rgba(92,61,30,1) 50%, rgba(139,99,64,1) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
