/**
 * Haptic Feedback Utilities
 * Uses the Web Vibration API to provide tactile feedback
 */

/**
 * Check if vibration is supported
 * @returns {boolean} True if vibration API is available
 */
export const isVibrationSupported = () => {
  return "vibrate" in navigator;
};

/**
 * Trigger haptic feedback
 * @param {number|number[]} pattern - Vibration pattern in milliseconds
 * @returns {boolean} True if vibration was triggered
 */
export const vibrate = (pattern) => {
  if (!isVibrationSupported()) {
    return false;
  }

  try {
    navigator.vibrate(pattern);
    return true;
  } catch (error) {
    console.warn("Vibration API error:", error);
    return false;
  }
};

/**
 * Predefined haptic feedback patterns
 */
export const HapticPatterns = {
  // Light tap for task completion
  taskComplete: [10],

  // Success pattern for completing all tasks
  success: [10, 50, 10, 50, 10],

  // Error pattern
  error: [50, 100, 50],

  // Light tap for selection
  select: [5],

  // Double tap
  doubleTap: [10, 30, 10],

  // Long press
  longPress: [20],

  // Delete action
  delete: [15, 50, 15],
};

/**
 * Trigger task completion haptic feedback
 */
export const hapticTaskComplete = () => {
  return vibrate(HapticPatterns.taskComplete);
};

/**
 * Trigger success haptic feedback (all tasks complete)
 */
export const hapticSuccess = () => {
  return vibrate(HapticPatterns.success);
};

/**
 * Trigger error haptic feedback
 */
export const hapticError = () => {
  return vibrate(HapticPatterns.error);
};

/**
 * Trigger selection haptic feedback
 */
export const hapticSelect = () => {
  return vibrate(HapticPatterns.select);
};

/**
 * Trigger delete haptic feedback
 */
export const hapticDelete = () => {
  return vibrate(HapticPatterns.delete);
};

/**
 * Cancel any ongoing vibration
 */
export const cancelVibration = () => {
  if (isVibrationSupported()) {
    navigator.vibrate(0);
  }
};
