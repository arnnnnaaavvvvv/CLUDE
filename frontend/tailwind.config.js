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
        background: "#0b0f17",
        surface: "#111827",
        surfaceHover: "#1f2937",
        border: "#1f293d",
        primary: {
          DEFAULT: "#6366f1",
          hover: "#4f46e5",
          foreground: "#ffffff",
        },
        danger: "#ef4444",
        warning: "#f59e0b",
        success: "#10b981",
      },
    },
  },
  plugins: [],
};
