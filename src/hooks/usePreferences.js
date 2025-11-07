/**
 * usePreferences Hook
 * Manages user preferences state
 */

import { useState, useCallback } from "preact/hooks";
import {
  getPreferences,
  updatePreferences,
  resetPreferences,
  getPreference,
  setPreference,
} from "../services/preferencesService";

export function usePreferences() {
  const [preferences, setPreferences] = useState(() => getPreferences());

  /**
   * Update one or more preferences
   * @param {Object} updates - Partial preferences to update
   */
  const update = useCallback((updates) => {
    const updated = updatePreferences(updates);
    setPreferences(updated);
  }, []);

  /**
   * Update a single preference
   * @param {string} key - Preference key
   * @param {*} value - Preference value
   */
  const setSingle = useCallback((key, value) => {
    const updated = setPreference(key, value);
    setPreferences(updated);
  }, []);

  /**
   * Get a single preference value
   * @param {string} key - Preference key
   * @returns {*} Preference value
   */
  const get = useCallback(
    (key) => {
      return preferences[key];
    },
    [preferences]
  );

  /**
   * Reset all preferences to defaults
   */
  const reset = useCallback(() => {
    const defaults = resetPreferences();
    setPreferences(defaults);
  }, []);

  return {
    preferences,
    update,
    setSingle,
    get,
    reset,
  };
}
