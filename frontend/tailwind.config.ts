import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        panel: "#ffffff",
        line: "#d7dde8",
        brand: "#0f766e",
        alert: "#b91c1c",
        amber: "#b45309",
        cobalt: "#2563eb"
      },
      boxShadow: {
        soft: "0 12px 36px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
