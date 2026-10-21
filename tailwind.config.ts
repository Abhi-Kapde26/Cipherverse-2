import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bunker: {
          950: "#090b0a",
          900: "#101312",
          850: "#151817",
          800: "#1a1f1d",
          700: "#272e2b",
          600: "#363f3c",
          500: "#4b5753",
        },
        sepia: {
          light: "#f9f6ee",
          DEFAULT: "#ece3cb",
          dark: "#d8c7a2",
          aged: "#b89f6e",
          burned: "#443425",
        },
        cipher: {
          amber: "#f59e0b",
          red: "#ef4444",
          green: "#22c55e",
          cyan: "#06b6d4",
          kgb: "#b91c1c",
          cia: "#1d4ed8",
        },
      },
      fontFamily: {
        mono: ['"Courier Prime"', "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
        typewriter: ['"Courier Prime"', '"Special Elite"', "Courier", "monospace"],
        stencil: ['"Impact"', '"Arial Black"', "sans-serif"],
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scanline": "scanline 8s linear infinite",
        "crt-flicker": "flicker 0.15s infinite",
        "red-siren": "siren 2s ease-in-out infinite",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.96" },
        },
        siren: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(239, 68, 68, 0.2) inset, 0 0 30px rgba(239, 68, 68, 0.3)" },
          "50%": { boxShadow: "0 0 50px rgba(239, 68, 68, 0.6) inset, 0 0 70px rgba(239, 68, 68, 0.7)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
