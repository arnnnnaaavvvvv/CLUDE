/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0B0D",
        surface: "#131417",
        surfaceHover: "#1B1D22",
        border: "#1F2127",
        borderStrong: "#2B2D33",
        primary: {
          DEFAULT: "#F97316",
          hover: "#EA580C",
          foreground: "#0A0B0D",
        },
        accent: {
          DEFAULT: "#F97316",
          muted: "#3F4147",
        },
        textPrimary: "#E8E9EB",
        textSecondary: "#8B8F98",
        danger: "#EF4444",
        success: "#22C55E",
      },
      fontFamily: {
        sans: ["'General Sans'", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        mono: ["'JetBrains Mono'", "'Fira Code'", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "monospace"],
      },
    },
  },
  plugins: [],
};
