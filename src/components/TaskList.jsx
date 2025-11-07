/**
 * TaskList Component
 * Container that displays a list of tasks with category information
 */

import { useEffect, useState } from "preact/hooks";
import TaskItem from "./TaskItem";

export default function TaskList({
  tasks,
  loading,
  onToggleTask,
  onDeleteTask,
  categories,
  isCompletedSection = false, // New prop to identify section type
}) {
  const [animatingTasks, setAnimatingTasks] = useState(new Set());

  // Track task IDs to detect when tasks move between sections
  useEffect(() => {
    const newAnimatingTasks = new Set();
    tasks.forEach((task) => {
      newAnimatingTasks.add(task.id);
    });
    setAnimatingTasks(newAnimatingTasks);

    // Clear animation state after animation completes
    const timer = setTimeout(() => {
      setAnimatingTasks(new Set());
    }, 500);

    return () => clearTimeout(timer);
  }, [tasks.map((t) => t.id).join(",")]);

  if (loading) {
    return (
      <div
        className="space-y-2 sm:space-y-3"
        aria-live="polite"
        aria-busy="true"
      >
        {/* Skeleton loaders */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 sm:p-4 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg animate-pulse"
          >
            <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-gray-200 dark:bg-gray-700"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return null; // Let parent handle empty state
  }

  /**
   * Get category for a task
   * @param {string|null} categoryId - Category ID
   * @returns {Object|null} Category object
   */
  const getCategoryForTask = (categoryId) => {
    if (!categoryId || !categories) return null;
    return categories.find((cat) => cat.id === categoryId) || null;
  };

  return (
    <div className="space-y-2 sm:space-y-3" role="list" aria-label="Tasks">
      {tasks.map((task) => {
        // Determine if this task should animate in (it's new to this section)
        const shouldAnimateIn = animatingTasks.has(task.id);
        const animationClass = shouldAnimateIn
          ? isCompletedSection
            ? "animate-slide-in-from-active"
            : "animate-slide-in-from-completed"
          : "";

        return (
          <div key={task.id} role="listitem" className={animationClass}>
            <TaskItem
              task={task}
              onToggle={onToggleTask}
              onDelete={onDeleteTask}
              category={getCategoryForTask(task.categoryId)}
            />
          </div>
        );
      })}
    </div>
  );
}
