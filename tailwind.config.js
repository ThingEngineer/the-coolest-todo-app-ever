/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Light theme (default)
        "light-bg": "#f9fafb",
        "light-surface": "#ffffff",
        "light-text": "#111827",
        "light-text-secondary": "#6b7280",
        "light-border": "#e5e7eb",

        // Dark theme
        "dark-bg": "#111827",
        "dark-surface": "#1f2937",
        "dark-text": "#f9fafb",
        "dark-text-secondary": "#9ca3af",
        "dark-border": "#374151",

        // Accent colors (consistent across themes)
        primary: "#3b82f6",
        "primary-dark": "#2563eb",
        success: "#10b981",
        "success-dark": "#059669",
        warning: "#f59e0b",
        "warning-dark": "#d97706",
        danger: "#ef4444",
        "danger-dark": "#dc2626",

        // Category colors with better contrast
        "category-red": "#ef4444",
        "category-orange": "#f97316",
        "category-amber": "#f59e0b",
        "category-yellow": "#eab308",
        "category-lime": "#84cc16",
        "category-green": "#10b981",
        "category-emerald": "#10b981",
        "category-teal": "#14b8a6",
        "category-cyan": "#06b6d4",
        "category-sky": "#0ea5e9",
        "category-blue": "#3b82f6",
        "category-indigo": "#6366f1",
        "category-violet": "#8b5cf6",
        "category-purple": "#a855f7",
        "category-fuchsia": "#d946ef",
        "category-pink": "#ec4899",
        "category-rose": "#f43f5e",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-in": "slideIn 0.3s ease-out",
        complete: "complete 0.5s ease-in-out",
        "theme-transition": "themeTransition 0.3s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        complete: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
        themeTransition: {
          "0%": { opacity: "0.8" },
          "100%": { opacity: "1" },
        },
      },
      transitionProperty: {
        theme: "background-color, border-color, color, fill, stroke",
      },
    },
  },
  plugins: [],
};
