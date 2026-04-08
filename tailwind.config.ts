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
        background: "var(--background)",
        foreground: "var(--foreground)",
        industrial: {
          900: "#1a1a1a",
          800: "#262626",
          700: "#404040",
          600: "#525252",
          DEFAULT: "#262626",
        },
        accent: {
          gold: "var(--accent-gold)",
          blue: "var(--accent-blue)",
          purple: "var(--accent-purple)",
          green: "var(--accent-green)",
          red: "var(--accent-red)",
        }
      },
    },
  },
  plugins: [],
};
export default config;
