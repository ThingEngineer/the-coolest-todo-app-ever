/**
 * User Preferences Service
 * Manages user preferences and settings persistence
 */

import { storageService } from "./storageService";

const PREFERENCES_KEY = "user-preferences";

/**
 * Default preferences
 */
const DEFAULT_PREFERENCES = {
  theme: "light", // 'light', 'dark', 'ocean', 'sunset', 'system'
  showCompleted: true,
  animationsEnabled: true,
  compactView: false,
  soundEnabled: false,
  notificationsEnabled: false,
  defaultCategoryId: null,
  sortBy: "order", // 'order', 'dueDate', 'title'
  sortDirection: "asc",
};

/**
 * Get user preferences
 * @returns {Object} User preferences with defaults
 */
export function getPreferences() {
  const stored = storageService.getItem(PREFERENCES_KEY);

  if (!stored) {
    return { ...DEFAULT_PREFERENCES };
  }

  try {
    const parsed = JSON.parse(stored);
    // Merge with defaults to handle new preference keys
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch (error) {
    console.error("Error parsing preferences:", error);
    return { ...DEFAULT_PREFERENCES };
  }
}

/**
 * Update user preferences
 * @param {Object} updates - Partial preferences to update
 * @returns {Object} Updated preferences
 */
export function updatePreferences(updates) {
  const current = getPreferences();
  const updated = { ...current, ...updates };

  storageService.setItem(PREFERENCES_KEY, JSON.stringify(updated));

  return updated;
}

/**
 * Reset preferences to defaults
 * @returns {Object} Default preferences
 */
export function resetPreferences() {
  storageService.setItem(PREFERENCES_KEY, JSON.stringify(DEFAULT_PREFERENCES));
  return { ...DEFAULT_PREFERENCES };
}

/**
 * Get a single preference value
 * @param {string} key - Preference key
 * @returns {*} Preference value
 */
export function getPreference(key) {
  const prefs = getPreferences();
  return prefs[key];
}

/**
 * Set a single preference value
 * @param {string} key - Preference key
 * @param {*} value - Preference value
 * @returns {Object} Updated preferences
 */
export function setPreference(key, value) {
  return updatePreferences({ [key]: value });
}
