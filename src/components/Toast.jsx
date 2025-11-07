/**
 * Toast Component
 * Displays temporary notification messages with different types
 * Auto-dismisses after a timeout or can be manually closed
 */

import { useEffect, useState } from "preact/hooks";

/**
 * Toast notification component
 * @param {Object} props
 * @param {string} props.id - Unique toast ID
 * @param {string} props.type - Toast type: 'success' | 'error' | 'warning' | 'info'
 * @param {string} props.message - User-friendly message to display
 * @param {number} props.duration - Auto-dismiss duration in ms (0 = no auto-dismiss)
 * @param {Function} props.onClose - Callback when toast is closed
 * @param {Object} props.action - Optional action button { label: string, onClick: function }
 */
export default function Toast({
  id,
  type = "info",
  message,
  duration = 5000,
  onClose,
  action,
}) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose?.(id);
    }, 300); // Match exit animation duration
  };

  const handleActionClick = () => {
    action?.onClick?.();
    handleClose();
  };

  // Icon for each toast type
  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        );
      case "error":
        return (
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case "warning":
        return (
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case "info":
      default:
        return (
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  // Style classes for each type
  const getTypeClasses = () => {
    switch (type) {
      case "success":
        return "bg-green-50 dark:bg-green-900/90 border-green-200 dark:border-green-700 text-green-800 dark:text-green-100 backdrop-blur-sm";
      case "error":
        return "bg-red-50 dark:bg-red-900/90 border-red-200 dark:border-red-700 text-red-800 dark:text-red-100 backdrop-blur-sm";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/90 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-100 backdrop-blur-sm";
      case "info":
      default:
        return "bg-blue-50 dark:bg-blue-900/90 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-100 backdrop-blur-sm";
    }
  };

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg
        ${getTypeClasses()}
        ${isExiting ? "animate-slide-out-right" : "animate-slide-in-right"}
        transition-all duration-300
      `}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div className="mt-0.5">{getIcon()}</div>

      {/* Message */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium break-words">{message}</p>

        {/* Action button if provided */}
        {action && (
          <button
            onClick={handleActionClick}
            className="mt-2 text-sm font-semibold underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-1 rounded"
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 ml-auto hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-1 rounded"
        aria-label="Close notification"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
