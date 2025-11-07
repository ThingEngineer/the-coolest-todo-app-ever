/**
 * Helper Utilities
 * Common utility functions used throughout the application
 */

/**
 * Generate a unique ID
 * @returns {string} Unique identifier
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  if (!date) return "";

  const dateObj = date instanceof Date ? date : new Date(date);

  const { includeTime = false, relative = false } = options;

  if (relative) {
    return getRelativeDate(dateObj);
  }

  const dateOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(includeTime && {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  return dateObj.toLocaleDateString("en-US", dateOptions);
}

/**
 * Get relative date string (e.g., "Today", "Tomorrow", "Yesterday")
 * @param {Date} date - Date to format
 * @returns {string} Relative date string
 */
export function getRelativeDate(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);

  const diffTime = compareDate - today;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

  return formatDate(date);
}

/**
 * Check if a date is overdue
 * @param {Date|string} dueDate - Due date to check
 * @returns {boolean} True if overdue
 */
export function isOverdue(dueDate) {
  if (!dueDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  return due < today;
}

/**
 * Sort items by a property
 * @param {Array} items - Array of items to sort
 * @param {string} property - Property to sort by
 * @param {string} direction - Sort direction ('asc' or 'desc')
 * @returns {Array} Sorted array
 */
export function sortBy(items, property, direction = "asc") {
  if (!items || !Array.isArray(items)) return [];

  return [...items].sort((a, b) => {
    let aVal = a[property];
    let bVal = b[property];

    // Handle null/undefined values
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    // Handle dates
    if (aVal instanceof Date || !isNaN(Date.parse(aVal))) {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }

    // Compare
    let result = 0;
    if (aVal < bVal) result = -1;
    if (aVal > bVal) result = 1;

    return direction === "desc" ? -result : result;
  });
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Truncate string with ellipsis
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
export function truncate(str, maxLength = 50) {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + "...";
}

/**
 * Get category color classes for Tailwind
 * @param {string} color - Hex color code
 * @returns {Object} Tailwind color classes
 */
export function getCategoryColorClasses(color) {
  // Map hex colors to Tailwind classes
  const colorMap = {
    "#ef4444": {
      bg: "bg-red-500",
      text: "text-red-700",
      border: "border-red-500",
    },
    "#3b82f6": {
      bg: "bg-blue-500",
      text: "text-blue-700",
      border: "border-blue-500",
    },
    "#10b981": {
      bg: "bg-green-500",
      text: "text-green-700",
      border: "border-green-500",
    },
    "#f59e0b": {
      bg: "bg-amber-500",
      text: "text-amber-700",
      border: "border-amber-500",
    },
    "#8b5cf6": {
      bg: "bg-violet-500",
      text: "text-violet-700",
      border: "border-violet-500",
    },
    "#ec4899": {
      bg: "bg-pink-500",
      text: "text-pink-700",
      border: "border-pink-500",
    },
    "#06b6d4": {
      bg: "bg-cyan-500",
      text: "text-cyan-700",
      border: "border-cyan-500",
    },
  };

  return (
    colorMap[color] || {
      bg: "bg-gray-500",
      text: "text-gray-700",
      border: "border-gray-500",
    }
  );
}

/**
 * Clamp a number between min and max
 * @param {number} num - Number to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}
