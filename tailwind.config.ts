import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        blue: { DEFAULT: "#185FA5", light: "#E6F1FB", dark: "#0C447C" },
        teal: { DEFAULT: "#0F6E56", light: "#E1F5EE" },
        coral: { DEFAULT: "#D85A30", light: "#FAECE7" },
        purple: { DEFAULT: "#534AB7", light: "#EEEDFE" },
        amber: { DEFAULT: "#BA7517", light: "#FAEEDA" },
        green: { DEFAULT: "#3B6D11", light: "#EAF3DE" },
        red: { DEFAULT: "#A32D2D", light: "#FCEBEB" },
        gray: { DEFAULT: "#5F5E5A", light: "#F1EFE8" },
        bg: "#F7F6F2",
        surface: "#FFFFFF",
        ink: { DEFAULT: "#1a1a18", secondary: "#5F5E5A", tertiary: "#9e9d98" },
      },
      borderColor: {
        DEFAULT: "rgba(0,0,0,0.1)",
        strong: "rgba(0,0,0,0.18)",
      },
      borderRadius: {
        DEFAULT: "10px",
        lg: "14px",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
      spacing: {
        sidebar: "210px",
      },
    },
  },
  plugins: [],
};

export default config;
