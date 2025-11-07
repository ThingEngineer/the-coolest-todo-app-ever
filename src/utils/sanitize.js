/**
 * Input Sanitization Utilities
 * Prevents XSS attacks by sanitizing user input
 */

import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize text input to prevent XSS
 * Removes all HTML tags and dangerous content
 * @param {string} input - Raw user input
 * @returns {string} Sanitized text
 */
export function sanitizeText(input) {
  if (!input || typeof input !== "string") {
    return "";
  }

  // Strip all HTML tags - we only want plain text
  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true, // Keep text content, just remove tags
  });

  return sanitized.trim();
}

/**
 * Sanitize task title
 * @param {string} title - Raw task title
 * @returns {string} Sanitized task title
 */
export function sanitizeTaskTitle(title) {
  const sanitized = sanitizeText(title);

  // Additional validation for task titles
  if (sanitized.length > 500) {
    return sanitized.substring(0, 500);
  }

  return sanitized;
}

/**
 * Sanitize category name
 * @param {string} name - Raw category name
 * @returns {string} Sanitized category name
 */
export function sanitizeCategoryName(name) {
  const sanitized = sanitizeText(name);

  // Additional validation for category names
  if (sanitized.length > 50) {
    return sanitized.substring(0, 50);
  }

  return sanitized;
}

/**
 * Sanitize HTML content (for rich text if needed in future)
 * Allows safe HTML tags only
 * @param {string} html - Raw HTML content
 * @returns {string} Sanitized HTML
 */
export function sanitizeHTML(html) {
  if (!html || typeof html !== "string") {
    return "";
  }

  // Allow only safe HTML tags for rich text
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "u", "br", "p", "ul", "ol", "li"],
    ALLOWED_ATTR: [], // No attributes allowed (no onclick, href, etc.)
    KEEP_CONTENT: true,
  });

  return sanitized;
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 * @param {string} url - Raw URL
 * @returns {string} Sanitized URL or empty string if invalid
 */
export function sanitizeURL(url) {
  if (!url || typeof url !== "string") {
    return "";
  }

  const sanitized = url.trim();

  // Block dangerous protocols
  const dangerousProtocols = ["javascript:", "data:", "vbscript:", "file:"];
  const lowerUrl = sanitized.toLowerCase();

  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return "";
    }
  }

  // Only allow http, https, mailto
  if (
    !lowerUrl.startsWith("http://") &&
    !lowerUrl.startsWith("https://") &&
    !lowerUrl.startsWith("mailto:")
  ) {
    return "";
  }

  return sanitized;
}

/**
 * Escape HTML entities for display
 * Converts <, >, &, ", ' to HTML entities
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export function escapeHTML(text) {
  if (!text || typeof text !== "string") {
    return "";
  }

  const entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
  };

  return text.replace(/[&<>"'/]/g, (char) => entityMap[char]);
}

/**
 * Check if string contains potential XSS
 * @param {string} input - Input to check
 * @returns {boolean} True if potentially dangerous
 */
export function containsXSS(input) {
  if (!input || typeof input !== "string") {
    return false;
  }

  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi, // Script tags
    /on\w+\s*=/gi, // Event handlers (onclick, onerror, etc.)
    /javascript:/gi, // JavaScript protocol
    /data:text\/html/gi, // Data URI with HTML
    /<iframe/gi, // Iframe tags
    /<object/gi, // Object tags
    /<embed/gi, // Embed tags
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
}
