/**
 * Date Parser Service
 * Natural language date parsing and date utilities
 */

/**
 * Parse natural language date strings into Date objects
 * @param {string} input - Natural language input (e.g., "today", "tomorrow", "next week")
 * @returns {Date|null} Parsed date or null if invalid
 */
export function parseNaturalLanguageDate(input) {
  if (!input || typeof input !== "string") return null;

  const normalized = input.toLowerCase().trim();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Today
  if (normalized === "today") {
    return today;
  }

  // Tomorrow
  if (normalized === "tomorrow" || normalized === "tmr") {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  // Yesterday
  if (normalized === "yesterday") {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  }

  // Next week
  if (normalized === "next week") {
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek;
  }

  // This week (Friday)
  if (normalized === "this week" || normalized === "end of week") {
    const friday = new Date(today);
    const daysUntilFriday = (5 - today.getDay() + 7) % 7;
    friday.setDate(friday.getDate() + daysUntilFriday);
    return friday;
  }

  // Next month
  if (normalized === "next month") {
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth;
  }

  // In X days (e.g., "in 3 days", "in 5 days")
  const inDaysMatch = normalized.match(/^in (\d+) days?$/);
  if (inDaysMatch) {
    const days = parseInt(inDaysMatch[1], 10);
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);
    return futureDate;
  }

  // In X weeks (e.g., "in 2 weeks")
  const inWeeksMatch = normalized.match(/^in (\d+) weeks?$/);
  if (inWeeksMatch) {
    const weeks = parseInt(inWeeksMatch[1], 10);
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + weeks * 7);
    return futureDate;
  }

  // Specific weekday (e.g., "monday", "tuesday")
  const weekdays = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const weekdayIndex = weekdays.indexOf(normalized);
  if (weekdayIndex !== -1) {
    const targetDay = new Date(today);
    const currentDay = today.getDay();
    let daysUntilTarget = weekdayIndex - currentDay;

    // If the day has passed this week, schedule for next week
    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7;
    }

    targetDay.setDate(targetDay.getDate() + daysUntilTarget);
    return targetDay;
  }

  // Try parsing as a standard date string
  try {
    const parsed = new Date(input);
    if (!isNaN(parsed.getTime())) {
      parsed.setHours(0, 0, 0, 0);
      return parsed;
    }
  } catch (e) {
    // Invalid date string
  }

  return null;
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
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  if (!date) return "";

  const dateObj = date instanceof Date ? date : new Date(date);

  const { includeTime = false, relative = true } = options;

  if (relative) {
    const relativeStr = getRelativeDate(dateObj);
    if (relativeStr) return relativeStr;
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
 * @returns {string|null} Relative date string or null
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

  return null;
}

/**
 * Get quick filter date ranges
 * @returns {Object} Date range filters
 */
export function getDateRanges() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);

  const endOfWeek = new Date(today);
  const daysUntilSunday = 7 - today.getDay();
  endOfWeek.setDate(endOfWeek.getDate() + daysUntilSunday);
  endOfWeek.setHours(23, 59, 59, 999);

  return {
    today: { start: today, end: endOfToday },
    thisWeek: { start: today, end: endOfWeek },
    overdue: { start: new Date(0), end: new Date(today.getTime() - 1) },
  };
}
