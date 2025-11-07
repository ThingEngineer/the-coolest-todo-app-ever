/**
 * useTheme Hook
 * Manages theme state and provides theme-related utilities
 */

import { useState, useEffect } from "preact/hooks";
import {
  getAllThemes,
  getThemeById,
  applyTheme,
  detectSystemTheme,
  listenToSystemTheme,
} from "../services/themeService";
import { getPreference, setPreference } from "../services/preferencesService";

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = getPreference("theme");
    return savedTheme === "system" ? detectSystemTheme() : savedTheme;
  });

  const [themePreference, setThemePreference] = useState(() => {
    return getPreference("theme");
  });

  const [availableThemes] = useState(() => getAllThemes());

  // Apply theme on mount and when it changes
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  // Listen for system theme changes if preference is 'system'
  useEffect(() => {
    if (themePreference !== "system") return;

    const cleanup = listenToSystemTheme((systemTheme) => {
      setCurrentTheme(systemTheme);
    });

    return cleanup;
  }, [themePreference]);

  /**
   * Change the theme
   * @param {string} themeId - Theme ID or 'system'
   */
  const changeTheme = (themeId) => {
    setThemePreference(themeId);
    setPreference("theme", themeId);

    if (themeId === "system") {
      const systemTheme = detectSystemTheme();
      setCurrentTheme(systemTheme);
    } else {
      setCurrentTheme(themeId);
    }
  };

  /**
   * Toggle between light and dark themes
   */
  const toggleTheme = () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    changeTheme(newTheme);
  };

  return {
    currentTheme,
    themePreference,
    availableThemes,
    changeTheme,
    toggleTheme,
    getThemeById,
    isSystemTheme: themePreference === "system",
  };
}
