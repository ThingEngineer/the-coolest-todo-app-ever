/**
 * Theme Service
 * Manages application themes including dark mode and color schemes
 */

/**
 * Available theme definitions
 */
export const THEMES = {
  light: {
    id: "light",
    name: "Light",
    description: "Clean and bright theme for daytime use",
    icon: "☀️",
    colors: {
      bg: "#f9fafb",
      surface: "#ffffff",
      text: "#111827",
      textSecondary: "#6b7280",
      primary: "#3b82f6",
      success: "#10b981",
      warning: "#f59e0b",
      danger: "#ef4444",
      border: "#e5e7eb",
    },
  },
  dark: {
    id: "dark",
    name: "Dark",
    description: "Easy on the eyes for low-light environments",
    icon: "🌙",
    colors: {
      bg: "#111827",
      surface: "#1f2937",
      text: "#f9fafb",
      textSecondary: "#9ca3af",
      primary: "#60a5fa",
      success: "#34d399",
      warning: "#fbbf24",
      danger: "#f87171",
      border: "#374151",
    },
  },
};

/**
 * Get all available themes
 * @returns {Array<Theme>} Array of theme objects
 */
export function getAllThemes() {
  return Object.values(THEMES);
}

/**
 * Get theme by ID
 * @param {string} themeId - Theme ID
 * @returns {Theme|null} Theme object or null
 */
export function getThemeById(themeId) {
  return THEMES[themeId] || null;
}

/**
 * Apply theme to the document
 * @param {string} themeId - Theme ID to apply
 */
export function applyTheme(themeId) {
  const theme = getThemeById(themeId);
  if (!theme) {
    console.warn(`Theme "${themeId}" not found`);
    return;
  }

  // Update HTML class for Tailwind dark mode
  const root = document.documentElement;

  // Remove all theme classes
  root.classList.remove("light", "dark", "ocean", "sunset");

  // Add new theme class
  root.classList.add(themeId);

  // Set data attribute for CSS custom properties (if needed)
  root.setAttribute("data-theme", themeId);

  // Apply CSS custom properties for dynamic theming
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
}

/**
 * Detect system color scheme preference
 * @returns {string} 'light' or 'dark'
 */
export function detectSystemTheme() {
  if (typeof window === "undefined") return "light";

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

/**
 * Listen for system theme changes
 * @param {Function} callback - Callback to call when system theme changes
 * @returns {Function} Cleanup function to remove listener
 */
export function listenToSystemTheme(callback) {
  if (typeof window === "undefined") return () => {};

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const listener = (e) => {
    const theme = e.matches ? "dark" : "light";
    callback(theme);
  };

  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }

  // Legacy browsers
  mediaQuery.addListener(listener);
  return () => mediaQuery.removeListener(listener);
}
