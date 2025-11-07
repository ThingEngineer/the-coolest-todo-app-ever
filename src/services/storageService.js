/**
 * Storage Service
 * Provides abstraction layer for localStorage operations
 */

const STORAGE_PREFIX = "coolest-todo-";

/**
 * Get item from localStorage
 * @param {string} key - Storage key (will be prefixed)
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Parsed value or defaultValue
 */
export function getItem(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
}

/**
 * Set item in localStorage
 * @param {string} key - Storage key (will be prefixed)
 * @param {*} value - Value to store (will be stringified)
 * @returns {boolean} Success status
 */
export function setItem(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
    // Check if quota exceeded
    if (error.name === "QuotaExceededError") {
      console.error("localStorage quota exceeded");
    }
    return false;
  }
}

/**
 * Remove item from localStorage
 * @param {string} key - Storage key (will be prefixed)
 * @returns {boolean} Success status
 */
export function removeItem(key) {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Clear all app data from localStorage
 * @returns {boolean} Success status
 */
export function clearAll() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    return true;
  } catch (error) {
    console.error("Error clearing localStorage:", error);
    return false;
  }
}

/**
 * Check if localStorage is available
 * @returns {boolean} True if localStorage is available
 */
export function isAvailable() {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get approximate storage usage
 * @returns {number} Approximate bytes used
 */
export function getStorageSize() {
  try {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key) && key.startsWith(STORAGE_PREFIX)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  } catch (error) {
    console.error("Error calculating storage size:", error);
    return 0;
  }
}

/**
 * Export all app data as JSON
 * @returns {Object} All app data
 */
export function exportData() {
  try {
    const data = {};
    const keys = Object.keys(localStorage);

    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        const cleanKey = key.replace(STORAGE_PREFIX, "");
        data[cleanKey] = JSON.parse(localStorage[key]);
      }
    });

    data._exportDate = new Date().toISOString();
    data._version = "1.0.0";

    return data;
  } catch (error) {
    console.error("Error exporting data:", error);
    throw new Error("Failed to export data");
  }
}

/**
 * Import app data from JSON
 * @param {Object} data - Data to import
 * @param {boolean} merge - If true, merge with existing data; if false, replace
 * @returns {Object} { success: boolean, error: string|null }
 */
export function importData(data, merge = false) {
  try {
    if (!data || typeof data !== "object") {
      throw new Error("Invalid data format");
    }

    // Clear existing data if not merging
    if (!merge) {
      clearAll();
    }

    // Import each key
    Object.keys(data).forEach((key) => {
      // Skip metadata fields
      if (key.startsWith("_")) return;

      setItem(key, data[key]);
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("Error importing data:", error);
    return { success: false, error: error.message || "Failed to import data" };
  }
}

/**
 * Download exported data as JSON file
 */
export function downloadData() {
  try {
    const data = exportData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `coolest-todo-backup-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error("Error downloading data:", error);
    return false;
  }
}

export const storageService = {
  getItem,
  setItem,
  removeItem,
  clearAll,
  isAvailable,
  getStorageSize,
  exportData,
  importData,
  downloadData,
};
