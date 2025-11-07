/**
 * Toast Context
 * Provides global toast notification management with queue system
 */

import { createContext } from "preact";
import { useState, useCallback, useContext } from "preact/hooks";
import Toast from "../components/Toast";

const ToastContext = createContext(null);

/**
 * Toast Provider Component
 * Manages toast notifications globally with a queue system
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [nextId, setNextId] = useState(1);

  /**
   * Add a new toast notification
   * @param {Object} options - Toast configuration
   * @param {string} options.type - Toast type: 'success' | 'error' | 'warning' | 'info'
   * @param {string} options.message - User-friendly message
   * @param {number} options.duration - Auto-dismiss duration in ms (default: 5000, 0 = no auto-dismiss)
   * @param {Object} options.action - Optional action button { label: string, onClick: function }
   * @returns {number} Toast ID
   */
  const showToast = useCallback(
    (options) => {
      const id = nextId;
      setNextId((prev) => prev + 1);

      const toast = {
        id,
        type: options.type || "info",
        message: options.message,
        duration: options.duration ?? 5000,
        action: options.action,
      };

      setToasts((prev) => [...prev, toast]);

      // Limit to max 5 toasts at once
      setToasts((prev) => prev.slice(-5));

      return id;
    },
    [nextId]
  );

  /**
   * Remove a toast by ID
   */
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  /**
   * Clear all toasts
   */
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  /**
   * Convenience methods for common toast types
   */
  const success = useCallback(
    (message, options = {}) => {
      return showToast({ ...options, type: "success", message });
    },
    [showToast]
  );

  const error = useCallback(
    (message, options = {}) => {
      return showToast({ ...options, type: "error", message, duration: 7000 });
    },
    [showToast]
  );

  const warning = useCallback(
    (message, options = {}) => {
      return showToast({ ...options, type: "warning", message });
    },
    [showToast]
  );

  const info = useCallback(
    (message, options = {}) => {
      return showToast({ ...options, type: "info", message });
    },
    [showToast]
  );

  const value = {
    showToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast Container - Fixed position at top-right */}
      <div
        className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} onClose={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Custom hook to use toast notifications
 * @returns {Object} Toast methods
 */
export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
