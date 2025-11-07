import { useEffect } from "preact/hooks";

/**
 * A beautiful confirmation modal with smooth animations
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {Function} props.onConfirm - Callback when action is confirmed
 * @param {string} props.title - Modal title
 * @param {string} props.message - Modal message
 * @param {string} props.confirmText - Confirm button text (default: "Confirm")
 * @param {string} props.cancelText - Cancel button text (default: "Cancel")
 * @param {string} props.variant - Color variant: "danger", "warning", "success" (default: "danger")
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}) {
  // Close modal on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Variant-specific colors
  const variantStyles = {
    danger: {
      icon: "🗑️",
      iconBg: "bg-red-100 dark:bg-red-900/30",
      iconColor: "text-red-600 dark:text-red-400",
      confirmBg:
        "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
      confirmText: "text-white",
    },
    warning: {
      icon: "⚠️",
      iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      confirmBg:
        "bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600",
      confirmText: "text-white",
    },
    success: {
      icon: "✓",
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
      confirmBg:
        "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600",
      confirmText: "text-white",
    },
  };

  const styles = variantStyles[variant] || variantStyles.danger;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon header */}
        <div className="flex items-center justify-center pt-8 pb-4">
          <div
            className={`w-16 h-16 rounded-full ${styles.iconBg} flex items-center justify-center animate-bounce-gentle`}
          >
            <span
              className={`text-3xl ${styles.iconColor}`}
              role="img"
              aria-hidden="true"
            >
              {styles.icon}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 text-center">
          <h2
            id="modal-title"
            className="text-2xl font-bold text-gray-900 dark:text-white mb-3"
          >
            {title}
          </h2>
          <p
            id="modal-description"
            className="text-gray-600 dark:text-gray-300 text-base leading-relaxed"
          >
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            type="button"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 px-4 py-3 text-sm font-medium ${styles.confirmText} ${styles.confirmBg} rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl`}
            type="button"
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
