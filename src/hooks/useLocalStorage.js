/**
 * useLocalStorage Hook
 * Custom hook for localStorage operations with state management
 */

import { useState, useEffect } from "preact/hooks";
import { getItem, setItem } from "../services/storageService";

/**
 * Custom hook for localStorage
 * @param {string} key - Storage key
 * @param {*} initialValue - Initial value if key doesn't exist
 * @returns {Array} [value, setValue, remove]
 */
export function useLocalStorage(key, initialValue) {
  // Initialize state with value from localStorage or initialValue
  const [storedValue, setStoredValue] = useState(() => {
    return getItem(key, initialValue);
  });

  // Update localStorage when state changes
  useEffect(() => {
    setItem(key, storedValue);
  }, [key, storedValue]);

  // Function to remove the item from localStorage
  const remove = () => {
    setStoredValue(initialValue);
  };

  return [storedValue, setStoredValue, remove];
}
