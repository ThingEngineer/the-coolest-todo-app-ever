/**
 * TaskItem Component
 * Display a single task with completion toggle, animations, category badge, due date, delete action, and swipe gestures
 */

import { useState } from "preact/hooks";
import { getCategoryColorClasses } from "../utils/helpers";
import { formatDate, isOverdue } from "../services/dateParser";
import { hapticTaskComplete, hapticDelete } from "../utils/haptics";
import { useTouchSwipe } from "../hooks/useTouchSwipe";
import ConfirmModal from "./ConfirmModal";

export default function TaskItem({ task, onToggle, onDelete, category }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState(null); // 'toCompleted' or 'toActive'
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const taskIsOverdue =
    !task.completed && task.dueDate && isOverdue(task.dueDate);

  /**
   * Handle swipe left - Delete action
   */
  const handleSwipeLeft = () => {
    hapticDelete();
    onDelete(task.id);
  };

  /**
   * Handle swipe right - Complete/Uncomplete action
   */
  const handleSwipeRight = () => {
    hapticTaskComplete();
    onToggle(task.id);
  };

  /**
   * Initialize swipe detection
   */
  const {
    swipeOffset,
    isSwiping,
    swipeDirection,
    swipeProgress,
    isThresholdMet,
    handlers: swipeHandlers,
  } = useTouchSwipe({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 80,
  });

  /**
   * Handle task click to toggle completion with smooth slide animation
   */
  const handleClick = (e) => {
    // Don't toggle if swiping
    if (isSwiping) {
      return;
    }

    // Prevent toggle when clicking delete button
    if (e.target.closest(".delete-button")) {
      return;
    }

    // Set animation direction based on current state
    const direction = task.completed ? "toActive" : "toCompleted";
    setAnimationDirection(direction);
    setIsAnimating(true);

    // Trigger haptic feedback when completing a task
    if (!task.completed) {
      hapticTaskComplete();
    }

    // Toggle the task after animation starts
    onToggle(task.id);

    // Reset animation state after it completes
    setTimeout(() => {
      setIsAnimating(false);
      setAnimationDirection(null);
    }, 400); // Match animation duration
  };

  /**
   * Handle delete with confirmation
   */
  const handleDelete = (e) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  /**
   * Confirm and execute delete
   */
  const confirmDelete = () => {
    // Trigger haptic feedback on delete
    hapticDelete();
    onDelete(task.id);
    setShowDeleteModal(false);
  };

  /**
   * Calculate background color based on swipe direction and progress
   */
  const getSwipeBackgroundColor = () => {
    if (!isSwiping || swipeProgress === 0) return "transparent";

    if (swipeDirection === "left") {
      // Red background for delete
      const opacity = Math.min(swipeProgress * 0.3, 0.3);
      return `rgba(239, 68, 68, ${opacity})`; // red-500 with opacity
    } else if (swipeDirection === "right") {
      // Green background for complete
      const opacity = Math.min(swipeProgress * 0.3, 0.3);
      return `rgba(34, 197, 94, ${opacity})`; // green-500 with opacity
    }

    return "transparent";
  };

  /**
   * Get swipe icon based on direction
   */
  const getSwipeIcon = () => {
    if (!isSwiping || !isThresholdMet) return null;

    if (swipeDirection === "left") {
      return (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 text-2xl animate-pulse">
          🗑️
        </div>
      );
    } else if (swipeDirection === "right") {
      return (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 text-2xl animate-pulse">
          ✓
        </div>
      );
    }

    return null;
  };

  return (
    <div className="relative overflow-hidden">
      {/* Swipe action icon */}
      {getSwipeIcon()}

      <div
        {...swipeHandlers}
        className={`
          group
          flex items-center gap-3 p-3 sm:p-4
          bg-white dark:bg-dark-surface
          border border-light-border dark:border-dark-border
          rounded-lg
          hover:shadow-md hover:border-primary/50
          focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2
          cursor-pointer
          ${task.completed ? "opacity-60" : "opacity-100"}
          ${
            isAnimating && animationDirection === "toCompleted"
              ? "animate-slide-to-completed"
              : ""
          }
          ${
            isAnimating && animationDirection === "toActive"
              ? "animate-slide-to-active"
              : ""
          }
          ${taskIsOverdue ? "border-l-4 border-l-danger" : ""}
          ${!isSwiping ? "active:scale-[0.98]" : ""}
        `}
        style={{
          minHeight: "72px", // Explicit min-height to prevent layout shifts
          transform: isSwiping
            ? `translateX(${swipeOffset}px)`
            : "translateX(0)",
          transition: isSwiping
            ? "none"
            : isAnimating
            ? "none"
            : "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease",
          backgroundColor: getSwipeBackgroundColor(),
        }}
        onClick={handleClick}
        role="checkbox"
        aria-checked={task.completed}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick(e);
          } else if (e.key === "Delete" || e.key === "Backspace") {
            e.preventDefault();
            handleDelete(e);
          }
        }}
        aria-label={`Task: ${task.title}. ${
          task.completed ? "Completed" : "Not completed"
        }. ${
          taskIsOverdue ? "Overdue." : ""
        } Press Enter or Space to toggle completion. Press Delete to remove. Swipe left to delete, swipe right to toggle completion.`}
      >
        {/* Checkbox */}
        <div
          className={`
          flex-shrink-0
          w-6 h-6 sm:w-7 sm:h-7 rounded-md border-2
          flex items-center justify-center
          transition-all duration-500
          ${
            task.completed
              ? "bg-primary border-primary scale-110"
              : "border-gray-300 dark:border-gray-600 group-hover:border-primary group-hover:scale-105"
          }
        `}
          aria-hidden="true"
        >
          {task.completed && (
            <svg
              className="w-4 h-4 text-white animate-fade-in"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        {/* Task Title and Category */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start sm:items-center gap-2 flex-wrap">
            {/* Task title - Preact automatically escapes text content to prevent XSS */}
            <p
              className={`
              text-sm sm:text-base leading-snug sm:leading-normal
              text-light-text dark:text-dark-text
              transition-all duration-300
              ${task.completed ? "task-completed" : "task-active"}
            `}
            >
              {task.title}
            </p>
          </div>

          {/* Category Badge and Overdue on new line for mobile */}
          <div
            className="flex items-center gap-2 mt-1.5 flex-wrap"
            style={{ minHeight: "24px" }} // Reserve space for badge to prevent layout shift
          >
            {/* Category Badge */}
            {category && (
              <span
                className={`
                inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                ${getCategoryColorClasses(category.color).bg} text-white
              `}
              >
                <span>{category.icon}</span>
                <span className="hidden sm:inline">{category.name}</span>
              </span>
            )}

            {/* Overdue Badge */}
            {taskIsOverdue && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-danger text-white">
                ⚠️ Overdue
              </span>
            )}
          </div>

          {/* Due Date Display */}
          {task.dueDate && !task.completed && (
            <p
              className={`text-xs sm:text-sm mt-1 ${
                taskIsOverdue
                  ? "text-danger font-medium"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              📅 Due {formatDate(task.dueDate, { relative: true })}
            </p>
          )}

          {/* Completion timestamp */}
          {task.completed && task.completedAt && (
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 animate-fade-in">
              ✓ Completed {new Date(task.completedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Delete Button */}
        <button
          className="delete-button flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-danger hover:bg-danger/10 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
          onClick={handleDelete}
          aria-label={`Delete task: ${task.title}`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Delete Task?"
          message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
          confirmText="Yes, Delete"
          cancelText="Cancel"
          variant="danger"
        />
      </div>
      {/* End of swipeable task item */}
    </div>
  );
}
