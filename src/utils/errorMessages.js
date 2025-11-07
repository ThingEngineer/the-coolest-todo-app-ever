/**
 * Error Message Utilities
 * Converts technical errors into user-friendly messages
 */

/**
 * Sanitize error message to prevent XSS and make it user-friendly
 * @param {Error|string|Object} error - Error object, string, or Supabase error
 * @returns {string} Safe, user-friendly error message
 */
export function getUserFriendlyError(error) {
  // Handle null/undefined
  if (!error) {
    return "Something went wrong. Please try again.";
  }

  // Extract error message
  let errorMessage = "";

  if (typeof error === "string") {
    errorMessage = error;
  } else if (error.message) {
    errorMessage = error.message;
  } else if (error.error?.message) {
    // Supabase error format
    errorMessage = error.error.message;
  } else {
    errorMessage = String(error);
  }

  // Map technical errors to user-friendly messages
  const errorMap = {
    // Network errors
    "Failed to fetch":
      "Unable to connect. Please check your internet connection.",
    NetworkError: "Network error. Please check your connection and try again.",
    "Network request failed": "Connection failed. Please try again.",

    // Auth errors
    "Invalid login credentials":
      "Email or password is incorrect. Please try again.",
    "User already registered": "An account with this email already exists.",
    "Email not confirmed":
      "Please verify your email address before signing in.",
    "Invalid email": "Please enter a valid email address.",
    "Password should be at least 6 characters":
      "Password must be at least 6 characters long.",
    "Email rate limit exceeded":
      "Too many attempts. Please wait a moment and try again.",

    // Storage errors
    QuotaExceededError: "Storage is full. Try deleting some completed tasks.",
    "localStorage quota exceeded":
      "Storage is full. Try clearing completed tasks.",
    "Failed to save": "Unable to save changes. Please try again.",

    // Validation errors
    "Title is required": "Please enter a task title.",
    "Title cannot be empty": "Task title cannot be empty.",
    "Title must be 500 characters or less":
      "Task title is too long (max 500 characters).",
    "Category name is required": "Please enter a category name.",
    "Category name cannot be empty": "Category name cannot be empty.",
    "Category name already exists": "A category with this name already exists.",
    "Invalid date format": "Please enter a valid date.",
    "Invalid color format": "Please select a valid color.",

    // Data errors
    "Category not found": "Category not found. It may have been deleted.",
    "Task not found": "Task not found. It may have been deleted.",
    "Failed to create": "Unable to create. Please try again.",
    "Failed to update": "Unable to save changes. Please try again.",
    "Failed to delete": "Unable to delete. Please try again.",

    // Sync errors
    "Supabase not available": "Cloud sync unavailable. Changes saved locally.",
    "Failed to sync": "Unable to sync to cloud. Changes saved locally.",
    "Sync failed": "Sync failed. Changes are saved locally.",

    // Generic
    "Unknown error": "Something unexpected happened. Please try again.",
    Error: "Something went wrong. Please try again.",
  };

  // Check for exact matches first
  for (const [tech, friendly] of Object.entries(errorMap)) {
    if (errorMessage.includes(tech)) {
      return friendly;
    }
  }

  // Sanitize the message (remove potential HTML/scripts)
  const sanitized = sanitizeMessage(errorMessage);

  // If it's already user-friendly (no stack traces, URLs, etc.), return it
  if (isUserFriendly(sanitized)) {
    return sanitized;
  }

  // Default fallback
  return "Something went wrong. Please try again.";
}

/**
 * Sanitize message to prevent XSS
 * @param {string} message
 * @returns {string} Sanitized message
 */
function sanitizeMessage(message) {
  if (typeof message !== "string") {
    return "An error occurred.";
  }

  // Remove HTML tags
  let sanitized = message.replace(/<[^>]*>/g, "");

  // Remove URLs
  sanitized = sanitized.replace(/https?:\/\/[^\s]+/g, "");

  // Remove file paths
  sanitized = sanitized.replace(/[A-Za-z]:[\\\/][^\s]+/g, "");
  sanitized = sanitized.replace(/\/[^\s]+\.(js|ts|jsx|tsx|css|html)/g, "");

  // Remove stack trace indicators
  sanitized = sanitized.replace(/at\s+\w+\s*\([^)]*\)/g, "");

  // Limit length
  if (sanitized.length > 200) {
    sanitized = sanitized.substring(0, 200) + "...";
  }

  return sanitized.trim();
}

/**
 * Check if message is user-friendly (no technical jargon)
 * @param {string} message
 * @returns {boolean}
 */
function isUserFriendly(message) {
  const technicalPatterns = [
    /\bat\s+\w+/i, // Stack trace
    /Error:/i,
    /Exception/i,
    /undefined is not/i,
    /Cannot read property/i,
    /\w+\.\w+\.\w+/, // Multiple dots (likely object path)
    /http[s]?:\/\//i, // URLs
    /\w+Error/i, // *Error (TypeError, ReferenceError, etc.)
    /\w+Exception/i,
  ];

  return !technicalPatterns.some((pattern) => pattern.test(message));
}

/**
 * Get success messages for different operations
 */
export const SuccessMessages = {
  taskCreated: "Task created successfully",
  taskUpdated: "Task updated",
  taskCompleted: "Task completed! 🎉",
  taskDeleted: "Task deleted",
  tasksCleared: "Completed tasks cleared",

  categoryCreated: "Category created",
  categoryUpdated: "Category updated",
  categoryDeleted: "Category deleted",

  syncSuccess: "Synced to cloud successfully",

  authSignIn: "Welcome back!",
  authSignUp: "Account created! Welcome!",
  authSignOut: "Signed out successfully",

  dataExported: "Data exported successfully",
  dataImported: "Data imported successfully",
};

/**
 * Get info messages for different states
 */
export const InfoMessages = {
  offline: "You're offline. Changes will sync when connected.",
  syncing: "Syncing to cloud...",
  savedLocally: "Saved locally (offline mode)",
  noTasks: "No tasks yet. Create one to get started!",
  noCategories: "No categories yet.",
};
