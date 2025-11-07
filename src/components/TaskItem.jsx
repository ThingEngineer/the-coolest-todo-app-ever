/**
 * TaskItem Component
 * Display a single task with completion toggle, animations, category badge, due date, and delete action
 */

import { useState } from "preact/hooks";
import { getCategoryColorClasses } from "../utils/helpers";
import { formatDate, isOverdue } from "../services/dateParser";

export default function TaskItem({ task, onToggle, onDelete, category }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const taskIsOverdue =
    !task.completed && task.dueDate && isOverdue(task.dueDate);

  /**
   * Handle task click to toggle completion with animation
   */
  const handleClick = (e) => {
    // Prevent toggle when clicking delete button
    if (e.target.closest(".delete-button")) {
      return;
    }

    setIsAnimating(true);
    onToggle(task.id);

    // Reset animation after it completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  /**
   * Handle delete with confirmation
   */
  const handleDelete = (e) => {
    e.stopPropagation();

    if (confirm(`Delete task "${task.title}"?`)) {
      onDelete(task.id);
    }
  };

  return (
    <div
      className={`
        group
        flex items-center gap-3 p-4
        bg-white dark:bg-dark-surface
        border border-light-border dark:border-dark-border
        rounded-lg
        transition-all duration-200
        hover:shadow-md hover:border-primary/50
        focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2
        cursor-pointer
        ${task.completed ? "opacity-60" : "opacity-100"}
        ${isAnimating ? "animate-task-complete" : ""}
        ${taskIsOverdue ? "border-l-4 border-l-danger" : ""}
      `}
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
      } Press Enter or Space to toggle completion. Press Delete to remove.`}
    >
      {/* Checkbox */}
      <div
        className={`
          flex-shrink-0
          w-6 h-6 rounded-md border-2
          flex items-center justify-center
          transition-all duration-300
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
        <div className="flex items-center gap-2 flex-wrap">
          <p
            className={`
              text-base
              text-light-text dark:text-dark-text
              transition-all duration-300
              ${task.completed ? "task-completed" : "task-active"}
            `}
          >
            {task.title}
          </p>

          {/* Category Badge */}
          {category && (
            <span
              className={`
                inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                ${getCategoryColorClasses(category.color).bg} text-white
              `}
            >
              {category.name}
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
            className={`text-xs mt-1 ${
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
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 animate-fade-in">
            Completed {new Date(task.completedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Completion indicator */}
      {task.completed && (
        <div className="flex-shrink-0 animate-fade-in">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
            ✓ Done
          </span>
        </div>
      )}

      {/* Delete Button */}
      <button
        className="delete-button flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-2 text-gray-400 hover:text-danger hover:bg-danger/10 rounded-md"
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
    </div>
  );
}
