/**
 * Validators
 * Input validation functions for the application
 */

/**
 * Validate task title
 * @param {string} title - Task title to validate
 * @returns {Object} { valid: boolean, error: string }
 */
export function validateTaskTitle(title) {
  if (!title || typeof title !== "string") {
    return { valid: false, error: "Title is required" };
  }

  const trimmed = title.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: "Title cannot be empty" };
  }

  if (trimmed.length > 500) {
    return { valid: false, error: "Title must be 500 characters or less" };
  }

  return { valid: true, error: null };
}

/**
 * Validate category name
 * @param {string} name - Category name to validate
 * @returns {Object} { valid: boolean, error: string }
 */
export function validateCategoryName(name) {
  if (!name || typeof name !== "string") {
    return { valid: false, error: "Category name is required" };
  }

  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: "Category name cannot be empty" };
  }

  if (trimmed.length > 50) {
    return {
      valid: false,
      error: "Category name must be 50 characters or less",
    };
  }

  return { valid: true, error: null };
}

/**
 * Validate date
 * @param {Date|string} date - Date to validate
 * @returns {Object} { valid: boolean, error: string }
 */
export function validateDate(date) {
  if (!date) {
    return { valid: true, error: null }; // Dates are optional
  }

  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: "Invalid date format" };
  }

  return { valid: true, error: null };
}

/**
 * Validate color hex code
 * @param {string} color - Hex color code to validate
 * @returns {Object} { valid: boolean, error: string }
 */
export function validateColor(color) {
  if (!color || typeof color !== "string") {
    return { valid: false, error: "Color is required" };
  }

  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

  if (!hexPattern.test(color)) {
    return { valid: false, error: "Invalid color format (use hex: #RRGGBB)" };
  }

  return { valid: true, error: null };
}
