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
        background: "#030712", // Vetra deep navy black
        surface: "#080E1A",
        surfaceHover: "#0F172A",
        border: "rgba(255, 255, 255, 0.09)",
        borderStrong: "rgba(255, 255, 255, 0.18)",
        primary: {
          DEFAULT: "#3B82F6", // Vetra Electric Blue
          hover: "#2563EB",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#38BDF8", // Sky blue
          muted: "#1E293B",
        },
        textPrimary: "#F8FAFC",
        textSecondary: "#94A3B8",
        danger: "#EF4444",
        success: "#10B981",
      },
      fontFamily: {
        sans: ["'General Sans'", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        mono: ["'JetBrains Mono'", "'Fira Code'", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
