import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Primary (Yellow 계열 - Binance 스타일)
        primary: {
          50: "#FFF9E6",
          100: "#FFF0BF",
          200: "#FFE066",
          300: "#FFD633",
          400: "#F0C000",
          500: "#FCD535", // 메인 브랜드 컬러
          600: "#E6B800",
          700: "#CC9E00",
          800: "#B38600",
          900: "#806000",
        },
        // Neutral (Dark UI Base)
        neutral: {
          50: "#F9FAFB",
          100: "#E5E7EB",
          200: "#D1D5DB",
          300: "#9CA3AF",
          400: "#6B7280",
          500: "#4B5563",
          600: "#374151",
          700: "#1F2937",
          800: "#111827", // 카드 배경
          900: "#0B0F1A", // 메인 배경
        },
        // Semantic Colors
        success: "#16C784", // 상승 (Profit)
        danger: "#EA3943", // 하락 (Loss)
        info: "#3B82F6", // 정보
        warning: "#F59E0B", // 경고
      },
    },
  },
  plugins: [],
};
export default config;
